// Original pixel vector artwork, represented as reusable text constants.
const SCENE_SVG = [
  '<svg viewBox="0 0 320 100" aria-hidden="true" shape-rendering="crispEdges"><path d="M0 89h',
  '320v11H0z" fill="#FFF4DE"/><path d="M25 64h8v-8h8V45h8v11h8v8h8v8h8v13H17V72h8zM254 66h8V5',
  '5h8V43h8v12h8v11h8v10h8v10h-56V76h8z" fill="#B78258"/><path d="M41 45h8v11h8v8H33v-8h8zM27',
  '0 43h8v12h8v8h-24v-8h8z" fill="#FFF4DE"/><path d="M104 51h112v39H104z" fill="#A93238"/><pa',
  'th d="M96 44h16v-8h16v-8h64v8h16v8h16v9H96z" fill="#A93238"/><path d="M96 44h16v-8h16v-8h6',
  '4v8h16v8h16v6H96z" fill="#FFF4DE"/><path d="M184 17h12v20h-12zM144 59h32v31h-32z" fill="#4',
  'B2D25"/><path d="M114 60h16v16h-16zM190 60h16v16h-16zM156 61h8v8h-8z" fill="#E9C776"/><pat',
  'h d="M177 9h6V3h6v6h-6v6h-6z" fill="#FFF4DE"/><path d="M231 10h6v6h6v6h-6v6h-6v-6h-6v-6h6z',
  '" fill="#E9C776"/></svg>',
].join('');

const GOOGLE_SVG = [
  '<svg viewBox="0 0 24 24" width="23" height="23" aria-hidden="true"><path fill="#4285F4" d=',
  '"M21.5 12.2c0-.7-.1-1.3-.2-1.9H12v3.8h5.3c-.2 1.2-.9 2.2-1.9 2.9v2.5h3.2c1.9-1.7 2.9-4.2 2',
  '.9-7.3z"/><path fill="#34A853" d="M12 22c2.7 0 4.9-.9 6.6-2.5l-3.2-2.5c-.9.6-2 1-3.4 1-2.6',
  ' 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z"/><path fill="#FBBC05" d="M6.4 13.9a6 6 0 0 ',
  '1 0-3.8V7.5H3.1a10 10 0 0 0 0 9l3.3-2.6z"/><path fill="#EA4335" d="M12 6c1.5 0 2.8.5 3.8 1',
  '.5l2.9-2.9A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.9 5.5l3.3 2.6C7.2 7.8 9.4 6 12 6z"/></svg>',
].join('');

const KAKAO_SVG = [
  '<svg viewBox="0 0 24 24" width="23" height="23" aria-hidden="true"><path fill="#3B2521" d=',
  '"M12 3C5.9 3 1 6.8 1 11.4c0 3 2 5.6 5.1 7.1l-.9 3.4c-.1.4.3.7.7.5l4.3-2.7c.6.1 1.2.1 1.8.1',
  ' 6.1 0 11-3.8 11-8.4S18.1 3 12 3z"/></svg>',
].join('');

const CHOCOLATE_SVGS = [
  [
    '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" shape-rendering="crispEdges"><pat',
    'h d="M5 3h14v18H5z" fill="#4B2D25"/><path d="M7 5h4v5H7zm6 0h4v5h-4zM7 12h4v6H7zm6 0h4v6h-',
    '4z" fill="#B78258"/></svg>',
  ].join(''),
  [
    '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" shape-rendering="crispEdges"><pat',
    'h d="M3 6h3V3h4v3h4V3h4v3h3v8h-3v3h-3v3H9v-3H6v-3H3z" fill="#A93238"/><path d="M6 6h3v3H6z',
    '" fill="#E9C776"/></svg>',
  ].join(''),
  [
    '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" shape-rendering="crispEdges"><pat',
    'h d="M10 2h4v4h3v4h3v4h3v4H1v-4h3v-4h3V6h3z" fill="#284C40"/><path d="M10 18h4v4h-4zM7 10h',
    '3v3H7zm7 4h3v3h-3z" fill="#B78258"/></svg>',
  ].join(''),
  [
    '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" shape-rendering="crispEdges"><pat',
    'h d="M3 7h18v14H3z" fill="#4B2D25"/><path d="M10 7h4v14h-4zM3 11h18v3H3zM5 2h5v3h4V2h5v5H5',
    'z" fill="#E9C776"/></svg>',
  ].join(''),
  [
    '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" shape-rendering="crispEdges"><pat',
    'h d="M10 1h4v6h7v6h-4v4h2v5h-5v-4h-4v4H5v-5h2v-4H3V7h7z" fill="#E9C776"/></svg>',
  ].join(''),
  [
    '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" shape-rendering="crispEdges"><pat',
    'h d="M7 3h10v3h4v12h-4v3H7v-3H3V6h4z" fill="#4B2D25"/><path d="M7 7h3v3H7zm7 4h3v3h-3zM8 1',
    '5h3v3H8z" fill="#B78258"/></svg>',
  ].join('')
];

export function icon(index = 0) {
  return CHOCOLATE_SVGS[index] ?? CHOCOLATE_SVGS[0];
}

export function scene() {
  return `<div class="snow-scene">${snow()}${SCENE_SVG}</div>`;
}

export function googleMark() {
  return GOOGLE_SVG;
}

export function kakaoMark() {
  return KAKAO_SVG;
}

export function snow(count = 16) {
  const flakes = Array.from({ length: count }, (_, index) => {
    const left = (index * 37) % 100;
    const speed = 3 + index % 5;
    const delay = index * 0.71;
    return `<i style="--left:${left}%;--speed:${speed}s;--delay:-${delay}s"></i>`;
  });
  return `<div class="pixel-snow" aria-hidden="true">${flakes.join('')}</div>`;
}
