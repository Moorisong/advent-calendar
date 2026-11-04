import assert from 'node:assert/strict';
import test from 'node:test';

import { renderRetentionBanner } from '../src/ui/retention-banner.js';

const t = (ko) => ko;

test('2026년 11월 오너에게 2027년 10월 1일 삭제 안내 표시', () => {
  const html = renderRetentionBanner({ today: '2026-11-04', t });
  assert.match(html, /2026년에 받은 초콜릿과 메시지/);
  assert.match(html, /2027년 10월 1일/);
  assert.match(html, /복구할 수 없으니/);
});

test('9월 30일까지 보관 안내, 10월에는 이전 시즌 안내를 숨김', () => {
  assert.match(renderRetentionBanner({ today: '2027-09-30', t }), /2027년 10월 1일/);
  assert.equal(renderRetentionBanner({ today: '2027-10-01', t }), '');
  assert.equal(renderRetentionBanner({ today: '2027-10-31', t }), '');
});

test('다음 시즌에는 삭제 연도가 자동으로 갱신됨', () => {
  assert.match(renderRetentionBanner({ today: '2027-11-01', t }), /2028년 10월 1일/);
  assert.match(renderRetentionBanner({ today: '2028-12-25', t }), /2029년 10월 1일/);
});
