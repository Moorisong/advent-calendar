export const APP = Object.freeze({
  title: 'Dear Choco',
  startDate: '2026-11-01',
  endDate: '2026-12-25',
  timeZone: 'Asia/Seoul',
  year: 2026,
  firstMonth: 11,
  lastMonth: 12,
  firstDay: 1,
  lastDay: 25,
  maximumNicknameLength: 12,
  maximumMessageLength: 200,
  calendarSlugLength: 16,
  toastMilliseconds: 3000,
  storagePrefix: 'dearchoco:',
});

export const CHOCOLATES = Object.freeze([
  { ko: '밀크', en: 'Milk' },
  { ko: '하트', en: 'Heart' },
  { ko: '트리', en: 'Tree' },
  { ko: '리본', en: 'Ribbon' },
  { ko: '별', en: 'Star' },
  { ko: '트러플', en: 'Truffle' },
]);

export const SCREEN = Object.freeze({
  landing: 'landing',
  login: 'login',
  callback: 'auth-callback',
  create: 'create',
  created: 'created',
  visitor: 'visitor',
  write: 'write',
  sent: 'sent',
  owner: 'owner',
  read: 'read',
  locked: 'locked',
  empty: 'empty',
  ended: 'ended',
  tutorial: 'tutorial',
  loading: 'auth-loading',
  error: 'error',
});

export const PROTECTED_SCREENS = Object.freeze(new Set([
  SCREEN.create,
  SCREEN.created,
  SCREEN.write,
  SCREEN.sent,
  SCREEN.owner,
  SCREEN.read,
  SCREEN.locked,
  SCREEN.empty,
]));
