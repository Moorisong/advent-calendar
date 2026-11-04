const JAVASCRIPT_KEY = import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY ?? '';

export function kakaoShareConfigured() {
  return Boolean(JAVASCRIPT_KEY);
}

export function shareToKakao({ url, nickname, lang }) {
  if (!JAVASCRIPT_KEY) {
    throw new Error('KAKAO_SHARE_NOT_CONFIGURED');
  }
  const kakao = window.Kakao;
  if (!kakao?.Share?.sendDefault) {
    throw new Error('KAKAO_SDK_UNAVAILABLE');
  }
  if (!kakao.isInitialized()) {
    kakao.init(JAVASCRIPT_KEY);
  }
  const name = String(nickname ?? '').trim();
  const title = lang === 'ko'
    ? `${name}의 초콜릿 캘린더 🍫`
    : `${name}'s chocolate calendar 🍫`;
  const description = lang === 'ko'
    ? '나에게 초콜릿과 익명 메시지를 남겨줘! 🎄'
    : 'Leave me a chocolate and an anonymous note! 🎄';
  kakao.Share.sendDefault({
    objectType: 'text',
    text: `${title}\n${description}`,
    link: { mobileWebUrl: url, webUrl: url },
    buttonTitle: lang === 'ko' ? '초콜릿 남기러 가기' : 'Leave a chocolate',
  });
}
