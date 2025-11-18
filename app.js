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

const varCss = {
    colorCorrect: getComputedStyle(document.documentElement).getPropertyValue('--color-correct').trim(),
    colorIncorrect: getComputedStyle(document.documentElement).getPropertyValue('--color-incorrect').trim(),
    colorPrimary: getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim(),
    colorCard: getComputedStyle(document.documentElement).getPropertyValue('--color-card').trim(),
    colorText: getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim()
};

let vocab = [];
let currentChapterKey = null;
let currentSubcategoryKey = null;
let chapterAlert = null;
let chosenWord = '';
let shuffledVocab = [];
let currentCardIndex = 0;
let masteredWords = loadMasteredWords();

function loadMasteredWords() {
    const storedWords = localStorage.getItem('masteredWords_vocAnglais');
    return storedWords ? new Set(JSON.parse(storedWords)) : new Set();
}

function saveMasteredWords() {
    localStorage.setItem('masteredWords_vocAnglais', JSON.stringify(Array.from(masteredWords)));
}

function levenshtein(a, b) {
    const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

    for (let i = 0; i <= a.length; i += 1) {
        matrix[0][i] = i;
    }

    for (let j = 0; j <= b.length; j += 1) {
        matrix[j][0] = j;
    }

    for (let j = 1; j <= b.length; j += 1) {
        for (let i = 1; i <= a.length; i += 1) {
            const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1, 
                matrix[j - 1][i] + 1, 
                matrix[j - 1][i - 1] + indicator,
            );
        }
    }

    return matrix[b.length][a.length];
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function hideAllGameContainers() {
    allContainers.forEach(container => {
        container.style.display = 'none';
        container.classList.remove('active-mode');
        setTimeout(() => container.style.opacity = '0', 0);
    });
    allModeBtns.forEach(btn => btn.classList.remove('active'));
}

function showGameContainer(container, button) {
    hideAllGameContainers();
    container.style.display = 'flex';
    button.classList.add('active');
    setTimeout(() => {
        container.classList.add('active-mode');
        container.style.opacity = '1';
    }, 50);
}

function displayAlert(message, color) {
    alertTextP.textContent = message;
    alertMessageDiv.style.backgroundColor = color;
    alertMessageDiv.style.display = 'block';
}

function hideAlert() {
    alertMessageDiv.style.display = 'none';
}

function updateProgressStatistics() {
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

function updateMasteredWordsDisplay() {
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
            // Restart current game mode to reflect changes
            if (currentChapterKey && currentSubcategoryKey) {
                changeVocabulary(currentChapterKey, currentSubcategoryKey);
            }
        });
    });
}

function generateChapterButtons() {
    chapterSelectorDiv.innerHTML = '';
    if (typeof ALL_VOCAB_DATA === 'undefined') return;

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
    currentChapterKey = chapterKey;
    currentSubcategoryKey = subcategoryKey;
    categoryModal.classList.remove('is-open'); // Moved here
    
    trackEvent(`section-${chapterKey}-${subcategoryKey}-selected`);
    
    if (typeof ALL_VOCAB_DATA === 'undefined') {
        displayAlert("Erreur: Fichier de données (vocab_data.js) manquant ou incorrect.", varCss.colorIncorrect);
        return;
    }

    const chapter = ALL_VOCAB_DATA[chapterKey];
    const subcategory = chapter.subcategories[subcategoryKey];
    const fullVocab = subcategory.data;
    vocab = fullVocab.filter(pair => !masteredWords.has(pair[0]));
    chapterAlert = subcategory.alert;

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
        // Restart current game mode to reflect changes
        if (currentChapterKey && currentSubcategoryKey) {
            changeVocabulary(currentChapterKey, currentSubcategoryKey);
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
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

    generateChapterButtons();
    hideAlert();
    updateMasteredWordsDisplay();
    updateProgressStatistics();
    
    const frontFace = document.getElementById('front');
    if (frontFace) {
        frontFace.textContent = "Sélectionnez un chapitre ci-dessus";
        const backFace = document.getElementById('back');
        backFace.textContent = "Puis une section pour commencer à jouer.";
    }
});

function trackEvent(eventName) {

}