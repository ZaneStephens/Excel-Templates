/**
 * Resource Handler - Manages the download functionality for Excel resources
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all resource download buttons
    initializeResourceButtons();
});

/**
 * Sets up event listeners for all resource download buttons
 */
function initializeResourceButtons() {
    const resourceButtons = document.querySelectorAll('.resource-btn');
    
    resourceButtons.forEach(button => {
        button.addEventListener('click', handleResourceDownload);
    });
}

/**
 * Handles the resource download when a button is clicked
 * @param {Event} event - The click event
 */
function handleResourceDownload(event) {
    // Ensure we're working with the button element itself, not any child elements
    let target = event.target;
    while (target && !target.classList.contains('resource-btn')) {
        target = target.parentElement;
    }
    
    if (!target) return;
    
    const resourceId = target.getAttribute('data-resource');
    const resourceType = getResourceType(resourceId);
    
    // Show loading state
    const button = target;
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = 'Downloading...';
    
    // Check if resource is HTML page and handle it differently
    if (resourceType === 'html') {
        const resourceMap = {
            'formulas-html': '/resources/cheatsheets/formulareference.html',
            'shortcuts-html': '/resources/cheatsheets/keyboardshortcuts.html'
        };
        
        const url = resourceMap[resourceId];
        if (url) {
            // Open HTML page in a new tab
            window.open(url, '_blank');
            button.textContent = 'Opened!';
            setTimeout(() => {
                button.textContent = originalText;
                button.disabled = false;
            }, 2000);
        } else {
            button.textContent = 'Not Available';
            setTimeout(() => {
                button.textContent = originalText;
                button.disabled = false;
            }, 2000);
            showNotification('This resource is coming soon!');
        }
        return;
    }
    
    // Simulate download delay (remove in production and replace with actual fetch)
    setTimeout(() => {
        downloadResource(resourceId, resourceType)
            .then(() => {
                button.textContent = 'Downloaded!';
                setTimeout(() => {
                    button.textContent = originalText;
                    button.disabled = false;
                }, 2000);
            })
            .catch(error => {
                console.error('Download failed:', error);
                if (error.message === 'Resource coming soon') {
                    button.textContent = 'Coming Soon';
                    showNotification('This resource is coming soon!');
                } else {
                    button.textContent = 'Error - Try Again';
                }
                setTimeout(() => {
                    button.textContent = originalText;
                    button.disabled = false;
                }, 2000);
            });
    }, 800);
}

/**
 * Determines the type of resource based on its ID
 * @param {string} resourceId - The unique identifier of the resource
 * @returns {string} The resource type
 */
function getResourceType(resourceId) {
    if(resourceId.includes('template')) {
        return 'excel';
    } else if(resourceId.includes('pdf')) {
        return 'pdf';
    } else if(resourceId.includes('html')) {
        return 'html';
    } else {
        return 'other';
    }
}

/**
 * Downloads the resource file
 * @param {string} resourceId - The unique identifier of the resource
 * @param {string} resourceType - The type of the resource
 * @returns {Promise} A promise that resolves when the download is complete
 */
function downloadResource(resourceId, resourceType) {
    return new Promise((resolve, reject) => {
        // Map resource IDs to file paths
        const resourceMap = {
            // Excel templates
            'budget-template': '/resources/templates/monthly_budget_template.xlsx',
            'commission-template': '/resources/templates/sales_commission_calculator.xlsx',
            'sales-analysis-template': '/resources/templates/sales_data_analysis.xlsx',
            'dashboard-template': '/resources/templates/dashboard_project.xlsx',
            
            // PDF cheat sheets
            'shortcuts-pdf': '/resources/cheatsheets/keyboardshortcuts.html',
            'formulas-pdf': '/resources/cheatsheets/formulareference.html',
            'chart-guide-pdf': '/resources/cheatsheets/chart_selection_guide.pdf',
            'functions-pdf': '/resources/cheatsheets/excel_functions_by_category.pdf'
        };
        
        const filePath = resourceMap[resourceId];
        
        if (!filePath) {
            reject(new Error('Resource coming soon'));
            return;
        }
        
        try {
            // Check if the resource exists or is available
            const availableResources = [
                'formulas-pdf',
                'formulas-html',
                'shortcuts-pdf', 
                'shortcuts-html'
            ];
            
            if (!availableResources.includes(resourceId)) {
                reject(new Error('Resource coming soon'));
                return;
            }
            
            // Special handling for PDF downloads from HTML files
            if (resourceId === 'formulas-pdf' || resourceId === 'shortcuts-pdf') {
                const htmlPath = resourceMap[resourceId];
                
                // Open the HTML file in a new window and trigger print dialog
                const printWindow = window.open(htmlPath, '_blank');
                if (!printWindow) {
                    showNotification('Please allow pop-ups to download PDF');
                    reject(new Error('Popup blocked'));
                    return;
                }
                
                showNotification('Save as PDF when the print dialog appears');
                
                // Wait for the page to load then trigger print
                printWindow.onload = function() {
                    setTimeout(() => {
                        // Try to set a good filename
                        if (resourceId === 'formulas-pdf') {
                            printWindow.document.title = 'Excel_Formula_Reference';
                        } else {
                            printWindow.document.title = 'Excel_Keyboard_Shortcuts';
                        }
                        
                        // Trigger print dialog
                        printWindow.print();
                        resolve();
                    }, 1000);
                };
                return;
            }
            
            // For normal file downloads
            window.location.href = filePath;
            resolve();
            
        } catch (error) {
            console.error('Download error:', error);
            reject(error);
        }
    });
}

/**
 * Generate PDF from HTML content
 * @param {string} htmlPath - Path to the HTML file
 * @param {string} resourceId - Resource identifier
 * @returns {Promise} A promise that resolves when PDF is generated
 */
function generatePDFFromHTML(htmlPath, resourceId) {
    return new Promise((resolve, reject) => {
        try {
            // Create a hidden iframe to load the HTML content
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
            
            // Set the source of the iframe
            iframe.src = htmlPath;
            
            // Wait for the iframe to load
            iframe.onload = function() {
                try {
                    // Get the title of the document for naming the PDF
                    let title = '';
                    if (resourceId === 'formulas-pdf') {
                        title = 'Excel_Formula_Reference';
                    } else if (resourceId === 'shortcuts-pdf') {
                        title = 'Excel_Keyboard_Shortcuts';
                    } else {
                        title = 'Excel_Cheatsheet';
                    }
                    
                    // Use the print functionality to generate PDF
                    const printWindow = window.open(htmlPath, '_blank');
                    printWindow.onload = function() {
                        // Add a small delay to ensure the page is fully loaded
                        setTimeout(() => {
                            // Set the document title for the PDF filename
                            printWindow.document.title = title;
                            
                            // Add a script to the print window to trigger print dialog
                            const script = printWindow.document.createElement('script');
                            script.textContent = `
                                // Add print CSS to ensure proper formatting
                                const style = document.createElement('style');
                                style.textContent = '@media print { body { -webkit-print-color-adjust: exact; } }';
                                document.head.appendChild(style);
                                
                                // Show print dialog after a short delay
                                setTimeout(() => {
                                    window.print();
                                    // Close the window once printing is done or canceled
                                    // Only if supported by the browser
                                    if (!window.chrome) {
                                        setTimeout(() => window.close(), 500);
                                    }
                                }, 500);
                            `;
                            printWindow.document.body.appendChild(script);
                            
                            // Show notification to the user
                            showNotification('Save as PDF when the print dialog appears');
                            
                            // Resolve the promise after a delay
                            setTimeout(resolve, 1000);
                        }, 1000);
                    };
                } catch (error) {
                    reject(error);
                } finally {
                    // Clean up the iframe
                    setTimeout(() => {
                        document.body.removeChild(iframe);
                    }, 2000);
                }
            };
            
            // Handle iframe load errors
            iframe.onerror = function() {
                document.body.removeChild(iframe);
                reject(new Error('Failed to load content'));
            };
            
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Simple check to simulate if a file exists (in a real app, you'd make a HEAD request)
 * @param {string} filePath - Path to the file
 * @returns {boolean} Whether the file exists
 */
function checkFileExists(filePath) {
    // For demo purposes, only the formula reference HTML is considered to exist
    return filePath.includes('formulareference.html');
}

/**
 * Display a notification when download completes
 * @param {string} message - The notification message
 */
function showNotification(message) {
    // Remove any existing notifications first
    const existingNotifications = document.querySelectorAll('.download-notification');
    existingNotifications.forEach(notification => {
        document.body.removeChild(notification);
    });
    
    // Create a new notification
    const notification = document.createElement('div');
    notification.className = 'download-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">
                <i class="fa-solid fa-info-circle"></i>
            </span>
            <span class="notification-message">${message}</span>
        </div>
        <button class="notification-close">×</button>
    `;
    
    // Add close button functionality
    const closeButton = notification.querySelector('.notification-close');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
    }
    
    document.body.appendChild(notification);
    
    // Show notification with animation
    setTimeout(() => {
        notification.classList.add('show');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (notification.classList.contains('show')) {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
    }, 10);
}
