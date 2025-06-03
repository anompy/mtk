const telegram = Telegram.WebApp;
telegram.ready();

// DOM Elements
const homeScreen = document.getElementById('home-screen');
const gameScreen = document.getElementById('game-screen');
const scoreScreen = document.getElementById('score-screen');
const highScoreElement = document.getElementById('high-score');
const startGameBtn = document.getElementById('start-game');
const currentScoreElement = document.getElementById('current-score');
const questionElement = document.getElementById('question');
const timerElement = document.getElementById('timer');
const timerFill = document.getElementById('timer-fill');
const trueBtn = document.getElementById('true-btn');
const falseBtn = document.getElementById('false-btn');
const finalScoreElement = document.getElementById('final-score');
const timeBonusInfo = document.getElementById('time-bonus-info');
const highScoreMessage = document.getElementById('high-score-message');
const playAgainBtn = document.getElementById('play-again');
const backHomeBtn = document.getElementById('back-home');

// Game variables
let currentScore = 0;
let timeLeft = 10;
let gameTimer;
let totalTimeAdded = 0;
let playDuration = 0;
let highScore = 0;

// Fungsi untuk membuat soal matematika acak
function generateMathProblem() {
    const operations = ['+', '-', '*'];
    let operation = operations[Math.floor(Math.random() * operations.length)];

    let num1, num2, correctAnswer;

    switch (operation) {
        case '+':
            num1 = Math.floor(Math.random() * 50) + 1;
            num2 = Math.floor(Math.random() * 50) + 1;
            correctAnswer = num1 + num2;
            break;
        case '-':
            num1 = Math.floor(Math.random() * 50) + 20;
            num2 = Math.floor(Math.random() * 20) + 1;
            // Pastikan hasilnya positif
            if (num1 < num2)[num1, num2] = [num2, num1];
            correctAnswer = num1 - num2;
            break;
        case '*':
            num1 = Math.floor(Math.random() * 10) + 1;
            num2 = Math.floor(Math.random() * 10) + 1;
            correctAnswer = num1 * num2;
            break;
    }

    // Tentukan apakah soal akan benar atau salah
    const isCorrect = Math.random() > 0.5;
    let displayedAnswer = correctAnswer;

    if (!isCorrect) {
        // Buat jawaban salah dengan menambahkan/mengurangi nilai acak
        const offset = Math.floor(Math.random() * 5) + 1;
        displayedAnswer = Math.random() > 0.5 ?
            correctAnswer + offset :
            Math.max(1, correctAnswer - offset);
    }

    if (operation === '*') {
        operation = '×';
    }

    return {
        question: `${num1} ${operation} ${num2} = ${displayedAnswer}`,
        isCorrect: isCorrect
    };
}

// Fungsi untuk memulai game
function startGame() {
    // Reset game state
    currentScore = 0;
    timeLeft = 10;
    totalTimeAdded = 0;
    currentScoreElement.textContent = currentScore;
    updateTimerDisplay();

    // Generate soal pertama
    generateNewProblem();

    // Tampilkan game screen
    showScreen(gameScreen);

    // Mulai timer
    startTimer();
}

// Fungsi untuk membuat soal baru
function generateNewProblem() {
    const problem = generateMathProblem();
    questionElement.textContent = problem.question;
    questionElement.dataset.isCorrect = problem.isCorrect;
}

// Fungsi untuk memulai timer
function startTimer() {
    clearInterval(gameTimer);

    gameTimer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        playDuration += 1;

        if (timeLeft <= 0) {
            clearInterval(gameTimer);
            endGame();
        }
    }, 1000);
}

// Fungsi untuk memperbarui tampilan timer
function updateTimerDisplay() {
    timerElement.textContent = timeLeft;
    const percentage = (timeLeft / 10) * 100;
    timerFill.style.setProperty('--percent', `${percentage}%`);

    // Ubah warna timer saat waktu hampir habis
    if (timeLeft <= 3) {
        timerFill.style.background =
            `conic-gradient(#ff416c 0% ${percentage}%, #1a2a6c ${percentage}% 100%)`;
    } else {
        timerFill.style.background =
            `conic-gradient(#00c9ff 0% ${percentage}%, #1a2a6c ${percentage}% 100%)`;
    }
}

// Fungsi untuk menambah waktu
function addTime(seconds) {
    timeLeft += seconds;
    totalTimeAdded += seconds;
    updateTimerDisplay();

    // Animasi feedback untuk jawaban benar
    questionElement.style.animation = 'pulse 0.5s';
    setTimeout(() => {
        questionElement.style.animation = '';
    }, 500);


}

// Fungsi untuk mengecek jawaban
function checkAnswer(userAnswer) {
    const isCorrect = questionElement.dataset.isCorrect === 'true';

    if (userAnswer === isCorrect) {
        // Jawaban benar
        currentScore++;
        currentScoreElement.textContent = currentScore;
        addTime(2); // Tambah waktu 3 detik

        // Animasi feedback
        questionElement.style.backgroundColor = 'rgba(0, 200, 0, 0.3)';
        setTimeout(() => {
            questionElement.style.backgroundColor = '';
        }, 300);
    } else {
        addTime(-3);
        // Jawaban salah
        questionElement.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
        setTimeout(() => {
            questionElement.style.backgroundColor = '';
        }, 300);
        if (timeLeft <= 0) {
            clearInterval(gameTimer);
            endGame();
        }
    }

    // Buat soal baru
    generateNewProblem();
}

// Fungsi ketika game berakhir
function endGame() {
    // Tampilkan skor akhir
    finalScoreElement.textContent = currentScore;
    timeBonusInfo.innerHTML = `<i class="fas fa-clock"></i> Durasi: ${playDuration} detik`;
    playDuration = 0;
    // Reset pesan skor tinggi
    highScoreMessage.innerHTML = '';

    // Cek apakah skor ini adalah skor tertinggi
    if (currentScore > highScore) {
        highScore = currentScore;
        
          telegram.CloudStorage.setItem('math_high_score', currentScore, (error, is_stored) => {
              if (!is_stored) telegram.showAlert(error);
          });
        
        highScoreMessage.innerHTML = `
                    <i class="fas fa-trophy"></i> Skor Tertinggi Baru!
                    <div style="font-size: 1.5rem; margin-top: 10px;">${currentScore} poin</div>
                `;
    } else if (highScore > 0) {
        highScoreMessage.innerHTML = `Skor tertinggi sesi ini: ${highScore}`;
    }

    // Tampilkan score screen
    showScreen(scoreScreen);
}

// Fungsi untuk menampilkan screen tertentu
function showScreen(screen) {
    // Sembunyikan semua screen
    homeScreen.classList.remove('active');
    gameScreen.classList.remove('active');
    scoreScreen.classList.remove('active');

    // Tampilkan screen yang dipilih
    screen.classList.add('active');
}

function bindEvent() {
    // Event Listeners
    startGameBtn.addEventListener('click', startGame);

    trueBtn.addEventListener('click', () => {
        checkAnswer(true);
    });

    falseBtn.addEventListener('click', () => {
        checkAnswer(false);
    });

    playAgainBtn.addEventListener('click', startGame);

    backHomeBtn.addEventListener('click', () => {
        // Perbarui skor tinggi di home screen
        highScoreElement.textContent = highScore;
        showScreen(homeScreen);
    });
}



window.addEventListener('load', (event) => {
    setInterval(() => {
        progress += Math.floor(Math.random() * 100) + 1;
    }, 1000);
    
    telegram.CloudStorage.getItem('math_high_score', (error, value) => {
        highScore = value;
        highScoreElement.textContent = highScore;
    });

    bindEvent();
    telegram.requestFullscreen();
    
});

