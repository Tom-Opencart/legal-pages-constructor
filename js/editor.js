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
        const saved = Storage.getDocument(docId);
        if (saved) {
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
        return text.split(/\n\n+/).map(paragraph => {
            const trimmed = paragraph.trim();
            if (/^\d+\./.test(trimmed)) {
                return '<h3>' + trimmed + '</h3>';
            }
            if (/^-\s/.test(trimmed)) {
                return '<p>' + trimmed + '</p>';
            }
            return '<p>' + trimmed + '</p>';
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

    getRenderedHtml() {
        const settings = Storage.getSettings();
        let content = this.getContent();
        content = content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return settings[key] !== undefined ? settings[key] : match;
        });
        content = content.replace(/\{%\s*if\s+(\w+)\s*%\}([\s\S]*?)\{%\s*endif\s*%\}/g, (match, key, inner) => {
            try {
                return new Function('settings', `return settings.${key} ? \`${inner}\` : ''`)(settings);
            } catch {
                return '';
            }
        });
        return content;
    }
};
