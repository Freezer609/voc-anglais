
import { ALL_VOCAB_DATA, masteredWords, currentChapterKey, currentSubcategoryKey, chapterAlert, vocab, setVocab, setCurrentChapterKey, setCurrentSubcategoryKey, setChapterAlert } from './state.js';

const allContainers = [
    document.getElementById('flashcardGameContainer'),
    document.getElementById('flashcard2GameContainer'),
    document.getElementById('quizGameContainer'),
    document.getElementById('hangmanGameContainer'),
    document.getElementById('scrambleGameContainer'),
    document.getElementById('dictationGameContainer'),
    document.getElementById('matchGameContainer')
];

const allModeBtns = [
    document.getElementById('flashcardModeBtn'),
    document.getElementById('flashcard2ModeBtn'),
    document.getElementById('quizModeBtn'),
    document.getElementById('hangmanModeBtn'),
    document.getElementById('scrambleModeBtn'),
    document.getElementById('dictationModeBtn'),
    document.getElementById('matchModeBtn')
];

const vocabularyList = document.getElementById('fullVocabularyList');
const masteredWordsList = document.getElementById('masteredWordsList');
const resetMasteredBtn = document.getElementById('resetMasteredBtn');
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


export function showGameContainer(container, button) {
    hideAllGameContainers();
    container.style.display = 'flex';
    if(button) button.classList.add('active');
    setTimeout(() => {
        container.classList.add('active-mode');
        container.style.opacity = '1';
    }, 50);
}

export function hideAllGameContainers() {
    allContainers.forEach(container => {
        if(container) {
            container.style.display = 'none';
            container.classList.remove('active-mode');
            setTimeout(() => container.style.opacity = '0', 0);
        }
    });
    allModeBtns.forEach(btn => btn && btn.classList.remove('active'));
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

export function generateChapterButtons() {
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

export function openCategoryModal(chapterKey, chapter) {
    document.querySelectorAll('.chapter-selector button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(chapter.selectorId).classList.add('active');

    // trackEvent(`chapitre-${chapterKey}-clicked`);

    modalTitle.textContent = `Choisir la section pour ${chapter.title}`;
    modalButtons.innerHTML = '';
    
    Object.entries(chapter.subcategories).forEach(([subKey, subcategory]) => {
        const button = document.createElement('button');
        button.textContent = subcategory.name;
        button.style.backgroundColor = subcategory.color;
        button.style.color = '#FFFFFF';
        button.addEventListener('click', () => {
            const event = new CustomEvent('vocabularyChange', { detail: { chapterKey, subKey } });
            document.dispatchEvent(event);
            categoryModal.classList.remove('is-open');
        });
        modalButtons.appendChild(button);
    });
    categoryModal.classList.add('is-open');
}

export function changeVocabulary(chapterKey, subcategoryKey) {
    hideAllGameContainers();
    setCurrentChapterKey(chapterKey);
    setCurrentSubcategoryKey(subcategoryKey);
    categoryModal.classList.remove('is-open');
    
    // trackEvent(`section-${chapterKey}-${subcategoryKey}-selected`);
    
    if (!ALL_VOCAB_DATA) {
        displayAlert("Erreur: Fichier de données (vocab_data.json) manquant ou incorrect.", "#F44336");
        return;
    }

    const chapter = ALL_VOCAB_DATA[chapterKey];
    const subcategory = chapter.subcategories[subcategoryKey];
    const fullVocab = subcategory.data;
    setVocab(fullVocab.filter(pair => !masteredWords.has(pair[0])));
    setChapterAlert(subcategory.alert);

    listTitleSummary.textContent = `${chapter.title} - ${subcategory.name}`;

    if (chapterAlert && chapterAlert.message) {
        displayAlert(chapterAlert.message, chapterAlert.color || "#BB86FC");
    } else {
        hideAlert();
    }

    generateList();
    updateProgressStatistics();
}

function generateList() {
    vocabularyList.innerHTML = '';
    vocab.forEach(pair => {
        const li = document.createElement('li');
        li.textContent = `${pair[0]} - ${pair[1]}`;
        vocabularyList.appendChild(li);
    });
}
