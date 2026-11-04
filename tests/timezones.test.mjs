import assert from 'node:assert/strict';
import test from 'node:test';

import { APP } from '../src/config/constants.js';
import { canReadDate, canWriteDate, todayInZone } from '../src/utils/date.js';
import { deviceTimeZone, timeZoneOptions, validTimeZone } from '../src/utils/timezones.js';

test('기기 위치 접근 없이 표준 IANA 시간대 사용', () => {
  assert.equal(validTimeZone('America/New_York'), true);
  assert.equal(validTimeZone('Australia/Sydney'), true);
  assert.equal(validTimeZone('Not/A_Timezone'), false);
  assert.equal(validTimeZone(''), false);
  assert.equal(validTimeZone(null), false);
  assert.equal(validTimeZone(deviceTimeZone()), true);
  assert.ok(timeZoneOptions().includes(APP.timeZone));
  assert.ok(timeZoneOptions('Pacific/Honolulu').includes('Pacific/Honolulu'));
});

test('동일한 순간이라도 주인 시간대에 따라 시즌 시작일이 다름', () => {
  const instant = new Date('2026-10-31T16:00:00Z');
  assert.equal(todayInZone('Asia/Seoul', instant), '2026-11-01');
  assert.equal(todayInZone('America/New_York', instant), '2026-10-31');
  assert.equal(canWriteDate(todayInZone('Asia/Seoul', instant)), true);
  assert.equal(canWriteDate(todayInZone('America/New_York', instant)), false);
});

test('미국 뉴욕 11월 1일 현지 자정 경계', () => {
  assert.equal(todayInZone('America/New_York', new Date('2026-11-01T03:59:59Z')), '2026-10-31');
  assert.equal(todayInZone('America/New_York', new Date('2026-11-01T04:00:00Z')), '2026-11-01');
});

test('호주 시드니 12월 25일 자정은 UTC 12월 24일 13시', () => {
  const before = todayInZone('Australia/Sydney', new Date('2026-12-24T12:59:59Z'));
  const after = todayInZone('Australia/Sydney', new Date('2026-12-24T13:00:00Z'));
  assert.equal(before, '2026-12-24');
  assert.equal(after, '2026-12-25');
  assert.equal(canReadDate('2026-12-25', before), false);
  assert.equal(canReadDate('2026-12-25', after), true);
});

test('북반구와 남반구 서머타임 전환을 시간대 데이터가 처리', () => {
  assert.equal(todayInZone('Australia/Sydney', new Date('2026-11-04T13:00:00Z')), '2026-11-05');
  assert.equal(todayInZone('America/New_York', new Date('2026-03-08T04:30:00Z')), '2026-03-07');
  assert.equal(todayInZone('America/New_York', new Date('2026-03-08T05:30:00Z')), '2026-03-08');
});

test('주인의 시간대에서 12월 26일로 바뀌면 작성 종료', () => {
  const before = todayInZone('Pacific/Honolulu', new Date('2026-12-26T09:59:59Z'));
  const after = todayInZone('Pacific/Honolulu', new Date('2026-12-26T10:00:00Z'));
  assert.equal(before, '2026-12-25');
  assert.equal(after, '2026-12-26');
  assert.equal(canWriteDate(before), true);
  assert.equal(canWriteDate(after), false);
});
