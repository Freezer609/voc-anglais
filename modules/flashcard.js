
import { vocab, shuffledVocab, currentCardIndex, masteredWords, varCss, saveMasteredWords, setShuffledVocab, setCurrentCardIndex } from './state.js';
import { shuffleArray } from './utils.js';
import { showGameContainer, hideAlert, displayAlert, updateProgressStatistics, updateMasteredWordsDisplay, trackEvent } from './ui.js';
import { checkSuggestMastered } from './suggestMastered.js';

const flashcard = document.getElementById('flashcard');
const frontFace = document.getElementById('front');
const backFace = document.getElementById('back');
const cardCounter = document.getElementById('cardCounter');
const feedbackButtons = document.getElementById('feedbackButtons');
const knewItBtn = document.getElementById('knewItBtn');
const didntKnowBtn = document.getElementById('didntKnowBtn');
const masteredBtn = document.getElementById('masteredBtn');
const flashcardGameContainer = document.getElementById('flashcardGameContainer');
const flashcardModeBtn = document.getElementById('flashcardModeBtn');


export function startFlashcardGame() {
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

    setShuffledVocab(shuffleArray([...vocab]));
    setCurrentCardIndex(0);
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
        consecutiveKnownCounts[currentWord] = (consecutiveKnownCounts[currentWord] || 0) + 1;
        checkSuggestMastered(currentWord);

        masteredWords.add(currentWord);
        saveMasteredWords();
        updateProgressStatistics();
    } else {
        consecutiveKnownCounts[currentWord] = 0;
        masteredWords.delete(currentWord);
        saveMasteredWords();
        updateProgressStatistics();
        
        const wordToReinsert = shuffledVocab.splice(currentCardIndex, 1)[0];
        let insertIndex = currentCardIndex + Math.floor(Math.random() * (shuffledVocab.length - currentCardIndex)) + 1;
        if (insertIndex > shuffledVocab.length) insertIndex = shuffledVocab.length;
        shuffledVocab.splice(insertIndex, 0, wordToReinsert);
        setCurrentCardIndex(currentCardIndex--);
    }

    flashcard.classList.remove('flipped');
    feedbackButtons.style.display = 'none';

    setTimeout(() => {
        setCurrentCardIndex(currentCardIndex++);
        if (currentCardIndex < shuffledVocab.length) {
            displayCard();
        } else {
            setShuffledVocab(shuffledVocab.filter(pair => !masteredWords.has(pair[0])));
            if (shuffledVocab.length > 0) {
                setCurrentCardIndex(0);
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

function handleMasteredWord() {
    const currentWord = shuffledVocab[currentCardIndex][0];
    masteredWords.add(currentWord);
    saveMasteredWords();
    updateMasteredWordsDisplay();
    updateProgressStatistics();
    displayAlert(`'${currentWord}' a été marqué comme maîtrisé et ne réapparaîtra plus.`, varCss.colorPrimary);

    flashcard.classList.remove('flipped');
    feedbackButtons.style.display = 'none';
    setTimeout(() => {
        setCurrentCardIndex(currentCardIndex++);
        if (currentCardIndex < shuffledVocab.length) {
            displayCard();
        } else {
            setShuffledVocab(shuffledVocab.filter(pair => !masteredWords.has(pair[0])));
            if (shuffledVocab.length > 0) {
                setCurrentCardIndex(0);
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
