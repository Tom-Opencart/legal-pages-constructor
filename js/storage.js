/**
 * Storage module for Legal Pages Constructor
 * Handles local storage operations for settings and documents
 */

const Storage = {
    SETTINGS_KEY: 'legal_pages_settings',
    DOCUMENTS_KEY: 'legal_pages_documents',
    
    /**
     * Get settings from local storage
     * @returns {Object} Settings object
     */
    getSettings() {
        const settings = localStorage.getItem(this.SETTINGS_KEY);
        return settings ? JSON.parse(settings) : {};
    },
    
    /**
     * Save settings to local storage
     * @param {Object} settings - Settings object to save
     */
    saveSettings(settings) {
        localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    },
    
    /**
     * Get document content from local storage
     * @param {string} docId - Document identifier
     * @returns {string} Document content
     */
    getDocument(docId) {
        const documents = this.getAllDocuments();
        return documents[docId] || '';
    },
    
    /**
     * Save document content to local storage
     * @param {string} docId - Document identifier
     * @param {string} content - Document content
     */
    saveDocument(docId, content) {
        const documents = this.getAllDocuments();
        documents[docId] = content;
        localStorage.setItem(this.DOCUMENTS_KEY, JSON.stringify(documents));
    },
    
    /**
     * Get all documents from local storage
     * @returns {Object} All documents
     */
    getAllDocuments() {
        const documents = localStorage.getItem(this.DOCUMENTS_KEY);
        return documents ? JSON.parse(documents) : {};
    },
    
    /**
     * Clear all data from local storage
     */
    clearAll() {
        localStorage.removeItem(this.SETTINGS_KEY);
        localStorage.removeItem(this.DOCUMENTS_KEY);
    }
};
