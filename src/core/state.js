import { APP, CHOCOLATES, SCREEN } from '../config/constants.js';
import { getInitialMonth, getSeasonYear, todayInZone } from '../utils/date.js';
import { deviceTimeZone } from '../utils/timezones.js';
import { initialLanguage } from '../utils/language.js';
import { writeLocal, writeSession } from '../utils/storage.js';

export const state = {
  lang: initialLanguage(),
  route: { page: SCREEN.loading, slug: null, date: null },
  user: null,
  calendar: null,
  myCalendar: null,
  month: getInitialMonth(todayInZone(deviceTimeZone())),
  year: getSeasonYear(todayInZone(deviceTimeZone())),
  day: APP.firstDay,
  today: todayInZone(deviceTimeZone()),
  selected: 0,
  message: '',
  nicknameDraft: '',
  timezoneDraft: deviceTimeZone(),
  timezoneSearchOpen: false,
  timezoneQuery: '',
  notes: [],
  myMessage: null,
  lastSent: null,
  readIndex: 0,
  loading: false,
  writing: false,
  deleteOpen: false,
  deleting: false,
  signingIn: false,
  loginError: '',
  error: '',
  tutorialVisible: false,
  names: CHOCOLATES,
};

export function translate(ko, en) {
  return state.lang === 'ko' ? ko : en;
}

export function switchLanguage() {
  state.lang = state.lang === 'ko' ? 'en' : 'ko';
  writeLocal('lang', state.lang);
  writeSession('lang', state.lang);
}

export function getViewState() {
  return {
    ...state,
    page: state.route.page,
    nickname: state.calendar?.nickname ?? '',
    slug: state.calendar?.slug ?? state.route.slug,
    t: translate,
  };
}
