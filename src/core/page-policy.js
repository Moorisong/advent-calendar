import { SCREEN } from '../config/constants.js';
import { canReadDate, canWriteDate, validCalendarDate } from '../utils/date.js';

const OWNER_DAY_SCREENS = new Set([SCREEN.read, SCREEN.empty, SCREEN.locked]);

export function resolvePage(route, today, lastSent) {
  const ownerDay = OWNER_DAY_SCREENS.has(route.page);
  const dated = ownerDay || route.page === SCREEN.write || route.page === SCREEN.sent;
  if (dated && !validCalendarDate(route.date)) {
    return { ...route, page: ownerDay ? SCREEN.owner : SCREEN.visitor, date: null };
  }
  if (route.page === SCREEN.write && !canWriteDate(today)) {
    return { ...route, page: SCREEN.visitor, date: null };
  }
  if (route.page === SCREEN.sent) {
    if (lastSent?.slug !== route.slug || lastSent?.date !== route.date) {
      return { ...route, page: SCREEN.visitor, date: null };
    }
  }
  if (ownerDay) {
    return { ...route, page: canReadDate(route.date, today) ? SCREEN.read : SCREEN.locked };
  }
  return route;
}
