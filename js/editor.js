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
            // Migrate saved content: remove wrongly applied <h3> and <strong> from sub-items
            const _tmp = document.createElement('div');
            _tmp.innerHTML = saved;
            // Convert any remaining <h3> to plain <p>
            _tmp.querySelectorAll('h3').forEach(h3 => {
                const p = document.createElement('p');
                p.innerHTML = h3.innerHTML;
                h3.parentNode.replaceChild(p, h3);
            });
            // Remove <strong> wrapping from sub-item paragraphs (N.N. pattern)
            _tmp.querySelectorAll('p').forEach(p => {
                const s = p.querySelector(':scope > strong');
                if (!s) return;
                const txt = s.textContent.trim();
                // Only sub-items (1.1., 2.3. etc.) should lose their strong wrap
                if (/^\d+\.\d/.test(txt)) {
                    p.innerHTML = s.innerHTML.replace(/<br\s*\/?>/gi, '<br>');
                }
                // Multi-line strong: pull first line into strong, rest plain
                if (/^\d+\.\s/.test(txt) && !/^\d+\.\d/.test(txt)) {
                    const parts = s.innerHTML.split(/<br\s*\/?>/i);
                    if (parts.length > 1) {
                        p.innerHTML = '<strong>' + parts[0].trim() + '</strong><br>\n' +
                            parts.slice(1).join('<br>\n');
                    }
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
            const firstLine = lines[0];

            // Top-level section header only: "N. Title" — digit(s) + dot + space, no sub-number
            // e.g. "1. Термины и определения"  →  bold
            // "1.1. Публичная оферта..."       →  plain paragraph
            const isSectionHeader = /^\d+\.\s/.test(firstLine) && !/^\d+\.\d/.test(firstLine);

            if (isSectionHeader) {
                const heading = '<strong>' + firstLine + '</strong>';
                if (lines.length === 1) {
                    return '<p>' + heading + '</p>';
                }
                const rest = lines.slice(1).join('<br>\n');
                return '<p>' + heading + '<br>\n' + rest + '</p>';
            }

            // Everything else — plain paragraph
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

document.addEventListener('DOMContentLoaded', () => App.init());
