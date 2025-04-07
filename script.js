// DOM Elements
const navLinks = document.querySelectorAll('a[data-module]');
const contentContainer = document.getElementById('content-container');
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const mobileNav = document.getElementById('mobile-nav');

// Track current module and topic
let currentModule = 'home';
let currentTopic = null;

// Module display names for breadcrumbs
const moduleDisplayNames = {
    'home': 'Home',
    'learning-path': 'Learning Path',
    'basics': 'Excel Basics',
    'formulas': 'Formulas & Functions',
    'dataanalysis': 'Data Analysis',
    'visualization': 'Data Visualization',
    'advanced': 'Advanced Features',
    'resources': 'Resources',
    'assessment': 'Assessment'
};

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Set current year in footer copyright
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // Initialize progress tracker
    if (typeof ProgressTracker !== 'undefined') {
        window.progressTracker = new ProgressTracker();

        // Listen for progress updates
        document.addEventListener('progressUpdated', () => {
            if (window.progressTracker) {
                window.progressTracker.updateUI();
            }
        });

        // Listen for content loaded to update progress UI
        document.addEventListener('contentLoaded', (event) => {
            if (window.progressTracker) {
                window.progressTracker.updateUI();
            }
        });

        // Continue tracking from last location
        const lastVisited = window.progressTracker.progress.lastVisited;
        if (lastVisited && lastVisited.module) {
            // Only auto-navigate if the user is on the home page
            if (window.location.hash === '' || window.location.hash === '#') {
                setTimeout(() => {
                    if (confirm('Would you like to continue from where you left off?')) {
                        loadModule(lastVisited.module, lastVisited.topic);
                    }
                }, 1500);
            }
        }
    }

    // Load initial module (home)
    loadModule('home');

    // Set up navigation event listeners
    setupNavigation();

    // Setup mobile menu
    setupMobileMenu();

    // Add progress tracking bar to header
    addProgressTrackingBar();

    // Initialize assessment manager
    if (typeof AssessmentManager !== 'undefined') {
        window.assessmentManager = new AssessmentManager();
    }

    // Remove reference to FormulaBuilder
    // The initialization of formula builder has been removed
});

// Add progress tracking bar to the header
function addProgressTrackingBar() {
    // Create progress bar container
    const progressContainer = document.createElement('div');
    progressContainer.className = 'progress-container';
    progressContainer.innerHTML = `
        <div class="progress">
            <div id="overall-progress" class="progress-bar" role="progressbar"
                 style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
        <span id="progress-text">0% Complete</span>
    `;

    // Insert after header
    const header = document.querySelector('header');
    if (header && header.nextSibling) {
        header.parentNode.insertBefore(progressContainer, header.nextSibling);
    }
}

// Load module content
async function loadModule(moduleName, topic = null) {
    try {
        // Show loading state
        contentContainer.innerHTML = '<div class="loading"><i class="fa-solid fa-spinner fa-spin"></i> Loading content...</div>';

        // Fetch the module HTML
        const response = await fetch(`modules/${moduleName}.html`);
        if (!response.ok) throw new Error(`Could not load module: ${moduleName}`);

        const html = await response.text();
        contentContainer.innerHTML = html;

        // Update current module tracking
        currentModule = moduleName;
        currentTopic = topic;

        // Update navigation active states
        updateActiveNavLinks();

        // Track this visit in progress system
        if (window.progressTracker) {
            progressTracker.trackVisit(moduleName, topic);
        }

        // Scroll to specific topic if provided
        if (topic) {
            const topicElement = document.getElementById(topic);
            if (topicElement) {
                setTimeout(() => {
                    topicElement.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        } else {
            // Scroll to top of page
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Set up special event handlers for the loaded content
        setupContentEventHandlers();

        // Add animation for topic cards
        animateTopicCards();

        // Add progress tracking UI elements to the page
        addProgressElements();

        // If we have the progress tracker system, update UI
        if (window.progressTracker) {
            // Update UI immediately
            window.progressTracker.updateUI();

            // Create and dispatch a contentLoaded event
            const event = new CustomEvent('contentLoaded', {
                detail: { module: moduleName, topic: topic }
            });
            document.dispatchEvent(event);
        }

        // Special handling for assessment module
        if (moduleName === 'assessment' && topic && window.assessmentManager) {
            // Initialize assessment with specified level
            setTimeout(() => {
                window.assessmentManager.initAssessment(topic);
            }, 100);
        }

        // Add breadcrumb navigation
        addBreadcrumbNavigation(moduleName, topic);

        // Return a resolved promise for chaining
        return Promise.resolve();
    } catch (error) {
        console.error('Error loading module:', error);
        contentContainer.innerHTML = `
            <div class="error-message">
                <i class="fa-solid fa-exclamation-triangle"></i>
                <p>Sorry, we couldn't load the requested content. Please try again later.</p>
                <button class="primary-btn" onclick="loadModule('home')">Return to Home</button>
            </div>
        `;

        // Return a rejected promise for error handling
        return Promise.reject(error);
    }
}

// Add breadcrumb navigation
function addBreadcrumbNavigation(moduleName, topicId) {
    const breadcrumbNav = document.createElement('nav');
    breadcrumbNav.setAttribute('aria-label', 'breadcrumb');
    breadcrumbNav.className = 'breadcrumb';

    const breadcrumbList = document.createElement('div');
    breadcrumbList.className = 'breadcrumb-list';

    // Always add home
    const homeItem = document.createElement('div');
    homeItem.className = 'breadcrumb-item';
    homeItem.innerHTML = `<a href="#" data-module="home">Home</a>`;
    breadcrumbList.appendChild(homeItem);

    // Add current module if not home
    if (moduleName !== 'home') {
        const moduleItem = document.createElement('div');
        moduleItem.className = 'breadcrumb-item';

        // If we have a topic, make the module a link
        if (topicId) {
            moduleItem.innerHTML = `<a href="#" data-module="${moduleName}">${moduleDisplayNames[moduleName] || moduleName}</a>`;
        } else {
            moduleItem.className += ' active';
            moduleItem.textContent = moduleDisplayNames[moduleName] || moduleName;
        }

        breadcrumbList.appendChild(moduleItem);
    }

    // Add topic if specified
    if (topicId) {
        const topicItem = document.createElement('div');
        topicItem.className = 'breadcrumb-item active';

        // Try to find the topic name from the heading
        const topicElement = document.getElementById(topicId);
        let topicName = topicId;

        if (topicElement) {
            const heading = topicElement.querySelector('h3');
            if (heading) {
                topicName = heading.textContent;
            }
        }

        topicItem.textContent = topicName;
        breadcrumbList.appendChild(topicItem);
    }

    breadcrumbNav.appendChild(breadcrumbList);

    // Insert breadcrumb at the beginning of the content
    const contentFirstChild = contentContainer.firstChild;
    contentContainer.insertBefore(breadcrumbNav, contentFirstChild);

    // Set up breadcrumb link event handlers
    const breadcrumbLinks = breadcrumbNav.querySelectorAll('a[data-module]');
    breadcrumbLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const module = link.getAttribute('data-module');
            loadModule(module);
        });
    });
}

// Add progress tracking elements to the page
function addProgressElements() {
    // Add progress bars to learning path if on that page
    if (currentModule === 'learning-path') {
        // Add progress bars to each level
        const levels = ['beginner', 'intermediate', 'advanced'];
        levels.forEach(level => {
            const levelHeader = document.querySelector(`.level-header.${level}`);
            if (levelHeader) {
                const progressBar = document.createElement('div');
                progressBar.className = 'level-progress-container';
                progressBar.innerHTML = `
                    <div class="progress">
                        <div id="${level}-progress" class="progress-bar" role="progressbar"
                             style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                    <span id="${level}-progress-text">0% Complete</span>
                `;
                levelHeader.appendChild(progressBar);
            }
        });

        // Add badge section
        if (!document.querySelector('.badges-section')) {
            const badgesSection = document.createElement('div');
            badgesSection.className = 'badges-section';
            badgesSection.innerHTML = `
                <h3>Your Achievements</h3>
                <div class="badges-container">
                    <div class="badge badge-locked" id="beginner-badge">
                        <i class="fa-solid fa-award"></i>
                        <span>Beginner</span>
                    </div>
                    <div class="badge badge-locked" id="intermediate-badge">
                        <i class="fa-solid fa-medal"></i>
                        <span>Intermediate</span>
                    </div>
                    <div class="badge badge-locked" id="advanced-badge">
                        <i class="fa-solid fa-trophy"></i>
                        <span>Advanced</span>
                    </div>
                </div>
                <button class="reset-progress-btn">Reset Progress</button>
            `;
            contentContainer.appendChild(badgesSection);

            // Add event listener to reset progress button
            const resetButton = badgesSection.querySelector('.reset-progress-btn');
            if (resetButton) {
                resetButton.addEventListener('click', function() {
                    if (window.progressTracker && confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
                        window.progressTracker.resetProgress();
                        // Reload the current page to reflect changes
                        loadModule('learning-path');
                    }
                });
            }
        }
    }

    // Add completion buttons to lesson pages
    if (['basics', 'formulas', 'dataanalysis', 'visualization', 'advanced'].includes(currentModule)) {
        // Add "Mark as Complete" buttons to each topic card
        const topicCards = document.querySelectorAll('.topic-card');
        topicCards.forEach(card => {
            const topicId = card.id;
            if (topicId) {
                const completeButton = document.createElement('button');
                completeButton.className = 'complete-lesson-btn';
                completeButton.innerHTML = '<i class="fa-solid fa-check"></i> Mark as Complete';
                completeButton.setAttribute('data-module', currentModule);
                completeButton.setAttribute('data-topic', topicId);

                // Add event listener
                completeButton.addEventListener('click', function() {
                    const module = this.getAttribute('data-module');
                    const topic = this.getAttribute('data-topic');
                    if (window.progressTracker) {
                        progressTracker.completeLesson(module, topic);
                        this.disabled = true;
                        this.innerHTML = '<i class="fa-solid fa-check-circle"></i> Completed!';

                        // Dispatch event to update UI
                        document.dispatchEvent(new CustomEvent('progressUpdated'));
                    }
                });

                // Check if already completed
                if (window.progressTracker && progressTracker.isLessonCompleted(currentModule, topicId)) {
                    completeButton.disabled = true;
                    completeButton.innerHTML = '<i class="fa-solid fa-check-circle"></i> Completed!';
                }

                // Add button to topic card
                card.querySelector('h3').appendChild(completeButton);
            }
        });

        // Add complete button for practice exercise
        const practiceExercise = document.querySelector('.practice-exercise');
        if (practiceExercise) {
            const completeExerciseButton = document.createElement('button');
            completeExerciseButton.className = 'complete-exercise-btn';
            completeExerciseButton.innerHTML = '<i class="fa-solid fa-check"></i> Mark Exercise Complete';

            // Add event listener
            completeExerciseButton.addEventListener('click', function() {
                if (window.progressTracker) {
                    progressTracker.completeExercise(currentModule);
                    this.disabled = true;
                    this.innerHTML = '<i class="fa-solid fa-check-circle"></i> Exercise Completed!';

                    // Dispatch event to update UI
                    document.dispatchEvent(new CustomEvent('progressUpdated'));
                }
            });

            // Check if already completed
            if (window.progressTracker && progressTracker.isExerciseCompleted(currentModule)) {
                completeExerciseButton.disabled = true;
                completeExerciseButton.innerHTML = '<i class="fa-solid fa-check-circle"></i> Exercise Completed!';
            }

            // Add button after the download button
            const downloadButton = practiceExercise.querySelector('.resource-btn');
            if (downloadButton) {
                downloadButton.insertAdjacentElement('afterend', completeExerciseButton);
            } else {
                practiceExercise.appendChild(completeExerciseButton);
            }
        }
    }
}

// Set up navigation event listeners
function setupNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const module = link.getAttribute('data-module');
            loadModule(module);

            // Close mobile menu if open
            if (mobileNav.style.display === 'block') {
                mobileNav.style.display = 'none';
            }
        });
    });
}

// Set up mobile menu toggle
function setupMobileMenu() {
    mobileMenuToggle.addEventListener('click', () => {
        mobileNav.style.display = mobileNav.style.display === 'block' ? 'none' : 'block';
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (event) => {
        if (mobileNav.style.display === 'block' &&
            !mobileNav.contains(event.target) &&
            event.target !== mobileMenuToggle) {
            mobileNav.style.display = 'none';
        }
    });
}

// Update active state on navigation links
function updateActiveNavLinks() {
    navLinks.forEach(link => {
        const linkModule = link.getAttribute('data-module');
        if (linkModule === currentModule) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Set up event handlers for interactive elements in content
function setupContentEventHandlers() {
    // Get Started button on home page
    const getStartedBtn = document.getElementById('get-started-btn');
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', () => {
            loadModule('learning-path');
        });
    }

    // View Resources button on home page
    const viewResourcesBtn = document.getElementById('view-resources-btn');
    if (viewResourcesBtn) {
        viewResourcesBtn.addEventListener('click', () => {
            loadModule('resources');
        });
    }

    // Path buttons in learning path
    const pathButtons = document.querySelectorAll('.path-btn');
    if (pathButtons.length > 0) {
        pathButtons.forEach(button => {
            button.addEventListener('click', () => {
                const module = button.getAttribute('data-module');
                const topic = button.getAttribute('data-topic');
                loadModule(module, topic);
            });
        });
    }

    // Path link buttons on home page
    const pathLinkButtons = document.querySelectorAll('.path-link-btn');
    if (pathLinkButtons.length > 0) {
        pathLinkButtons.forEach(button => {
            button.addEventListener('click', () => {
                const module = button.getAttribute('data-module');
                const path = button.getAttribute('data-path');

                // Scroll to the specific path section after loading the learning path
                loadModule(module).then(() => {
                    if (path) {
                        // Find the corresponding section based on the path
                        let targetSection;

                        switch(path) {
                            case 'beginner':
                                targetSection = document.querySelector('.level-header.beginner');
                                break;
                            case 'data-analysis':
                                // Find the Data Analysis path header
                                const headers = document.querySelectorAll('.level-header');
                                headers.forEach(header => {
                                    if (header.querySelector('h3').textContent.includes('Data Analysis')) {
                                        targetSection = header;
                                    }
                                });
                                break;
                            case 'data-visualization':
                                // Find the Data Visualization path header
                                const vizHeaders = document.querySelectorAll('.level-header');
                                vizHeaders.forEach(header => {
                                    if (header.querySelector('h3').textContent.includes('Data Visualization')) {
                                        targetSection = header;
                                    }
                                });
                                break;
                            case 'advanced':
                                targetSection = document.querySelector('.level-header.advanced');
                                break;
                        }

                        // Scroll to the section if found
                        if (targetSection) {
                            setTimeout(() => {
                                targetSection.scrollIntoView({ behavior: 'smooth' });
                            }, 100);
                        }
                    }
                });
            });
        });
    }

    // Remove duplicate resource button handlers - they're now handled by resource-handler.js

    // Quick links in the Popular Resources section
    const quickLinks = document.querySelectorAll('.quick-link');
    if (quickLinks.length > 0) {
        quickLinks.forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                const module = link.getAttribute('data-module');
                const topic = link.getAttribute('data-topic');
                loadModule(module, topic);
            });
        });
    }

    // Assessment buttons
    const assessmentButtons = document.querySelectorAll('.assessment-btn');
    if (assessmentButtons.length > 0) {
        assessmentButtons.forEach(button => {
            button.addEventListener('click', () => {
                const level = button.getAttribute('data-level');

                // Navigate to assessment page with level parameter
                loadModule('assessment', level);
            });
        });
    }

    // Formula examples section has been removed
}

// Add animation to topic cards
function animateTopicCards() {
    const topicCards = document.querySelectorAll('.topic-card');

    // Create and add animation styles if not already present
    if (!document.getElementById('animation-styles')) {
        const style = document.createElement('style');
        style.id = 'animation-styles';
        style.textContent = `
            .animate-on-scroll {
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 0.6s ease, transform 0.6s ease;
            }

            .animate-on-scroll.visible {
                opacity: 1;
                transform: translateY(0);
            }

            /* Progress tracking styles */
            .progress-container {
                background-color: #f3f9f3;
                padding: 0.5rem 1rem;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }

            .progress {
                flex: 1;
                height: 0.75rem;
                background-color: #e0e0e0;
                border-radius: 0.375rem;
                margin-right: 1rem;
                max-width: 300px;
                overflow: hidden;
            }

            .progress-bar {
                height: 100%;
                background-color: var(--primary-color);
                border-radius: 0.375rem;
                transition: width 0.3s ease;
            }

            #progress-text {
                font-size: 0.875rem;
                font-weight: 600;
                color: var(--primary-color);
            }

            /* Learning path progress */
            .level-progress-container {
                margin-top: 0.5rem;
                display: flex;
                align-items: center;
            }

            .level-header .progress {
                height: 0.5rem;
                background-color: rgba(255,255,255,0.3);
                max-width: 200px;
            }

            .level-header .progress-bar {
                background-color: white;
            }

            .level-header #beginner-progress-text,
            .level-header #intermediate-progress-text,
            .level-header #advanced-progress-text {
                font-size: 0.75rem;
                color: white;
                margin-left: 0.5rem;
            }

            /* Badges section */
            .badges-section {
                margin-top: 3rem;
                text-align: center;
                padding: 2rem;
                background-color: #f9f9f9;
                border-radius: 8px;
            }

            .badges-container {
                display: flex;
                justify-content: center;
                gap: 2rem;
                margin: 1.5rem 0;
            }

            .badge {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 1.5rem;
                border-radius: 50%;
                width: 120px;
                height: 120px;
                justify-content: center;
            }

            .badge i {
                font-size: 2.5rem;
                margin-bottom: 0.5rem;
            }

            .badge-locked {
                background-color: #f0f0f0;
                color: #999;
                opacity: 0.7;
            }

            .badge-earned {
                background-color: #fef9e7;
                color: #f1c40f;
                box-shadow: 0 0 15px rgba(241, 196, 15, 0.5);
                animation: badge-glow 2s infinite alternate;
            }

            @keyframes badge-glow {
                from {
                    box-shadow: 0 0 15px rgba(241, 196, 15, 0.5);
                }
                to {
                    box-shadow: 0 0 25px rgba(241, 196, 15, 0.8);
                }
            }

            /* Completion buttons */
            .complete-lesson-btn, .complete-exercise-btn {
                background-color: #e8f5e9;
                border: 1px solid var(--primary-color);
                color: var(--primary-color);
                border-radius: 4px;
                padding: 0.3rem 0.8rem;
                font-size: 0.85rem;
                margin-left: 1rem;
                cursor: pointer;
                transition: all 0.2s ease;
                vertical-align: middle;
            }

            .complete-lesson-btn:hover, .complete-exercise-btn:hover {
                background-color: #c8e6c9;
            }

            .complete-lesson-btn:disabled, .complete-exercise-btn:disabled {
                background-color: #f1f8e9;
                border-color: #a5d6a7;
                color: #81c784;
                cursor: default;
            }

            .complete-exercise-btn {
                display: block;
                margin: 1rem 0 0 0;
                padding: 0.5rem 1rem;
                font-size: 1rem;
            }

            .completion-indicator {
                color: var(--primary-color);
                margin-left: 0.5rem;
            }

            .path-step.completed .step-number {
                background-color: var(--primary-color);
            }

            .assessment-score {
                background-color: #fef9e7;
                border-radius: 4px;
                padding: 0.5rem;
                margin-bottom: 0.5rem;
                color: #f39c12;
                font-weight: 600;
            }

            .reset-progress-btn {
                background-color: #f5f5f5;
                border: 1px solid #ddd;
                color: #666;
                border-radius: 4px;
                padding: 0.5rem 1rem;
                cursor: pointer;
            }

            .reset-progress-btn:hover {
                background-color: #eeeeee;
                color: #333;
            }
        `;
        document.head.appendChild(style);
    }

    // Interactive formula styles have been removed

    // Set up intersection observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    });

    // Apply animation classes and observe each card
    topicCards.forEach(card => {
        card.classList.add('animate-on-scroll');
        observer.observe(card);
    });
}