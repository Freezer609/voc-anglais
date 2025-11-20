
import { loadVocabData } from './modules/data.js';
import { 
    varCss, vocab, currentChapterKey, currentSubcategoryKey, masteredWords, 
    setVocab, setCurrentChapterKey, setCurrentSubcategoryKey, setChapterAlert, saveMasteredWords 
} from './modules/state.js';
import { initializeSuggestMastered, checkSuggestMastered, getConsecutiveKnownCounts } from './modules/suggestMastered.js';

import { startFlashcardGame } from './modules/flashcard.js';
import { startFlashcard2Mode } from './modules/flashcard2.js';
import { startQuizGame } from './modules/quiz.js';
import { startHangGame } from './modules/hangman.js';
import { startScrambleGame } from './modules/scramble.js';
import { startDictationGame } from './modules/dictation.js';
import { startMatchGame } from './modules/match.js';

const container = document.querySelector('.container');
const vocabularyList = document.getElementById('fullVocabularyList');

const masteredWordsList = document.getElementById('masteredWordsList');
const resetMasteredBtn = document.getElementById('resetMasteredBtn');
const resetChapterMasteredBtn = document.getElementById('resetChapterMasteredBtn');

const flashcardModeBtn = document.getElementById('flashcardModeBtn');
const flashcard2ModeBtn = document.getElementById('flashcard2ModeBtn');
const quizModeBtn = document.getElementById('quizModeBtn');
const hangmanModeBtn = document.getElementById('hangmanModeBtn');
const scrambleModeBtn = document.getElementById('scrambleModeBtn');
const dictationModeBtn = document.getElementById('dictationModeBtn');
const matchModeBtn = document.getElementById('matchModeBtn');

const flashcardGameContainer = document.getElementById('flashcardGameContainer');
const flashcard2GameContainer = document.getElementById('flashcard2GameContainer');
const quizGameContainer = document.getElementById('quizGameContainer');
const hangmanGameContainer = document.getElementById('hangmanGameContainer');
const scrambleGameContainer = document.getElementById('scrambleGameContainer');
const dictationGameContainer = document.getElementById('dictationGameContainer');
const matchGameContainer = document.getElementById('matchGameContainer');
const allContainers = [flashcardGameContainer, flashcard2GameContainer, quizGameContainer, hangmanGameContainer, scrambleGameContainer, dictationGameContainer, matchGameContainer];
const allModeBtns = [flashcardModeBtn, flashcard2ModeBtn, quizModeBtn, hangmanModeBtn, scrambleModeBtn, dictationModeBtn, matchModeBtn];

const chapterSelectorDiv = document.getElementById('chapterSelector');
const listTitleSummary = document.getElementById('listTitle');
const alertMessageDiv = document.getElementById('alertMessage');
const alertTextP = document.getElementById('alertText');

const categoryModal = document.getElementById('categoryModal');
const modalTitle = document.getElementById('modalTitle');
const modalButtons = document.getElementById('modalButtons');

const totalWordsCountSpan = document.getElementById('totalWordsCount');
const masteredWordsCountSpan = document.getElementById('masteredWordsCount');
const progressPercentageSpan = document.getElementById('progressPercentage');

let ALL_VOCAB_DATA = null;

export function showGameContainer(container, button) {
    hideAllGameContainers();
    container.style.display = 'flex';
    button.classList.add('active');
    setTimeout(() => {
        container.classList.add('active-mode');
        container.style.opacity = '1';
    }, 50);
}

function hideAllGameContainers() {
    allContainers.forEach(container => {
        container.style.display = 'none';
        container.classList.remove('active-mode');
        setTimeout(() => container.style.opacity = '0', 0);
    });
    allModeBtns.forEach(btn => btn.classList.remove('active'));
}

export function displayAlert(message, color) {
    alertTextP.textContent = message;
    alertMessageDiv.style.backgroundColor = color;
    alertMessageDiv.style.display = 'block';
}

export function hideAlert() {
    alertMessageDiv.style.display = 'none';
}

export function updateProgressStatistics() {
    let totalWordsInCurrentChapter = 0;
    if (currentChapterKey && currentSubcategoryKey && ALL_VOCAB_DATA[currentChapterKey] && ALL_VOCAB_DATA[currentChapterKey].subcategories[currentSubcategoryKey]) {
        totalWordsInCurrentChapter = ALL_VOCAB_DATA[currentChapterKey].subcategories[currentSubcategoryKey].data.length;
    }

    let masteredWordsInCurrentChapter = 0;
    if (currentChapterKey && currentSubcategoryKey && ALL_VOCAB_DATA[currentChapterKey] && ALL_VOCAB_DATA[currentChapterKey].subcategories[currentSubcategoryKey]) {
        const fullVocabForChapter = ALL_VOCAB_DATA[currentChapterKey].subcategories[currentSubcategoryKey].data;
        masteredWordsInCurrentChapter = fullVocabForChapter.filter(pair => masteredWords.has(pair[0])).length;
    }

    totalWordsCountSpan.textContent = totalWordsInCurrentChapter;
    masteredWordsCountSpan.textContent = masteredWordsInCurrentChapter;

    let percentage = 0;
    if (totalWordsInCurrentChapter > 0) {
        percentage = Math.round((masteredWordsInCurrentChapter / totalWordsInCurrentChapter) * 100);
    }
    progressPercentageSpan.textContent = `${percentage}%`;
}

export function updateMasteredWordsDisplay() {
    masteredWordsList.innerHTML = '';
    if (masteredWords.size === 0) {
        masteredWordsList.innerHTML = '<p class="no-mastered-words-message">Aucun mot maîtrisé pour le moment.</p>';
        resetMasteredBtn.style.display = 'none';
        return;
    }
    resetMasteredBtn.style.display = 'block';
    masteredWords.forEach(word => {
        const li = document.createElement('li');
        li.classList.add('mastered-word-item');
        li.innerHTML = `<span>${word}</span><button class="remove-mastered-btn" data-word="${word}">❌</button>`;
        masteredWordsList.appendChild(li);
    });

    masteredWordsList.querySelectorAll('.remove-mastered-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const wordToRemove = event.target.dataset.word;
            masteredWords.delete(wordToRemove);
            saveMasteredWords();
            updateMasteredWordsDisplay();
            updateProgressStatistics();
            displayAlert(`'${wordToRemove}' a été retiré des mots maîtrisés.`, varCss.colorPrimary);
            if (currentChapterKey && currentSubcategoryKey) {
                changeVocabulary(currentChapterKey, currentSubcategoryKey);
            }
        });
    });
}

function generateChapterButtons() {
    chapterSelectorDiv.innerHTML = '';
    if (!ALL_VOCAB_DATA) return;

    Object.entries(ALL_VOCAB_DATA).forEach(([key, chapter]) => {
        const button = document.createElement('button');
        button.id = chapter.selectorId;
        button.textContent = chapter.title;
        button.addEventListener('click', () => openCategoryModal(key, chapter));
        chapterSelectorDiv.appendChild(button);
    });
}

function openCategoryModal(chapterKey, chapter) {
    document.querySelectorAll('.chapter-selector button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(chapter.selectorId).classList.add('active');

    trackEvent(`chapitre-${chapterKey}-clicked`);

    modalTitle.textContent = `Choisir la section pour ${chapter.title}`;
    modalButtons.innerHTML = '';
    
    Object.entries(chapter.subcategories).forEach(([subKey, subcategory]) => {
        const button = document.createElement('button');
        button.textContent = subcategory.name;
        button.style.backgroundColor = subcategory.color;
        button.style.color = '#FFFFFF';
        button.addEventListener('click', () => {
            changeVocabulary(chapterKey, subKey);
        });
        modalButtons.appendChild(button);
    });
    categoryModal.classList.add('is-open');
}

function changeVocabulary(chapterKey, subcategoryKey) {
    hideAllGameContainers();
    setCurrentChapterKey(chapterKey);
    setCurrentSubcategoryKey(subcategoryKey);
    categoryModal.classList.remove('is-open');
    
    trackEvent(`section-${chapterKey}-${subcategoryKey}-selected`);
    
    if (!ALL_VOCAB_DATA) {
        displayAlert("Erreur: Fichier de données (vocab_data.json) manquant ou incorrect.", varCss.colorIncorrect);
        return;
    }

    const chapter = ALL_VOCAB_DATA[chapterKey];
    const subcategory = chapter.subcategories[subcategoryKey];
    const fullVocab = subcategory.data;
    setVocab(fullVocab.filter(pair => !masteredWords.has(pair[0])));
    setChapterAlert(subcategory.alert);

    listTitleSummary.textContent = `${chapter.title} - ${subcategory.name}`;

    if (chapterAlert && chapterAlert.message) {
        displayAlert(chapterAlert.message, chapterAlert.color || varCss.colorPrimary);
    } else {
        hideAlert();
    }

    generateList();
    updateProgressStatistics();
    startFlashcardGame();
}

function generateList() {
    vocabularyList.innerHTML = '';
    vocab.forEach(pair => {
        const li = document.createElement('li');
        li.textContent = `${pair[0]} - ${pair[1]}`;
        vocabularyList.appendChild(li);
    });
}

export function trackEvent(eventName) {
    // console.log(eventName);
}


const introOverlay = document.getElementById('introOverlay');
const introLogo = document.getElementById('introLogo');
const introSound = document.getElementById('introSound');

async function runApp() {
    ALL_VOCAB_DATA = await loadVocabData();
    generateChapterButtons();
    hideAlert();
    updateMasteredWordsDisplay();
    updateProgressStatistics();
    initializeSuggestMastered();

    flashcardModeBtn.addEventListener('click', startFlashcardGame);
    quizModeBtn.addEventListener('click', startQuizGame);
    hangmanModeBtn.addEventListener('click', startHangGame);
    scrambleModeBtn.addEventListener('click', startScrambleGame);
    dictationModeBtn.addEventListener('click', startDictationGame);
    matchModeBtn.addEventListener('click', startMatchGame);
    flashcard2ModeBtn.addEventListener('click', startFlashcard2Mode);

    resetMasteredBtn.addEventListener('click', () => {
        if (confirm("Êtes-vous sûr de vouloir réinitialiser tous les mots maîtrisés ? Ils réapparaîtront dans les jeux.")) {
            masteredWords.clear();
            saveMasteredWords();
            updateMasteredWordsDisplay();
            updateProgressStatistics();
            displayAlert("Tous les mots maîtrisés ont été réinitialisés.", varCss.colorPrimary);
            if (currentChapterKey && currentSubcategoryKey) {
                changeVocabulary(currentChapterKey, currentSubcategoryKey);
            }
        }
    });

    const flashcard2WelcomeModal = document.getElementById('flashcard2-welcome-modal');
    const flashcard2DontShowAgain = document.getElementById('flashcard2-dont-show-again');
    const flashcard2GoBtn = document.getElementById('flashcard2-go-btn');
    const flashcard2LaterBtn = document.getElementById('flashcard2-later-btn');

    function closeFlashcard2Welcome() {
        if (flashcard2DontShowAgain.checked) {
            localStorage.setItem('hideFlashcard2Welcome', 'true');
        }
        flashcard2WelcomeModal.classList.remove('is-open');
    }

    flashcard2GoBtn.addEventListener('click', () => {
        closeFlashcard2Welcome();
        showGameContainer(flashcard2GameContainer, flashcard2ModeBtn);
    });

    flashcard2LaterBtn.addEventListener('click', () => {
        closeFlashcard2Welcome();
    });

    resetChapterMasteredBtn.addEventListener('click', () => {
        if (!currentChapterKey || !currentSubcategoryKey) {
            displayAlert("Veuillez d'abord sélectionner un chapitre.", varCss.colorIncorrect);
            return;
        }

        if (confirm(`Êtes-vous sûr de vouloir réinitialiser les mots maîtrisés pour le chapitre actuel ?`)) {
            const chapter = ALL_VOCAB_DATA[currentChapterKey];
            const subcategory = chapter.subcategories[currentSubcategoryKey];
            const fullVocabForChapter = subcategory.data;

            fullVocabForChapter.forEach(pair => {
                masteredWords.delete(pair[0]);
            });

            saveMasteredWords();
            updateMasteredWordsDisplay();
            updateProgressStatistics();
            displayAlert(`Les mots maîtrisés pour le chapitre actuel ont été réinitialisés.`, varCss.colorPrimary);

            if (currentChapterKey && currentSubcategoryKey) {
                changeVocabulary(currentChapterKey, currentSubcategoryKey);
            }
        }
    });

    const frontFace = document.getElementById('front');
    if (frontFace) {
        frontFace.textContent = "Sélectionnez un chapitre ci-dessus";
        const backFace = document.getElementById('back');
        backFace.textContent = "Puis une section pour commencer à jouer.";
    }

    function reviewintro() {
        const introOverlay = document.getElementById('introOverlay');
        const introLogo = document.getElementById('introLogo');
        const introSound = document.getElementById('introSound');

        introOverlay.style.display = 'flex';
        introOverlay.style.opacity = '1';
        introLogo.classList.remove('fade-in');

        void introLogo.offsetWidth;

        introSound.play().catch(error => console.error("Audio play failed:", error));
        introLogo.classList.add('fade-in');

        setTimeout(() => {
            introOverlay.style.opacity = '0';
            setTimeout(() => {
                introOverlay.style.display = 'none';
            }, 500);
        }, 2500);
    }

    window.reviewintro = reviewintro;

    console.log("%cBienvenue, développeur !","color: #BB86FC; font-size: 20px; font-weight: bold;");
    console.log("Une commande spéciale est disponible : tapez %creviewintro()%c pour revoir l'animation d'introduction.", "color: #03DAC6; font-family: monospace;", "");
}

function handleIntro() {
    if (localStorage.getItem('introShown') === 'true') {
        introOverlay.style.display = 'none';
        runApp();
        return;
    }

    // Use a user interaction to play the sound
    const playIntro = () => {
        document.removeEventListener('click', playIntro);
        document.removeEventListener('keydown', playIntro);
        
        introSound.play().catch(error => console.error("Audio play failed:", error));
        introLogo.classList.add('fade-in');

        setTimeout(() => {
            introOverlay.style.opacity = '0';
            setTimeout(() => {
                introOverlay.style.display = 'none';
            }, 500);
            localStorage.setItem('introShown', 'true');
            runApp();
        }, 2500);
    };

    document.addEventListener('click', playIntro);
    document.addEventListener('keydown', playIntro);
    
    // Fallback in case the user doesn't interact
    setTimeout(() => {
        document.removeEventListener('click', playIntro);
        document.removeEventListener('keydown', playIntro);
        if (localStorage.getItem('introShown') !== 'true') {
            introOverlay.style.display = 'none';
            runApp();
        }
    }, 5000);
}

document.addEventListener('DOMContentLoaded', handleIntro);

export { checkSuggestMastered, getConsecutiveKnownCounts };
