// filepath: c:\Users\ZaneMounce-Stephens\OneDrive - QUORUM SYSTEMS PTY LTD\Documents\6. Tools and Projects\New Projects\Excel-Templates\assessment.js

/**
 * Excel Mastery - Assessment Manager
 * 
 * This module handles the assessment functionality including:
 * - Level-specific assessments (beginner, intermediate, advanced)
 * - Question rendering and scoring
 * - Timer functionality
 * - Results calculation and display
 * - Integration with progress tracking
 */

class AssessmentManager {
    constructor() {
        // DOM elements
        this.assessmentIntro = document.getElementById('assessment-intro');
        this.quizContainer = document.getElementById('quiz-container');
        this.resultsContainer = document.getElementById('results-container');
        this.reviewContainer = document.getElementById('review-container');
        
        // Assessment state
        this.currentAssessment = null;
        this.currentLevel = null;
        this.questions = [];
        this.userAnswers = [];
        this.currentQuestionIndex = 0;
        this.timeRemaining = 0;
        this.timerInterval = null;
        
        // Level descriptions and metadata
        this.levelData = {
            beginner: {
                title: "Beginner Assessment",
                icon: "fa-solid fa-seedling",
                description: "Test your knowledge of Excel basics including interface navigation, cell formatting, and simple formulas.",
                questionCount: 10,
                timeLimit: 10, // minutes
                passingScore: 70 // percentage
            },
            intermediate: {
                title: "Intermediate Assessment",
                icon: "fa-solid fa-chart-line",
                description: "Demonstrate your understanding of functions, data organization, and visualization techniques in Excel.",
                questionCount: 10,
                timeLimit: 15, // minutes
                passingScore: 70 // percentage
            },
            advanced: {
                title: "Advanced Assessment",
                icon: "fa-solid fa-award",
                description: "Show your mastery of advanced Excel features including complex formulas, PivotTables, macros, and data analysis tools.",
                questionCount: 10,
                timeLimit: 20, // minutes
                passingScore: 70 // percentage
            }
        };
        
        // Set up event listeners when document is ready
        document.addEventListener('DOMContentLoaded', () => {
            this.setupUI();
        });
    }

    /**
     * Initialize assessment for a specific level
     * @param {string} level - The assessment level (beginner, intermediate, advanced)
     */
    initAssessment(level) {
        this.currentLevel = level;
        // Load question set (replace with real data as needed)
        this.questions = this.getQuestionsForLevel(level);
        this.userAnswers = new Array(this.questions.length).fill(null);
        this.currentQuestionIndex = 0;
        this.updateLevelUI();
        this.setupEventListeners();
    }
    
    /**
     * Set up the UI for assessment
     */
    setupUI() {
        // Check if we're on the assessment page
        if (!this.assessmentIntro) return;
        
        // Get the level from URL if present
        const urlParams = new URLSearchParams(window.location.search);
        const level = urlParams.get('level');
        
        if (level && ['beginner', 'intermediate', 'advanced'].includes(level)) {
            this.initAssessment(level);
        } else {
            // Default to beginner if no level specified
            this.initAssessment('beginner');
        }
    }

    /**
     * Reset assessment state
     */
    resetAssessment() {
        this.currentAssessment = null;
        this.questions = [];
        this.userAnswers = [];
        this.currentQuestionIndex = 0;
        this.timeRemaining = 0;
        
        // Clear timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // Reset UI
        if (this.assessmentIntro) this.assessmentIntro.style.display = 'block';
        if (this.quizContainer) this.quizContainer.style.display = 'none';
        if (this.resultsContainer) this.resultsContainer.style.display = 'none';
        if (this.reviewContainer) this.reviewContainer.style.display = 'none';
    }

    /**
     * Update the UI with level-specific information
     */
    updateLevelUI() {
        const levelInfo = this.levelData[this.currentLevel];
        if (!levelInfo) return;
        
        // Update level badge
        const levelBadge = document.getElementById('current-assessment-level');
        if (levelBadge) {
            levelBadge.innerHTML = `<i class="${levelInfo.icon}"></i> ${levelInfo.title}`;
        }
        
        // Update description
        const description = document.getElementById('assessment-description');
        if (description) {
            description.textContent = levelInfo.description;
        }
        
        // Update stats
        const questionCount = document.getElementById('question-count');
        const timeEstimate = document.getElementById('time-estimate');
        const passingScore = document.getElementById('passing-score');
        
        if (questionCount) {
            questionCount.textContent = `${levelInfo.questionCount} Questions`;
        }
        
        if (timeEstimate) {
            timeEstimate.textContent = `~${levelInfo.timeLimit} Minutes`;
        }
        
        if (passingScore) {
            passingScore.textContent = `${levelInfo.passingScore}% to Pass`;
        }
    }

    /**
     * Set up event listeners for assessment controls
     */
    setupEventListeners() {
        // Start assessment button
        const startButton = document.getElementById('start-assessment-btn');
        if (startButton) {
            // Remove existing listener to avoid duplicates
            startButton.replaceWith(startButton.cloneNode(true));
            
            // Add new listener
            document.getElementById('start-assessment-btn').addEventListener('click', () => {
                this.startAssessment();
            });
        }
        
        // Review answers button
        const reviewBtn = document.getElementById('review-answers-btn');
        if (reviewBtn) {
            reviewBtn.addEventListener('click', () => {
                this.reviewContainer.style.display = 'block';
            });
        }
        
        // Return to path button
        const returnBtn = document.getElementById('return-path-btn');
        if (returnBtn) {
            returnBtn.addEventListener('click', () => {
                window.location.href = '?module=learning-path';
            });
        }
    }

    /**
     * Start the assessment
     */
    startAssessment() {
        // Load questions for current level
        this.loadQuestions();
        
        // Set up initial UI
        this.assessmentIntro.style.display = 'none';
        this.quizContainer.style.display = 'block';
        
        // Set up timer
        this.timeRemaining = this.levelData[this.currentLevel].timeLimit * 60;
        this.startTimer();
        
        // Render first question
        this.renderQuestion(0);
        
        // Set up navigation buttons
        this.setupNavigationButtons();
        
        // Update progress bar
        this.updateProgressBar();
        
        // Add animation
        this.quizContainer.classList.add('fade-in-animation');
    }

    /**
     * Load questions for the current level
     */
    loadQuestions() {
        // In a real application, these would likely be loaded from an API or database
        // For now, we'll use the getQuestionsForLevel method to get level-specific questions
        this.questions = this.getQuestionsForLevel(this.currentLevel);
        
        // Initialize user answers array with nulls
        this.userAnswers = Array(this.questions.length).fill(null);
    }

    /**
     * Set up navigation button event listeners
     */
    setupNavigationButtons() {
        const prevBtn = document.getElementById('prev-question-btn');
        const nextBtn = document.getElementById('next-question-btn');
        const submitBtn = document.getElementById('submit-quiz-btn');
        
        // Previous button
        if (prevBtn) {
            prevBtn.replaceWith(prevBtn.cloneNode(true));
            document.getElementById('prev-question-btn').addEventListener('click', () => {
                this.navigateToQuestion(this.currentQuestionIndex - 1);
            });
        }
        
        // Next button
        if (nextBtn) {
            nextBtn.replaceWith(nextBtn.cloneNode(true));
            document.getElementById('next-question-btn').addEventListener('click', () => {
                this.navigateToQuestion(this.currentQuestionIndex + 1);
            });
        }
        
        // Submit button
        if (submitBtn) {
            submitBtn.replaceWith(submitBtn.cloneNode(true));
            document.getElementById('submit-quiz-btn').addEventListener('click', () => {
                if (confirm('Are you sure you want to submit your assessment?')) {
                    this.submitAssessment();
                }
            });
        }
        
        // Update button states
        this.updateNavigationButtons();
    }

    /**
     * Navigate to a specific question
     * @param {number} index - The question index to navigate to
     */
    navigateToQuestion(index) {
        if (index < 0 || index >= this.questions.length) return;
        
        this.currentQuestionIndex = index;
        this.renderQuestion(index);
        this.updateNavigationButtons();
        this.updateProgressBar();
    }

    /**
     * Update navigation button states based on current question index
     */
    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-question-btn');
        const nextBtn = document.getElementById('next-question-btn');
        const submitBtn = document.getElementById('submit-quiz-btn');
        
        if (prevBtn) {
            prevBtn.disabled = this.currentQuestionIndex === 0;
        }
        
        if (nextBtn) {
            nextBtn.disabled = this.currentQuestionIndex === this.questions.length - 1;
        }
        
        if (submitBtn) {
            submitBtn.style.display = this.currentQuestionIndex === this.questions.length - 1 ? 'inline-block' : 'none';
        }
    }

    /**
     * Update the progress bar
     */
    updateProgressBar() {
        const progressBar = document.getElementById('quiz-progress-bar');
        if (progressBar) {
            const progress = ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
            progressBar.style.width = `${progress}%`;
            progressBar.setAttribute('aria-valuenow', progress);
        }
        
        const progressText = document.getElementById('quiz-progress-text');
        if (progressText) {
            progressText.textContent = `Question ${this.currentQuestionIndex + 1} of ${this.questions.length}`;
        }
        
        const questionStatus = document.getElementById('question-status');
        if (questionStatus) {
            questionStatus.textContent = `Question ${this.currentQuestionIndex + 1} of ${this.questions.length}`;
        }
    }
    
    /**
     * Update the question UI with the current answer state
     */
    updateQuestionUI() {
        this.renderQuestion(this.currentQuestionIndex);
        this.updateNavigationButtons();
        this.updateProgressBar();
    }

    /**
     * Get level-specific assessment questions
     * @param {string} level - The assessment level
     * @returns {Array} Array of question objects
     */
    getQuestionsForLevel(level) {
        // Sample questions for different levels
        const questions = {
            beginner: [
                { 
                    text: "Which feature sorts spreadsheet data by column?",
                    type: "multipleChoice",
                    options: ["Filter", "PivotTable", "Sort", "Highlight Cells"],
                    correctIndex: 2
                },
                {
                    text: "What keyboard shortcut is used to copy selected cells in Excel?",
                    type: "multipleChoice",
                    options: ["Ctrl+X", "Ctrl+C", "Ctrl+V", "Ctrl+P"],
                    correctIndex: 1
                },
                {
                    text: "Which of these is NOT a basic chart type in Excel?",
                    type: "multipleChoice",
                    options: ["Column", "Bar", "Network", "Pie"],
                    correctIndex: 2
                }
            ],
            intermediate: [
                {
                    text: "Which function would you use to find a value in a table based on a column and row position?",
                    type: "multipleChoice",
                    options: ["HLOOKUP", "VLOOKUP", "INDEX", "MATCH"],
                    correctIndex: 2
                },
                {
                    text: "What does the COUNTIFS function allow you to do?",
                    type: "multipleChoice",
                    options: ["Count cells based on a single criterion", "Count cells based on multiple criteria", "Count non-empty cells", "Count numbers only"],
                    correctIndex: 1
                },
                {
                    text: "Which feature helps you create an interactive data summary?",
                    type: "multipleChoice",
                    options: ["Charts", "PivotTable", "Data Validation", "Conditional Formatting"],
                    correctIndex: 1
                }
            ],
            advanced: [
                {
                    text: "Which function would you use to extract the middle portion of a text string?",
                    type: "multipleChoice",
                    options: ["LEFT", "RIGHT", "MID", "CONCAT"],
                    correctIndex: 2
                },
                {
                    text: "What Excel feature allows you to analyze different data outcomes?",
                    type: "multipleChoice",
                    options: ["Data Validation", "Scenario Manager", "Data Tables", "All of the above"],
                    correctIndex: 3
                },
                {
                    text: "Which of these is NOT a valid Power Query data transformation?",
                    type: "multipleChoice",
                    options: ["Unpivot Columns", "Add Custom Column", "Remove Duplicates", "Automatic Forecasting"],
                    correctIndex: 3
                }
            ]
        };
        
        // Return questions for the requested level or default to beginner
        return questions[level] || questions.beginner;
    }

    /**
     * Start the assessment timer
     */
    startTimer() {
        const timerDisplay = document.getElementById('time-remaining');
        
        // Update timer display initially
        this.updateTimerDisplay();
        
        // Set up interval to update every second
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            
            if (this.timeRemaining <= 0) {
                // Time's up!
                clearInterval(this.timerInterval);
                this.timeRemaining = 0;
                alert("Time's up! Your assessment will be submitted now.");
                this.submitAssessment();
            }
            
            this.updateTimerDisplay();
        }, 1000);
    }

    /**
     * Update the timer display
     */
    updateTimerDisplay() {
        const timerDisplay = document.getElementById('time-remaining');
        if (!timerDisplay) return;
        
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        
        timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Add warning class when time is running low
        if (this.timeRemaining <= 60) {
            timerDisplay.classList.add('timer-warning');
        }
    }

    /**
     * Render a question at the specified index
     * @param {number} index - The question index to render
     */
    renderQuestion(index) {
        const questionData = this.questions[index];
        if (!questionData) return;
        
        const container = document.getElementById('question-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        const questionEl = document.createElement('div');
        questionEl.className = 'question';
        questionEl.innerHTML = `<h4 class="question-text">${questionData.text}</h4>`;
        const optionsList = document.createElement('div');
        optionsList.className = 'options-list';

        questionData.options.forEach((opt, idx) => {
            const optionItem = document.createElement('div');
            optionItem.className = 'option-item';
            
            // Add selected class if this option is the user's answer
            if (this.userAnswers[index] === idx) {
                optionItem.classList.add('selected');
            }
            
            optionItem.textContent = opt;
            optionItem.addEventListener('click', () => {
                // Remove selected class from all options
                optionsList.querySelectorAll('.option-item').forEach(item => {
                    item.classList.remove('selected');
                });
                
                // Add selected class to this option
                optionItem.classList.add('selected');
                
                // Save the answer
                this.userAnswers[index] = idx;
            });
            
            optionsList.appendChild(optionItem);
        });
        
        questionEl.appendChild(optionsList);
        container.appendChild(questionEl);
    }

    goToNext() {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.currentQuestionIndex++;
            this.updateQuestionUI();
        } else {
            // Reached last question, show submit
            const submitBtn = document.getElementById('submit-quiz-btn');
            if (submitBtn) {
                submitBtn.style.display = 'inline-block';
                submitBtn.focus();
            }
        }
    }

    /**
     * Submit the assessment for scoring
     */
    submitAssessment() {
        clearInterval(this.timerInterval);
        
        const correct = this.userAnswers.reduce((acc, ans, i) => {
            if (ans === this.questions[i].correctIndex) acc++;
            return acc;
        }, 0);
        
        const score = Math.round((correct / this.questions.length) * 100);
        const passing = score >= this.levelData[this.currentLevel].passingScore;

        this.quizContainer.style.display = 'none';
        this.resultsContainer.style.display = 'block';
        
        const correctAnswers = document.getElementById('correct-answers');
        const totalQuestions = document.getElementById('total-questions');
        const scorePercentage = document.getElementById('score-percentage');
        
        if (correctAnswers) correctAnswers.textContent = correct;
        if (totalQuestions) totalQuestions.textContent = this.questions.length;
        if (scorePercentage) {
            scorePercentage.textContent = `${score}%`;
            scorePercentage.className = passing ? 'passing-score' : 'failing-score';
        }

        // Save result if progressTracker is present
        if (window.progressTracker) {
            progressTracker.saveAssessmentResult(this.currentLevel, score);
        }
        
        // Pass/fail message
        const passFail = document.getElementById('pass-fail-message');
        if (passFail) {
            passFail.innerHTML = passing
                ? `<div class="pass-message">Congratulations! You've passed the ${this.levelData[this.currentLevel].title}!</div>`
                : `<div class="fail-message">You did not pass. Keep practicing and try again!</div>`;
        }
        
        // Prepare review content
        this.prepareReviewContent(correct, score);
        
        // Add animation
        this.resultsContainer.classList.add('fade-in-animation');
    }
    
    /**
     * Prepare the review content showing correct/incorrect answers
     */
    prepareReviewContent(correct, score) {
        const reviewQuestionsContainer = document.getElementById('review-questions');
        if (!reviewQuestionsContainer) return;
        
        reviewQuestionsContainer.innerHTML = '';
        
        this.questions.forEach((question, index) => {
            const userAnswer = this.userAnswers[index];
            const isCorrect = userAnswer === question.correctIndex;
            
            const reviewItem = document.createElement('div');
            reviewItem.className = `review-question ${isCorrect ? 'correct' : 'incorrect'}`;
            
            reviewItem.innerHTML = `
                <h5>Question ${index + 1}: ${question.text}</h5>
                <div class="review-answers">
                    <div class="user-answer">
                        <strong>Your answer:</strong> ${userAnswer !== null ? question.options[userAnswer] : 'Not answered'}
                    </div>
                    ${!isCorrect ? `<div class="correct-answer">
                        <strong>Correct answer:</strong> ${question.options[question.correctIndex]}
                    </div>` : ''}
                </div>
            `;
            
            reviewQuestionsContainer.appendChild(reviewItem);
        });
    }
}

// Initialize assessment manager when document is ready
document.addEventListener('DOMContentLoaded', () => {
    window.assessmentManager = new AssessmentManager();
});