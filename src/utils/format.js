export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => {
    const replacements = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return replacements[character];
  });
}

export function messageHtml(value) {
  return escapeHtml(value).replace(/\r?\n/g, '<br>');
}

export function encodedHtmlAttribute(value) {
  return escapeHtml(value);
}
