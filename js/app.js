/**
 * Main application module for Legal Pages Constructor
 * Initializes all modules and handles app lifecycle
 */

const App = {
    /**
     * Initialize application
     */
    init() {
        console.log('Legal Pages Constructor initializing...');
        
        // Initialize UI
        UI.init();
        
        // Initialize Editor
        Editor.init();
        
        // Check if settings exist
        this.checkFirstRun();
        
        // Load initial document
        UI.loadCurrentDocument();
        
        console.log('Legal Pages Constructor initialized successfully');
    },
    
    /**
     * Check if this is first run and show settings modal
     */
    checkFirstRun() {
        const settings = Storage.getSettings();
        if (!settings.full_name) {
            // Show settings modal on first run
            setTimeout(() => {
                UI.openSettingsModal();
            }, 500);
        }
    },
    
    /**
     * Handle window beforeunload event
     */
    handleBeforeUnload(e) {
        if (Editor.isDirty) {
            Editor.save();
        }
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Save on page unload
window.addEventListener('beforeunload', () => {
    App.handleBeforeUnload();
});
