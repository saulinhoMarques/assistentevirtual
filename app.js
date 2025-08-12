// Enhanced JARVIS Virtual Assistant
class JarvisAssistant {
    constructor() {
        this.isListening = false;
        this.commandHistory = JSON.parse(localStorage.getItem('jarvis-history') || '[]');
        this.currentTheme = localStorage.getItem('jarvis-theme') || 'dark';
        this.init();
    }

    init() {
        this.setupElements();
        this.setupEventListeners();
        this.setupSpeechRecognition();
        this.loadTheme();
        this.loadHistory();
        this.updateStatus('online');
        this.greetUser();
    }

    setupElements() {
        this.elements = {
            voiceBtn: document.getElementById('voiceBtn'),
            voiceContent: document.getElementById('voiceContent'),
            searchInput: document.getElementById('searchInput'),
            searchBtn: document.getElementById('searchBtn'),
            themeBtn: document.getElementById('themeBtn'),
            statusDot: document.getElementById('statusDot'),
            statusText: document.getElementById('statusText'),
            historyList: document.getElementById('historyList'),
            clearHistory: document.getElementById('clearHistory'),
            loadingOverlay: document.getElementById('loadingOverlay'),
            avatar: document.getElementById('avatar')
        };
    }

    setupEventListeners() {
        // Voice button
        this.elements.voiceBtn.addEventListener('click', () => this.toggleVoiceRecognition());
        
        // Search functionality
        this.elements.searchBtn.addEventListener('click', () => this.handleSearch());
        this.elements.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });
        
        // Theme toggle
        this.elements.themeBtn.addEventListener('click', () => this.toggleTheme());
        
        // Quick action buttons
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.executeQuickAction(action);
            });
        });
        
        // Clear history
        this.elements.clearHistory.addEventListener('click', () => this.clearCommandHistory());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === ' ') {
                e.preventDefault();
                this.toggleVoiceRecognition();
            }
            if (e.ctrlKey && e.key === '/') {
                e.preventDefault();
                this.elements.searchInput.focus();
            }
        });
    }

    setupSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'pt-BR';
            
            this.recognition.onstart = () => {
                this.isListening = true;
                this.elements.voiceBtn.classList.add('listening');
                this.elements.voiceContent.textContent = 'Ouvindo...';
                this.updateStatus('listening');
            };
            
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.elements.voiceContent.textContent = transcript;
                this.processCommand(transcript.toLowerCase());
            };
            
            this.recognition.onend = () => {
                this.isListening = false;
                this.elements.voiceBtn.classList.remove('listening');
                this.updateStatus('online');
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.isListening = false;
                this.elements.voiceBtn.classList.remove('listening');
                this.elements.voiceContent.textContent = 'Erro no reconhecimento de voz';
                this.updateStatus('error');
                setTimeout(() => this.updateStatus('online'), 3000);
            };
        } else {
            console.warn('Speech recognition not supported');
            this.elements.voiceContent.textContent = 'Reconhecimento de voz não suportado neste navegador';
        }
    }

    toggleVoiceRecognition() {
        if (!this.recognition) {
            this.speak('Reconhecimento de voz não está disponível neste navegador.');
            return;
        }

        if (this.isListening) {
            this.recognition.stop();
        } else {
            this.recognition.start();
        }
    }

    handleSearch() {
        const query = this.elements.searchInput.value.trim();
        if (query) {
            this.processCommand(query.toLowerCase());
            this.elements.searchInput.value = '';
        }
    }

    processCommand(command) {
        this.showLoading();
        this.addToHistory(command);
        
        // Simulate processing delay
        setTimeout(() => {
            this.executeCommand(command);
            this.hideLoading();
        }, 500);
    }

    executeCommand(message) {
        const sites = {
            'youtube': 'https://youtube.com',
            'google': 'https://google.com',
            'facebook': 'https://facebook.com',
            'instagram': 'https://instagram.com',
            'twitter': 'https://twitter.com',
            'x': 'https://x.com',
            'netflix': 'https://netflix.com',
            'spotify': 'https://spotify.com',
            'github': 'https://github.com',
            'linkedin': 'https://linkedin.com',
            'whatsapp': 'https://web.whatsapp.com',
            'gmail': 'https://gmail.com',
            'amazon': 'https://amazon.com.br',
            'mercado livre': 'https://mercadolivre.com.br',
            'globo': 'https://globo.com',
            'uol': 'https://uol.com.br',
            'g1': 'https://g1.globo.com',
            'reddit': 'https://reddit.com',
            'discord': 'https://discord.com',
            'twitch': 'https://twitch.tv'
        };

        // Greeting responses
        if (message.includes('olá') || message.includes('oi') || message.includes('hello') || message.includes('hey')) {
            this.speak("Olá! Como posso ajudá-lo hoje?");
            this.elements.voiceContent.textContent = "Olá! Como posso ajudá-lo hoje?";
        }
        
        // Site opening commands
        else if (message.includes('abrir') || message.includes('abre') || message.includes('ir para')) {
            let siteFound = false;
            for (const [site, url] of Object.entries(sites)) {
                if (message.includes(site)) {
                    window.open(url, "_blank");
                    this.speak(`Abrindo ${site}...`);
                    this.elements.voiceContent.textContent = `Abrindo ${site}...`;
                    siteFound = true;
                    break;
                }
            }
            if (!siteFound) {
                // Try to extract site name and search
                const siteMatch = message.match(/abrir?\s+(.+)/);
                if (siteMatch) {
                    const siteName = siteMatch[1].trim();
                    window.open(`https://www.google.com/search?q=${encodeURIComponent(siteName)}`, "_blank");
                    this.speak(`Procurando por ${siteName}...`);
                    this.elements.voiceContent.textContent = `Procurando por ${siteName}...`;
                }
            }
        }
        
        // Direct site commands
        else if (sites[message]) {
            window.open(sites[message], "_blank");
            this.speak(`Abrindo ${message}...`);
            this.elements.voiceContent.textContent = `Abrindo ${message}...`;
        }
        
        // Search commands
        else if (message.includes('pesquisar') || message.includes('procurar') || message.includes('buscar')) {
            const searchTerm = message.replace(/pesquisar|procurar|buscar/g, '').trim();
            if (searchTerm) {
                window.open(`https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`, "_blank");
                this.speak(`Pesquisando por ${searchTerm}...`);
                this.elements.voiceContent.textContent = `Pesquisando por ${searchTerm}...`;
            }
        }
        
        // Question commands
        else if (message.includes('o que é') || message.includes('quem é') || message.includes('o que são') || message.includes('como')) {
            window.open(`https://www.google.com/search?q=${encodeURIComponent(message)}`, "_blank");
            this.speak("Procurando informações sobre sua pergunta...");
            this.elements.voiceContent.textContent = "Procurando informações sobre sua pergunta...";
        }
        
        // Wikipedia
        else if (message.includes('wikipedia')) {
            const topic = message.replace('wikipedia', '').trim();
            if (topic) {
                window.open(`https://pt.wikipedia.org/wiki/${encodeURIComponent(topic)}`, "_blank");
                this.speak(`Abrindo Wikipedia sobre ${topic}...`);
                this.elements.voiceContent.textContent = `Abrindo Wikipedia sobre ${topic}...`;
            }
        }
        
        // Time
        else if (message.includes('hora') || message.includes('horas')) {
            const time = new Date().toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            this.speak(`Agora são ${time}`);
            this.elements.voiceContent.textContent = `Agora são ${time}`;
        }
        
        // Date
        else if (message.includes('data') || message.includes('dia')) {
            const date = new Date().toLocaleDateString('pt-BR', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            this.speak(`Hoje é ${date}`);
            this.elements.voiceContent.textContent = `Hoje é ${date}`;
        }
        
        // Calculator
        else if (message.includes('calculadora')) {
            // Try to open system calculator or fallback to Google calculator
            try {
                window.open('calculator://');
            } catch (e) {
                window.open('https://www.google.com/search?q=calculator', "_blank");
            }
            this.speak("Abrindo calculadora...");
            this.elements.voiceContent.textContent = "Abrindo calculadora...";
        }
        
        // Music
        else if (message.includes('música') || message.includes('tocar') || message.includes('som')) {
            window.open('https://spotify.com', "_blank");
            this.speak("Abrindo Spotify para você ouvir música...");
            this.elements.voiceContent.textContent = "Abrindo Spotify para você ouvir música...";
        }
        
        // Weather
        else if (message.includes('tempo') || message.includes('clima')) {
            window.open('https://www.google.com/search?q=previsão+do+tempo', "_blank");
            this.speak("Verificando a previsão do tempo...");
            this.elements.voiceContent.textContent = "Verificando a previsão do tempo...";
        }
        
        // News
        else if (message.includes('notícias') || message.includes('news')) {
            window.open('https://g1.globo.com', "_blank");
            this.speak("Abrindo as últimas notícias...");
            this.elements.voiceContent.textContent = "Abrindo as últimas notícias...";
        }
        
        // Theme toggle
        else if (message.includes('tema') || message.includes('escuro') || message.includes('claro')) {
            this.toggleTheme();
            this.speak("Alternando tema da interface...");
            this.elements.voiceContent.textContent = "Alternando tema da interface...";
        }
        
        // Help
        else if (message.includes('ajuda') || message.includes('help') || message.includes('comandos')) {
            this.speak("Posso abrir sites, pesquisar informações, mostrar hora e data, e muito mais. Experimente dizer 'abrir YouTube' ou 'que horas são'.");
            this.elements.voiceContent.textContent = "Mostrando comandos disponíveis...";
        }
        
        // Default: Google search
        else {
            window.open(`https://www.google.com/search?q=${encodeURIComponent(message)}`, "_blank");
            this.speak(`Pesquisando por ${message} no Google...`);
            this.elements.voiceContent.textContent = `Pesquisando por "${message}"...`;
        }
    }

    executeQuickAction(action) {
        const actionMap = {
            'youtube': 'abrir youtube',
            'google': 'abrir google',
            'facebook': 'abrir facebook',
            'instagram': 'abrir instagram',
            'twitter': 'abrir twitter',
            'netflix': 'abrir netflix',
            'spotify': 'tocar música',
            'github': 'abrir github'
        };
        
        if (actionMap[action]) {
            this.processCommand(actionMap[action]);
        }
    }

    speak(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'pt-BR';
            utterance.rate = 1;
            utterance.volume = 0.8;
            utterance.pitch = 1;
            
            // Try to use a Portuguese voice if available
            const voices = speechSynthesis.getVoices();
            const portugueseVoice = voices.find(voice => 
                voice.lang.includes('pt') || voice.lang.includes('BR')
            );
            if (portugueseVoice) {
                utterance.voice = portugueseVoice;
            }
            
            speechSynthesis.speak(utterance);
        }
    }

    greetUser() {
        const hour = new Date().getHours();
        let greeting;
        
        if (hour >= 5 && hour < 12) {
            greeting = "Bom dia! JARVIS inicializado e pronto para ajudar.";
        } else if (hour >= 12 && hour < 18) {
            greeting = "Boa tarde! JARVIS está online e funcionando.";
        } else {
            greeting = "Boa noite! JARVIS ativado e aguardando comandos.";
        }
        
        setTimeout(() => {
            this.speak(greeting);
            this.elements.voiceContent.textContent = greeting;
        }, 1000);
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.loadTheme();
        localStorage.setItem('jarvis-theme', this.currentTheme);
    }

    loadTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        const icon = this.elements.themeBtn.querySelector('i');
        icon.className = this.currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    updateStatus(status) {
        const statusMap = {
            'online': { text: 'Online', class: 'online' },
            'listening': { text: 'Ouvindo', class: 'listening' },
            'processing': { text: 'Processando', class: 'processing' },
            'error': { text: 'Erro', class: 'error' }
        };
        
        const statusInfo = statusMap[status] || statusMap['online'];
        this.elements.statusText.textContent = statusInfo.text;
        this.elements.statusDot.className = `status-dot ${statusInfo.class}`;
    }

    addToHistory(command) {
        const timestamp = new Date().toLocaleString('pt-BR');
        const historyItem = { command, timestamp };
        
        this.commandHistory.unshift(historyItem);
        if (this.commandHistory.length > 50) {
            this.commandHistory = this.commandHistory.slice(0, 50);
        }
        
        localStorage.setItem('jarvis-history', JSON.stringify(this.commandHistory));
        this.loadHistory();
    }

    loadHistory() {
        const historyList = this.elements.historyList;
        
        if (this.commandHistory.length === 0) {
            historyList.innerHTML = '<p class="no-history">Nenhum comando executado ainda</p>';
            return;
        }
        
        historyList.innerHTML = this.commandHistory
            .slice(0, 10) // Show only last 10 commands
            .map(item => `
                <div class="history-item">
                    <span>"${item.command}"</span>
                    <small>${item.timestamp}</small>
                </div>
            `).join('');
    }

    clearCommandHistory() {
        this.commandHistory = [];
        localStorage.removeItem('jarvis-history');
        this.loadHistory();
        this.speak("Histórico de comandos limpo.");
    }

    showLoading() {
        this.elements.loadingOverlay.classList.add('show');
    }

    hideLoading() {
        this.elements.loadingOverlay.classList.remove('show');
    }
}

// Initialize JARVIS when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.jarvis = new JarvisAssistant();
});

// Handle speech synthesis voices loading
if ('speechSynthesis' in window) {
    speechSynthesis.addEventListener('voiceschanged', () => {
        // Voices are now loaded
    });
}