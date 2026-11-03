import assert from 'node:assert/strict';
import test from 'node:test';

import { escapeHtml, messageHtml } from '../src/utils/format.js';

test('닉네임/메시지에 HTML 태그를 주입할 수 없다', () => {
  const script = '<img src=x onerror=alert(1)>';
  assert.equal(escapeHtml(script).includes('<img'), false);
  assert.equal(messageHtml(script).includes('<img'), false);
});

test('메시지 줄바꿈은 안전하게 변환된다', () => {
  assert.equal(messageHtml('첫 줄\n둘째 줄'), '첫 줄<br>둘째 줄');
  assert.equal(messageHtml('A & B'), 'A &amp; B');
});
