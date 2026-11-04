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
            browser = playwright.chromium.launch(headless=True)
            context = browser.new_context(viewport={'width': 390, 'height': 844}, timezone_id='Asia/Seoul')
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
            assert page.locator('select[name=timezone]').input_value() == 'Asia/Seoul'
            page.locator('input[name=nickname]').fill('수진')
            page.get_by_role('button', name='캘린더 만들기').click()
            page.locator('[data-screen=created]').wait_for()
            public_link = page.locator('.share-link-url').inner_text()
            assert '/c/' in public_link, public_link
            assert page.locator('[data-action=private]').count() == 0
            page.get_by_role('button', name='내 캘린더로 가기').click()
            page.locator('[data-screen=owner]').wait_for()
            assert page.locator('[data-screen=owner] .share-link .share-copy-icon').count() == 1
            assert page.locator('[data-screen=owner] .share-utilities [data-action=copy]').count() == 0
            assert page.locator('[data-screen=owner] .new-calendar-button:visible').count() == 1
            assert public_link in page.locator('[data-screen=owner] .share-link-url').inner_text()
            page.set_viewport_size({'width': 1280, 'height': 900})
            page.locator('[data-month="12"]').click()
            header = page.locator('.owner-layout .calendar-intro').bounding_box()
            calendar = page.locator('.owner-layout .calendar-main').bounding_box()
            sidebar = page.locator('.owner-layout .owner-sidebar').bounding_box()
            assert header and calendar and sidebar
            assert header['y'] < calendar['y']
            assert sidebar['x'] > calendar['x']
            assert abs(sidebar['y'] - calendar['y']) < 15
            owner_button_style = page.locator('.desktop-new-calendar .new-calendar-button').evaluate(
                "(el) => ({background: getComputedStyle(el).backgroundColor, "
                "border: getComputedStyle(el).borderTopWidth, "
                "shadow: getComputedStyle(el).boxShadow})")
            assert owner_button_style['border'] == '3px'
            assert owner_button_style['shadow'] != 'none'
            page.set_viewport_size({'width': 390, 'height': 844})
            page.locator('[data-month="11"]').click()
            mobile_button_style = page.locator('.mobile-new-calendar .new-calendar-button').evaluate(
                "(el) => ({background: getComputedStyle(el).backgroundColor, "
                "border: getComputedStyle(el).borderTopWidth, "
                "shadow: getComputedStyle(el).boxShadow})")
            assert mobile_button_style == owner_button_style
            page.locator('[data-action=open-share]').click()
            page.locator('.owner-layout.share-open .owner-share').wait_for()
            page.locator('.share-close').click()
            assert page.locator('.owner-layout.share-open').count() == 0
            page.screenshot(path=str(ROOT / 'tests/owner-current.png'))
            # 확인: 미래 날짜는 메시지 개수 없이 잠금 상태만 노출.
            page.locator('[data-month="12"]').click()
            page.evaluate("window.scrollTo(0, 360)")
            before_drawer = page.evaluate("window.scrollY")
            assert before_drawer > 0
            page.locator('[data-day="13"][data-role="owner"]').evaluate("(element) => element.click()")
            page.locator('[data-screen=locked]').wait_for()
            assert '13일에' in page.locator('.bubble').inner_text()
            assert abs(page.evaluate("window.scrollY") - before_drawer) < 5
            page.get_by_role('button', name='기다릴게!').click()
            page.locator('[data-screen=owner]').wait_for()
            assert abs(page.evaluate("window.scrollY") - before_drawer) < 5
            page.get_by_role('button', name='로그아웃').click()
            page.locator('[data-screen=landing]').wait_for()
            page.goto(public_link)
            page.locator('[data-screen=tutorial]').wait_for()
            page.get_by_role('button', name='알겠어!').click()
            page.locator('[data-screen=visitor]').wait_for()
            page.set_viewport_size({'width': 1280, 'height': 900})
            visitor_header = page.locator('.visitor-layout .calendar-intro').bounding_box()
            visitor_calendar = page.locator('.visitor-layout .calendar-main').bounding_box()
            visitor_action = page.locator('.visitor-layout .visitor-create-action').bounding_box()
            visitor_box = page.locator('.visitor-layout .box').bounding_box()
            assert visitor_header and visitor_calendar and visitor_action and visitor_box
            assert visitor_header['y'] < visitor_calendar['y']
            assert abs((visitor_header['x'] + visitor_header['width'] / 2)
                       - (visitor_calendar['x'] + visitor_calendar['width'] / 2)) < 15
            assert visitor_action['y'] > visitor_box['y'] + visitor_box['height']
            assert page.locator('.visitor-create-action .secondary').is_visible()
            visitor_button_style = page.locator('.visitor-create-action .secondary').evaluate(
                "(el) => ({background: getComputedStyle(el).backgroundColor, "
                "border: getComputedStyle(el).borderTopWidth, "
                "shadow: getComputedStyle(el).boxShadow})")
            assert visitor_button_style == owner_button_style
            assert page.locator('.visitor-guide').count() == 0
            assert '초콜릿을 선택해 메시지를 남겨줘' in page.locator(
                '.visitor-layout .calendar-intro .sub').inner_text()
            page.set_viewport_size({'width': 390, 'height': 844})
            assert page.locator('.visitor-create-action .secondary').is_visible()
            assert page.locator('.visitor-create-action .secondary').count() == 1
            mobile_action = page.locator('.visitor-create-action').bounding_box()
            mobile_footer = page.locator('.visitor-layout footer').bounding_box()
            assert mobile_action and mobile_footer and mobile_action['y'] < mobile_footer['y'], (
                f"mobile CTA: {mobile_action}, footer: {mobile_footer}")
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
            page.locator('[data-screen=owner]').wait_for()
            assert public_link in page.locator('[data-screen=owner] .url').inner_text()
            page.goto(public_link + '/owner')
            page.locator('[data-screen=owner]').wait_for()
            page.locator('[data-month="12"]').click()
            page.locator('[data-day="12"][data-role="owner"]').click()
            page.locator('[data-screen=read]').wait_for()
            assert '달콤한 하루!' in page.locator('.note').inner_text()
            assert '1 / 2' in page.locator('.paging').inner_text()
            page.locator('[data-action=next]').click()
            assert '두 번째 선물!' in page.locator('.note').inner_text()
            # 주인과 다른 시간대를 선택한 신규 캘린더의 미래 서랍 잠금 검증.
            page.get_by_role('button', name='서랍 닫기').click()
            page.locator('[data-screen=owner]').wait_for()
            page.locator('[data-action=new-calendar]:visible').click()
            page.locator('[data-screen=create]').wait_for()
            page.locator('input[name=nickname]').fill('뉴욕친구')
            page.locator('select[name=timezone]').select_option('America/New_York')
            page.get_by_role('button', name='캘린더 만들기').click()
            page.locator('[data-screen=created]').wait_for()
            page.get_by_role('button', name='내 캘린더로 가기').click()
            page.locator('[data-screen=owner]').wait_for()
            assert 'America/New_York' in page.locator('[data-screen=owner] footer').inner_text()
            assert page.locator('[data-day="12"][data-role="owner"]').count() == 1
            page.locator('[data-month="12"]').click()
            page.locator('[data-day="12"][data-role="owner"]').click()
            page.locator('[data-screen=locked]').wait_for()
            assert 'America/New_York' in page.locator('.bubble').inner_text()
            if errors:
                raise AssertionError('; '.join(errors))
            print('브라우저 모의 통합 테스트: 생성/로그인/작성/잠금/열람 성공, 오류 0개')
            browser.close()
        server.shutdown()


if __name__ == '__main__':
    main()
