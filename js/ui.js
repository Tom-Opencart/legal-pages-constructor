/**
 * UI module for Legal Pages Constructor
 * Handles user interface interactions and state
 */

const UI = {
    elements: {},
    currentDoc: 'offer',
    
    /**
     * Initialize UI elements
     */
    init() {
        this.elements = {
            settingsBtn: document.getElementById('settingsBtn'),
            helpBtn: document.getElementById('helpBtn'),
            copyBtn: document.getElementById('copyBtn'),
            donateBtn: document.getElementById('donateBtn'),
            settingsSave: document.getElementById('settingsSave'),
            settingsModal: document.getElementById('settingsModal'),
            donateModal: document.getElementById('donateModal'),
            editorTitle: document.getElementById('editorTitle'),
            editor: document.getElementById('editor'),
            toast: document.getElementById('toast'),
            toastText: document.getElementById('toastText'),
            docTabs: document.querySelectorAll('.sidebar__tab'),
            settingsForm: document.getElementById('settingsForm')
        };
        
        this.bindEvents();
    },
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        // Settings modal
        this.elements.settingsBtn.addEventListener('click', () => this.openSettingsModal());
        this.elements.settingsSave.addEventListener('click', () => this.saveSettings());
        
        // Close modals
        document.querySelectorAll('.modal__close').forEach(btn => {
            btn.addEventListener('click', (e) => this.closeModal(e.target.closest('.modal')));
        });
        
        document.querySelectorAll('.modal__overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => this.closeModal(e.target.closest('.modal')));
        });
        
        // Donate modal
        this.elements.donateBtn.addEventListener('click', () => this.openDonateModal());
        document.querySelector('.donate-close').addEventListener('click', () => this.closeModal(this.elements.donateModal));
        
        // Copy button
        this.elements.copyBtn.addEventListener('click', () => this.copyToClipboard());
        
        // Document tabs
        this.elements.docTabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchDocument(tab.dataset.doc));
        });
        
        // Help button
        this.elements.helpBtn.addEventListener('click', () => this.showHelp());
    },
    
    /**
     * Open settings modal
     */
    openSettingsModal() {
        const settings = Storage.getSettings();
        this.fillSettingsForm(settings);
        this.elements.settingsModal.classList.add('active');
    },
    
    /**
     * Open donate modal
     */
    openDonateModal() {
        this.elements.donateModal.classList.add('active');
    },
    
    /**
     * Close modal
     * @param {HTMLElement} modal - Modal element to close
     */
    closeModal(modal) {
        modal.classList.remove('active');
    },
    
    /**
     * Fill settings form with data
     * @param {Object} settings - Settings object
     */
    fillSettingsForm(settings) {
        const form = this.elements.settingsForm;
        for (const [key, value] of Object.entries(settings)) {
            const field = form.querySelector(`[name="${key}"]`);
            if (field) {
                field.value = value;
            }
        }
    },
    
    /**
     * Save settings from form
     */
    saveSettings() {
        const form = this.elements.settingsForm;
        const formData = new FormData(form);
        const settings = {};
        
        for (const [key, value] of formData.entries()) {
            settings[key] = value;
        }
        
        Storage.saveSettings(settings);
        this.closeModal(this.elements.settingsModal);
        this.showToast('Настройки сохранены');
        
        // Refresh current document with new settings
        this.loadCurrentDocument();
    },
    
    /**
     * Switch to different document
     * @param {string} docId - Document identifier
     */
    switchDocument(docId) {
        // Save current document content
        this.saveCurrentDocument();
        
        // Update active tab
        this.elements.docTabs.forEach(tab => {
            tab.classList.toggle('sidebar__tab--active', tab.dataset.doc === docId);
        });
        
        // Update current document
        this.currentDoc = docId;
        
        // Load new document
        this.loadCurrentDocument();
    },
    
    /**
     * Load current document into editor
     */
    loadCurrentDocument() {
        const template = Documents.getTemplate(this.currentDoc);
        if (!template) return;
        
        // Update title
        this.elements.editorTitle.textContent = template.title;
        
        // Get saved content or generate from template
        let content = Storage.getDocument(this.currentDoc);
        if (!content) {
            const settings = Storage.getSettings();
            content = Documents.generateDocument(this.currentDoc, settings);
            Storage.saveDocument(this.currentDoc, content);
        }
        
        // Set editor content
        this.elements.editor.innerHTML = content;
    },
    
    /**
     * Save current document content
     */
    saveCurrentDocument() {
        const content = this.elements.editor.innerHTML;
        Storage.saveDocument(this.currentDoc, content);
    },
    
    /**
     * Copy editor content to clipboard
     */
    async copyToClipboard() {
        try {
            const content = this.elements.editor.innerHTML;
            await navigator.clipboard.writeText(content);
            this.showToast('HTML скопирован в буфер обмена');
        } catch (err) {
            console.error('Failed to copy:', err);
            this.showToast('Ошибка при копировании');
        }
    },
    
    /**
     * Show toast notification
     * @param {string} message - Message to display
     */
    showToast(message) {
        this.elements.toastText.textContent = message;
        this.elements.toast.classList.add('show');
        
        setTimeout(() => {
            this.elements.toast.classList.remove('show');
        }, 3000);
    },
    
    /**
     * Show help information
     */
    showHelp() {
        this.showToast('Используйте боковое меню для выбора документа и настройки магазина');
    }
};
