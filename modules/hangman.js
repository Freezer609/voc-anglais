
import { vocab, varCss } from './state.js';
import { shuffleArray } from './utils.js';
import { showGameContainer, hideAlert, displayAlert } from './ui.js';

const hangmanWordDiv = document.getElementById('hangmanWord');
const hangmanLettersDiv = document.getElementById('hangmanLetters');
const hangmanParts = ["head", "body", "arm1", "arm2", "leg1", "leg2"];
const hangmanGameContainer = document.getElementById('hangmanGameContainer');
const hangmanModeBtn = document.getElementById('hangmanModeBtn');


let hangmanWord = '';
let guessedLetters = new Set();
const maxErrors = hangmanParts.length;
let errors = 0;

export function startHangGame() {
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
