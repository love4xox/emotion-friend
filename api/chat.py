import os
import json
from http.server import BaseHTTPRequestHandler
from google import genai

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        
        try:
            data = json.loads(body.decode('utf-8'))
            user_message = data.get('message', '').strip()

            # 1. 빈 입력값 검증 (400)
            if not user_message:
                self.send_response(400)
                self.send_header('Content-type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(json.dumps({'error': '마음(메시지)을 입력해주세요.'}).encode('utf-8'))
                return

            # 2. Vercel 환경변수에서 API 키 로드
            api_key = os.environ.get("GEMINI_API_KEY")
            if not api_key:
                raise Exception("GEMINI_API_KEY 환경변수가 설정되지 않았습니다.")

            client = genai.Client(api_key=api_key)

            # 3. 고립청년 맞춤 시스템 프롬프트
            system_prompt = """
당신은 고립과 은둔을 겪는 청년들의 마음에 진심으로 공감하고 따뜻한 위로를 전하는 '마음친구'입니다.
- 사용자의 감정을 있는 그대로 인정하고 온전히 수용해 주세요.
- 절대 섣부른 조언, 해결책 강요, 평가, 훈계를 하지 마세요.
- 따뜻하고 다정하며 부담 없는 어조로 3~4문단 내외의 에세이 편지처럼 답장해 주세요.
- 마지막 문장은 오늘 하루를 무사히 견뎌준 것에 대한 다정한 격려로 마무리해 주세요.
"""

            # 4. Gemini 모델 호출
            response = client.models.generate_content(
                model='gemini-3.5-flash',
                contents=user_message,
                config={'system_instruction': system_prompt}
            )

            # 5. 정상 반환 (200)
            self.send_response(200)
            self.send_header('Content-type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps({'reply': response.text}).encode('utf-8'))

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))