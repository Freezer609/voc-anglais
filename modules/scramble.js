
import { vocab, varCss } from './state.js';
import { shuffleArray, onEnterPress } from './utils.js';
import { showGameContainer, hideAlert } from './ui.js';

const scrambleWordDiv = document.getElementById('scrambleWord');
const scrambleClueDiv = document.getElementById('scrambleClue');
const scrambleInput = document.getElementById('scrambleInput');
const scrambleCheckBtn = document.getElementById('scrambleCheckBtn');
const scrambleFeedbackDiv = document.getElementById('scrambleFeedback');
const scrambleNextBtn = document.getElementById('scrambleNextBtn');
const scrambleGameContainer = document.getElementById('scrambleGameContainer');
const scrambleModeBtn = document.getElementById('scrambleModeBtn');


let currentScrambleWord = '';

function scrambleWord(word) {
    const letters = word.split('');
    for (let i = letters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    return letters.join('');
}

export function startScrambleGame() {
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

onEnterPress(scrambleInput, () => {
    if (scrambleNextBtn.style.display !== 'none') {
        scrambleNextBtn.click();
    } else {
        scrambleCheckBtn.click();
    }
});
