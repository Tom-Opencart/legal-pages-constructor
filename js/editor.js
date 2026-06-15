const Editor = {
    element: null,
    currentDoc: null,

    init() {
        this.element = document.getElementById('editor');
        this.loadDocument('offer');
        this.element.addEventListener('input', () => this.autoSave());
        this.element.addEventListener('keydown', (e) => this.handleKeyboard(e));
    },

    loadDocument(docId) {
        const doc = Documents.get(docId);
        this.currentDoc = docId;
        let saved = Storage.getDocument(docId);
        if (saved) {
            // Migrate old h3/p+strong headers: wrap only numeric prefix in strong
            saved = saved
                .replace(/<h3>(<strong>)?(\d[\d.]*\.)<\/strong>([^<]*)<\/h3>/g, '<p><strong>$2</strong>$3</p>')
                .replace(/<h3>(\d[\d.]*\.)([^<]*)<\/h3>/g, '<p><strong>$1</strong>$2</p>')
                .replace(/<p><strong>(\d[\d.]*\.)([^<]+)<\/strong><\/p>/g, '<p><strong>$1</strong>$2</p>');
            this.element.innerHTML = saved;
        } else {
            const settings = Storage.getSettings();
            const rendered = Documents.render(docId, settings);
            this.element.innerHTML = this.textToHtml(rendered);
        }
        if (UI.tabs) {
            UI.tabs.currentTab = docId;
        }
    },


    textToHtml(text) {
        if (!text) return '';
        return text.split(/\n\n+/).map(paragraph => {
            const trimmed = paragraph.trim();
            const formatted = trimmed.replace(/\n/g, '<br>\n');
            // Wrap only the numeric prefix ("1.", "2.3." etc.) in strong
            if (/^\d+\./.test(trimmed)) {
                const withBoldNum = formatted.replace(/^(\d[\d.]*\.)/, '<strong>$1</strong>');
                return '<p>' + withBoldNum + '</p>';
            }
            return '<p>' + formatted + '</p>';
        }).join('\n');
    },

    autoSave() {
        if (this.currentDoc && this.element) {
            Storage.saveDocument(this.currentDoc, this.element.innerHTML);
        }
    },

    getContent() {
        return this.element ? this.element.innerHTML : '';
    },

    setContent(html) {
        this.element.innerHTML = html;
    },

    handleKeyboard(e) {
        if (e.ctrlKey && e.key === 'b') {
            e.preventDefault();
            document.execCommand('bold');
        }
        if (e.ctrlKey && e.key === 'i') {
            e.preventDefault();
            document.execCommand('italic');
        }
        if (e.ctrlKey && e.key === 'u') {
            e.preventDefault();
            document.execCommand('underline');
        }
    },

    updateSettingsInEditor(settings) {
        if (!this.element) return;
        
        // Find simple placeholders
        const placeholders = this.element.querySelectorAll('span.placeholder[data-placeholder]');
        placeholders.forEach(span => {
            const key = span.getAttribute('data-placeholder');
            const value = (settings[key] !== undefined && settings[key] !== '') 
                ? settings[key] 
                : Documents.getPlaceholderLabel(key);
            if (span.textContent !== value) {
                span.textContent = value;
            }
        });

        // Find expression placeholders
        const exprPlaceholders = this.element.querySelectorAll('span.placeholder[data-expr]');
        exprPlaceholders.forEach(span => {
            const expr = span.getAttribute('data-expr');
            const val = Documents.evaluateExpression(expr, settings);
            if (span.textContent !== val) {
                span.textContent = val;
            }
        });
        
        this.autoSave();
    },

    getRenderedHtml() {
        const temp = document.createElement('div');
        temp.innerHTML = this.getContent();

        // Replace all span.placeholder elements with their text contents
        const spans = temp.querySelectorAll('span.placeholder');
        spans.forEach(span => {
            const textNode = document.createTextNode(span.textContent);
            span.parentNode.replaceChild(textNode, span);
        });

        return temp.innerHTML;
    }
};
