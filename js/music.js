export function extractMusicKeywords(text) {
    const musicRegex = /\[MUSIC:\s*([^\]]+)\]/i;
    const match = text.match(musicRegex);
  
    let cleanText = text;
    let keywords = [];
  
    if (match) {
      cleanText = text.replace(musicRegex, '').trim();
      keywords = match[1].split(',').map((k) => k.trim()).filter(Boolean);
    }
  
    return { cleanText, keywords };
  }
  
  export function saveRecommendedMusic(keywords) {
    if (!keywords || keywords.length === 0) return;
  
    const existing = JSON.parse(localStorage.getItem('mindmate_music_list') || '[]');
    const newItems = keywords.map((title) => ({
      title,
      date: new Date().toLocaleDateString('ko-KR'),
      youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(title)}`,
    }));
  
    // 중복 제거 후 최신 항목을 앞에 추가
    const updated = [...newItems, ...existing.filter((e) => !keywords.includes(e.title))].slice(0, 10);
    localStorage.setItem('mindmate_music_list', JSON.stringify(updated));
  }
  
  export function renderMusicList(containerId = 'music-list-container') {
    const container = document.getElementById(containerId);
    if (!container) return;
  
    const list = JSON.parse(localStorage.getItem('mindmate_music_list') || '[]');
  
    if (list.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding: 40px 20px; color: #888;">
          <p style="font-size: 1.1rem; margin-bottom: 8px;">🎵 아직 추천받은 음악이 없어요.</p>
          <p style="font-size: 0.9rem;">'마음쓰기'에서 답장을 받으면 여기에 맞춤 힐링 음악이 쌓입니다.</p>
        </div>
      `;
      return;
    }
  
    container.innerHTML = list
      .map(
        (item) => `
      <div style="background: #ffffff; border-radius: 12px; padding: 16px 20px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h4 style="margin: 0 0 4px 0; font-size: 1rem; color: #333;">🎧 ${item.title}</h4>
          <span style="font-size: 0.8rem; color: #999;">추천일: ${item.date}</span>
        </div>
        <a href="${item.youtubeUrl}" target="_blank" rel="noopener noreferrer" 
           style="background: #eef2ff; color: #4f46e5; padding: 8px 14px; border-radius: 8px; font-size: 0.85rem; font-weight: bold; text-decoration: none;">
          ▶ 재생하기
        </a>
      </div>
    `
      )
      .join('');
  }