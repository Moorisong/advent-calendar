import assert from 'node:assert/strict';
import test from 'node:test';

import { renderBox, renderCalendar } from '../src/ui/calendar.js';
import { renderRead, renderWrite } from '../src/ui/pages/messages.js';

const t = (ko) => ko;
const base = {
  t,
  lang: 'ko',
  nickname: '수진',
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
  assert.match(html, /data-action="create"/);
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
