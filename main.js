import { loadVocabData } from './modules/data.js';
import { 
    varCss,
    masteredWords, 
    currentChapterKey, 
    currentSubcategoryKey,
    setAllVocabData,
    saveMasteredWords,
    ALL_VOCAB_DATA,
} from './modules/state.js';
import { initializeSuggestMastered, checkSuggestMastered, getConsecutiveKnownCounts } from './modules/suggestMastered.js';
import { showGameContainer, hideAlert, updateMasteredWordsDisplay, updateProgressStatistics, generateChapterButtons, changeVocabulary, displayAlert } from './modules/ui.js';
import { startFlashcardGame } from './modules/flashcard.js';
import { startFlashcard2Mode } from './modules/flashcard2.js';
import { startQuizGame } from './modules/quiz.js';
import { startHangGame } from './modules/hangman.js';
import { startScrambleGame } from './modules/scramble.js';
import { startDictationGame } from './modules/dictation.js';
import { startMatchGame } from './modules/match.js';

// --- DOM Elements ---
const resetMasteredBtn = document.getElementById('resetMasteredBtn');
const resetChapterMasteredBtn = document.getElementById('resetChapterMasteredBtn');
const flashcardModeBtn = document.getElementById('flashcardModeBtn');
const flashcard2ModeBtn = document.getElementById('flashcard2ModeBtn');
const quizModeBtn = document.getElementById('quizModeBtn');
const hangmanModeBtn = document.getElementById('hangmanModeBtn');
const scrambleModeBtn = document.getElementById('scrambleModeBtn');
const dictationModeBtn = document.getElementById('dictationModeBtn');
const matchModeBtn = document.getElementById('matchModeBtn');
const flashcard2GameContainer = document.getElementById('flashcard2GameContainer');
const introOverlay = document.getElementById('introOverlay');
const introLogo = document.getElementById('introLogo');
const introSound = document.getElementById('introSound');

// --- Main App Logic ---
async function runApp() {
    setAllVocabData(await loadVocabData());
    
    // Initialize UI and state
    generateChapterButtons();
    hideAlert();
    updateMasteredWordsDisplay();
    updateProgressStatistics();
    initializeSuggestMastered();

    // --- Event Listeners ---
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

    // --- Welcome Modal Logic ---
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

    if (flashcard2GoBtn) {
        flashcard2GoBtn.addEventListener('click', () => {
            closeFlashcard2Welcome();
            showGameContainer(flashcard2GameContainer, flashcard2ModeBtn);
        });
    }

    if(flashcard2LaterBtn) {
        flashcard2LaterBtn.addEventListener('click', closeFlashcard2Welcome);
    }

    // Set initial text
    const frontFace = document.getElementById('front');
    if (frontFace) {
        frontFace.textContent = "Sélectionnez un chapitre ci-dessus";
        const backFace = document.getElementById('back');
        backFace.textContent = "Puis une section pour commencer à jouer.";
    }

    document.addEventListener('vocabularyChange', (e) => {
        const { chapterKey, subKey } = e.detail;
        changeVocabulary(chapterKey, subKey);
        startFlashcardGame();
    });

    // --- Developer Console Commands ---
    function reviewintro() {
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

// --- Intro Handler ---
function handleIntro() {
    if (localStorage.getItem('introShown') === 'true') {
        introOverlay.style.display = 'none';
        runApp();
        return;
    }
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
    
    // Fallback if user does not interact
    setTimeout(() => {
        if (localStorage.getItem('introShown') !== 'true') {
            document.removeEventListener('click', playIntro);
            document.removeEventListener('keydown', playIntro);
            introOverlay.style.display = 'none';
            runApp();
        }
    }, 5000);
}

// --- App Start ---
document.addEventListener('DOMContentLoaded', handleIntro);

// --- Exports for other modules ---
export { checkSuggestMastered, getConsecutiveKnownCounts };
export function trackEvent(eventName) {
    // console.log(`Event: ${eventName}`);
}