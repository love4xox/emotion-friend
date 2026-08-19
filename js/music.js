const MUSIC_DATABASE = {
    sad: [
        { title: "밤편지", artist: "IU", desc: "마음이 버거울 때 조용히 안아주는 노래" },
        { title: "주저하는 연인들을 위해", artist: "잔나비", desc: "쓸쓸한 마음을 달래주는 따뜻한 멜로디" }
    ],
    lonely: [
        { title: "별 보러 가자", artist: "적재", desc: "홀로 있는 밤에 편안한 온기를 주는 곡" },
        { title: "Help", artist: "10cm", desc: "외로운 밤을 다정하게 채워주는 멜로디" }
    ],
    default: [
        { title: "주저하는 연인들을 위해", artist: "잔나비", desc: "따뜻하고 감성적인 멜로디" },
        { title: "밤편지", artist: "IU", desc: "혼자만의 시간에 어울리는 노래" }
    ]
};

export function getRecommendedMusic(text) {
    if (/(슬|울|힘들|지쳐|우울)/.test(text)) return MUSIC_DATABASE.sad;
    if (/(외|혼자|고독|공허)/.test(text)) return MUSIC_DATABASE.lonely;
    return MUSIC_DATABASE.default;
}

export function createMusicItemHTML(item) {
    const query = encodeURIComponent(`${item.artist} ${item.title}`);
    return `
        <li class="music-item">
            <div>
                <div style="font-weight:600;">🎵 ${item.artist} - ${item.title}</div>
                <div style="font-size:0.85rem; color:#758390;">${item.desc}</div>
            </div>
            <a href="https://www.youtube.com/results?search_query=${query}" target="_blank" rel="noopener noreferrer" class="music-link-btn">▶ YouTube 바로듣기</a>
        </li>
    `;
}