const JAVASCRIPT_KEY = import.meta.env?.VITE_KAKAO_JAVASCRIPT_KEY ?? '';
const SDK_URL = 'https://t1.kakaocdn.net/kakao_js_sdk/2.8.4/kakao.min.js';
const SDK_INTEGRITY = 'sha384-BGX7Wb16GmRFagri4bLJV2DgipVZaU2AI812GZtHtHzzDQJnfHasDXN5houxv45w';

let loadingSdk = null;

function loadKakaoSdk() {
  if (window.Kakao?.init && window.Kakao?.isInitialized) {
    return Promise.resolve(window.Kakao);
  }
  if (loadingSdk) {
    return loadingSdk;
  }
  loadingSdk = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SDK_URL;
    script.integrity = SDK_INTEGRITY;
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      if (window.Kakao?.init && window.Kakao?.isInitialized) {
        resolve(window.Kakao);
      } else {
        reject(new Error('KAKAO_SDK_UNAVAILABLE'));
      }
    };
    script.onerror = () => reject(new Error('KAKAO_SDK_LOAD_FAILED'));
    document.head.append(script);
  }).catch((error) => {
    loadingSdk = null;
    throw error;
  });
  return loadingSdk;
}

export async function shareToKakao({ url, nickname, lang }) {
  if (!JAVASCRIPT_KEY) {
    throw new Error('KAKAO_SHARE_NOT_CONFIGURED');
  }
  const kakao = await loadKakaoSdk();
  if (!kakao.isInitialized()) {
    kakao.init(JAVASCRIPT_KEY);
  }
  if (typeof kakao.Share?.sendDefault !== 'function') {
    throw new Error('KAKAO_SHARE_API_UNAVAILABLE');
  }
  const name = String(nickname ?? '').trim();
  const title = lang === 'ko'
    ? `${name}의 초콜릿 캘린더 🍫`
    : `${name}'s chocolate calendar 🍫`;
  const description = lang === 'ko'
    ? '나에게 초콜릿과 익명 메시지를 남겨줘! 🎄'
    : 'Leave me a chocolate and an anonymous note! 🎄';
  return kakao.Share.sendDefault({
    objectType: 'text',
    text: `${title}\n${description}`,
    link: { mobileWebUrl: url, webUrl: url },
    buttonTitle: lang === 'ko' ? '초콜릿 남기러 가기' : 'Leave a chocolate',
  });
}
