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

import { timeZoneLabel } from '../src/utils/timezones.js';

const FIRST_DAY = '2026-11-01';
const LAST_DAY = '2026-12-25';

test('캘린더는 11월 30칸 + 12월 25칸, 총 55칸', () => {
  assert.equal(calendarDays(11).length, 30);
  assert.equal(calendarDays(12).length, 25);
  assert.equal(calendarDays(11)[0], 1);
  assert.equal(calendarDays(12)[24], 25);
  assert.equal(calendarDays(11).length + calendarDays(12).length, 55);
});

test('2026년 시즌 외 날짜와 비정상 날짜를 거부', () => {
  assert.equal(validCalendarDate(FIRST_DAY), true);
  assert.equal(validCalendarDate(LAST_DAY), true);
  assert.equal(validCalendarDate('2026-10-31'), false);
  assert.equal(validCalendarDate('2026-12-26'), false);
  assert.equal(validCalendarDate('2026-02-30'), false);
  assert.equal(calendarDate(11, 1), FIRST_DAY);
});

test('한국 시간으로 자정 기준을 계산', () => {
  assert.equal(todayInKorea(new Date('2026-10-31T14:59:59Z')), '2026-10-31');
  assert.equal(todayInKorea(new Date('2026-10-31T15:00:00Z')), FIRST_DAY);
});

test('미래 서랍은 열리지 않고, 과거와 오늘 서랍은 열린다', () => {
  assert.equal(drawerStatus('2026-12-12', '2026-12-11'), 'future');
  assert.equal(drawerStatus('2026-12-12', '2026-12-12'), 'today');
  assert.equal(drawerStatus('2026-12-12', '2026-12-13'), 'past');
  assert.equal(canReadDate('2026-12-12', '2026-12-11'), false);
  assert.equal(canReadDate('2026-12-12', '2026-12-12'), true);
});

test('새 메시지 작성 가능 기간과 시즌 종료', () => {
  assert.equal(canWriteDate('2026-10-31'), false);
  assert.equal(canWriteDate(FIRST_DAY), true);
  assert.equal(canWriteDate(LAST_DAY), true);
  assert.equal(canWriteDate('2026-12-26'), false);
  assert.equal(isSeasonEnded('2026-12-26'), true);
  assert.equal(canReadDate(FIRST_DAY, '2026-12-26'), true);
});

test('2027년 이후에도 11월 1일부터 열리고 12월 26일 닫힘', () => {
  assert.equal(validCalendarDate('2027-11-01'), true);
  assert.equal(validCalendarDate('2028-12-25'), true);
  assert.equal(validCalendarDate('2028-12-26'), false);
  assert.equal(canWriteDate('2027-10-31'), false);
  assert.equal(canWriteDate('2027-11-01'), true);
  assert.equal(canWriteDate('2027-12-25'), true);
  assert.equal(canWriteDate('2027-12-26'), false);
  assert.equal(canWriteDate('2028-01-01'), false);
  assert.equal(canWriteDate('2028-11-01'), true);
  assert.equal(canReadDate('2026-12-25', '2028-11-01'), true);
});

test('시간대는 저장값을 유지하면서 언어별 국가 및 도시를 표시', () => {
  assert.equal(timeZoneLabel('Asia/Seoul', 'ko'), '대한민국');
  assert.equal(timeZoneLabel('Asia/Seoul', 'en'), 'South Korea');
  assert.equal(timeZoneLabel('Asia/Tokyo', 'en'), 'Japan');
  assert.equal(timeZoneLabel('Europe/Paris', 'en'), 'France');
  assert.equal(timeZoneLabel('America/New_York', 'en'), 'United States · New York');
  assert.equal(timeZoneLabel('America/New_York', 'ko'), '미국 · New York');
  assert.equal(timeZoneLabel('UTC', 'ko'), 'UTC');
  assert.equal(timeZoneLabel('Pacific/Fiji', 'en'), 'Fiji');
});
