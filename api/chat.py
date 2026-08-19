# api/chat.py
import os
import json
from http.server import BaseHTTPRequestHandler
from google import genai
from .prompts import SYSTEM_PROMPT

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        # 1. 클라이언트 요청 본문 길이 확인 및 데이터 읽기
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        
        try:
            # 2. JSON 파싱
            data = json.loads(body.decode('utf-8'))
            user_message = data.get('message', '').strip()

            # 3. 필수값 누락 검증 (400 Bad Request)
            if not user_message:
                self._send_json(400, {'error': '마음(메시지)을 입력해주세요.'})
                return

            # 4. 서버 환경 변수에서 Gemini API 키 로드
            api_key = os.environ.get("GEMINI_API_KEY")
            if not api_key:
                raise Exception("GEMINI_API_KEY 환경변수가 설정되지 않았습니다.")

            # 5. Google GenAI 클라이언트 초기화 및 콘텐츠 생성
            client = genai.Client(api_key=api_key)
            response = client.models.generate_content(
                model='gemini-3.5-flash',
                contents=user_message,
                config={'system_instruction': SYSTEM_PROMPT}
            )

            # 6. 정상 응답 반환 (200 OK)
            self._send_json(200, {'reply': response.text})

        except Exception as e:
            # 7. 서버 및 API 오류 처리 (500 Internal Server Error)
            self._send_json(500, {'error': str(e)})

    def _send_json(self, status_code, payload):
        """JSON 헤더 설정 및 응답 전송 헬퍼 메서드"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode('utf-8'))

    def do_OPTIONS(self):
        """CORS 프리플라이트 요청 처리"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()