'use strict';

//////////////////////////////////////////////////////
//////////////////////////////////////////////////////
// Selecting all the elements for DOM Manipulation.
const containerWelcome = document.querySelector('.welcome-container'),
  containerQuiz = document.querySelector('.quiz-container'),
  containerFinalScore = document.querySelector('.final-score-container'),
  numberQuestionEl = document.querySelector('#num-questions'),
  categoryEl = document.querySelector('#category'),
  difficultyEl = document.querySelector('#difficulty'),
  timePerQuestionEl = document.querySelector('#time'),
  btnStart = document.querySelector('.btn--start'),
  btnSubmit = document.querySelector('.btn--submit'),
  btnNext = document.querySelector('.btn--next'),
  btnRestart = document.querySelector('.btn--restart'),
  questionIndicator = document.querySelector('.question-indicator'),
  questionText = document.querySelector('.question-text'),
  countdownProgressBarEl = document.querySelector('.countdown-progress-bar'),
  countdownIndicator = document.querySelector('.countdown'),
  wrapperAnswer = document.querySelector('.answer-wrapper'),
  labelScoreRemark = document.querySelector('.text-remark'),
  labelScorePercentage = document.querySelector('.score-percentage'),
  labelScore = document.querySelector('.score');

//////////////////////////////////////////////////////
// Global Variables.
let currentQuestion,
  score = 0,
  questions = [],
  timer,
  time,
  animationTimer;

// Restart the quiz
const init = function () {
  containerFinalScore.classList.add('hidden');
  containerWelcome.classList.remove('hidden');
  score = 0;
  btnStart.textContent = 'Start quiz';
};

// Percentage Calculator Function
const calcPercentage = function (val1, val2) {
  return (val1 / val2) * 100;
};

//////////////////////////////////////////////////////
// Loading Animation.
const loadingAnimation = function () {
  btnStart.textContent = 'Starting';
  animationTimer = setInterval(() => {
    if (btnStart.textContent.length === 11) btnStart.textContent = 'Starting';
    else btnStart.textContent += '.';
  }, 500);
};

//////////////////////////////////////////////////////
// Timer Sound.
const playAudio = function (src) {
  const audio = new Audio('countdown.mp3');
  audio.play();
};

//////////////////////////////////////////////////////
// Countdown Progress Indicator.
const countdownProgress = function (value) {
  const percentage = calcPercentage(value, time);
  countdownProgressBarEl.style.width = `${percentage}%`;
  countdownIndicator.textContent = `${value}`.padStart(2, 0);
};

//////////////////////////////////////////////////////
// Countdown Timer.
const startTimer = function (time) {
  timer = setInterval(() => {
    // Play the countdown timer sound.
    if (time === 4) playAudio();

    // Run the progress indicator upon countdown time.
    if (time >= 0) {
      countdownProgress(time);
      time--;
    }

    // Check answer
    else checkAnswer();
  }, 1000);
};

//////////////////////////////////////////////////////
// Start the quiz app.
const startQuiz = async function () {
  let num = numberQuestionEl.value,
    cat = categoryEl.value,
    dif = difficultyEl.value;

  loadingAnimation();
  const res = await fetch(
    `https://opentdb.com/api.php?amount=${num}&category=${cat}&difficulty=${dif}&type=multiple`
  );
  const data = await res.json();
  questions = data.results;

  setTimeout(() => {
    currentQuestion = 1;
    showQuestion(questions[0]);
    containerWelcome.classList.add('hidden');
    containerQuiz.classList.remove('hidden');
  }, 1000);
};

//////////////////////////////////////////////////////
// Display the question and answer options.
const showQuestion = function (question) {
  // Start the countdown timer.
  time = timePerQuestionEl.value;
  startTimer(time);

  // Display the question section (page)
  questionIndicator.innerHTML = `Question ${
    questions.indexOf(question) + 1
  }/<span>${questions.length}</span>`;

  // Display the question text
  questionText.innerHTML = question.question;

  // Display the answer options
  const answers = [...question.incorrect_answers, question.correct_answer];

  answers.sort(() => Math.random() - 0.5);

  wrapperAnswer.innerHTML = '';

  answers.forEach(answer => {
    wrapperAnswer.insertAdjacentHTML(
      'afterbegin',
      `  <div class="answer selected">
              <span class="answer-text">${answer}</span>
              <span class="checkbox">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  class="check"
                >
                  <path
                    fill-rule="evenodd"
                    d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                    clip-rule="evenodd"
                  />
                </svg>
              </span>
            </div>`
    );
  });

  // Selecting one answer from the answer options
  const answerBtn = document.querySelectorAll('.answer');
  answerBtn.forEach(btn => btn.classList.remove('selected'));
  answerBtn.forEach(btn => {
    // Click to select answer
    btn.addEventListener('click', function () {
      answerBtn.forEach(btn => btn.classList.remove('selected'));
      btn.classList.add('selected');
      btnSubmit.disabled = false;
    });
  });
};

//////////////////////////////////////////////////////
// Check Answer to the question.
const checkAnswer = function () {
  // Stop countdown timer
  clearInterval(timer);

  // Stop loadanimation timer
  clearInterval(animationTimer);

  // Check if answer is submitted
  const selectedAnswer = document.querySelector('.answer.selected');

  if (selectedAnswer) {
    // Check if submitted answer is correct
    const answer = selectedAnswer.querySelector('.answer-text').innerHTML;
    if (answer === questions[currentQuestion - 1].correct_answer) {
      // Display correct answer on selection
      selectedAnswer.classList.add('correct');

      // Add score +1
      score++;
    } else {
      selectedAnswer.classList.add('wrong');

      // Display correct answer automatically
      const answerBtn = document.querySelectorAll('.answer');
      answerBtn.forEach(btn => {
        if (
          btn.querySelector('.answer-text').innerHTML ===
          questions[currentQuestion - 1].correct_answer
        ) {
          btn.classList.add('correct');
        }
      });
    }
  } else {
    // Check if answer is NOT submitted but display correct answer after countdown
    const answerBtn = document.querySelectorAll('.answer');
    answerBtn.forEach(btn => {
      if (
        btn.querySelector('.answer-text').innerHTML ===
        questions[currentQuestion - 1].correct_answer
      ) {
        btn.classList.add('correct');
      }
    });
  }

  // Remove Submit Button
  btnSubmit.style.display = 'none';

  // Add Next Button
  btnNext.style.display = 'block';
};

//////////////////////////////////////////////////////
// Display the Next Question.
const goToNextQuestion = function () {
  // Add Submit Button
  btnSubmit.disabled = true;
  btnSubmit.style.display = 'block';

  // Remove Next Button
  btnNext.style.display = 'none';

  // Go to NEXT question
  if (currentQuestion < questions.length) {
    currentQuestion++;
    showQuestion(questions[currentQuestion - 1]);
  }

  // Show Final Score after final question
  else displayFinalScore();
};

//////////////////////////////////////////////////////
// Display the Final Score
const displayFinalScore = function () {
  containerQuiz.classList.add('hidden');
  containerFinalScore.classList.remove('hidden');
  const percentage = calcPercentage(score, questions.length);

  labelScorePercentage.innerHTML = `<span class="${
    percentage >= 75 ? 'congrat' : percentage >= 50 ? 'nice' : 'oopsey'
  }">${percentage}%</span> Score`;

  labelScore.innerHTML = `You attempted <span>${questions.length} questions</span> and from that
              <span>${score} answer(s)</span> is correct.`;

  labelScoreRemark.innerHTML = `<p class="text-remark ${
    percentage >= 75 ? 'congrat' : percentage >= 50 ? 'nice' : 'oopsey'
  }">${
    percentage >= 75 ? 'Congratulations' : percentage >= 50 ? 'Nice' : 'Oopsey'
  }</p>`;
};

//////////////////////////////////////////////////////
// User Actions

// Click to start quiz
btnStart.addEventListener('click', startQuiz);

// Click to submit answer
btnSubmit.addEventListener('click', checkAnswer);

// Click to display the next question
btnNext.addEventListener('click', goToNextQuestion);

// Restart the Quiz
btnRestart.addEventListener('click', init);
