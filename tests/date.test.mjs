import assert from 'node:assert/strict';
import test from 'node:test';

import {
  calendarDate,
  calendarDays,
  canReadDate,
  canWriteDate,
  drawerStatus,
  isSeasonEnded,
  todayInKorea,
  validCalendarDate,
} from '../src/utils/date.js';

const FIRST_DAY = '2026-11-05';
const LAST_DAY = '2026-12-25';

test('캘린더는 11월 26칸 + 12월 25칸, 총 51칸', () => {
  assert.equal(calendarDays(11).length, 26);
  assert.equal(calendarDays(12).length, 25);
  assert.equal(calendarDays(11)[0], 5);
  assert.equal(calendarDays(12)[24], 25);
  assert.equal(calendarDays(11).length + calendarDays(12).length, 51);
});

test('2026년 시즌 외 날짜와 비정상 날짜를 거부', () => {
  assert.equal(validCalendarDate(FIRST_DAY), true);
  assert.equal(validCalendarDate(LAST_DAY), true);
  assert.equal(validCalendarDate('2026-11-04'), false);
  assert.equal(validCalendarDate('2026-12-26'), false);
  assert.equal(validCalendarDate('2026-02-30'), false);
  assert.equal(calendarDate(11, 5), FIRST_DAY);
});

test('한국 시간으로 자정 기준을 계산', () => {
  assert.equal(todayInKorea(new Date('2026-11-04T14:59:59Z')), '2026-11-04');
  assert.equal(todayInKorea(new Date('2026-11-04T15:00:00Z')), FIRST_DAY);
});

test('미래 서랍은 열리지 않고, 과거와 오늘 서랍은 열린다', () => {
  assert.equal(drawerStatus('2026-12-12', '2026-12-11'), 'future');
  assert.equal(drawerStatus('2026-12-12', '2026-12-12'), 'today');
  assert.equal(drawerStatus('2026-12-12', '2026-12-13'), 'past');
  assert.equal(canReadDate('2026-12-12', '2026-12-11'), false);
  assert.equal(canReadDate('2026-12-12', '2026-12-12'), true);
});

test('새 메시지 작성 가능 기간과 시즌 종료', () => {
  assert.equal(canWriteDate('2026-11-04'), false);
  assert.equal(canWriteDate(FIRST_DAY), true);
  assert.equal(canWriteDate(LAST_DAY), true);
  assert.equal(canWriteDate('2026-12-26'), false);
  assert.equal(isSeasonEnded('2026-12-26'), true);
  assert.equal(canReadDate(FIRST_DAY, '2026-12-26'), true);
});
