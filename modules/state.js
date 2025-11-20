
function loadMasteredWords() {
    const storedWords = localStorage.getItem('masteredWords_vocAnglais');
    return storedWords ? new Set(JSON.parse(storedWords)) : new Set();
}

export const varCss = {
    colorCorrect: getComputedStyle(document.documentElement).getPropertyValue('--color-correct').trim(),
    colorIncorrect: getComputedStyle(document.documentElement).getPropertyValue('--color-incorrect').trim(),
    colorPrimary: getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim(),
    colorCard: getComputedStyle(document.documentElement).getPropertyValue('--color-card').trim(),
    colorText: getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim()
};

export let ALL_VOCAB_DATA = null;
export let vocab = [];
export let currentChapterKey = null;
export let currentSubcategoryKey = null;
export let chapterAlert = null;
export let chosenWord = '';
export let shuffledVocab = [];
export let currentCardIndex = 0;
export let masteredWords = loadMasteredWords();

export function setAllVocabData(data) {
    ALL_VOCAB_DATA = data;
}

export function setVocab(newVocab) {
    vocab = newVocab;
}

export function setCurrentChapterKey(key) {
    currentChapterKey = key;
}

export function setCurrentSubcategoryKey(key) {
    currentSubcategoryKey = key;
}

export function setChapterAlert(alert) {
    chapterAlert = alert;
}

export function setChosenWord(word) {
    chosenWord = word;
}

export function setShuffledVocab(newShuffledVocab) {
    shuffledVocab = newShuffledVocab;
}

export function setCurrentCardIndex(index) {
    currentCardIndex = index;
}

export function saveMasteredWords() {
    localStorage.setItem('masteredWords_vocAnglais', JSON.stringify(Array.from(masteredWords)));
}
