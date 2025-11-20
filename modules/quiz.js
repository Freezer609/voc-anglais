
import { vocab, shuffledVocab, varCss, setShuffledVocab } from './state.js';
import { shuffleArray } from './utils.js';
import { showGameContainer, hideAlert, displayAlert } from './ui.js';

const quizQuestion = document.getElementById('quizQuestion');
const quizOptions = document.getElementById('quizOptions');
const quizScore = document.getElementById('quizScore');
const quizGameContainer = document.getElementById('quizGameContainer');
const quizModeBtn = document.getElementById('quizModeBtn');

let currentQuizQuestionIndex = 0;
let quizQuestions = [];
let score = { correct: 0, total: 0 };

export function startQuizGame() {
    showGameContainer(quizGameContainer, quizModeBtn);
    trackEvent('mode-quiz-started');
    if (vocab.length === 0) {
        quizQuestion.textContent = "Sélectionnez un chapitre et une section pour commencer.";
        quizOptions.innerHTML = '';
        quizScore.textContent = "Score: 0 / 0";
        return;
    }

    setShuffledVocab(shuffleArray([...vocab]));
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
