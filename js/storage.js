const STORAGE_KEY = 'mindmate_saved_letters';

export function getSavedLetters() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

export function saveLetter(letterObj) {
    const letters = getSavedLetters();
    letters.unshift(letterObj);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(letters));
}

export function deleteLetter(id) {
    let letters = getSavedLetters();
    letters = letters.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(letters));
    return letters;
}