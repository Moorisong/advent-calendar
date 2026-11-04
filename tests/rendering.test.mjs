import assert from 'node:assert/strict';
import test from 'node:test';

import { renderBox, renderCalendar } from '../src/ui/calendar.js';
import { renderEmpty, renderRead, renderWrite } from '../src/ui/pages/messages.js';
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

test('주인과 방문자 모두 지난 날짜와 오늘을 구분하고 미래 날짜는 유지', () => {
  for (const role of ['owner', 'visitor']) {
    const html = renderBox(base, role);
    assert.match(html, new RegExp('class="drawer past" data-day="11" data-role="' + role + '"'));
    assert.match(html, new RegExp('class="drawer today" data-day="12" data-role="' + role + '"'));
    assert.match(html, new RegExp('class="drawer " data-day="13" data-role="' + role + '"'));
    assert.match(html, /<small>오늘<\/small>/);
    assert.doesNotMatch(html, /disabled/);
  }
  const preview = renderBox(base, 'visitor', true);
  assert.doesNotMatch(preview, /drawer past|drawer today/);
});

test('11월 캘린더는 1일부터 30일까지', () => {
  const html = renderBox({ ...base, month: 11 }, 'visitor');
  assert.equal((html.match(/data-day=/g) ?? []).length, 30);
  assert.match(html, /data-day="1"/);
  assert.match(html, /data-day="30"/);
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

test('작성 중 메시지는 다시 그려도 유지하고 HTML을 이스케이프', () => {
  const html = renderWrite({ ...base, message: '작성 중 <script>alert(1)</script>', selected: 2 });
  assert.match(html, /작성 중 &lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(html, /data-choco="2"/);
  assert.match(html, /\/ 200/);
  assert.doesNotMatch(html, /주인만 읽을 수 있어요/);
  assert.doesNotMatch(html, /지난 날짜의 메시지는 바로 열려요/);
});

test('이미 작성한 날짜는 새 글 대신 수정 및 삭제를 표시', () => {
  const html = renderWrite({
    ...base,
    myMessage: { id: 'my-note', chocolate_type: 2, body: '안녕' },
    selected: 2,
    message: '안녕',
  });
  assert.match(html, /메시지 수정하기/);
  assert.match(html, /data-action="delete-message"/);
  const fresh = renderWrite(base);
  assert.match(fresh, /초콜릿 남기기/);
  assert.doesNotMatch(fresh, /data-action="delete-message"/);
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

test('빈 서랍은 선택한 날짜를 선물 아이콘과 제목 사이에 표시', () => {
  const html = renderEmpty({ ...base, month: 11, day: 2 });
  assert.match(html, /class="empty-drawer-date">11월 2일의 서랍<\/div>/);
  assert.ok(html.indexOf('class="largeicon"') < html.indexOf('class="empty-drawer-date"'));
  assert.ok(html.indexOf('class="empty-drawer-date"') < html.indexOf('아직 조용한 서랍이야'));
});

test('빈 서랍에서도 오너와 동일한 공유 기능을 제공', () => {
  const previousWindow = globalThis.window;
  globalThis.window = { location: { origin: 'https://advent.example' } };
  try {
    const html = renderEmpty(base);
    assert.match(html, /class="empty-share-panel"/);
    assert.match(html, /https:\/\/advent.example\/c\/abcdef1234567890/);
    assert.match(html, /data-action="copy"/);
    assert.match(html, /data-action="kakao-share"/);
    assert.match(html, /data-action="share"/);
    assert.match(html, /data-action="owner"/);
    assert.doesNotMatch(html, /data-action="create"/);
  } finally {
    globalThis.window = previousWindow;
  }
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
  assert.match(html, /초콜릿 배달은 쉬고 있어/);
  assert.doesNotMatch(html, /class="visitor-guide"/);
  assert.doesNotMatch(html, /data-role="visitor"/);
});

test('오너만 삭제 확인창과 연도 선택을 사용할 수 있음', () => {
  const owner = renderCalendar({ ...base, year: 2027, today: '2027-12-26', deleteOpen: true }, 'owner');
  assert.match(owner, /data-action="delete-open"/);
  assert.match(owner, /data-delete-confirmation/);
  assert.match(owner, /data-action="delete-confirm"/);
  assert.match(owner, /data-year/);
  assert.match(owner, /<option value="2026"/);
  const visitor = renderCalendar(base, 'visitor');
  assert.doesNotMatch(visitor, /delete-confirm|delete-open|data-year/);
});

test('2027년 서랍과 날짜 표기가 2026년과 겹치지 않음', () => {
  const html = renderBox({ ...base, month: 11, year: 2027 }, 'owner');
  assert.match(html, /NOVEMBER · 2027/);
  assert.equal((html.match(/data-day=/g) ?? []).length, 30);
});

test('보관 기간 안내는 오너에게만 표시', () => {
  const owner = renderCalendar({ ...base, today: '2026-11-04' }, 'owner');
  const visitor = renderCalendar({ ...base, today: '2026-11-04' }, 'visitor');
  assert.match(owner, /class="retention-banner"/);
  assert.match(owner, /2027년 10월 1일/);
  assert.doesNotMatch(visitor, /retention-banner/);
});
