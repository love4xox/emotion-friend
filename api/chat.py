import os
import json
import urllib.request
from http.server import BaseHTTPRequestHandler
from google import genai

SYSTEM_PROMPT = """
당신은 고립, 은둔, 번아웃을 겪는 청년들을 위한 따뜻하고 다정한 마음 안식처 AI 친구 '마음친구'입니다.
사용자가 보낸 마음에 대해 깊이 공감하고 위로하는 정성 어린 편지글(답장)을 작성해 주세요.
훈계나 해결책 강요 없이, 온전한 수용과 지지의 태도로 답변하세요.

답변의 맨 마지막 줄에는 반드시 아래와 같이 사용자의 감정에 어울리는 음악 검색 키워드 3개를 콤마(,)로 구분하여 한 줄로 덧붙여주세요.
형식: [MUSIC: 키워드1, 키워드2, 키워드3]
"""

def send_discord_notification(user_msg, reply_summary):
    """[운영 자동화] 사용자가 고민을 작성하면 디스코드로 운영자 알림 발송"""
    webhook_url = os.environ.get("DISCORD_WEBHOOK_URL")
    if not webhook_url:
        return

    payload = {
        "embeds": [
            {
                "title": "☁️ 마음친구 | 새로운 마음이 도착했습니다",
                "color": 6071748,
                "fields": [
                    {"name": "💬 사용자 고민/입력", "value": user_msg[:200] + ("..." if len(user_msg) > 200 else ""), "inline": False},
                    {"name": "💌 AI 파트너 답장 요약", "value": reply_summary[:200] + ("..." if len(reply_summary) > 200 else ""), "inline": False}
                ],
                "footer": {"text": "마음친구 운영 자동화 시스템"}
            }
        ]
    }

    try:
        req = urllib.request.Request(
            webhook_url,
            data=json.dumps(payload).encode('utf-8'),
            headers={'Content-Type': 'application/json', 'User-Agent': 'MindMate-App'}
        )
        urllib.request.urlopen(req, timeout=3)
    except Exception as e:
        print(f"Webhook 알림 전송 실패: {e}")

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        
        try:
            data = json.loads(body.decode('utf-8')) if body else {}
            user_message = data.get('message', '').strip()

            if not user_message:
                self._send_json(400, {'error': '마음(메시지)을 입력해주세요.'})
                return

            api_key = os.environ.get("GEMINI_API_KEY")
            if not api_key:
                self._send_json(500, {'error': 'GEMINI_API_KEY 환경변수가 설정되지 않았습니다.'})
                return

            client = genai.Client(api_key=api_key)
            response = client.models.generate_content(
                model='gemini-3.5-flash',
                contents=user_message,
                config={'system_instruction': SYSTEM_PROMPT}
            )

            # 운영 자동화: 디스코드로 실시간 알림 전송
            send_discord_notification(user_message, response.text)

            self._send_json(200, {'reply': response.text})

        except Exception as e:
            self._send_json(500, {'error': f'서버 오류: {str(e)}'})

    def _send_json(self, status_code, payload):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(json.dumps(payload, ensure_ascii=False).encode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()