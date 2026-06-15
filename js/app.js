const App = {
    init() {
        UI.init();
        Editor.init();
        this.bindEvents();
        this.checkFirstVisit();
    },

    bindEvents() {
        document.getElementById('settingsBtn').addEventListener('click', () => {
            UI.modal.show('settingsModal');
            this.populateSettingsForm();
        });

        document.getElementById('settingsSave').addEventListener('click', () => {
            this.saveSettings();
        });

        document.getElementById('settingsClose').addEventListener('click', () => {
            UI.modal.hide('settingsModal');
        });

        document.getElementById('donateBtn').addEventListener('click', () => {
            UI.modal.show('donateModal');
        });

        document.getElementById('donateClose').addEventListener('click', () => {
            UI.modal.hide('donateModal');
        });

        document.getElementById('donateCloseBtn').addEventListener('click', () => {
            UI.modal.hide('donateModal');
        });

        document.getElementById('copyBtn').addEventListener('click', () => {
            this.copyHtml();
        });

        document.getElementById('helpBtn').addEventListener('click', () => {
            UI.toast.show('Справка: Редактируйте текст документов и нажмите "Копировать HTML" для вставки в OpenCart');
        });
    },

    checkFirstVisit() {
        const settings = Storage.getSettings();
        if (!settings.full_name) {
            UI.modal.show('settingsModal');
        }
    },

    populateSettingsForm() {
        const settings = Storage.getSettings();
        const form = document.getElementById('settingsForm');
        for (const key in settings) {
            const input = form.querySelector(`input[name="${key}"]`);
            if (input) {
                input.value = settings[key];
            }
        }
    },

    saveSettings() {
        const form = document.getElementById('settingsForm');
        const formData = new FormData(form);
        const settings = Object.fromEntries(formData.entries());
        Storage.saveSettings(settings);
        UI.modal.hide('settingsModal');
        Editor.loadDocument(UI.tabs.currentTab);
        UI.toast.show('Настройки сохранены');
    },

    async copyHtml() {
        const html = Editor.getRenderedHtml();
        try {
            await navigator.clipboard.writeText(html);
            UI.toast.show('HTML скопирован в буфер обмена');
        } catch {
            try {
                const textarea = document.createElement('textarea');
                textarea.value = html;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                UI.toast.show('HTML скопирован в буфер обмена');
            } catch {
                UI.toast.show('Ошибка копирования');
            }
        }
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
