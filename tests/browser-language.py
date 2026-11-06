"""Browser checks for language detection, persistence and untranslated user content."""
import importlib.util
import pathlib
import threading
from datetime import datetime, timedelta, timezone

from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location('browser_smoke', ROOT / 'tests/browser-smoke.py')
smoke = importlib.util.module_from_spec(spec)
spec.loader.exec_module(smoke)


def assert_language(page, expected):
    page.locator('[data-screen]').wait_for()
    actual = page.locator('html').get_attribute('lang')
    assert actual == expected, f'Expected {expected}, got {actual}'


def main():
    with smoke.Server(('127.0.0.1', smoke.PORT), smoke.Handler) as server:
        threading.Thread(target=server.serve_forever, daemon=True).start()
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(headless=True)
            base = f'http://127.0.0.1:{smoke.PORT}'
            for locale, expected in [
                ('ko-KR', 'ko'), ('en-US', 'en'), ('ja-JP', 'en'),
            ]:
                context = browser.new_context(locale=locale, timezone_id='Asia/Seoul')
                page = context.new_page()
                errors = []
                page.on('pageerror', lambda error: errors.append(str(error)))
                page.goto(base + '/')
                page.locator('[data-screen=landing]').wait_for()
                assert_language(page, expected)
                assert page.locator('[data-action=lang]').inner_text() == (
                    'EN' if expected == 'ko' else '한국어'
                )
                if locale == 'en-US':
                    # Manual selection overrides locale on reload, new tabs and routes.
                    page.locator('[data-action=lang]').click()
                    assert_language(page, 'ko')
                    page.reload()
                    assert_language(page, 'ko')
                    other = context.new_page()
                    other.goto(base + '/create')
                    assert_language(other, 'ko')
                    other.close()

                    # Returning from a different browser locale keeps the preference.
                    saved = context.storage_state()
                    changed = browser.new_context(locale='ja-JP', storage_state=saved)
                    revisit = changed.new_page()
                    revisit.goto(base + '/')
                    assert_language(revisit, 'ko')
                    changed.close()

                    # Calendar owner's language does not change visitor UI or messages.
                    page.evaluate("""() => {
                      localStorage.setItem('mock-user', JSON.stringify({id:'owner-123'}));
                      localStorage.setItem('mock-calendars', JSON.stringify([{
                        id:'cal-1', owner_id:'owner-123', slug:'abcdef1234567890',
                        nickname:'한국이름', timezone:'Asia/Seoul'
                      }]));
                      localStorage.setItem('mock-messages', JSON.stringify([{
                        id:'note-1', calendar_id:'cal-1', gift_date:'2026-11-05',
                        sender_id:'friend-456', chocolate_type:1,
                        body:'안녕! Hello!', created_at:'2026-11-05T03:00:00Z'
                      }]));
                    }""")
                    page.clock.install(time=datetime(
                        2026, 11, 6, 8, 30, tzinfo=timezone(timedelta(hours=9))
                    ))
                    page.goto(base + '/c/abcdef1234567890/read?date=2026-11-05')
                    page.locator('[data-screen=read]').wait_for()
                    assert_language(page, 'ko')
                    assert '안녕! Hello!' in page.locator('.drawer-note-body').inner_text()
                    page.locator('[data-action=lang]').click()
                    assert_language(page, 'en')
                    assert '안녕! Hello!' in page.locator('.drawer-note-body').inner_text()
                assert not errors, errors
                context.close()
            browser.close()
        server.shutdown()
    print('Language browser checks passed: locale, override, reload, routes, message content')


if __name__ == '__main__':
    main()
