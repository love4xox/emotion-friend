import { getSavedLetters, deleteLetter } from './storage.js';

export function switchTab(tabName) {
    document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-tab-btn').forEach(btn => btn.classList.remove('active'));

    const targetSec = document.getElementById(`tab-${tabName}`);
    if (targetSec) targetSec.classList.add('active');

    const targetBtn = document.querySelector(`.nav-tab-btn[data-tab="${tabName}"]`);
    if (targetBtn) targetBtn.classList.add('active');

    if (tabName === 'saved') renderSavedLetters();
}

export function renderSavedLetters() {
    const container = document.getElementById('saved-container');
    const letters = getSavedLetters();

    if (letters.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#9cb1c2; padding:30px 0;">보관된 답장이 없어요 ☁️</p>';
        return;
    }

    container.innerHTML = letters.map(item => `
        <div style="background:#fbfdff; border:1px solid #e4edf5; border-radius:16px; padding:20px; margin-bottom:14px;">
            <button type="button" class="delete-btn" data-id="${item.id}" style="background:#e27c79; color:white; border:none; border-radius:8px; padding:4px 10px; cursor:pointer; float:right;">삭제</button>
            <div style="font-size:0.82rem; color:#758390; margin-bottom:6px;">📅 ${item.date}</div>
            <div style="font-size:0.9rem; color:#4b6b85; margin-bottom:8px;">💬 이야기: ${item.userInput}</div>
            <div style="line-height:1.7;">${item.reply}</div>
        </div>
    `).join('');

    container.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = Number(e.target.getAttribute('data-id'));
            if (confirm('이 답장을 보관함에서 삭제하시겠어요?')) {
                deleteLetter(id);
                renderSavedLetters();
            }
        });
    });
}