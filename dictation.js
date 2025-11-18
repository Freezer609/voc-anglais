const dictationClueDiv = document.getElementById('dictationClue');
const dictationInput = document.getElementById('dictationInput');
const dictationCheckBtn = document.getElementById('dictationCheckBtn');
const dictationFeedbackDiv = document.getElementById('dictationFeedback');
const dictationNextBtn = document.getElementById('dictationNextBtn');

let currentDictationClue = '';
let currentDictationAnswers = [];

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