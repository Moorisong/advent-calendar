import { APP, SCREEN } from '../config/constants.js';
import { createCalendar, findMyCalendar } from '../data/calendars.js';
import { shareToKakao } from '../data/kakao-share.js';
import { writeMessage } from '../data/messages.js';
import { canWriteDate, getInitialMonth, todayInZone } from '../utils/date.js';
import { validTimeZone } from '../utils/timezones.js';

import { navigate } from './navigation.js';
import { render, toast } from './render.js';
import { state, translate } from './state.js';

export async function submitCalendar(form) {
  if (!state.user || state.writing) {
    return;
  }
  const input = form.elements.namedItem('nickname');
  const nickname = String(input?.value ?? '').trim();
  if (!nickname || Array.from(nickname).length > APP.maximumNicknameLength) {
    toast(translate('닉네임을 다시 확인해 줘.', 'Please check the nickname.'));
    return;
  }
  const timezone = String(form.elements.namedItem('timezone')?.value ?? '');
  if (!validTimeZone(timezone)) {
    toast(translate('시간대를 다시 선택해 줘.', 'Please choose a valid time zone.'));
    return;
  }
  state.writing = true;
  const button = form.querySelector('button[type="submit"],button[data-action="submit-create"]');
  if (button) {
    button.disabled = true;
  }
  try {
    const calendar = await createCalendar(nickname, state.user.id, timezone);
    state.calendar = calendar;
    state.myCalendar = calendar;
    state.nicknameDraft = '';
    state.timezoneDraft = timezone;
    state.month = getInitialMonth(todayInZone(timezone));
    await navigate({ page: SCREEN.created, slug: calendar.slug });
  } catch (error) {
    if (error.message === 'CALENDAR_ALREADY_EXISTS') {
      try {
        const existing = await findMyCalendar(state.user.id);
        if (existing) {
          state.myCalendar = existing;
          await navigate({ page: SCREEN.owner, slug: existing.slug }, { replace: true });
          toast(translate('이미 만든 캘린더로 이동했어요.', 'Opened your existing calendar.'));
          return;
        }
      } catch (lookupError) {
        console.error('Existing calendar lookup failed:', lookupError);
      }
    }
    console.error('Create calendar failed:', error);
    toast(translate('캘린더를 만들지 못했어요. 다시 시도해 줘.', 'Could not create the calendar. Try again.'));
    if (button) {
      button.disabled = false;
    }
  } finally {
    state.writing = false;
  }
}

export async function submitMessage(form) {
  if (!state.user || !state.calendar || state.writing) {
    return;
  }
  const today = todayInZone(state.calendar.timezone);
  if (!canWriteDate(today)) {
    toast(translate('지금은 초콜릿을 남길 수 없어요.', 'Chocolate deliveries are closed right now.'));
    return;
  }
  const input = form.elements.namedItem('message');
  const note = String(input?.value ?? '').trim();
  if (!note || note.length > APP.maximumMessageLength) {
    toast(translate('메시지를 다시 확인해 줘.', 'Please check your message.'));
    return;
  }
  state.writing = true;
  const button = form.querySelector('button[data-action="send"]');
  if (button) {
    button.disabled = true;
  }
  try {
    await writeMessage(state.calendar.id, state.route.date, state.selected, note);
    state.message = '';
    state.lastSent = { slug: state.calendar.slug, date: state.route.date };
    await navigate({ page: SCREEN.sent, slug: state.calendar.slug, date: state.route.date });
  } catch (error) {
    console.error('Submit message failed:', error);
    toast(translate('메시지를 보내지 못했어요. 다시 시도해 줘.', 'Could not send the message. Try again.'));
    if (button) {
      button.disabled = false;
    }
  } finally {
    state.writing = false;
  }
}

async function copyUrl(url, message) {
  try {
    await navigator.clipboard.writeText(url);
    toast(message);
  } catch (error) {
    console.error('Link copy failed:', error);
    toast(translate('링크를 복사하지 못했어요.', 'Could not copy the link.'));
  }
}

export async function shareCalendar(action) {
  const slug = state.calendar?.slug;
  if (!slug) {
    return;
  }
  const publicUrl = `${window.location.origin}/c/${slug}`;
  if (action === 'kakao-share') {
    try {
      await shareToKakao({
        url: publicUrl,
        nickname: state.calendar.nickname,
        lang: state.lang,
      });
    } catch (error) {
      console.error('Kakao sharing unavailable:', error);
      const sdkFailed = ['KAKAO_SDK_LOAD_FAILED', 'KAKAO_SDK_UNAVAILABLE'].includes(error.message);
      toast(sdkFailed
        ? translate('카카오 SDK를 불러오지 못했어요. 네트워크를 확인해 줘.',
          'Could not load Kakao SDK. Check your connection.')
        : translate('카카오톡 공유를 시작할 수 없어요. 설정을 확인해 줘.',
          'KakaoTalk sharing is unavailable. Check the setup.'));
    }
    return;
  }
  if (action === 'share' && navigator.share) {
    try {
      await navigator.share({ title: APP.title, url: publicUrl });
      return;
    } catch (error) {
      if (error?.name === 'AbortError') {
        return;
      }
      console.warn('Native sharing unavailable:', error);
    }
  }
  await copyUrl(publicUrl, translate('친구용 링크를 복사했어요.', 'Friend link copied.'));
}

export function changeSelectedChocolate(index) {
  state.selected = index;
  render();
}
