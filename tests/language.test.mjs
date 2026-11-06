import assert from 'node:assert/strict';
import test from 'node:test';

import { APP } from '../src/config/constants.js';
import { renderRead } from '../src/ui/pages/messages.js';
import { initialLanguage, languageForLocale } from '../src/utils/language.js';

function memoryStorage(entries = {}) {
  const values = new Map(Object.entries(entries));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
}

function mockEnvironment({ locale, local = {}, session = {}, blocked = false } = {}) {
  const originals = new Map();
  const values = {
    navigator: locale ? { language: locale, languages: [locale] } : undefined,
    localStorage: blocked ? { getItem() { throw Error('blocked'); } } : memoryStorage(local),
    sessionStorage: blocked ? { getItem() { throw Error('blocked'); } } : memoryStorage(session),
  };
  for (const [name, value] of Object.entries(values)) {
    originals.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, { configurable: true, value });
  }
  return {
    localStorage: values.localStorage,
    sessionStorage: values.sessionStorage,
    restore() {
      for (const [name, descriptor] of originals) {
        if (descriptor) Object.defineProperty(globalThis, name, descriptor);
        else delete globalThis[name];
      }
    },
  };
}

test('첫 방문은 한국어 브라우저만 한국어, 영어와 미지원 언어는 영어', () => {
  for (const [locale, expected] of [
    ['ko-KR', 'ko'], ['ko', 'ko'], ['KO_kr', 'ko'],
    ['en-US', 'en'], ['en-GB', 'en'], ['ja-JP', 'en'], ['fr-FR', 'en'],
    ['', 'en'], [undefined, 'en'],
  ]) {
    assert.equal(languageForLocale(locale), expected, String(locale));
  }
});

test('첫 방문 언어는 브라우저 설정에 따라 자동으로 선택', () => {
  for (const [locale, expected] of [
    ['ko-KR', 'ko'], ['en-US', 'en'], ['ja-JP', 'en'],
  ]) {
    const env = mockEnvironment({ locale });
    try {
      assert.equal(initialLanguage(), expected);
      assert.equal(env.localStorage.getItem(APP.storagePrefix + 'lang'), null);
    } finally {
      env.restore();
    }
  }
});

test('직접 선택한 언어는 브라우저 언어보다 우선하고 재방문에도 유지', async () => {
  const env = mockEnvironment({ locale: 'ko-KR' });
  try {
    const first = await import('../src/core/state.js?language-test=first');
    assert.equal(first.state.lang, 'ko');
    first.switchLanguage();
    assert.equal(first.state.lang, 'en');
    assert.equal(env.localStorage.getItem(APP.storagePrefix + 'lang'), 'en');

    Object.defineProperty(globalThis, 'navigator', {
      configurable: true, value: { language: 'ko-KR', languages: ['ko-KR'] },
    });
    const revisit = await import('../src/core/state.js?language-test=revisit');
    assert.equal(revisit.state.lang, 'en');
    revisit.switchLanguage();
    assert.equal(env.localStorage.getItem(APP.storagePrefix + 'lang'), 'ko');
  } finally {
    env.restore();
  }
});

test('예전 세션 언어 선택도 유지하고 영구 저장소로 옮김', () => {
  const key = APP.storagePrefix + 'lang';
  const env = mockEnvironment({ locale: 'ja-JP', session: { [key]: 'ko' } });
  try {
    assert.equal(initialLanguage(), 'ko');
    assert.equal(env.localStorage.getItem(key), 'ko');
  } finally {
    env.restore();
  }
});

test('영구 저장된 언어가 세션과 브라우저 설정보다 우선', () => {
  const key = APP.storagePrefix + 'lang';
  const env = mockEnvironment({
    locale: 'ko-KR', local: { [key]: 'en' }, session: { [key]: 'ko' },
  });
  try {
    assert.equal(initialLanguage(), 'en');
  } finally {
    env.restore();
  }
});

test('잘못된 저장 값이나 차단된 저장소에서도 안전하게 영어로 대체', () => {
  const key = APP.storagePrefix + 'lang';
  const invalid = mockEnvironment({ locale: 'ja-JP', local: { [key]: 'xx' } });
  try {
    assert.equal(initialLanguage(), 'en');
  } finally {
    invalid.restore();
  }
  const blocked = mockEnvironment({ locale: 'ja-JP', blocked: true });
  try {
    assert.equal(initialLanguage(), 'en');
  } finally {
    blocked.restore();
  }
});

test('주인과 방문자의 UI 언어가 달라도 작성된 메시지 원문은 유지', () => {
  const note = {
    id: 'note-1', chocolate_type: 1, body: '안녕! Hello!',
    created_at: '2026-11-05T03:00:00Z',
  };
  for (const lang of ['ko', 'en']) {
    const html = renderRead({
      lang, t: (ko, en) => lang === 'ko' ? ko : en,
      month: 11, day: 5, today: '2026-11-06',
      route: { date: '2026-11-05' }, notes: [note],
      calendar: { timezone: 'Asia/Seoul' },
    });
    assert.match(html, /class="drawer-note-body">안녕! Hello!<\/div>/);
    assert.match(html, lang === 'ko' ? /익명의 친구가/ : /From an anonymous friend/);
  }
});
