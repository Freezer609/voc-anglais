
import { vocab, shuffledVocab, currentCardIndex, masteredWords, varCss, saveMasteredWords, setShuffledVocab, setCurrentCardIndex } from './state.js';
import { shuffleArray } from './utils.js';
import { showGameContainer, hideAlert, trackEvent, displayAlert, updateMasteredWordsDisplay, updateProgressStatistics, checkSuggestMastered } from './main.js';

const flashcard2 = document.getElementById('flashcard2');
const flashcard2Front = document.getElementById('flashcard2Front');
const flashcard2Back = document.getElementById('flashcard2Back');
const flashcard2CardCounter = document.getElementById('flashcard2CardCounter');
const flashcard2FeedbackButtons = document.getElementById('flashcard2FeedbackButtons');
const flashcard2KnewItBtn = document.getElementById('flashcard2KnewItBtn');
const flashcard2MasteredBtn = document.getElementById('flashcard2MasteredBtn');
const flashcard2DidntKnowBtn = document.getElementById('flashcard2DidntKnowBtn');
const flashcard2GameContainer = document.getElementById('flashcard2GameContainer');
const flashcard2ModeBtn = document.getElementById('flashcard2ModeBtn');


export function startFlashcard2Mode() {
    if (localStorage.getItem('hideFlashcard2Welcome') !== 'true') {
        const flashcard2WelcomeModal = document.getElementById('flashcard2-welcome-modal');
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

    setShuffledVocab(shuffleArray([...unmasteredVocab]));
    setCurrentCardIndex(0);
    displayFlashcard2Card();
}

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
        consecutiveKnownCounts[currentWord] = (consecutiveKnownCounts[currentWord] || 0) + 1;
        checkSuggestMastered(currentWord);

        masteredWords.add(currentWord);
        saveMasteredWords();
        updateMasteredWordsDisplay();
        updateProgressStatistics();
    } else {
        consecutiveKnownCounts[currentWord] = 0;
        const wordToReinsert = shuffledVocab.splice(currentCardIndex, 1)[0];
        let insertIndex = currentCardIndex + Math.floor(Math.random() * (shuffledVocab.length - currentCardIndex)) + 1;
        if (insertIndex > shuffledVocab.length) insertIndex = shuffledVocab.length;
        shuffledVocab.splice(insertIndex, 0, wordToReinsert);
        setCurrentCardIndex(currentCardIndex--);
    }

    flashcard2.classList.remove('flipped');
    flashcard2FeedbackButtons.style.display = 'none';

    setTimeout(() => {
        setCurrentCardIndex(currentCardIndex++);
        if (currentCardIndex < shuffledVocab.length) {
            displayFlashcard2Card();
        } else {
            const unmasteredRemaining = vocab.filter(pair => !masteredWords.has(pair[0]));
            if (unmasteredRemaining.length > 0) {
                setShuffledVocab(shuffleArray([...unmasteredRemaining]));
                setCurrentCardIndex(0);
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

    flashcard2.classList.remove('flipped');
    flashcard2FeedbackButtons.style.display = 'none';
    setTimeout(() => {
        setCurrentCardIndex(currentCardIndex++);
        if (currentCardIndex < shuffledVocab.length) {
            displayFlashcard2Card();
        } else {
            const unmasteredRemaining = vocab.filter(pair => !masteredWords.has(pair[0]));
            if (unmasteredRemaining.length > 0) {
                setShuffledVocab(shuffleArray([...unmasteredRemaining]));
                setCurrentCardIndex(0);
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
