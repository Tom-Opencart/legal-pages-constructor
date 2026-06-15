/**
 * Editor module for Legal Pages Constructor
 * Handles rich text editing functionality
 */

const Editor = {
    editor: null,
    isDirty: false,
    
    /**
     * Initialize editor
     */
    init() {
        this.editor = document.getElementById('editor');
        this.setupEventListeners();
    },
    
    /**
     * Setup event listeners for editor
     */
    setupEventListeners() {
        // Input event for auto-save
        this.editor.addEventListener('input', () => {
            this.isDirty = true;
            this.autoSave();
        });
        
        // Keyboard shortcuts
        this.editor.addEventListener('keydown', (e) => {
            // Ctrl+S to save
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.save();
            }
            
            // Ctrl+B for bold
            if (e.ctrlKey && e.key === 'b') {
                e.preventDefault();
                document.execCommand('bold');
            }
            
            // Ctrl+I for italic
            if (e.ctrlKey && e.key === 'i') {
                e.preventDefault();
                document.execCommand('italic');
            }
        });
        
        // Prevent paste formatting issues
        this.editor.addEventListener('paste', (e) => {
            e.preventDefault();
            const text = (e.clipboardData || window.clipboardData).getData('text/plain');
            document.execCommand('insertText', false, text);
        });
    },
    
    /**
     * Auto-save with debounce
     */
    autoSave() {
        clearTimeout(this.autoSaveTimer);
        this.autoSaveTimer = setTimeout(() => {
            this.save();
        }, 1000);
    },
    
    /**
     * Save editor content
     */
    save() {
        if (!this.isDirty) return;
        
        const content = this.editor.innerHTML;
        Storage.saveDocument(UI.currentDoc, content);
        this.isDirty = false;
    },
    
    /**
     * Set editor content
     * @param {string} content - HTML content
     */
    setContent(content) {
        this.editor.innerHTML = content;
        this.isDirty = false;
    },
    
    /**
     * Get editor content
     * @returns {string} HTML content
     */
    getContent() {
        return this.editor.innerHTML;
    },
    
    /**
     * Clear editor content
     */
    clear() {
        this.editor.innerHTML = '';
        this.isDirty = true;
    },
    
    /**
     * Insert HTML at cursor position
     * @param {string} html - HTML to insert
     */
    insertHTML(html) {
        this.editor.focus();
        document.execCommand('insertHTML', false, html);
        this.isDirty = true;
    },
    
    /**
     * Execute document command
     * @param {string} command - Command name
     * @param {string} value - Command value (optional)
     */
    executeCommand(command, value = null) {
        this.editor.focus();
        document.execCommand(command, false, value);
        this.isDirty = true;
    }
};
