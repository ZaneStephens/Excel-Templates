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
    const resourceId = event.target.getAttribute('data-resource');
    const resourceType = getResourceType(resourceId);
    
    // Show loading state
    const button = event.target;
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = 'Downloading...';
    
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
                button.textContent = 'Error - Try Again';
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
            'shortcuts-pdf': '/resources/cheatsheets/excel_keyboard_shortcuts.pdf',
            'formulas-pdf': '/resources/cheatsheets/excel_formula_reference.pdf',
            'chart-guide-pdf': '/resources/cheatsheets/chart_selection_guide.pdf',
            'functions-pdf': '/resources/cheatsheets/excel_functions_by_category.pdf'
        };
        
        const filePath = resourceMap[resourceId];
        
        if (!filePath) {
            reject(new Error('Resource not found'));
            return;
        }
        
        // In a real implementation, you would use fetch or other methods to download the file
        // For now, we're simulating a successful download
        try {
            // This is where you'd typically trigger the actual download
            // e.g., window.location.href = filePath;
            console.log(`Downloading resource: ${filePath}`);
            
            // Simulate successful download
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Display a notification when download completes
 * @param {string} message - The notification message
 */
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'download-notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 2000);
    }, 10);
}
