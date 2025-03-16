/**
 * Excel Mastery - Learning Progress Tracker
 * 
 * This module handles user progress tracking using browser localStorage.
 * It allows tracking completed lessons, storing assessment results, and
 * providing visual progress indicators throughout the learning path.
 */

// Main Progress Tracker Class
class ProgressTracker {
    constructor() {
        this.storageKey = 'excelMasteryProgress';
        this.progress = this.loadProgress();
        this.initializeIfEmpty();
    }

    // Load saved progress from localStorage
    loadProgress() {
        const savedProgress = localStorage.getItem(this.storageKey);
        return savedProgress ? JSON.parse(savedProgress) : null;
    }

    // Initialize empty progress object if none exists
    initializeIfEmpty() {
        if (!this.progress) {
            this.progress = {
                completedLessons: [],
                completedExercises: [],
                assessments: {
                    beginner: { completed: false, score: 0 },
                    intermediate: { completed: false, score: 0 },
                    advanced: { completed: false, score: 0 }
                },
                lastVisited: null
            };
            this.saveProgress();
        }
    }

    // Save progress to localStorage
    saveProgress() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.progress));
    }

    // Mark a lesson as completed
    completeLesson(moduleId, topicId) {
        const lessonId = `${moduleId}-${topicId}`;
        if (!this.progress.completedLessons.includes(lessonId)) {
            this.progress.completedLessons.push(lessonId);
            this.saveProgress();
        }
        this.updateUI();
    }

    // Mark an exercise as completed
    completeExercise(moduleId) {
        if (!this.progress.completedExercises.includes(moduleId)) {
            this.progress.completedExercises.push(moduleId);
            this.saveProgress();
        }
        this.updateUI();
    }

    // Save assessment result
    saveAssessmentResult(level, score) {
        if (this.progress.assessments[level]) {
            this.progress.assessments[level].completed = true;
            this.progress.assessments[level].score = score;
            this.saveProgress();
        }
        this.updateUI();
    }

    // Track last visited page
    trackVisit(moduleId, topicId = null) {
        this.progress.lastVisited = {
            module: moduleId,
            topic: topicId
        };
        this.saveProgress();
    }

    // Check if a specific lesson is completed
    isLessonCompleted(moduleId, topicId) {
        const lessonId = `${moduleId}-${topicId}`;
        return this.progress.completedLessons.includes(lessonId);
    }

    // Check if an exercise is completed
    isExerciseCompleted(moduleId) {
        return this.progress.completedExercises.includes(moduleId);
    }

    // Get assessment result
    getAssessmentResult(level) {
        return this.progress.assessments[level] || { completed: false, score: 0 };
    }

    // Calculate overall progress percentage
    getOverallProgress() {
        // This is a simplified calculation - would need to be adjusted based on total lessons
        const totalLessons = 20; // Example total number of possible lessons
        const totalExercises = 5; // Example total number of exercises
        const totalAssessments = 3; // Beginner, Intermediate, Advanced
        
        const completedItems = this.progress.completedLessons.length + 
                              this.progress.completedExercises.length +
                              Object.values(this.progress.assessments)
                                    .filter(a => a.completed).length;
                              
        const totalItems = totalLessons + totalExercises + totalAssessments;
        
        return Math.round((completedItems / totalItems) * 100);
    }

    // Get progress for a specific level (beginner, intermediate, advanced)
    getLevelProgress(level) {
        // Define lessons and exercises per level (example mapping)
        const levelMapping = {
            beginner: {
                lessons: ['basics-interface', 'basics-data-entry', 'basics-formatting', 'formulas-basics'],
                exercises: ['basics']
            },
            intermediate: {
                lessons: ['formulas-logical', 'basics-multi-sheets', 'dataanalysis-sorting', 'visualization-basics'],
                exercises: ['dataanalysis']
            },
            advanced: {
                lessons: ['dataanalysis-pivottables', 'formulas-lookup', 'advanced-validation', 'advanced-macros'],
                exercises: ['advanced']
            }
        };
        
        if (!levelMapping[level]) return 0;
        
        const levelLessons = levelMapping[level].lessons;
        const levelExercises = levelMapping[level].exercises;
        
        const completedLevelLessons = this.progress.completedLessons.filter(lesson => 
            levelLessons.includes(lesson));
            
        const completedLevelExercises = this.progress.completedExercises.filter(exercise => 
            levelExercises.includes(exercise));
            
        const assessmentComplete = this.progress.assessments[level].completed ? 1 : 0;
        
        const totalItems = levelLessons.length + levelExercises.length + 1; // +1 for assessment
        const completedItems = completedLevelLessons.length + completedLevelExercises.length + assessmentComplete;
        
        return Math.round((completedItems / totalItems) * 100);
    }

    // Update UI elements with progress information
    updateUI() {
        // Add progress indicators to learning path steps
        this.updateLearningPathUI();
        
        // Update any progress bars
        this.updateProgressBars();
        
        // Update any completion badges
        this.updateCompletionBadges();
    }

    // Update learning path UI with completion statuses
    updateLearningPathUI() {
        // Only run this if we're on the learning path page
        if (window.location.hash.includes('learning-path') || currentModule === 'learning-path') {
            const pathSteps = document.querySelectorAll('.path-step');
            
            pathSteps.forEach(step => {
                const button = step.querySelector('.path-btn');
                if (!button) return;
                
                const moduleId = button.getAttribute('data-module');
                const topicId = button.getAttribute('data-topic');
                
                // Handle regular lessons
                if (moduleId && topicId && !button.classList.contains('path-exercise')) {
                    if (this.isLessonCompleted(moduleId, topicId)) {
                        step.classList.add('completed');
                        
                        // Add a completion indicator
                        if (!step.querySelector('.completion-indicator')) {
                            const indicator = document.createElement('span');
                            indicator.className = 'completion-indicator';
                            indicator.innerHTML = '<i class="fa-solid fa-check-circle"></i>';
                            step.querySelector('.step-content').appendChild(indicator);
                        }
                    }
                }
                
                // Handle exercises
                if (button.classList.contains('path-exercise') && moduleId) {
                    if (this.isExerciseCompleted(moduleId)) {
                        step.classList.add('completed');
                        
                        // Add a completion indicator
                        if (!step.querySelector('.completion-indicator')) {
                            const indicator = document.createElement('span');
                            indicator.className = 'completion-indicator';
                            indicator.innerHTML = '<i class="fa-solid fa-check-circle"></i>';
                            step.querySelector('.step-content').appendChild(indicator);
                        }
                    }
                }
            });
            
            // Update assessment buttons
            const assessmentButtons = document.querySelectorAll('.assessment-btn');
            assessmentButtons.forEach(button => {
                const level = button.getAttribute('data-level');
                const result = this.getAssessmentResult(level);
                
                if (result.completed) {
                    const parent = button.parentElement;
                    
                    // Add or update score display
                    let scoreDisplay = parent.querySelector('.assessment-score');
                    if (!scoreDisplay) {
                        scoreDisplay = document.createElement('div');
                        scoreDisplay.className = 'assessment-score';
                        parent.insertBefore(scoreDisplay, button);
                    }
                    
                    scoreDisplay.innerHTML = `<i class="fa-solid fa-trophy"></i> Your Score: ${result.score}%`;
                    button.textContent = 'Retake Assessment';
                }
            });
        }
    }

    // Update progress bars throughout the application
    updateProgressBars() {
        // Overall progress bar in header
        const headerProgress = document.getElementById('overall-progress');
        if (headerProgress) {
            const percentage = this.getOverallProgress();
            headerProgress.style.width = `${percentage}%`;
            headerProgress.setAttribute('aria-valuenow', percentage);
            
            const progressText = document.getElementById('progress-text');
            if (progressText) {
                progressText.textContent = `${percentage}% Complete`;
            }
        }
        
        // Level-specific progress bars on learning path
        ['beginner', 'intermediate', 'advanced'].forEach(level => {
            const levelProgress = document.getElementById(`${level}-progress`);
            if (levelProgress) {
                const percentage = this.getLevelProgress(level);
                levelProgress.style.width = `${percentage}%`;
                levelProgress.setAttribute('aria-valuenow', percentage);
                
                const levelProgressText = document.getElementById(`${level}-progress-text`);
                if (levelProgressText) {
                    levelProgressText.textContent = `${percentage}% Complete`;
                }
            }
        });
    }

    // Update completion badges
    updateCompletionBadges() {
        // Check for earned badges
        ['beginner', 'intermediate', 'advanced'].forEach(level => {
            const badge = document.getElementById(`${level}-badge`);
            if (badge) {
                const levelProgress = this.getLevelProgress(level);
                if (levelProgress === 100) {
                    badge.classList.remove('badge-locked');
                    badge.classList.add('badge-earned');
                }
            }
        });
    }

    // Reset all progress
    resetProgress() {
        if (confirm('Are you sure you want to reset all your progress? This cannot be undone.')) {
            localStorage.removeItem(this.storageKey);
            this.progress = null;
            this.initializeIfEmpty();
            this.updateUI();
            alert('Your progress has been reset.');
        }
    }
}

// Initialize the Progress Tracker
let progressTracker;
document.addEventListener('DOMContentLoaded', () => {
    progressTracker = new ProgressTracker();
    
    // Add reset progress button listeners
    const resetButtons = document.querySelectorAll('.reset-progress-btn');
    resetButtons.forEach(button => {
        button.addEventListener('click', () => progressTracker.resetProgress());
    });
});

// Update UI whenever content is loaded
document.addEventListener('contentLoaded', () => {
    progressTracker.updateUI();
});

// Export the progress tracker for use in other scripts
window.progressTracker = progressTracker;