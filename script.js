// Questions will be loaded dynamically based on chapter selection
let questions = [];
let chapterQuestionsLoaded = {};

// === DEVICE DETECTION ===
function detectDevice() {
    const ua = navigator.userAgent;
    const width = window.innerWidth;
    
    // Check for mobile devices
    if (/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
        if (width < 768) {
            return 'mobile';
        } else {
            return 'tablet';
        }
    }
    
    // Check for tablets (iPad, Android tablets)
    if (/iPad|Android/i.test(ua) && width >= 768 && width <= 1024) {
        return 'tablet';
    }
    
    // Default to desktop
    return 'desktop';
}

// Detect device type and add class to body
const deviceType = detectDevice();
document.body.classList.add(`device-${deviceType}`);
console.log('Device type detected:', deviceType);

// === STATE ===
let selectedChapter = 1;
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
const welcomeScreen = document.getElementById('welcome-screen');
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

// === FUNCTIONS ===

// Chapter file path mapping
const chapterPaths = {
    1: "Chapters/Chp-1/Chp-1_testbank/chapter1.js",
    2: "Chapters/Chp-2/Ch-2_PsychologicalResearch-testbank/chapter2.js",
    3: "Chapters/Chp-3/Ch-3_Biopsychology-testbank/chapter3.js",
    4: "Chapters/Chp-4/Ch-4_StatesofConsciousness-testbank/chapter4.js",
    5: "Chapters/Chp-5/Ch-5_SensationandPerception-testbank/chapter5.js",
    6: "Chapters/Chp-6/Ch-6_Learning-testbank/chapter6.js",
    7: "Chapters/Chp-7/Ch-7_ThinkingandIntelligence-testbank/chapter7.js",
    8: "Chapters/Chp-8/Ch-8_Memory-testbank/chapter8.js",
    9: "Chapters/Chp-9/Ch-9_LifespanDevelopment-testbank/chapter9.js",
    10: "Chapters/Chp-10/Ch-10_MotivationandEmotion-testbank/chapter10.js",
    11: "Chapters/Chp-11/Ch-11_Personality-testbank/chapter11.js",
    14: "Chapters/Chp-14/Ch-14_StressLifestyleandHealth-testbank/chapter14.js",
    15: "Chapters/Chp-15/Ch-15_PsychologicalDisorders-testbank/chapter15.js",
    16: "Chapters/Chp-16/Ch-16_TherapyandTreatment-testbank/chapter16.js"
};

// Load chapter questions dynamically
function loadChapterQuestions(chapterNum, callback) {
    // Check if already loaded
    if (chapterQuestionsLoaded[chapterNum]) {
        questions = chapterQuestionsLoaded[chapterNum];
        if (callback) callback();
        return;
    }
    
    // Load the chapter script dynamically
    const script = document.createElement('script');
    script.src = chapterPaths[chapterNum];
    script.onload = function() {
        // Access the global variable created by the chapter file
        const chapterVar = window[`chapter${chapterNum}Questions`];
        if (chapterVar) {
            chapterQuestionsLoaded[chapterNum] = chapterVar;
            questions = chapterVar;
            if (callback) callback();
        } else {
            console.error(`Failed to load chapter ${chapterNum} questions`);
            alert(`Error: Could not load Chapter ${chapterNum} questions.`);
        }
    };
    script.onerror = function() {
        console.error(`Failed to load chapter${chapterNum}.js`);
        alert(`Error: Could not find Chapter ${chapterNum} question file.`);
    };
    document.head.appendChild(script);
}

// Chapter descriptions mapping
const chapterDescriptions = {
    1: "Chapter 1: Introduction to Psychology",
    2: "Chapter 2: Research Methods",
    3: "Chapter 3: Biological Psychology",
    4: "Chapter 4: Sensation and Perception",
    5: "Chapter 5: Consciousness",
    6: "Chapter 6: Learning",
    7: "Chapter 7: Memory",
    8: "Chapter 8: Thinking and Intelligence",
    9: "Chapter 9: Development",
    10: "Chapter 10: Motivation and Emotion",
    11: "Chapter 11: Personality",
    14: "Chapter 14: Social Psychology",
    15: "Chapter 15: Psychological Disorders",
    16: "Chapter 16: Therapy and Treatment"
};

window.selectChapter = function(chapterNum) {
    selectedChapter = chapterNum;
    
    // Load chapter questions
    loadChapterQuestions(chapterNum, function() {
        // Update the chapter description
        const chapterDesc = document.getElementById('chapter-description');
        if (chapterDesc) {
            chapterDesc.innerHTML = `${chapterDescriptions[chapterNum] || 'Chapter ' + chapterNum}.<br>There are <span id="start-total-q">${questions.length}</span> questions in this set.`;
        }
        
        // Hide welcome screen, show start screen
        welcomeScreen.classList.add('hidden');
        startScreen.classList.remove('hidden');
    });
};

window.backToChapterSelect = function() {
    // Hide start screen, show welcome screen
    startScreen.classList.add('hidden');
    quizScreen.classList.add('hidden');
    resultScreen.classList.add('hidden');
    headerBar.classList.add('hidden');
    progressContainer.classList.add('hidden');
    welcomeScreen.classList.remove('hidden');
};

window.startGame = function() {
    console.log("Starting game...");
    startScreen.classList.add('hidden');
    resultScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');
    headerBar.classList.remove('hidden');
    progressContainer.classList.remove('hidden');
    
    // Shuffle the questions randomly using Fisher-Yates algorithm
    gameQuestions = [...questions];
    for (let i = gameQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [gameQuestions[i], gameQuestions[j]] = [gameQuestions[j], gameQuestions[i]];
    }
    
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
    while (answerButtonsElement.firstChild) {
        answerButtonsElement.removeChild(answerButtonsElement.firstChild);
    }
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
        // Display a random insult instead of "Incorrect"
        if (insults && insults.length > 0) {
            const idx = Math.floor(Math.random() * insults.length);
            feedbackText.innerText = insults[idx];
        } else {
            feedbackText.innerText = "Incorrect";
        }
        feedbackText.className = "text-lg font-bold text-red-600 mb-2";
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
    backToChapterSelect();
};

