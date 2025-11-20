
import { masteredWords, saveMasteredWords, varCss } from './state.js';
import { updateMasteredWordsDisplay, updateProgressStatistics, displayAlert } from './ui.js';

let consecutiveKnownCounts = {};
let wordToSuggest = '';

export function initializeSuggestMastered() {
    const suggestMasteredModal = document.getElementById('suggest-mastered-modal');
    const suggestMasteredDontShowAgain = document.getElementById('suggest-mastered-dont-show-again');
    const suggestMasteredYesBtn = document.getElementById('suggest-mastered-yes-btn');
    const suggestMasteredNoBtn = document.getElementById('suggest-mastered-no-btn');

    suggestMasteredYesBtn.addEventListener('click', () => {
        masteredWords.add(wordToSuggest);
        saveMasteredWords();
        updateMasteredWordsDisplay();
        updateProgressStatistics();
        displayAlert(`'${wordToSuggest}' a été marqué comme maîtrisé.`, varCss.colorPrimary);
        suggestMasteredModal.classList.remove('is-open');
        if (suggestMasteredDontShowAgain.checked) {
            localStorage.setItem('hideSuggestMastered', 'true');
        }
        consecutiveKnownCounts[wordToSuggest] = 0;
    });

    suggestMasteredNoBtn.addEventListener('click', () => {
        suggestMasteredModal.classList.remove('is-open');
        if (suggestMasteredDontShowAgain.checked) {
            localStorage.setItem('hideSuggestMastered', 'true');
        }
        consecutiveKnownCounts[wordToSuggest] = 0;
    });
}

export function checkSuggestMastered(word) {
    if (localStorage.getItem('hideSuggestMastered') !== 'true' && consecutiveKnownCounts[word] >= 3) {
        wordToSuggest = word;
        const suggestMasteredModal = document.getElementById('suggest-mastered-modal');
        suggestMasteredModal.classList.add('is-open');
    }
}

export function getConsecutiveKnownCounts() {
    return consecutiveKnownCounts;
}
