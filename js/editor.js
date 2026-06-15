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
            // Migrate: in numbered paragraphs bold only the first line, rest is plain text
            const _tmp = document.createElement('div');
            _tmp.innerHTML = saved;
            _tmp.querySelectorAll('p').forEach(p => {
                // Case 1: entire paragraph is inside <strong> (old format)
                const s = p.querySelector(':scope > strong');
                if (s && p.children.length === 1 && /^\d[\d.]*\./.test(s.textContent.trim())) {
                    const parts = s.innerHTML.split(/<br\s*\/?>/i);
                    if (parts.length > 1) {
                        p.innerHTML = '<strong>' + parts[0].trim() + '</strong><br>\n' + parts.slice(1).join('<br>\n');
                    }
                    // single-line with full text bold → keep as is (already correct)
                }
                // Case 2: old <h3> converted to p without migration yet
                if (/^<h3>/i.test(p.outerHTML)) {
                    const txt = p.textContent.trim();
                    const lines = txt.split('\n');
                    p.outerHTML = '<p><strong>' + lines[0] + '</strong>' +
                        (lines.length > 1 ? '<br>\n' + lines.slice(1).join('<br>\n') : '') + '</p>';
                }
            });
            this.element.innerHTML = _tmp.innerHTML;
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
            const lines = trimmed.split('\n');
            // Numbered paragraph: first line bold (heading), rest plain text
            if (/^\d[\d.]*\./.test(trimmed) && lines.length > 0) {
                const heading = '<strong>' + lines[0] + '</strong>';
                if (lines.length === 1) {
                    return '<p>' + heading + '</p>';
                }
                const rest = lines.slice(1).join('<br>\n');
                return '<p>' + heading + '<br>\n' + rest + '</p>';
            }
            const formatted = trimmed.replace(/\n/g, '<br>\n');
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
