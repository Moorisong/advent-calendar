import assert from 'node:assert/strict';
import test from 'node:test';

import { SCREEN } from '../src/config/constants.js';
import { resolvePage } from '../src/core/page-policy.js';

const slug = 'abcdef1234567890';
const opened = '2026-11-05';
const future = '2026-12-25';

function route(page, date) {
  return { page, slug, date };
}

test('날짜 이전의 소유자 서랍은 잠금, 당일과 과거는 열람', () => {
  assert.equal(resolvePage(route(SCREEN.read, future), opened).page, SCREEN.locked);
  assert.equal(resolvePage(route(SCREEN.locked, opened), opened).page, SCREEN.read);
  assert.equal(resolvePage(route(SCREEN.empty, opened), future).page, SCREEN.read);
});

test('날짜가 없는 열람·작성 경로는 안전한 화면으로 이동', () => {
  assert.equal(resolvePage(route(SCREEN.read, null), opened).page, SCREEN.owner);
  assert.equal(resolvePage(route(SCREEN.write, null), opened).page, SCREEN.visitor);
});

test('시즌 시작 전과 종료 후 작성 화면을 차단', () => {
  assert.equal(resolvePage(route(SCREEN.write, future), '2026-11-04').page, SCREEN.visitor);
  assert.equal(resolvePage(route(SCREEN.write, future), '2026-12-26').page, SCREEN.visitor);
  assert.equal(resolvePage(route(SCREEN.write, future), opened).page, SCREEN.write);
});

test('메시지 전송 완료 화면은 실제 전송 이후에만 표시', () => {
  const requested = route(SCREEN.sent, opened);
  assert.equal(resolvePage(requested, opened, null).page, SCREEN.visitor);
  assert.equal(resolvePage(requested, opened, { slug, date: future }).page, SCREEN.visitor);
  assert.equal(resolvePage(requested, opened, { slug, date: opened }).page, SCREEN.sent);
  assert.equal(resolvePage(requested, opened, { slug: 'ffffffffffffffff', date: opened }).page, SCREEN.visitor);
});
