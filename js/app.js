import { fetchEmpathyReply } from './api.js';
import { saveLetter } from './storage.js';
import { extractMusicKeywords, saveRecommendedMusic, renderMusicList } from './music.js';
import { switchTab } from './ui.js';

let currentLetter = null;

document.addEventListener('DOMContentLoaded', () => {
    // 1. 네비게이션 탭 전환 이벤트
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const tabName = btn.getAttribute('data-tab');
            switchTab(tabName);

            // 힐링음악 탭을 눌렀을 때 최신 음악 목록 렌더링
            if (tabName === 'music') {
                renderMusicList('music-list-container');
            }
        });
    });

    // 2. 개별 음악 탭 버튼이 별도로 존재하는 경우를 위한 예외 처리
    document.getElementById('tab-music-btn')?.addEventListener('click', () => {
        renderMusicList('music-list-container');
    });

    // 3. 로고 및 주요 버튼 이벤트
    document.getElementById('logoBtn')?.addEventListener('click', () => switchTab('about'));
    document.getElementById('sendBtn')?.addEventListener('click', handleSend);
    document.getElementById('saveBtn')?.addEventListener('click', handleSave);
});

async function handleSend() {
    const inputEl = document.getElementById("emotion-input");
    const input = inputEl.value.trim();
    const responseArea = document.getElementById("response-area");
    const sendBtn = document.getElementById("sendBtn");
    const saveBtnWrapper = document.getElementById("saveBtnWrapper");

    if (!input) {
        alert("마음을 먼저 적어주세요 ☁️");
        return;
    }

    switchTab('response');
    sendBtn.disabled = true;
    if (saveBtnWrapper) saveBtnWrapper.style.display = 'none';
    responseArea.innerHTML = '<p class="loading">☁️ 당신의 마음에 가만히 귀 기울이고 있어요...</p>';

    try {
        const rawReply = await fetchEmpathyReply(input);

        // [MUSIC: ...] 태그 분리 및 음악 리스트 추출
        const { cleanText, keywords } = extractMusicKeywords(rawReply);

        // 답장 영역에는 태그가 제거된 깔끔한 편지글만 출력
        responseArea.innerHTML = `<p style="line-height:1.9; white-space: pre-wrap;">${cleanText}</p>`;
        if (saveBtnWrapper) saveBtnWrapper.style.display = 'block';

        // 추천 음악이 있으면 로컬스토리지에 저장 및 목록 갱신
        if (keywords.length > 0) {
            saveRecommendedMusic(keywords);
            renderMusicList('music-list-container');
        }

        currentLetter = {
            id: Date.now(),
            date: new Date().toLocaleDateString('ko-KR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
            }),
            userInput: input,
            reply: cleanText
        };

    } catch (error) {
        responseArea.innerHTML = `
            <div style="color:#d9534f; padding: 15px; background: #fff5f5; border-radius: 12px; border: 1px solid #fed7d7;">
                <p style="font-weight: 700; margin-bottom: 6px;">답장을 불러오는 중 문제가 생겼어요 😢</p>
                <p style="font-size: 0.9rem;">${error.message}</p>
            </div>
        `;
    } finally {
        sendBtn.disabled = false;
    }
}

function handleSave() {
    if (!currentLetter) return;
    saveLetter(currentLetter);
    alert('💌 보관함에 따뜻하게 저장되었어요! 상단 [📂 보관함] 탭에서 확인하세요.');
}