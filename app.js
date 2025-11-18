const container = document.querySelector('.container');
const flashcard = document.getElementById('flashcard');
const frontFace = document.getElementById('front');
const backFace = document.getElementById('back');
const cardCounter = document.getElementById('cardCounter');
const vocabularyList = document.getElementById('fullVocabularyList');
const feedbackButtons = document.getElementById('feedbackButtons');
const knewItBtn = document.getElementById('knewItBtn');
const didntKnowBtn = document.getElementById('didntKnowBtn');
const masteredBtn = document.getElementById('masteredBtn');

const masteredWordsList = document.getElementById('masteredWordsList');
const resetMasteredBtn = document.getElementById('resetMasteredBtn');

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

const flashcard2 = document.getElementById('flashcard2');
const flashcard2Front = document.getElementById('flashcard2Front');
const flashcard2Back = document.getElementById('flashcard2Back');
const flashcard2CardCounter = document.getElementById('flashcard2CardCounter');
const flashcard2FeedbackButtons = document.getElementById('flashcard2FeedbackButtons');
const flashcard2KnewItBtn = document.getElementById('flashcard2KnewItBtn');
const flashcard2MasteredBtn = document.getElementById('flashcard2MasteredBtn');
const flashcard2DidntKnowBtn = document.getElementById('flashcard2DidntKnowBtn');

const quizQuestion = document.getElementById('quizQuestion');
const quizOptions = document.getElementById('quizOptions');
const quizScore = document.getElementById('quizScore');

const hangmanWordDiv = document.getElementById('hangmanWord');
const hangmanLettersDiv = document.getElementById('hangmanLetters');
const hangmanParts = ["head", "body", "arm1", "arm2", "leg1", "leg2"];

const scrambleWordDiv = document.getElementById('scrambleWord');
const scrambleClueDiv = document.getElementById('scrambleClue');
const scrambleInput = document.getElementById('scrambleInput');
const scrambleCheckBtn = document.getElementById('scrambleCheckBtn');
const scrambleFeedbackDiv = document.getElementById('scrambleFeedback');
const scrambleNextBtn = document.getElementById('scrambleNextBtn');

const dictationClueDiv = document.getElementById('dictationClue');
const dictationInput = document.getElementById('dictationInput');
const dictationCheckBtn = document.getElementById('dictationCheckBtn');
const dictationFeedbackDiv = document.getElementById('dictationFeedback');
const dictationNextBtn = document.getElementById('dictationNextBtn');

const matchScoreSpan = document.getElementById('matchScore');
const wordsColumn = document.getElementById('wordsColumn');
const definitionsColumn = document.getElementById('definitionsColumn');
const matchNextBtn = document.getElementById('matchNextBtn');

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

let currentQuizQuestionIndex = 0;
let quizQuestions = [];
let score = { correct: 0, total: 0 };

let hangmanWord = '';
let guessedLetters = new Set();
const maxErrors = hangmanParts.length;
let errors = 0;

let currentScrambleWord = '';
let currentDictationClue = '';
let currentDictationAnswers = [];

let matchPairs = [];
let matchedPairsCount = 0;
let selectedWordItem = null;
let selectedDefItem = null;
const MATCH_COUNT = 6;

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

function handleMasteredWord() {
    const currentWord = shuffledVocab[currentCardIndex][0];
    masteredWords.add(currentWord);
    saveMasteredWords();
    updateMasteredWordsDisplay();
    updateProgressStatistics();
    displayAlert(`'${currentWord}' a été marqué comme maîtrisé et ne réapparaîtra plus.`, varCss.colorPrimary);

    // Proceed to the next card, similar to handleFeedback
    flashcard.classList.remove('flipped');
    feedbackButtons.style.display = 'none';
    setTimeout(() => {
        currentCardIndex++;
        if (currentCardIndex < shuffledVocab.length) {
            displayCard();
        } else {
            // If all words in current shuffledVocab are mastered or reviewed, filter and restart
            shuffledVocab = shuffledVocab.filter(pair => !masteredWords.has(pair[0]));
            if (shuffledVocab.length > 0) {
                currentCardIndex = 0;
                shuffleArray(shuffledVocab);
                displayAlert(`Nouveau tour avec ${shuffledVocab.length} mots restants!`, varCss.colorPrimary);
                displayCard();
            } else {
                frontFace.textContent = "Félicitations! Tu as maîtrisé tous les mots!";
                backFace.textContent = "Clique sur le bouton 'Mode Cartes' pour recommencer.";
                cardCounter.textContent = "";
            }
        }
    }, 350);
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

function startFlashcardGame() {
    showGameContainer(flashcardGameContainer, flashcardModeBtn);
    trackEvent('mode-cartes-started');
    flashcard.classList.remove('flipped');
    feedbackButtons.style.display = 'none';
    
    if (vocab.length === 0) {
         frontFace.textContent = "Sélectionnez un chapitre et une section.";
         backFace.textContent = "Le jeu commencera après la sélection.";
         cardCounter.textContent = "";
         return;
    }

    shuffledVocab = shuffleArray([...vocab]);
    currentCardIndex = 0;
    displayCard();
}

function displayCard() {
    if (shuffledVocab.length === 0) {
        frontFace.textContent = "Aucun mot à réviser.";
        backFace.textContent = "";
        cardCounter.textContent = "0 / 0";
        return;
    }
    
    const [word, definition] = shuffledVocab[currentCardIndex];

    if (Math.random() < 0.5) {
        frontFace.textContent = word;
        backFace.innerHTML = definition;
    } else {
        frontFace.textContent = definition;
        backFace.innerHTML = word;
    }
    
    cardCounter.textContent = `${currentCardIndex + 1} / ${shuffledVocab.length}`;
    
    feedbackButtons.style.display = 'none';
}

function flipCard() {
    if (vocab.length === 0) return;
    
    flashcard.classList.toggle('flipped');
    if (flashcard.classList.contains('flipped')) {
        feedbackButtons.style.display = 'flex';
    }
}

function handleFeedback(known) {
    const currentWord = shuffledVocab[currentCardIndex][0];
    
    if (known) {
        masteredWords.add(currentWord);
        saveMasteredWords();
        updateProgressStatistics();
    } else {
        masteredWords.delete(currentWord);
        saveMasteredWords();
        updateProgressStatistics();
        
        const wordToReinsert = shuffledVocab.splice(currentCardIndex, 1)[0];
        let insertIndex = currentCardIndex + Math.floor(Math.random() * (shuffledVocab.length - currentCardIndex)) + 1;
        if (insertIndex > shuffledVocab.length) insertIndex = shuffledVocab.length;
        shuffledVocab.splice(insertIndex, 0, wordToReinsert);
        currentCardIndex--;
    }

    flashcard.classList.remove('flipped');
    feedbackButtons.style.display = 'none';

    setTimeout(() => {
        currentCardIndex++;
        if (currentCardIndex < shuffledVocab.length) {
            displayCard();
        } else {
            shuffledVocab = shuffledVocab.filter(pair => !masteredWords.has(pair[0]));
            if (shuffledVocab.length > 0) {
                currentCardIndex = 0;
                shuffleArray(shuffledVocab);
                displayAlert(`Nouveau tour avec ${shuffledVocab.length} mots restants!`, varCss.colorPrimary);
                displayCard();
            } else {
                frontFace.textContent = "Félicitations! Tu as maîtrisé tous les mots!";
                backFace.textContent = "Clique sur le bouton 'Mode Cartes' pour recommencer.";
                cardCounter.textContent = "";
            }
        }
    }, 350);
}

flashcard.addEventListener('click', flipCard);
knewItBtn.addEventListener('click', () => handleFeedback(true));
didntKnowBtn.addEventListener('click', () => handleFeedback(false));
masteredBtn.addEventListener('click', handleMasteredWord);

function startQuizGame() {
    showGameContainer(quizGameContainer, quizModeBtn);
    trackEvent('mode-quiz-started');
    if (vocab.length === 0) {
        quizQuestion.textContent = "Sélectionnez un chapitre et une section pour commencer.";
        quizOptions.innerHTML = '';
        quizScore.textContent = "Score: 0 / 0";
        return;
    }

    shuffledVocab = shuffleArray([...vocab]);
    quizQuestions = generateQuizQuestions();
    currentQuizQuestionIndex = 0;
    score = { correct: 0, total: 0 };
    displayQuizQuestion();
}

function generateQuizQuestions() {
    return shuffledVocab.map(([word, definition]) => {
        const type = Math.random() < 0.5 ? 'wordToDef' : 'defToWord';
        const correctAnswer = type === 'wordToDef' ? definition : word;
        const question = type === 'wordToDef' ? word : definition;
        
        let incorrectAnswers = [];
        let tempVocab = vocab.filter(pair => pair[0] !== word);
        shuffleArray(tempVocab);

        while (incorrectAnswers.length < 3 && tempVocab.length > 0) {
            const incorrectWord = type === 'wordToDef' ? tempVocab.pop()[1] : tempVocab.pop()[0];
            if (!incorrectAnswers.includes(incorrectWord)) {
                incorrectAnswers.push(incorrectWord);
            }
        }
        
        const options = shuffleArray([correctAnswer, ...incorrectAnswers]).slice(0, 4);

        return { question, correctAnswer, options };
    });
}

function displayQuizQuestion() {
    hideAlert();
    if (currentQuizQuestionIndex >= quizQuestions.length) {
        quizQuestion.textContent = `Quiz terminé! Ton score final : ${score.correct} / ${score.total}`;
        quizOptions.innerHTML = `<button onclick="startQuizGame()" style="background: linear-gradient(135deg, var(--color-secondary) 0%, #018786 100%); color: #FFFFFF; border: none;">Recommencer le Quiz</button>`;
        return;
    }

    const q = quizQuestions[currentQuizQuestionIndex];
    quizQuestion.textContent = q.question;
    quizOptions.innerHTML = '';
    
    q.options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.addEventListener('click', () => checkQuizAnswer(button, option, q.correctAnswer));
        quizOptions.appendChild(button);
    });
    updateQuizScore();
}

function checkQuizAnswer(button, selectedAnswer, correctAnswer) {
    score.total++;
    
    Array.from(quizOptions.children).forEach(btn => {
        btn.disabled = true;
        if (btn.textContent === correctAnswer) {
            btn.classList.add('correct');
        } else if (btn.textContent === selectedAnswer) {
            btn.classList.add('incorrect');
        }
    });

                            if (selectedAnswer === correctAnswer) {
                score.correct++;
                displayAlert('Correct!', varCss.colorCorrect);
            } else {
                displayAlert(`Faux. La bonne réponse était : ${correctAnswer}`, varCss.colorIncorrect);
            }
    
    updateQuizScore();
    
    setTimeout(() => {
        currentQuizQuestionIndex++;
        displayQuizQuestion();
    }, 1500);
}

function updateQuizScore() {
    quizScore.textContent = `Score: ${score.correct} / ${score.total}`;
    
    if (score.total > 0 && currentQuizQuestionIndex >= quizQuestions.length) {
        trackEvent(`quiz-completed-score-${score.correct}-sur-${score.total}`);
    }
}

function startHangGame() {
    showGameContainer(hangmanGameContainer, hangmanModeBtn);
    trackEvent('mode-pendu-started');
     if (vocab.length === 0) {
        hangmanWordDiv.textContent = "Sélectionnez un chapitre pour jouer.";
        hangmanLettersDiv.innerHTML = '';
        return;
    }

    hideAlert();
    
    const randomPair = shuffleArray([...vocab])[0];
    hangmanWord = randomPair[0].toUpperCase();
    guessedLetters = new Set();
    errors = 0;
    
    hangmanParts.forEach(id => document.getElementById(id).style.display = 'none');
    
    hangmanWordDiv.textContent = hangmanWord.split('').map(char => {
        if (char.match(/[A-ZÀ-Ÿ]/i)) return '_';
        return char;
    }).join(' ');

    generateHangButtons();
}

function generateHangButtons() {
    hangmanLettersDiv.innerHTML = '';
    
    const baseAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
    
    baseAlphabet.forEach(letter => {
        const button = document.createElement('button');
        button.textContent = letter;
        button.value = letter;
        button.addEventListener('click', () => guessLetter(letter, button));
        hangmanLettersDiv.appendChild(button);
    });
}

function guessLetter(letter, button) {
    if (button.disabled) return;

    button.disabled = true;
    hideAlert();

    const normalizedWord = hangmanWord.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const normalizedLetter = letter.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (normalizedWord.includes(normalizedLetter)) {
        button.style.backgroundColor = varCss.colorCorrect;
        
        let updatedDisplay = '';
        let currentWordGuessed = '';
        
        for (let i = 0; i < hangmanWord.length; i++) {
            const currentLetter = hangmanWord[i].toUpperCase();
            const normalizedCurrentLetter = currentLetter.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

            if (normalizedCurrentLetter === normalizedLetter || guessedLetters.has(normalizedCurrentLetter)) {
                updatedDisplay += currentLetter;
                currentWordGuessed += currentLetter;
                guessedLetters.add(normalizedCurrentLetter);
            } else if (!currentLetter.match(/[A-ZÀ-Ÿ]/i)) {
                 updatedDisplay += currentLetter;
                 currentWordGuessed += currentLetter;
                 guessedLetters.add(normalizedCurrentLetter);
            }
            else {
                updatedDisplay += '_';
                currentWordGuessed += '_';
            }
        }
        
        hangmanWordDiv.textContent = updatedDisplay.split('').join(' ');

        if (!currentWordGuessed.includes('_')) {
            displayAlert(`Gagné ! Le mot était : ${hangmanWord}`, varCss.colorCorrect);
            trackEvent('pendu-won');
            disableHangButtons();
        }

    } else {
        button.style.backgroundColor = varCss.colorIncorrect;
        errors++;
        if (errors <= maxErrors) {
            document.getElementById(hangmanParts[errors - 1]).style.display = 'block';
        }

        if (errors >= maxErrors) {
            displayAlert(`Perdu ! Le mot était : ${hangmanWord}`, varCss.colorIncorrect);
            trackEvent('pendu-lost');
            disableHangButtons();
        }
    }
}

function disableHangButtons() {
    Array.from(hangmanLettersDiv.children).forEach(btn => btn.disabled = true);
}

function scrambleWord(word) {
    const letters = word.split('');
    for (let i = letters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    return letters.join('');
}

function startScrambleGame() {
    showGameContainer(scrambleGameContainer, scrambleModeBtn);
    trackEvent('mode-scramble-started');
    if (vocab.length === 0) {
        scrambleWordDiv.textContent = "Sélectionnez un chapitre pour jouer.";
        scrambleClueDiv.textContent = "";
        scrambleInput.value = '';
        scrambleFeedbackDiv.textContent = '';
        scrambleNextBtn.style.display = 'none';
        scrambleCheckBtn.style.display = 'block';
        return;
    }

    hideAlert();
    scrambleInput.value = '';
    scrambleFeedbackDiv.textContent = '';
    scrambleNextBtn.style.display = 'none';
    scrambleCheckBtn.style.display = 'block';
    
    const randomPair = shuffleArray([...vocab])[0];
    currentScrambleWord = randomPair[0];
    const definition = randomPair[1];

    const scrambled = scrambleWord(currentScrambleWord.toUpperCase().replace(/[\s-]/g, ''));

    scrambleWordDiv.textContent = scrambled.split('').join(' ');
    scrambleClueDiv.textContent = definition;
}

function checkScrambleAnswer() {
    const userAnswer = scrambleInput.value.trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\s-]/g, '');
    const correctWord = currentScrambleWord.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\s-]/g, '');

    scrambleCheckBtn.style.display = 'none';
    scrambleNextBtn.style.display = 'block';

    if (userAnswer === correctWord) {
        scrambleFeedbackDiv.textContent = `Correct! Le mot était bien : ${currentScrambleWord}`;
        scrambleFeedbackDiv.style.color = varCss.colorCorrect;
    } else {
        scrambleFeedbackDiv.textContent = `Faux. Le mot correct était : ${currentScrambleWord}`;
        scrambleFeedbackDiv.style.color = varCss.colorIncorrect;
    }
}

scrambleCheckBtn.addEventListener('click', checkScrambleAnswer);
scrambleNextBtn.addEventListener('click', startScrambleGame);

function startDictationGame() {
    showGameContainer(dictationGameContainer, dictationModeBtn);
    trackEvent('mode-dictation-started');
     if (vocab.length === 0) {
        dictationClueDiv.textContent = "Sélectionnez un chapitre pour jouer.";
        dictationInput.value = '';
        dictationFeedbackDiv.textContent = '';
        dictationNextBtn.style.display = 'none';
        dictationCheckBtn.style.display = 'block';
        return;
    }

    hideAlert();
    dictationInput.value = '';
    dictationFeedbackDiv.textContent = '';
    dictationNextBtn.style.display = 'none';
    dictationCheckBtn.style.display = 'block';

    const randomPair = shuffleArray([...vocab])[0];
    const wordPart = randomPair[0];
    const definitionPart = randomPair[1];

    if (Math.random() < 0.5) {
        currentDictationClue = definitionPart;
        currentDictationAnswers = wordPart.split(/[/,]/).map(item => item.trim());
    } else {
        currentDictationClue = wordPart;
        currentDictationAnswers = definitionPart.split(/[/,]/).map(item => item.trim());
    }
    
    dictationClueDiv.textContent = currentDictationClue;
    dictationInput.focus();
}

function checkDictationAnswer() {
    const userAnswer = dictationInput.value.trim();
    let isExactMatch = false;
    let closeMatch = null;

    if (currentDictationAnswers.some(answer => userAnswer === answer)) {
        isExactMatch = true;
    }

    if (!isExactMatch) {
        for (const answer of currentDictationAnswers) {
            const distance = levenshtein(userAnswer, answer);
            const threshold = answer.length > 7 ? 2 : 1;
            if (distance <= threshold) {
                closeMatch = answer;
                break;
            }
        }
    }

    dictationCheckBtn.style.display = 'none';
    dictationNextBtn.style.display = 'block';
    
    if (isExactMatch) {
        dictationFeedbackDiv.textContent = `Exact!`;
        dictationFeedbackDiv.style.color = varCss.colorCorrect;
    } else if (closeMatch) {
        dictationFeedbackDiv.innerHTML = `Presque ! La bonne orthographe est : <span style="color: #CCCCCC;">${closeMatch}</span>`;
        dictationFeedbackDiv.style.color = varCss.colorCorrect;
    } else {
        dictationFeedbackDiv.textContent = `Incorrect. La ou les réponses possibles étaient : ${currentDictationAnswers.join(' / ')}`;
        dictationFeedbackDiv.style.color = varCss.colorIncorrect;
    }
}

dictationCheckBtn.addEventListener('click', checkDictationAnswer);
dictationNextBtn.addEventListener('click', startDictationGame);

scrambleInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        if (scrambleNextBtn.style.display !== 'none') {
            scrambleNextBtn.click();
        } else {
            scrambleCheckBtn.click();
        }
    }
});

dictationInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        if (dictationNextBtn.style.display !== 'none') {
            dictationNextBtn.click();
        } else {
            dictationCheckBtn.click();
        }
    }
});

function startMatchGame() {
    showGameContainer(matchGameContainer, matchModeBtn);
    trackEvent('mode-match-started');
    if (vocab.length === 0) {
         matchScoreSpan.textContent = "Sélectionnez un chapitre pour jouer.";
         wordsColumn.innerHTML = '';
         definitionsColumn.innerHTML = '';
         return;
    }

    hideAlert();
    wordsColumn.innerHTML = '';
    definitionsColumn.innerHTML = '';
    matchNextBtn.style.display = 'none';
    matchedPairsCount = 0;
    selectedWordItem = null;
    selectedDefItem = null;
    updateMatchScore();

    const pairs = shuffleArray([...vocab]).slice(0, MATCH_COUNT);
    matchPairs = pairs.map(([word, definition]) => ({ word, definition }));

    let words = shuffleArray(matchPairs.map(p => p.word));
    let definitions = shuffleArray(matchPairs.map(p => p.definition));

    words.forEach(word => createMatchItem(wordsColumn, word, 'word'));
    definitions.forEach(def => createMatchItem(definitionsColumn, def, 'definition'));
}

function createMatchItem(parent, content, type) {
    const item = document.createElement('div');
    item.classList.add('match-item');
    item.textContent = content;
    item.dataset.type = type;
    item.dataset.value = content;
    item.addEventListener('click', () => handleMatchSelection(item));
    parent.appendChild(item);
}

function getMatchPair(item1, item2) {
    const wordValue = item1.dataset.type === 'word' ? item1.dataset.value : item2.dataset.value;
    const defValue = item1.dataset.type === 'definition' ? item1.dataset.value : item2.dataset.value;

    return matchPairs.find(p => p.word === wordValue && p.definition === defValue);
}

function handleMatchSelection(item) {
    if (item.classList.contains('matched')) return;

    if (item.dataset.type === 'word') {
        if (selectedWordItem) selectedWordItem.classList.remove('selected');
        selectedWordItem = item;
    } else {
        if (selectedDefItem) selectedDefItem.classList.remove('selected');
        selectedDefItem = item;
    }

    item.classList.add('selected');

    if (selectedWordItem && selectedDefItem) {
        const wordItem = selectedWordItem;
        const defItem = selectedDefItem;

        const pair = getMatchPair(wordItem, defItem);

        if (pair) {
            matchedPairsCount++;
            wordItem.classList.remove('selected');
            defItem.classList.remove('selected');
            wordItem.classList.add('matched');
            defItem.classList.add('matched');
            updateMatchScore();

            if (matchedPairsCount === MATCH_COUNT) {
                displayAlert('Félicitations! Toutes les paires trouvées.', varCss.colorCorrect);
                trackEvent('match-completed');
                matchNextBtn.style.display = 'block';
            }
        } else {
            wordItem.classList.add('error');
            defItem.classList.add('error');
            setTimeout(() => {
                wordItem.classList.remove('error', 'selected');
                defItem.classList.remove('error', 'selected');
            }, 1000);
        }
        
        selectedWordItem = null;
        selectedDefItem = null;
    }
}

function updateMatchScore() {
    matchScoreSpan.textContent = `Paires trouvées : ${matchedPairsCount} / ${MATCH_COUNT}`;
}

function updateMatchScore() {
    matchScoreSpan.textContent = `Paires trouvées : ${matchedPairsCount} / ${MATCH_COUNT}`;
}

matchNextBtn.addEventListener('click', startMatchGame);

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

const flashcard2WelcomeModal = document.getElementById('flashcard2-welcome-modal');
const flashcard2DontShowAgain = document.getElementById('flashcard2-dont-show-again');
const flashcard2GoBtn = document.getElementById('flashcard2-go-btn');
const flashcard2LaterBtn = document.getElementById('flashcard2-later-btn');

function startFlashcard2Mode() {
    if (localStorage.getItem('hideFlashcard2Welcome') !== 'true') {
        flashcard2WelcomeModal.classList.add('is-open');
    } else {
        showGameContainer(flashcard2GameContainer, flashcard2ModeBtn);
    }

    trackEvent('mode-flashcard-2-started');
    flashcard2.classList.remove('flipped');
    flashcard2FeedbackButtons.style.display = 'none';

    const unmasteredVocab = vocab.filter(pair => !masteredWords.has(pair[0]));

    if (unmasteredVocab.length === 0) {
        flashcard2Front.textContent = "Félicitations ! Tous les mots de ce chapitre sont maîtrisés.";
        flashcard2Back.textContent = "Vous pouvez réinitialiser les mots maîtrisés ou choisir un autre chapitre.";
        flashcard2CardCounter.textContent = "";
        return;
    }

    shuffledVocab = shuffleArray([...unmasteredVocab]);
    currentCardIndex = 0;
    displayFlashcard2Card();
}

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

function displayFlashcard2Card() {
    if (shuffledVocab.length === 0) {
        flashcard2Front.textContent = "Félicitations ! Tous les mots de ce chapitre sont maîtrisés.";
        flashcard2Back.textContent = "Vous pouvez réinitialiser les mots maîtrisés ou choisir un autre chapitre.";
        flashcard2CardCounter.textContent = "";
        return;
    }

    const [word, definition] = shuffledVocab[currentCardIndex];

    flashcard2Front.textContent = definition;
    flashcard2Back.innerHTML = word;
    
    flashcard2CardCounter.textContent = `${currentCardIndex + 1} / ${shuffledVocab.length}`;
    flashcard2.classList.remove('flipped');
    flashcard2FeedbackButtons.style.display = 'none';
}

function flipFlashcard2Card() {
    if (shuffledVocab.length === 0) return;
    
    flashcard2.classList.toggle('flipped');
    if (flashcard2.classList.contains('flipped')) {
        flashcard2FeedbackButtons.style.display = 'flex';
    }
}

function handleFlashcard2Feedback(known) {
    const currentWord = shuffledVocab[currentCardIndex][0];
    
    if (known) {
        masteredWords.add(currentWord);
        saveMasteredWords();
        updateMasteredWordsDisplay();
        updateProgressStatistics();
    } else {
        // If not known, reinsert the word later in the shuffled list
        const wordToReinsert = shuffledVocab.splice(currentCardIndex, 1)[0];
        let insertIndex = currentCardIndex + Math.floor(Math.random() * (shuffledVocab.length - currentCardIndex)) + 1;
        if (insertIndex > shuffledVocab.length) insertIndex = shuffledVocab.length;
        shuffledVocab.splice(insertIndex, 0, wordToReinsert);
        currentCardIndex--; // Stay on the same index for the next card
    }

    flashcard2.classList.remove('flipped');
    flashcard2FeedbackButtons.style.display = 'none';

    setTimeout(() => {
        currentCardIndex++;
        if (currentCardIndex < shuffledVocab.length) {
            displayFlashcard2Card();
        } else {
            // If all words in current shuffledVocab are reviewed, filter and restart
            const unmasteredRemaining = vocab.filter(pair => !masteredWords.has(pair[0]));
            if (unmasteredRemaining.length > 0) {
                shuffledVocab = shuffleArray([...unmasteredRemaining]);
                currentCardIndex = 0;
                displayAlert(`Nouveau tour de révision avec ${shuffledVocab.length} mots restants!`, varCss.colorPrimary);
                displayFlashcard2Card();
            } else {
                flashcard2Front.textContent = "Félicitations ! Tous les mots de ce chapitre sont maîtrisés.";
                flashcard2Back.textContent = "Vous pouvez réinitialiser les mots maîtrisés ou choisir un autre chapitre.";
                flashcard2CardCounter.textContent = "";
            }
        }
    }, 350);
}

flashcard2.addEventListener('click', flipFlashcard2Card);
flashcard2KnewItBtn.addEventListener('click', () => handleFlashcard2Feedback(true));
flashcard2DidntKnowBtn.addEventListener('click', () => handleFlashcard2Feedback(false));
flashcard2MasteredBtn.addEventListener('click', () => {
    const currentWord = shuffledVocab[currentCardIndex][0];
    masteredWords.add(currentWord);
    saveMasteredWords();
    updateMasteredWordsDisplay();
    updateProgressStatistics();
    displayAlert(`'${currentWord}' a été marqué comme maîtrisé et ne réapparaîtra plus.`, varCss.colorPrimary);

    // Proceed to the next card, similar to handleFlashcard2Feedback
    flashcard2.classList.remove('flipped');
    flashcard2FeedbackButtons.style.display = 'none';
    setTimeout(() => {
        currentCardIndex++;
        if (currentCardIndex < shuffledVocab.length) {
            displayFlashcard2Card();
        } else {
            const unmasteredRemaining = vocab.filter(pair => !masteredWords.has(pair[0]));
            if (unmasteredRemaining.length > 0) {
                shuffledVocab = shuffleArray([...unmasteredRemaining]);
                currentCardIndex = 0;
                displayAlert(`Nouveau tour de révision avec ${shuffledVocab.length} mots restants!`, varCss.colorPrimary);
                displayFlashcard2Card();
            } else {
                flashcard2Front.textContent = "Félicitations ! Tous les mots de ce chapitre sont maîtrisés.";
                flashcard2Back.textContent = "Vous pouvez réinitialiser les mots maîtrisés ou choisir un autre chapitre.";
                flashcard2CardCounter.textContent = "";
            }
        }
    }, 350);
});

document.addEventListener('DOMContentLoaded', () => {
    generateChapterButtons();
    hideAlert();
    updateMasteredWordsDisplay();
    updateProgressStatistics();
    
    frontFace.textContent = "Sélectionnez un chapitre ci-dessus";
    backFace.textContent = "Puis une section pour commencer à jouer.";
});





function trackEvent(eventName) {

}
