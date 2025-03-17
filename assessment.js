/**
 * Excel Mastery - Assessment Manager
 * 
 * This module handles the assessment functionality including:
 * - Level-specific assessments (beginner, intermediate, advanced, analyst, visualizer)
 * - Question rendering and scoring
 * - Timer functionality
 * - Results calculation and display
 * - Integration with progress tracking
 */

class AssessmentManager {
    constructor() {
        // DOM elements will be initialized on setup
        this.assessmentIntro = null;
        this.quizContainer = null;
        this.resultsContainer = null;
        this.reviewContainer = null;
        
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
            analyst: {
                title: "Data Analyst Assessment",
                icon: "fa-solid fa-magnifying-glass-chart",
                description: "Showcase your ability to analyze data with PivotTables, functions, and Excel's analytical tools.",
                questionCount: 10,
                timeLimit: 15, // minutes
                passingScore: 70 // percentage
            },
            visualizer: {
                title: "Data Visualization Assessment",
                icon: "fa-solid fa-chart-pie",
                description: "Demonstrate your mastery of Excel's visualization capabilities and dashboard creation techniques.",
                questionCount: 10,
                timeLimit: 15, // minutes
                passingScore: 70 // percentage
            },
            advanced: {
                title: "Advanced Assessment",
                icon: "fa-solid fa-award",
                description: "Show your mastery of advanced Excel features including complex formulas, Power tools, and data analysis tools.",
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
     * @param {string} level - The assessment level (beginner, intermediate, analyst, visualizer, advanced)
     */
    initAssessment(level) {
        this.currentLevel = level;
        
        // Initialize DOM references here to ensure they're current
        this.initDomReferences();
        
        // Load question set
        this.questions = this.getQuestionsForLevel(level);
        this.userAnswers = new Array(this.questions.length).fill(null);
        this.currentQuestionIndex = 0;
        this.updateLevelUI();
        this.setupEventListeners();
    }
    
    /**
     * Initialize DOM references
     */
    initDomReferences() {
        this.assessmentIntro = document.getElementById('assessment-intro');
        this.quizContainer = document.getElementById('quiz-container');
        this.resultsContainer = document.getElementById('results-container');
        this.reviewContainer = document.getElementById('review-container');
        
        // If elements aren't found, log error but don't crash
        if (!this.assessmentIntro) console.error('Element #assessment-intro not found');
        if (!this.quizContainer) console.error('Element #quiz-container not found');
        if (!this.resultsContainer) console.error('Element #results-container not found');
        if (!this.reviewContainer) console.error('Element #review-container not found');
    }
    
    /**
     * Set up the UI for assessment
     */
    setupUI() {
        // Initialize DOM references
        this.initDomReferences();
        
        // Check if we're on the assessment page
        if (!this.assessmentIntro) return;
        
        // Get the level from URL if present
        const urlParams = new URLSearchParams(window.location.search);
        const level = urlParams.get('level');
        
        if (level && Object.keys(this.levelData).includes(level)) {
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
        
        // Reset UI (only if elements exist)
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
                if (this.reviewContainer) {
                    this.reviewContainer.style.display = 'block';
                }
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
        // Make sure DOM elements are initialized
        this.initDomReferences();
        
        // Check if required elements exist
        if (!this.assessmentIntro || !this.quizContainer) {
            console.error('Required DOM elements not found for starting assessment');
            alert('There was a problem starting the assessment. Please try refreshing the page.');
            return;
        }
        
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
                },
                {
                    text: "Which symbol must start every Excel formula?",
                    type: "multipleChoice",
                    options: ["#", "$", "=", "@"],
                    correctIndex: 2
                },
                {
                    text: "How do you make a cell reference absolute in a formula?",
                    type: "multipleChoice",
                    options: ["Add @ before the reference", "Add $ before the column and row", "Add ! after the reference", "Use the ABS function"],
                    correctIndex: 1
                },
                {
                    text: "What is the result of the formula =SUM(10,20,30)?",
                    type: "multipleChoice",
                    options: ["10", "30", "60", "Error"],
                    correctIndex: 2
                },
                {
                    text: "Which feature would you use to make text bold in Excel?",
                    type: "multipleChoice",
                    options: ["Format Cells", "Cell Styles", "Conditional Formatting", "Text Functions"],
                    correctIndex: 0
                },
                {
                    text: "What's the quickest way to select all cells in a worksheet?",
                    type: "multipleChoice",
                    options: ["Ctrl+A", "Ctrl+Home", "Clicking the corner between row and column headers", "Alt+Enter"],
                    correctIndex: 2
                },
                {
                    text: "Which is NOT a valid number format in Excel?",
                    type: "multipleChoice",
                    options: ["Currency", "Percentage", "Scientific", "Capitals"],
                    correctIndex: 3
                },
                {
                    text: "How do you insert a new row in Excel?",
                    type: "multipleChoice",
                    options: ["Right-click and select Insert", "Home tab > Insert button", "Alt+I+R", "All of these"],
                    correctIndex: 3
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
                    text: "Which function calculates the number of days between two dates, excluding weekends?",
                    type: "multipleChoice",
                    options: ["DAYS", "NETWORKDAYS", "DATEIF", "WORKDAYS"],
                    correctIndex: 1
                },
                {
                    text: "What does the formula =IF(A1>10,\"High\",\"Low\") do?",
                    type: "multipleChoice",
                    options: ["Displays 'High' if A1 is greater than 10, otherwise displays 'Low'", "Displays 'High' if A1 is less than 10, otherwise displays 'Low'", "Displays 'High' if A1 equals 10, otherwise displays 'Low'", "Returns an error because the syntax is incorrect"],
                    correctIndex: 0
                },
                {
                    text: "Which formula would properly calculate the average of numbers in cells A1 through A10, but only if they are greater than zero?",
                    type: "multipleChoice",
                    options: ["=AVERAGE(A1:A10>0)", "=AVERAGEIF(A1:A10,\">0\")", "=AVERAGE(IF(A1:A10>0,A1:A10))", "=IF(A1:A10>0,AVERAGE(A1:A10))"],
                    correctIndex: 1
                },
                {
                    text: "What chart type is best suited for showing data composition over time?",
                    type: "multipleChoice",
                    options: ["Pie chart", "Line chart", "Stacked area chart", "Scatter plot"],
                    correctIndex: 2
                },
                {
                    text: "How would you restrict data entry in a cell to values between 1 and 100?",
                    type: "multipleChoice",
                    options: ["Conditional formatting", "Data validation", "Custom number format", "Protect sheet"],
                    correctIndex: 1
                },
                {
                    text: "Which Excel feature could create a table that shows sales by product and region?",
                    type: "multipleChoice",
                    options: ["Data Table", "PivotTable", "Consolidate", "Scenario Manager"],
                    correctIndex: 1
                },
                {
                    text: "What formula error appears when a formula refers to a cell that has been deleted?",
                    type: "multipleChoice",
                    options: ["#NULL!", "#REF!", "#VALUE!", "#N/A"],
                    correctIndex: 1
                },
                {
                    text: "Which function would you use to combine text from multiple cells?",
                    type: "multipleChoice",
                    options: ["COMBINE", "CONCAT", "JOIN", "MERGE"],
                    correctIndex: 1
                }
            ],
            
            analyst: [
                {
                    text: "In a correlation analysis, what does a value of -0.9 indicate?",
                    type: "multipleChoice",
                    options: ["Strong positive correlation", "Weak positive correlation", "No correlation", "Strong negative correlation"],
                    correctIndex: 3
                },
                {
                    text: "Which PivotTable calculation shows each value as a percentage of the total?",
                    type: "multipleChoice",
                    options: ["% of Column Total", "% of Row Total", "% of Grand Total", "% Difference From"],
                    correctIndex: 2
                },
                {
                    text: "Which feature would you use to find the input value needed to reach a specific target result?",
                    type: "multipleChoice",
                    options: ["Data Table", "Scenario Manager", "Goal Seek", "Solver"],
                    correctIndex: 2
                },
                {
                    text: "What does the INDEX-MATCH combination do better than VLOOKUP?",
                    type: "multipleChoice",
                    options: ["It's faster for small datasets", "It can lookup values to the left of the lookup column", "It automatically handles errors", "It always returns approximate matches"],
                    correctIndex: 1
                },
                {
                    text: "Which Power Query operation would you use to turn columns into rows?",
                    type: "multipleChoice",
                    options: ["Transpose", "Unpivot", "Pivot", "Reverse"],
                    correctIndex: 1
                },
                {
                    text: "What is R-squared in regression analysis?",
                    type: "multipleChoice",
                    options: ["The correlation coefficient", "The percentage of variance explained by the model", "The slope of the regression line", "The standard error"],
                    correctIndex: 1
                },
                {
                    text: "Which Analysis ToolPak feature creates a frequency distribution and histogram?",
                    type: "multipleChoice",
                    options: ["Descriptive Statistics", "Histogram", "Random Number Generation", "Sampling"],
                    correctIndex: 1
                },
                {
                    text: "What is a two-variable data table used for?",
                    type: "multipleChoice",
                    options: ["Creating a PivotTable with two variables", "Testing formulas with two changing inputs", "Comparing two datasets", "Converting two columns of data"],
                    correctIndex: 1
                },
                {
                    text: "Which function would help identify duplicates in a dataset?",
                    type: "multipleChoice",
                    options: ["UNIQUE", "DUPLICATE", "COUNTIF", "FILTER"],
                    correctIndex: 2
                },
                {
                    text: "What problem can the TRIM function solve?",
                    type: "multipleChoice",
                    options: ["Removing spaces from the beginning and end of text", "Converting text to proper case", "Removing all spaces from text", "Shortening text to a specific length"],
                    correctIndex: 0
                }
            ],
            
            visualizer: [
                {
                    text: "Which chart type is best for showing the relationship between two numerical variables?",
                    type: "multipleChoice",
                    options: ["Pie chart", "Column chart", "Scatter chart", "Doughnut chart"],
                    correctIndex: 2
                },
                {
                    text: "What does a bubble chart's third dimension (bubble size) represent?",
                    type: "multipleChoice",
                    options: ["Time", "A third numeric value", "Category", "Error margin"],
                    correctIndex: 1
                },
                {
                    text: "Which Excel visualization feature is best for showing a small trend graph within a single cell?",
                    type: "multipleChoice",
                    options: ["Sparkline", "Miniature", "In-cell chart", "Data bar"],
                    correctIndex: 0
                },
                {
                    text: "When creating a dashboard, which interactive element allows users to filter multiple charts simultaneously?",
                    type: "multipleChoice",
                    options: ["Filter button", "Slicer", "Query table", "Dynamic range"],
                    correctIndex: 1
                },
                {
                    text: "Which chart element should be used to explain an unusual value in your visualization?",
                    type: "multipleChoice",
                    options: ["Legend", "Data label", "Text box", "Title"],
                    correctIndex: 2
                },
                {
                    text: "What's a key consideration when choosing colors for your charts?",
                    type: "multipleChoice",
                    options: ["Use as many different colors as possible", "Always use dark backgrounds", "Ensure sufficient contrast", "Avoid using the same colors in different charts"],
                    correctIndex: 2
                },
                {
                    text: "Which chart accurately shows changes in composition over time?",
                    type: "multipleChoice",
                    options: ["Multiple pie charts", "Stacked column chart", "100% stacked area chart", "Clustered bar chart"],
                    correctIndex: 2
                },
                {
                    text: "What Excel feature creates an image-like snapshot of data that updates when the source changes?",
                    type: "multipleChoice",
                    options: ["Print Screen", "Copy as Picture", "Camera tool", "Screenshot"],
                    correctIndex: 2
                },
                {
                    text: "What visualization is best for showing hierarchical data relationships?",
                    type: "multipleChoice",
                    options: ["Line chart", "Sunburst chart", "Box and whisker plot", "Waterfall chart"],
                    correctIndex: 1
                },
                {
                    text: "When is it appropriate to start a column chart's y-axis at a value other than zero?",
                    type: "multipleChoice",
                    options: ["To save space", "When the data range is very small", "When focusing on percentage changes", "Never - it's misleading"],
                    correctIndex: 3
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
                },
                {
                    text: "Which financial function calculates the future value of an investment with regular payments?",
                    type: "multipleChoice",
                    options: ["FV", "PMT", "PV", "NPV"],
                    correctIndex: 0
                },
                {
                    text: "What is an array formula in Excel?",
                    type: "multipleChoice",
                    options: ["A formula that operates on multiple values simultaneously", "A formula that creates a graphic array", "A formula that sorts data in arrays", "A formula with multiple conditions"],
                    correctIndex: 0
                },
                {
                    text: "What's the benefit of using structured references in Excel Tables?",
                    type: "multipleChoice",
                    options: ["They make formulas more readable", "They automatically adjust when the table size changes", "They prevent formula errors", "All of the above"],
                    correctIndex: 3
                },
                {
                    text: "Which VBA object represents a single Excel file?",
                    type: "multipleChoice",
                    options: ["Application", "Worksheet", "Workbook", "Range"],
                    correctIndex: 2
                },
                {
                    text: "What is the main advantage of Power Pivot over regular PivotTables?",
                    type: "multipleChoice",
                    options: ["Better formatting options", "Ability to handle much larger datasets", "More chart types", "Simpler interface"],
                    correctIndex: 1
                },
                {
                    text: "Which function would help create dynamic chart titles that update based on selected data?",
                    type: "multipleChoice",
                    options: ["CELL", "INDIRECT", "ADDRESS", "OFFSET"],
                    correctIndex: 1
                },
                {
                    text: "What technique helps improve Excel file performance with large datasets?",
                    type: "multipleChoice",
                    options: ["Adding more formatting", "Using more formulas instead of values", "Minimizing volatile functions", "Linking to external data sources"],
                    correctIndex: 2
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
        if (!timerDisplay) return;
        
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
        // Clear timer if it exists
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        // Calculate score
        const correct = this.userAnswers.reduce((acc, ans, i) => {
            if (ans === this.questions[i].correctIndex) acc++;
            return acc;
        }, 0);
        
        const score = Math.round((correct / this.questions.length) * 100);
        const passing = score >= this.levelData[this.currentLevel].passingScore;

        // Make sure DOM elements are available
        this.initDomReferences();
        
        // Check for required elements
        if (!this.quizContainer || !this.resultsContainer) {
            console.error("Required DOM elements missing for assessment results");
            alert("There was a problem displaying your results. Please try again.");
            return;
        }
        
        // Update UI
        this.quizContainer.style.display = 'none';
        this.resultsContainer.style.display = 'block';
        
        // Update result display
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