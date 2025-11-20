// Questions are loaded from chapter1.js
const questions = chapter1Questions;

// === STATE ===

// === STATE ===
let currentQuestionIndex = 0;
let score = 0;
let isAnswered = false;
let hintUsed = false;
let gameQuestions = [];
// Insults loaded from `response-insults.txt`
let insults = [];
// Load insults file (simple newline-separated). Remove numeric prefixes if present.
fetch('response-insults.txt').then(r => r.text()).then(txt => {
    insults = txt.split(/\r?\n/)
        .map(l => l.trim())
        .filter(l => l.length > 0)
        .map(l => l.replace(/^\d+\.\s*/, ''))
        .filter(l => l.length > 0);
}).catch(err => {
    console.warn('Could not load insults:', err);
    insults = [];
});

// === DOM ELEMENTS ===
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const headerBar = document.getElementById('header-bar');
const progressContainer = document.getElementById('progress-container');
const questionElement = document.getElementById('question-text');
const answerButtonsElement = document.getElementById('answer-buttons');
const feedbackArea = document.getElementById('feedback-area');
const feedbackText = document.getElementById('feedback-text');
const scoreDisplay = document.getElementById('score-display');
const progressBar = document.getElementById('progress-bar');
const currentQNum = document.getElementById('current-q-num');
const totalQNum = document.getElementById('total-q-num');
const startTotalQ = document.getElementById('start-total-q');
const hintBtn = document.getElementById('hint-btn');

// Initialize static text
startTotalQ.innerText = questions.length;

// === FUNCTIONS ===

window.startGame = function() {
    console.log("Starting game...");
    startScreen.classList.add('hidden');
    resultScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');
    headerBar.classList.remove('hidden');
    progressContainer.classList.remove('hidden');
    
    gameQuestions = [...questions]; 
    
    currentQuestionIndex = 0;
    score = 0;
    scoreDisplay.innerText = score;
    totalQNum.innerText = gameQuestions.length;
    
    showQuestion();
};

function showQuestion() {
    resetState();
    let currentQuestion = gameQuestions[currentQuestionIndex];
    let questionNo = currentQuestionIndex + 1;
    
    questionElement.innerHTML = currentQuestion.q;
    currentQNum.innerText = questionNo;
    
    const progressPercent = ((currentQuestionIndex) / gameQuestions.length) * 100;
    progressBar.style.width = `${progressPercent}%`;

    currentQuestion.a.forEach(answer => {
        const button = document.createElement('button');
        button.innerHTML = answer.t;
        button.classList.add('option-btn', 'p-4', 'text-left', 'bg-white', 'border', 'border-gray-200', 'rounded-xl', 'text-gray-700', 'font-medium', 'hover:bg-gray-50', 'shadow-sm');
        if (answer.c) {
            button.dataset.correct = "true";
        }
        button.addEventListener('click', selectAnswer);
        answerButtonsElement.appendChild(button);
    });

    document.querySelector('.custom-scroll').scrollTop = 0;
}

function resetState() {
    isAnswered = false;
    hintUsed = false;
    hintBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    hintBtn.disabled = false;
    feedbackArea.classList.add('hidden');
    // hide insult banner between questions
    const insultEl = document.getElementById('insult-banner');
    if (insultEl) { insultEl.classList.remove('show'); insultEl.innerHTML = ''; }
    while (answerButtonsElement.firstChild) {
        answerButtonsElement.removeChild(answerButtonsElement.firstChild);
    }
}

// Display an insult in bold red text over the quiz; auto-hide after a short delay
function showInsult(text) {
    const el = document.getElementById('insult-banner');
    if (!el) return;
    el.innerHTML = '<strong>' + text.toUpperCase() + '</strong>';
    el.classList.add('show');
    // remove after 5s
    setTimeout(() => { el.classList.remove('show'); }, 3000);
}

window.useHint = function() {
    if (isAnswered || hintUsed) return;
    
    const buttons = Array.from(answerButtonsElement.children);
    const wrongButtons = buttons.filter(btn => btn.dataset.correct !== "true");
    
    // Shuffle wrong buttons to pick random ones to eliminate
    wrongButtons.sort(() => Math.random() - 0.5);
    
    // Eliminate up to 2 wrong answers
    wrongButtons.slice(0, 2).forEach(btn => {
        btn.classList.add('eliminated');
        btn.disabled = true;
        btn.innerHTML = '<span class="line-through decoration-2 decoration-gray-400 text-gray-400">' + btn.innerHTML + '</span>';
    });
    
    hintUsed = true;
    hintBtn.classList.add('opacity-50', 'cursor-not-allowed');
    hintBtn.disabled = true;
};

function selectAnswer(e) {
    if (isAnswered) return;
    isAnswered = true;
    hintBtn.disabled = true; // Disable hint after answering
    hintBtn.classList.add('opacity-50', 'cursor-not-allowed');
    
    const selectedBtn = e.target.closest('button');
    const isCorrect = selectedBtn.dataset.correct === "true";
    
    if (isCorrect) {
        score++;
        scoreDisplay.innerText = score;
        selectedBtn.classList.add('correct');
        feedbackText.innerText = "Correct!";
        feedbackText.className = "text-lg font-bold text-green-600 mb-2";
    } else {
        selectedBtn.classList.add('wrong');
        feedbackText.innerText = "Incorrect";
        feedbackText.className = "text-lg font-bold text-red-600 mb-2";
        // show a random insult (if loaded) in front of quiz
        if (insults && insults.length > 0) {
            const idx = Math.floor(Math.random() * insults.length);
            showInsult(insults[idx]);
        }
    }

    Array.from(answerButtonsElement.children).forEach(button => {
        if (button.dataset.correct === "true") {
            button.classList.add('correct');
            if (!button.querySelector('.fa-check')) {
                 button.innerHTML += ' <i class="fa-solid fa-check float-right mt-1 text-green-700"></i>';
            }
        }
        button.disabled = true;
        button.classList.remove('hover:bg-gray-50', 'hover:shadow-xl');
    });

    feedbackArea.classList.remove('hidden');
    feedbackArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

window.nextQuestion = function() {
    currentQuestionIndex++;
    if (currentQuestionIndex < gameQuestions.length) {
        showQuestion();
    } else {
        showResults();
    }
};

function showResults() {
    quizScreen.classList.add('hidden');
    headerBar.classList.add('hidden');
    progressContainer.classList.add('hidden');
    resultScreen.classList.remove('hidden');
    
    document.getElementById('final-score').innerText = score;
    document.getElementById('final-total').innerText = gameQuestions.length;
    
    const resultIcon = document.getElementById('result-icon');
    const percent = (score / gameQuestions.length) * 100;
    
    if (percent === 100) {
        resultIcon.innerHTML = '<i class="fa-solid fa-trophy text-yellow-400"></i>';
    } else if (percent >= 60) {
        resultIcon.innerHTML = '<i class="fa-solid fa-thumbs-up text-blue-400"></i>';
    } else {
        resultIcon.innerHTML = '<i class="fa-solid fa-book-open text-gray-400"></i>';
    }
}

window.restartGame = function() {
    startGame();
};

