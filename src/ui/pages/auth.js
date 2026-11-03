import { isConfigured } from '../../data/client.js';
import { escapeHtml } from '../../utils/format.js';

import { btn, footer } from '../chrome.js';
import { googleMark, icon, kakaoMark, scene } from '../sprites.js';

export function renderAuthLoading(state) {
  return [
    '<div class="content auth-loading" role="status"><div class="largeicon">',
    icon(3),
    `</div><p>${state.t('로그인을 확인하고 있어요…', 'Checking your sign-in…')}</p></div>`,
  ].join('');
}

export function renderLogin(state) {
  const { t, signingIn, loginError } = state;
  return [
    '<div class="auth-wrap">',
    scene(),
    '<div class="auth-panel">',
    `<div class="auth-gift">${icon(3)}<span class="auth-spark">✦</span></div>`,
    '<p class="auth-tag">A LITTLE SWEETNESS FOR YOU</p>',
    `<h2>${t('달콤한 마음을 전하러 왔나요?', 'Ready to share a little sweetness?')}</h2>`,
    `<p class="sub">${t('캘린더를 만들거나 초콜릿을 남기려면 로그인해줘.', 'Sign in to create a calendar or leave a chocolate.')}</p>`,
    '<div class="auth-buttons">',
    `<button class="oauth-button oauth-kakao" data-oauth="kakao" ${signingIn ? 'disabled' : ''}>`,
    `${kakaoMark()}<span>${t('카카오로 계속하기', 'Continue with Kakao')}</span></button>`,
    `<button class="oauth-button oauth-google" data-oauth="google" ${signingIn ? 'disabled' : ''}>`,
    `${googleMark()}<span>${t('Google로 계속하기', 'Continue with Google')}</span></button>`,
    '</div>',
    loginError ? `<p class="auth-error" role="alert">${escapeHtml(loginError)}</p>` : '',
    isConfigured ? '' : `<p class="auth-hint">${t('로그인 연결 준비 중이에요.', 'Social sign-in is being configured.')}</p>`,
    `<p class="auth-fine">${t('로그인하면 원래 보던 화면으로 돌아가요.', 'You’ll return to where you left off after signing in.')}</p>`,
    `<button class="textbtn" data-action="leave-login">${t('돌아가기', 'Go back')}</button>`,
    '</div>',
    footer(state),
    '</div>',
  ].join('');
}

export function renderError(state) {
  const { t } = state;
  return [
    '<div class="content empty"><div class="largeicon">',
    icon(3),
    `</div><h2>${t('캘린더를 불러오지 못했어요.', 'Could not open the calendar.')}</h2>`,
    `<p class="sub">${escapeHtml(state.error || t('링크를 다시 확인해 줘.', 'Please check the link.'))}</p>`,
    btn(t('처음으로', 'Back to home'), 'landing', true),
    '</div>',
  ].join('');
}
