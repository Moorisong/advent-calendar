import assert from 'node:assert/strict';
import test from 'node:test';

import { renderRetentionBanner } from '../src/ui/retention-banner.js';

const t = (ko) => ko;

test('9월 안내에는 해당 시즌과 10월 1일 삭제 날짜를 명확히 표시', () => {
  const html = renderRetentionBanner({ today: '2027-09-01', t });
  assert.match(html, /지난 초콜릿이 곧 정리돼/);
  assert.match(html, /2026년에 받은 초콜릿과 메시지/);
  assert.match(html, /2027년 10월 1일/);
  assert.match(html, /9월 30일까지/);
});

test('매년 9월에 지난 시즌 기준으로 날짜 자동 갱신', () => {
  assert.match(renderRetentionBanner({ today: '2028-09-30', t }), /2028년 10월 1일/);
  assert.match(renderRetentionBanner({ today: '2028-09-30', t }), /2027년에 받은/);
});

test('2026년 11월만 임시 미리보기, 이후에는 9월에만 표시', () => {
  assert.match(renderRetentionBanner({ today: '2026-11-04', t }), /2027년 10월 1일/);
  assert.equal(renderRetentionBanner({ today: '2026-12-01', t }), '');
  assert.equal(renderRetentionBanner({ today: '2027-08-31', t }), '');
  assert.equal(renderRetentionBanner({ today: '2027-10-01', t }), '');
});
