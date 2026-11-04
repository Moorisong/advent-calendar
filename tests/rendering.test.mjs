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

test('주인 캘린더에는 공유만 있고 새 캘린더 생성 버튼은 없음', () => {
  const html = renderCalendar(base, 'owner');
  assert.match(html, /data-action="share"/);
  assert.match(html, /data-action="kakao-share"/);
  assert.doesNotMatch(html, /new-calendar|새 캘린더 만들기|Create another calendar/);
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

test('언어와 무관하게 공유 방식은 같은 중요도로 나란히 표시', () => {
  const ko = renderCalendar(base, 'owner');
  const en = renderCalendar({ ...base, lang: 'en', t: (_, text) => text }, 'owner');
  for (const html of [ko, en]) {
    assert.match(html, /data-action="kakao-share"/);
    assert.match(html, /data-action="share"/);
    assert.match(html, /data-action="copy"/);
  }
});

test('주인 화면은 제목과 캘린더 및 공유 패널을 별도 영역으로 구성', () => {
  const html = renderCalendar(base, 'owner');
  assert.match(html, /class="calendar-layout owner-layout"/);
  assert.match(html, /class="content calendar-main"/);
  assert.match(html, /class="owner-sidebar"/);
  assert.match(html, /data-action="open-share"/);
  assert.ok(html.indexOf('class="content calendar-main"') < html.indexOf('class="owner-sidebar"'));
});

test('한국어 캘린더 제목은 이름과 제목을 정확히 두 줄로 분리', () => {
  const html = renderCalendar({ ...base, nickname: '똥현' }, 'owner');
  assert.match(html, /<span class="calendar-title-line">똥현의<\/span>/);
  assert.match(html, /<span class="calendar-title-line">초콜릿 캘린더<\/span>/);
  assert.match(html, /class="calendar-heading-gift" aria-hidden="true"/);
  assert.doesNotMatch(html, /title-highlight|초콜릿 캘린더의/);
});

test('주인 화면은 모바일과 데스크톱 모두 새 캘린더 버튼을 렌더링하지 않음', () => {
  const html = renderCalendar(base, 'owner');
  assert.doesNotMatch(html, /mobile-new-calendar|desktop-new-calendar|new-calendar-button/);
  assert.doesNotMatch(html, /data-action="create"|data-action="new-calendar"/);
  assert.match(html, /class="owner-sidebar"/);
});

test('친구 캘린더는 날짜 선택 뒤에 단일 생성 버튼을 배치', () => {
  const html = renderCalendar(base, 'visitor');
  assert.match(html, /class="calendar-layout visitor-layout"/);
  assert.match(html, /class="content calendar-intro"/);
  assert.match(html, /class="content calendar-main"/);
  assert.doesNotMatch(html, /class="visitor-sidebar"/);
  assert.match(html, /달력에서 날짜를 고르고 초콜릿을 선택해 메시지를 남겨줘/);
  assert.doesNotMatch(html, /class="visitor-guide"|친구에게 초콜릿 남기기/);
  assert.match(html, /class="visitor-create-action"/);
  assert.match(html, /data-day="12" data-role="visitor"/);
  assert.equal((html.match(/data-action="create"/g) ?? []).length, 1);
  assert.doesNotMatch(html, /class="owner-share"|data-action="open-share"/);
  assert.ok(html.indexOf('class="visitor-create-action"') > html.indexOf('class="box"'));
  assert.ok(html.indexOf('class="visitor-create-action"') < html.indexOf('class="ad"'));
});

test('종료된 친구 캘린더는 메시지 작성 대신 종료 안내를 표시', () => {
  const html = renderCalendar(base, 'visitor', true);
  assert.match(html, /올해의 초콜릿 배달이 끝났어요/);
  assert.doesNotMatch(html, /class="visitor-guide"/);
  assert.doesNotMatch(html, /data-role="visitor"/);
});
