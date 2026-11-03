"""로컬 브라우저 시각·동선 테스트 전용. 실제 Supabase 대신 메모리 모의를 사용합니다."""
import http.server
import pathlib
import socketserver
import threading
from datetime import datetime, timedelta, timezone
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
PORT = 5179


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        path = self.path.split('?')[0]
        if path == '/src/data/client.js':
            source = (ROOT / 'src/data/client.js').read_text()
            source = source.replace(
                'import.meta.env',
                "({VITE_SUPABASE_URL:'https://mock.supabase.co',"
                "VITE_SUPABASE_PUBLISHABLE_KEY:'mock'})",
            )
            content = source.encode()
            self.send_response(200)
            self.send_header('Content-Type', 'text/javascript; charset=utf-8')
            self.send_header('Content-Length', str(len(content)))
            self.end_headers()
            self.wfile.write(content)
            return
        if path == '/src/data/kakao.js':
            content = (
                "export async function startKakaoSignIn() {"
                "localStorage.setItem('mock-user', JSON.stringify({id:'owner-123'}));"
                "location.assign('/auth/callback?state=mock-kakao&code=mock-code');"
                "}"
                "export async function finishKakaoSignIn() {"
                "return JSON.parse(localStorage.getItem('mock-user') ?? 'null');"
                "}"
            ).encode()
            self.send_response(200)
            self.send_header('Content-Type', 'text/javascript; charset=utf-8')
            self.send_header('Content-Length', str(len(content)))
            self.end_headers()
            self.wfile.write(content)
            return
        if not path.startswith(('/src/', '/tests/')):
            self.path = '/tests/browser.html'
        super().do_GET()

    def log_message(self, format, *args):
        pass


class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True


def main():
    with Server(('127.0.0.1', PORT), Handler) as server:
        threading.Thread(target=server.serve_forever, daemon=True).start()
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(executable_path='/usr/bin/chromium', headless=True)
            context = browser.new_context(viewport={'width': 390, 'height': 844})
            page = context.new_page()
            page.clock.install(time=datetime(2026, 12, 12, 8, 30, tzinfo=timezone(timedelta(hours=9))))
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            url = f'http://127.0.0.1:{PORT}'
            page.goto(url + '/')
            page.locator('[data-screen=landing]').wait_for()
            page.screenshot(path=str(ROOT / 'tests/landing-current.png'))
            page.locator('[data-action=lang]').click()
            assert page.locator('html').get_attribute('lang') == 'en'
            page.locator('[data-action=lang]').click()
            assert page.locator('html').get_attribute('lang') == 'ko'
            page.get_by_role('button', name='내 캘린더 만들기').click()
            page.locator('[data-screen=login]').wait_for()
            page.screenshot(path=str(ROOT / 'tests/login-current.png'))
            page.get_by_role('button', name='카카오로 계속하기').click()
            page.locator('[data-screen=create]').wait_for()
            page.locator('input[name=nickname]').fill('수진')
            page.get_by_role('button', name='캘린더 만들기').click()
            page.locator('[data-screen=created]').wait_for()
            public_link = page.locator('.url').inner_text()
            assert '/c/' in public_link, public_link
            page.get_by_role('button', name='내 캘린더로 가기').click()
            page.locator('[data-screen=owner]').wait_for()
            page.screenshot(path=str(ROOT / 'tests/owner-current.png'))
            # 확인: 미래 날짜는 메시지 개수 없이 잠금 상태만 노출.
            page.locator('[data-month="12"]').click()
            page.locator('[data-day="13"][data-role="owner"]').click()
            page.locator('[data-screen=locked]').wait_for()
            assert '13일에' in page.locator('.bubble').inner_text()
            page.get_by_role('button', name='기다릴게!').click()
            page.locator('[data-screen=owner]').wait_for()
            page.get_by_role('button', name='로그아웃').click()
            page.locator('[data-screen=landing]').wait_for()
            page.goto(public_link)
            page.locator('[data-screen=tutorial]').wait_for()
            page.get_by_role('button', name='알겠어!').click()
            page.locator('[data-screen=visitor]').wait_for()
            page.goto(public_link + '/sent?date=2026-12-12')
            page.locator('[data-screen=visitor]').wait_for()
            page.locator('[data-month="12"]').click()
            page.locator('[data-day="12"][data-role="visitor"]').click()
            page.locator('[data-screen=login]').wait_for()
            page.get_by_role('button', name='Google로 계속하기').click()
            page.locator('[data-screen=write]').wait_for()
            page.locator('textarea[name=message]').fill('달콤한 하루!')
            assert page.locator('#count').inner_text() == '7'
            page.get_by_role('button', name='초콜릿 남기기').click()
            page.locator('[data-screen=sent]').wait_for()
            page.get_by_role('button', name='캘린더로 돌아가기').click()
            page.locator('[data-screen=visitor]').wait_for()
            page.locator('[data-month="12"]').click()
            page.locator('[data-day="12"][data-role="visitor"]').click()
            page.locator('[data-screen=write]').wait_for()
            page.locator('textarea[name=message]').fill('두 번째 선물!')
            page.get_by_role('button', name='초콜릿 남기기').click()
            page.locator('[data-screen=sent]').wait_for()
            page.get_by_role('button', name='로그아웃').click()
            page.goto(public_link)
            page.locator('[data-day="12"][data-role="visitor"]').wait_for()
            # 다시 주인 계정으로 로그인하여 저장 메시지를 읽음.
            page.goto(url + '/create')
            page.locator('[data-screen=login]').wait_for()
            page.get_by_role('button', name='카카오로 계속하기').click()
            page.locator('[data-screen=create]').wait_for()
            page.goto(public_link + '/owner')
            page.locator('[data-screen=owner]').wait_for()
            page.locator('[data-month="12"]').click()
            page.locator('[data-day="12"][data-role="owner"]').click()
            page.locator('[data-screen=read]').wait_for()
            assert '달콤한 하루!' in page.locator('.note').inner_text()
            assert '1 / 2' in page.locator('.paging').inner_text()
            page.locator('[data-action=next]').click()
            assert '두 번째 선물!' in page.locator('.note').inner_text()
            if errors:
                raise AssertionError('; '.join(errors))
            print('브라우저 모의 통합 테스트: 생성/로그인/작성/잠금/열람 성공, 오류 0개')
            browser.close()
        server.shutdown()


if __name__ == '__main__':
    main()
