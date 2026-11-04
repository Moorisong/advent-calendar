import assert from 'node:assert/strict';
import test from 'node:test';

import { renderBox, renderCalendar } from '../src/ui/calendar.js';
import { renderRead, renderWrite } from '../src/ui/pages/messages.js';
import { renderCreated } from '../src/ui/pages/intro.js';

const t = (ko) => ko;
const base = {
  t,
  lang: 'ko',
  nickname: '수진',
  slug: 'abcdef1234567890',
  month: 12,
  day: 12,
  selected: 0,
  today: '2026-12-12',
  notes: [],
  readIndex: 0,
  message: '',
};

test('12월 캘린더 25개 서랍은 미래 메시지 수를 노출하지 않음', () => {
  const html = renderBox(base, 'owner');
  assert.equal((html.match(/data-day=/g) ?? []).length, 25);
  assert.match(html, /class="drawer today" data-day="12"/);
  assert.match(html, /class="drawer " data-day="13"/);
  assert.doesNotMatch(html, /data-count|message-count|받은 초콜릿 \d+개/);
});

test('11월 캘린더는 5일부터 30일까지', () => {
  const html = renderBox({ ...base, month: 11 }, 'visitor');
  assert.equal((html.match(/data-day=/g) ?? []).length, 26);
  assert.match(html, /data-day="5"/);
  assert.doesNotMatch(html, /data-day="4"/);
});

test('주인 캘린더에 공유와 추가 생성 버튼이 존재', () => {
  const html = renderCalendar(base, 'owner');
  assert.match(html, /data-action="share"/);
  assert.match(html, /data-action="kakao-share"/);
  assert.match(html, /data-action="new-calendar"/);
});

test('메시지 본문과 닉네임에 HTML 출력 인젝션이 일어나지 않음', () => {
  const html = renderRead({
    ...base,
    notes: [{ chocolate_type: 0, body: '<script>alert(1)</script>\n응원해!' }],
  });
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
  const input = renderWrite({ ...base, nickname: '<img src=x>' });
  assert.doesNotMatch(input, /FOR <img src=x>/);
});

test('랜딩 미리보기 서랍은 클릭 가능한 실제 캘린더로 오인하지 않음', () => {
  const html = renderBox(base, 'visitor', true);
  assert.equal((html.match(/<span class="drawer"/g) ?? []).length, 15);
  assert.doesNotMatch(html, /data-day=/);
  assert.doesNotMatch(html, /<button class="drawer/);
});

test('생성 완료 화면에서 중복 관리 링크 저장 영역 제거', () => {
  const previousWindow = globalThis.window;
  globalThis.window = { location: { origin: 'https://dearchoco.example' } };
  const html = renderCreated(base);
  globalThis.window = previousWindow;
  assert.doesNotMatch(html, /data-action="private"|class="private"/);
  assert.match(html, /data-action="copy"/);
  assert.match(html, /data-action="share"/);
  assert.match(html, /data-action="kakao-share"/);
  assert.match(html, /data-action="owner"/);
});

test('주인 화면에서 언제든 친구용 주소 복사 가능', () => {
  const html = renderCalendar(base, 'owner');
  assert.match(html, /data-action="copy"/);
  assert.match(html, /data-action="share"/);
  assert.match(html, /\/c\/abcdef1234567890/);
});

test('한국어는 카카오톡 우선, 영어는 다른 앱 공유 우선', () => {
  const ko = renderCalendar(base, 'owner');
  const en = renderCalendar({ ...base, lang: 'en', t: (_, text) => text }, 'owner');
  assert.ok(ko.indexOf('data-action="kakao-share"') < ko.indexOf('data-action="share"'));
  assert.ok(en.indexOf('data-action="share"') < en.indexOf('data-action="kakao-share"'));
  assert.match(ko, /data-action="copy"/);
  assert.match(en, /data-action="copy"/);
});
