import assert from 'node:assert/strict';
import test from 'node:test';

import { SCREEN } from '../src/config/constants.js';
import { readRoute, routeUrl } from '../src/core/routes.js';

const SLUG = 'abcdef1234567890';

test('캘린더 공개/소유자/작성/열람 URL 매핑', () => {
  const routes = [SCREEN.visitor, SCREEN.owner, SCREEN.created, SCREEN.write, SCREEN.read];
  for (const page of routes) {
    const route = { page, slug: SLUG, date: '2026-11-05' };
    const parsed = readRoute(new URL(routeUrl(route), 'https://example.test'));
    assert.equal(parsed.page, page);
    assert.equal(parsed.slug, SLUG);
    assert.equal(parsed.date, '2026-11-05');
  }
});

test('임의 URL과 외부 리디렉션 경로는 페이지가 아닌 오류 화면', () => {
  assert.equal(readRoute(new URL('https://example.test/not-a-route')).page, SCREEN.error);
  assert.equal(readRoute(new URL('https://example.test/c/../../login')).page, SCREEN.login);
  assert.equal(readRoute(new URL('https://example.test/c/INVALID')).page, SCREEN.error);
});
