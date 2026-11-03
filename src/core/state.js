import { APP, CHOCOLATES, SCREEN } from '../config/constants.js';
import { getInitialMonth, todayInKorea } from '../utils/date.js';
import { readSession, writeSession } from '../utils/storage.js';

export const state = {
  lang: readSession('lang') === 'en' ? 'en' : 'ko',
  route: { page: SCREEN.loading, slug: null, date: null },
  user: null,
  calendar: null,
  month: getInitialMonth(),
  day: APP.firstDay,
  today: todayInKorea(),
  selected: 0,
  message: '',
  nicknameDraft: '',
  notes: [],
  lastSent: null,
  readIndex: 0,
  loading: false,
  writing: false,
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
