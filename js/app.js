import { fetchEmpathyReply } from './api.js';
import { saveLetter } from './storage.js';
import { getRecommendedMusic, createMusicItemHTML } from './music.js';
import { switchTab } from './ui.js';

let currentLetter = null;

document.addEventListener('DOMContentLoaded', () => {
    // 탭 버튼 클릭 이벤트
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab(btn.getAttribute('data-tab'));
        });
    });

    // 로고 및 버튼 이벤트
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
        const replyText = await fetchEmpathyReply(input);
        responseArea.innerHTML = `<p style="line-height:1.9; white-space: pre-wrap;">${replyText}</p>`;
        if (saveBtnWrapper) saveBtnWrapper.style.display = 'block';

        currentLetter = {
            id: Date.now(),
            date: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            userInput: input,
            reply: replyText
        };

        const musicListEl = document.getElementById("music-list");
        const musicData = getRecommendedMusic(input);
        musicListEl.innerHTML = musicData.map(createMusicItemHTML).join('');

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