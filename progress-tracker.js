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
        this.storageKey = 'excel-mastery-progress';
        this.progress = null;
        
        // Initialize or load existing progress
        this.initializeIfEmpty();
        
        // Add custom event for progress updates
        this.progressUpdateEvent = new CustomEvent('progressUpdated');
    }
    
    // Initialize progress object if it doesn't exist
    initializeIfEmpty() {
        try {
            const storedProgress = localStorage.getItem(this.storageKey);
            this.progress = storedProgress ? JSON.parse(storedProgress) : null;
            
            if (!this.progress) {
                this.progress = {
                    completedLessons: [],
                    completedExercises: [],
                    assessments: {
                        beginner: { completed: false, score: 0 },
                        intermediate: { completed: false, score: 0 },
                        analyst: { completed: false, score: 0 },
                        visualizer: { completed: false, score: 0 },
                        advanced: { completed: false, score: 0 }
                    },
                    lastVisited: { module: null, topic: null },
                    visitsCount: {}
                };
                this.saveProgress();
            }
            
            // Migration for older versions without newer assessment types
            if (!this.progress.assessments.analyst) {
                this.progress.assessments.analyst = { completed: false, score: 0 };
            }
            if (!this.progress.assessments.visualizer) {
                this.progress.assessments.visualizer = { completed: false, score: 0 };
            }
            
            // Migration for older versions without visitsCount
            if (!this.progress.visitsCount) {
                this.progress.visitsCount = {};
                this.saveProgress();
            }
        } catch (e) {
            console.error('Error initializing progress:', e);
            // Create new progress object on error
            this.progress = {
                completedLessons: [],
                completedExercises: [],
                assessments: {
                    beginner: { completed: false, score: 0 },
                    intermediate: { completed: false, score: 0 },
                    analyst: { completed: false, score: 0 },
                    visualizer: { completed: false, score: 0 },
                    advanced: { completed: false, score: 0 }
                },
                lastVisited: { module: null, topic: null },
                visitsCount: {}
            };
            this.saveProgress();
        }
    }
    
    // Save progress to localStorage
    saveProgress() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.progress));
            document.dispatchEvent(this.progressUpdateEvent);
        } catch (e) {
            console.error('Error saving progress:', e);
        }
    }
    
    // Track user visits to modules/topics
    trackVisit(moduleId, topicId = null) {
        // Update last visited
        this.progress.lastVisited = {
            module: moduleId,
            topic: topicId
        };
        
        // Track visit count
        const key = topicId ? `${moduleId}-${topicId}` : moduleId;
        if (!this.progress.visitsCount[key]) {
            this.progress.visitsCount[key] = 0;
        }
        this.progress.visitsCount[key]++;
        
        this.saveProgress();
    }
    
    // Get visit count for a module/topic
    getVisitCount(moduleId, topicId = null) {
        const key = topicId ? `${moduleId}-${topicId}` : moduleId;
        return this.progress.visitsCount[key] || 0;
    }
    
    // Check if a lesson is marked as completed
    isLessonCompleted(moduleId, topicId) {
        const lessonId = `${moduleId}-${topicId}`;
        return this.progress.completedLessons.includes(lessonId);
    }
    
    // Check if an exercise is marked as completed
    isExerciseCompleted(moduleId) {
        return this.progress.completedExercises.includes(moduleId);
    }
    
    // Mark a lesson as completed
    completeLesson(moduleId, topicId) {
        const lessonId = `${moduleId}-${topicId}`;
        if (!this.progress.completedLessons.includes(lessonId)) {
            this.progress.completedLessons.push(lessonId);
            this.saveProgress();
            this.showCompletionToast('Lesson marked as complete!');
        }
        this.updateUI();
    }

    // Mark an exercise as completed
    completeExercise(moduleId) {
        if (!this.progress.completedExercises.includes(moduleId)) {
            this.progress.completedExercises.push(moduleId);
            this.saveProgress();
            this.showCompletionToast('Exercise marked as complete!');
        }
        this.updateUI();
    }
    
    // Show a toast notification for completion events
    showCompletionToast(message) {
        // Create toast container if it doesn't exist
        let toastContainer = document.getElementById('progress-toasts');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'progress-toasts';
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
            
            // Add toast container styles if not present
            if (!document.getElementById('toast-styles')) {
                const toastStyles = document.createElement('style');
                toastStyles.id = 'toast-styles';
                toastStyles.textContent = `
                    .toast-container {
                        position: fixed;
                        bottom: 20px;
                        right: 20px;
                        z-index: 1000;
                    }
                    
                    .toast {
                        background-color: #4CAF50;
                        color: white;
                        padding: 12px 24px;
                        border-radius: 4px;
                        margin-top: 10px;
                        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                        display: flex;
                        align-items: center;
                        animation: toast-slide-in 0.3s, toast-fade-out 0.5s 2.5s;
                        opacity: 0;
                        animation-fill-mode: forwards;
                    }
                    
                    .toast i {
                        margin-right: 10px;
                        font-size: 1.2rem;
                    }
                    
                    @keyframes toast-slide-in {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                    
                    @keyframes toast-fade-out {
                        from { opacity: 1; }
                        to { opacity: 0; }
                    }
                `;
                document.head.appendChild(toastStyles);
            }
        }
        
        // Create and add the toast
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<i class="fa-solid fa-check-circle"></i> ${message}`;
        toastContainer.appendChild(toast);
        
        // Remove toast after animation completes
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // Get assessment result for a specific level
    getAssessmentResult(level) {
        return this.progress.assessments[level] || { completed: false, score: 0 };
    }
    
    // Save assessment result
    saveAssessmentResult(level, score) {
        if (this.progress.assessments[level]) {
            // Only update if score is higher or assessment was not previously completed
            if (!this.progress.assessments[level].completed || score > this.progress.assessments[level].score) {
                this.progress.assessments[level].completed = true;
                this.progress.assessments[level].score = score;
                this.saveProgress();
            }
        }
        this.updateUI();
        
        // Check if this completed a level and issue a congratulations message
        if (this.getLevelProgress(level) === 100) {
            setTimeout(() => {
                this.showCompletionToast(`You've completed the ${level} level of Excel mastery!`);
            }, 1500);
            
            // Check if badge was newly earned and display an animation
            this.animateBadgeEarned(level);
        }
    }
    
    // Animate badge earning
    animateBadgeEarned(level) {
        const badgeElement = document.getElementById(`${level}-badge`);
        if (badgeElement && badgeElement.classList.contains('badge-locked')) {
            setTimeout(() => {
                badgeElement.classList.remove('badge-locked');
                badgeElement.classList.add('badge-earned');
                
                // Create and display confetti animation
                this.createConfetti();
            }, 2000);
        }
    }
    
    // Create confetti celebration effect
    createConfetti() {
        const confettiContainer = document.createElement('div');
        confettiContainer.className = 'confetti-container';
        document.body.appendChild(confettiContainer);
        
        // Add confetti styles if not present
        if (!document.getElementById('confetti-styles')) {
            const confettiStyles = document.createElement('style');
            confettiStyles.id = 'confetti-styles';
            confettiStyles.textContent = `
                .confetti-container {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 9999;
                }
                
                .confetti {
                    position: absolute;
                    width: 10px;
                    height: 10px;
                    opacity: 0;
                    animation: confetti-fall 3s ease-in-out forwards;
                }
                
                @keyframes confetti-fall {
                    0% { 
                        transform: translateY(-100px) rotate(0deg); 
                        opacity: 1; 
                    }
                    100% { 
                        transform: translateY(calc(100vh + 100px)) rotate(720deg); 
                        opacity: 0; 
                    }
                }
            `;
            document.head.appendChild(confettiStyles);
        }
        
        // Create confetti pieces
        const colors = ['#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d', '#43aa8b', '#577590'];
        const shapes = ['square', 'circle'];
        
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            
            // Random position, color, size, and rotation
            const left = Math.random() * 100;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = Math.random() * 10 + 5;
            const rotation = Math.random() * 360;
            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            
            // Set styles
            confetti.style.left = `${left}%`;
            confetti.style.backgroundColor = color;
            confetti.style.width = `${size}px`;
            confetti.style.height = `${size}px`;
            confetti.style.transform = `rotate(${rotation}deg)`;
            confetti.style.borderRadius = shape === 'circle' ? '50%' : '0';
            
            // Add delay for staggered effect
            confetti.style.animationDelay = `${Math.random() * 1.5}s`;
            
            // Add to container
            confettiContainer.appendChild(confetti);
        }
        
        // Remove confetti after animation
        setTimeout(() => {
            confettiContainer.remove();
        }, 4500);
    }

    // Calculate overall progress percentage
    getOverallProgress() {
        // Count total lessons and exercises across all modules
        const totalLessons = 20; // Update this based on your actual content
        const totalExercises = 5; // Update this based on your actual content
        const totalAssessments = 5; // Now includes analyst and visualizer
        
        // Count completed items
        const completedLessons = this.progress.completedLessons.length;
        const completedExercises = this.progress.completedExercises.length;
        const completedAssessments = Object.values(this.progress.assessments)
            .filter(assessment => assessment.completed).length;
        
        // Calculate overall progress
        const total = totalLessons + totalExercises + totalAssessments;
        const completed = completedLessons + completedExercises + completedAssessments;
        
        return Math.round((completed / total) * 100);
    }

    // Get progress for a specific level (beginner, intermediate, analyst, visualizer, advanced)
    getLevelProgress(level) {
        let totalItems = 0;
        let completedItems = 0;
        
        // Define which lessons and exercises belong to each level
        // This depends on your content structure - update as needed
        const levelStructure = {
            beginner: {
                modules: ['basics'],
                assessmentRequired: true
            },
            intermediate: {
                modules: ['formulas', 'basics'],
                assessmentRequired: true
            },
            analyst: {
                modules: ['dataanalysis', 'formulas'],
                assessmentRequired: true
            },
            visualizer: {
                modules: ['visualization'],
                assessmentRequired: true
            },
            advanced: {
                modules: ['advanced', 'visualization', 'dataanalysis'],
                assessmentRequired: true
            }
        };
        
        const levelModules = levelStructure[level]?.modules || [];
        
        // Count lessons for this level
        levelModules.forEach(moduleId => {
            // Count completed lessons in this module
            this.progress.completedLessons.forEach(lessonId => {
                if (lessonId.startsWith(`${moduleId}-`)) {
                    completedItems++;
                }
            });
            
            // Count completed exercises in this module
            if (this.progress.completedExercises.includes(moduleId)) {
                completedItems++;
            }
            
            // Add to total items based on your content structure
            // This is an estimate - update with actual counts
            if (moduleId === 'basics') {
                totalItems += 5; // 4 lessons + 1 exercise
            } else if (moduleId === 'formulas') {
                totalItems += 5; // 4 lessons + 1 exercise
            } else if (moduleId === 'dataanalysis') {
                totalItems += 5; // 4 lessons + 1 exercise
            } else if (moduleId === 'visualization') {
                totalItems += 5; // 4 lessons + 1 exercise
            } else if (moduleId === 'advanced') {
                totalItems += 5; // 4 lessons + 1 exercise
            }
        });
        
        // Add assessment to total
        if (levelStructure[level].assessmentRequired) {
            totalItems += 1;
            if (this.progress.assessments[level]?.completed) {
                completedItems += 1;
            }
        }
        
        // Calculate percentage
        return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    }

    // Update UI elements with progress information
    updateUI() {
        // Add progress indicators to learning path steps
        this.updateLearningPathUI();
        
        // Update any progress bars
        this.updateProgressBars();
        
        // Update any completion badges
        this.updateCompletionBadges();
        
        // Add tooltips to progress indicators
        this.addProgressTooltips();
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
        ['beginner', 'intermediate', 'analyst', 'visualizer', 'advanced'].forEach(level => {
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
    
    // Add tooltips to progress indicators
    addProgressTooltips() {
        // Add tooltips to progress bars
        const progressContainer = document.querySelector('.progress-container');
        if (progressContainer && !progressContainer.hasAttribute('data-tooltip')) {
            const overallProgress = this.getOverallProgress();
            progressContainer.setAttribute('data-tooltip', `Overall progress: ${overallProgress}% complete`);
            progressContainer.classList.add('tooltip');
            
            // Add tooltip element if not present
            if (!progressContainer.querySelector('.tooltip-text')) {
                const tooltipText = document.createElement('span');
                tooltipText.className = 'tooltip-text';
                tooltipText.textContent = `Overall progress: ${overallProgress}% complete`;
                progressContainer.appendChild(tooltipText);
            }
        }
        
        // Add tooltips to completion indicators
        document.querySelectorAll('.completion-indicator').forEach(indicator => {
            if (!indicator.hasAttribute('data-tooltip')) {
                indicator.setAttribute('data-tooltip', 'Completed!');
                indicator.classList.add('tooltip');
                
                // Add tooltip element if not present
                if (!indicator.querySelector('.tooltip-text')) {
                    const tooltipText = document.createElement('span');
                    tooltipText.className = 'tooltip-text';
                    tooltipText.textContent = 'Completed!';
                    indicator.appendChild(tooltipText);
                }
            }
        });
    }

// Update completion badges
updateCompletionBadges() {
    // Check for earned badges
    ['beginner', 'intermediate', 'analyst', 'visualizer', 'advanced'].forEach(level => {
        const badge = document.getElementById(`${level}-badge`);
        if (badge) {
            const levelProgress = this.getLevelProgress(level);
            if (levelProgress === 100) {
                badge.classList.remove('badge-locked');
                badge.classList.add('badge-earned');
                
                // Add tooltip to badge
                if (!badge.hasAttribute('data-tooltip')) {
                    badge.setAttribute('data-tooltip', `${this.formatLevelName(level)} level completed!`);
                    badge.classList.add('tooltip');
                    
                    // Add tooltip element if not present
                    if (!badge.querySelector('.tooltip-text')) {
                        const tooltipText = document.createElement('span');
                        tooltipText.className = 'tooltip-text';
                        tooltipText.textContent = `${this.formatLevelName(level)} level completed!`;
                        badge.appendChild(tooltipText);
                    }
                }
            } else {
                // Add tooltip showing progress
                if (!badge.hasAttribute('data-tooltip') || badge.getAttribute('data-tooltip').includes('%')) {
                    badge.setAttribute('data-tooltip', `${levelProgress}% of ${this.formatLevelName(level)} level completed`);
                    badge.classList.add('tooltip');
                    
                    // Add or update tooltip element
                    let tooltipText = badge.querySelector('.tooltip-text');
                    if (!tooltipText) {
                        tooltipText = document.createElement('span');
                        tooltipText.className = 'tooltip-text';
                        badge.appendChild(tooltipText);
                    }
                    tooltipText.textContent = `${levelProgress}% of ${this.formatLevelName(level)} level completed`;
                }
            }
        }
    });
}

// Format level name for display (capitalize first letter, handle special cases)
formatLevelName(level) {
    if (level === 'visualizer') return 'Data Visualizer';
    if (level === 'analyst') return 'Data Analyst';
    return level.charAt(0).toUpperCase() + level.slice(1);
}

// Reset all progress
resetProgress() {
    if (confirm('Are you sure you want to reset all your progress? This cannot be undone.')) {
        localStorage.removeItem(this.storageKey);
        this.progress = null;
        this.initializeIfEmpty();
        this.updateUI();
        this.showCompletionToast('Your progress has been reset.');
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

// Continue tracking from last location
const lastVisited = progressTracker.progress.lastVisited;
if (lastVisited && lastVisited.module) {
    // Only auto-navigate if the user is on the home page
    if (window.location.hash === '' || window.location.hash === '#') {
        setTimeout(() => {
            if (typeof loadModule === 'function') {
                if (confirm('Would you like to continue from where you left off?')) {
                    loadModule(lastVisited.module, lastVisited.topic);
                }
            }
        }, 1500);
    }
}
});

// Update UI whenever content is loaded
document.addEventListener('contentLoaded', () => {
progressTracker.updateUI();
});

// Export the progress tracker for use in other scripts
window.progressTracker = progressTracker;