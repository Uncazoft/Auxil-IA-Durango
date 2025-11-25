// Medical Chat Application - Professional Version
class MedicalChatApp {
    constructor() {
        this.sessionId = null;
        this.isSessionActive = false;
        this.sessionStartTime = null;
        this.timerInterval = null;
        this.lastResponseTime = null;
        
        this.initializeApp();
    }

    initializeApp() {
        this.initializeElements();
        this.initializeEventListeners();
        this.initializeTheme();
        this.checkServerHealth();
        this.setWelcomeTime();
    }

    initializeElements() {
        // Core elements
        this.chatMessages = document.getElementById('chat-messages');
        this.messageInput = document.getElementById('message-input');
        this.sendButton = document.getElementById('send-button');
        this.messageForm = document.getElementById('message-form');
        
        // Buttons
        this.startSessionBtn = document.getElementById('start-session-btn');
        this.startBtn = document.getElementById('start-btn');
        this.endBtn = document.getElementById('end-btn');
        this.clearInputBtn = document.getElementById('clear-input');
        this.emergencyCallBtn = document.getElementById('emergency-call-btn');
        
        // Status elements
        this.connectionStatus = document.getElementById('connection-status');
        this.sessionStatus = document.getElementById('session-status');
        this.sessionTimer = document.getElementById('session-timer');
        this.sessionIdDisplay = document.getElementById('session-id-display');
        this.responseTimeValue = document.getElementById('response-time-value');
        this.charCount = document.getElementById('char-count');
        
        // Modals
        this.emergencyModal = document.getElementById('emergency-modal');
        this.endSessionModal = document.getElementById('end-session-modal');
        this.loadingOverlay = document.getElementById('loading-overlay');
        
        // Modal buttons
        this.confirmEndBtn = document.getElementById('confirm-end-btn');
        this.cancelEndBtn = document.getElementById('cancel-end-btn');
        this.closeEmergencyModal = document.getElementById('close-emergency-modal');
        this.closeEndModal = document.getElementById('close-end-modal');
        this.cancelEmergency = document.getElementById('cancel-emergency');
        
        // Theme
        this.themeToggle = document.getElementById('theme-toggle');
        
        // Quick action buttons
        this.quickActionButtons = document.querySelectorAll('.action-btn');
    }

    initializeEventListeners() {
        // Form submission
        this.messageForm.addEventListener('submit', (e) => this.handleMessageSubmit(e));
        
        // Session controls
        this.startSessionBtn.addEventListener('click', () => this.startMedicalSession());
        this.startBtn.addEventListener('click', () => this.startMedicalSession());
        this.endBtn.addEventListener('click', () => this.showEndSessionModal());
        this.emergencyCallBtn.addEventListener('click', () => this.showEmergencyModal());
        
        // Input handling
        this.messageInput.addEventListener('input', () => this.handleInputChange());
        this.messageInput.addEventListener('keydown', (e) => this.handleKeydown(e));
        this.clearInputBtn.addEventListener('click', () => this.clearInput());
        
        // Modal controls
        this.confirmEndBtn.addEventListener('click', () => this.endMedicalSession());
        this.cancelEndBtn.addEventListener('click', () => this.hideEndSessionModal());
        this.closeEmergencyModal.addEventListener('click', () => this.hideEmergencyModal());
        this.closeEndModal.addEventListener('click', () => this.hideEndSessionModal());
        this.cancelEmergency.addEventListener('click', () => this.hideEmergencyModal());
        
        // Theme toggle
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Quick actions
        this.quickActionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleQuickAction(e));
        });
        
        // Close modals on backdrop click
        [this.emergencyModal, this.endSessionModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    }

    initializeTheme() {
        const savedTheme = localStorage.getItem('medassist-theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('medassist-theme', newTheme);
        this.updateThemeIcon(newTheme);
    }

    updateThemeIcon(theme) {
        const icon = this.themeToggle.querySelector('i');
        icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }

    setWelcomeTime() {
        const welcomeTime = document.getElementById('welcome-time');
        welcomeTime.textContent = new Date().toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    handleInputChange() {
        const text = this.messageInput.value;
        this.charCount.textContent = text.length;
        
        // Auto-resize
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
        
        // Toggle send button
        this.sendButton.disabled = !text.trim() || !this.isSessionActive;
    }

    handleKeydown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.handleMessageSubmit(e);
        }
    }

    handleMessageSubmit(e) {
        e.preventDefault();
        
        const message = this.messageInput.value.trim();
        if (!message || !this.isSessionActive) return;
        
        this.sendMessage(message);
    }

    clearInput() {
        this.messageInput.value = '';
        this.handleInputChange();
        this.messageInput.focus();
    }

    async checkServerHealth() {
        try {
            this.showLoading('Verificando conexión con el servidor...');
            
            const response = await fetch('/api/health');
            const data = await response.json();
            
            this.updateConnectionStatus(data.success);
            
            if (data.success) {
                this.addSystemMessage('Sistema conectado correctamente. Puede iniciar una sesión médica.', 'success');
            } else {
                this.addSystemMessage('Error de conexión con el servidor. Verifique su conexión a internet.', 'error');
            }
        } catch (error) {
            console.error('Health check failed:', error);
            this.updateConnectionStatus(false);
            this.addSystemMessage('No se pudo conectar al servidor. Verifique su conexión.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    updateConnectionStatus(isConnected) {
        const dot = this.connectionStatus.querySelector('.status-dot');
        const text = this.connectionStatus.querySelector('.status-text');
        
        if (isConnected) {
            dot.classList.add('connected');
            text.textContent = 'Conectado';
        } else {
            dot.classList.remove('connected');
            text.textContent = 'Desconectado';
        }
    }

    updateSessionStatus(isActive) {
        const dot = this.sessionStatus.querySelector('.status-dot');
        const text = this.sessionStatus.querySelector('.status-text');
        
        if (isActive) {
            dot.classList.add('connected');
            text.textContent = 'Activa';
        } else {
            dot.classList.remove('connected');
            text.textContent = 'Inactiva';
        }
    }

    async startMedicalSession() {
        try {
            this.showLoading('Iniciando sesión médica...');
            
            const response = await fetch('/api/medical/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({})
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al iniciar sesión');
            }

            this.sessionId = data.sessionId;
            this.isSessionActive = true;
            this.sessionStartTime = new Date();
            
            this.updateSessionStatus(true);
            this.sessionIdDisplay.textContent = `ID: ${this.sessionId.substring(0, 8)}...`;
            
            // Enable interface
            this.messageInput.disabled = false;
            this.sendButton.disabled = true;
            this.endBtn.disabled = false;
            this.startSessionBtn.style.display = 'none';
            this.startBtn.style.display = 'none';
            
            this.startSessionTimer();
            
            this.addSystemMessage('Sesión médica iniciada. Por favor, describa la situación de emergencia.', 'success');
            
            // Focus input
            setTimeout(() => this.messageInput.focus(), 100);

        } catch (error) {
            console.error('Error starting session:', error);
            this.addSystemMessage(`Error: ${error.message}`, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async sendMessage(message) {
        const startTime = performance.now();
        
        try {
            // Clear input and disable temporarily
            this.messageInput.value = '';
            this.handleInputChange();
            this.sendButton.disabled = true;
            
            // Add user message to chat
            this.addUserMessage(message);
            
            const response = await fetch('/api/medical/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    message: message
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al procesar mensaje');
            }

            // Calculate response time
            const endTime = performance.now();
            const responseTime = Math.round(endTime - startTime);
            this.updateResponseTime(responseTime);

            // Add assistant response
            this.addAssistantMessage(data.response, data.shouldEndSession ? 'emergency' : '');

            if (data.shouldEndSession) {
                setTimeout(() => this.endMedicalSession(), 2000);
            }

        } catch (error) {
            console.error('Error sending message:', error);
            this.addSystemMessage(`Error: ${error.message}`, 'error');
        } finally {
            this.sendButton.disabled = false;
            this.messageInput.focus();
        }
    }

    updateResponseTime(time) {
        this.responseTimeValue.textContent = `${time} ms`;
        this.lastResponseTime = time;
    }

    handleQuickAction(e) {
        if (!this.isSessionActive) {
            this.addSystemMessage('Por favor, inicie una sesión médica primero.', 'warning');
            return;
        }

        const action = e.currentTarget.dataset.action;
        const messages = {
            breathing: "La persona está teniendo dificultad para respirar o no respira.",
            bleeding: "Hay sangrado severo que no para.",
            unconscious: "La persona está inconsciente o no responde.",
            pain: "Dolor intenso en el pecho, cabeza o abdomen."
        };

        if (messages[action]) {
            this.sendMessage(messages[action]);
        }
    }

    showEmergencyModal() {
        this.emergencyModal.classList.add('active');
    }

    hideEmergencyModal() {
        this.emergencyModal.classList.remove('active');
    }

    showEndSessionModal() {
        this.endSessionModal.classList.add('active');
    }

    hideEndSessionModal() {
        this.endSessionModal.classList.remove('active');
    }

    async endMedicalSession() {
        try {
            this.hideEndSessionModal();
            this.showLoading('Finalizando sesión...');

            const response = await fetch('/api/medical/end', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId: this.sessionId
                })
            });

            // Reset session state
            this.resetSession();
            this.addSystemMessage('Sesión médica finalizada. Si necesita más ayuda, inicie una nueva sesión.', 'info');

        } catch (error) {
            console.error('Error ending session:', error);
            this.addSystemMessage(`Error: ${error.message}`, 'error');
        } finally {
            this.hideLoading();
        }
    }

    resetSession() {
        this.isSessionActive = false;
        this.sessionId = null;
        this.sessionStartTime = null;
        
        this.updateSessionStatus(false);
        this.sessionIdDisplay.textContent = 'ID: No activa';
        
        // Restore interface
        this.messageInput.disabled = true;
        this.messageInput.value = '';
        this.sendButton.disabled = true;
        this.endBtn.disabled = true;
        this.startSessionBtn.style.display = 'block';
        this.startBtn.style.display = 'block';
        
        this.stopSessionTimer();
        this.sessionTimer.querySelector('span').textContent = '00:00';
        this.handleInputChange();
    }

    startSessionTimer() {
        this.stopSessionTimer();
        
        this.timerInterval = setInterval(() => {
            const now = new Date();
            const diff = Math.floor((now - this.sessionStartTime) / 1000);
            const minutes = Math.floor(diff / 60).toString().padStart(2, '0');
            const seconds = (diff % 60).toString().padStart(2, '0');
            
            this.sessionTimer.querySelector('span').textContent = `${minutes}:${seconds}`;
        }, 1000);
    }

    stopSessionTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    addSystemMessage(content, type = 'info') {
        this.addMessage(content, 'system', type);
    }

    addUserMessage(content) {
        this.addMessage(content, 'user');
    }

    addAssistantMessage(content, type = '') {
        this.addMessage(content, 'assistant', type);
    }

    addMessage(content, type, additionalType = '') {
        const messageDiv = document.createElement('div');
        
        const timestamp = new Date().toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        // CORRECCIÓN DEL ERROR: Eliminar espacios en las clases CSS
        let messageClass = type + '-message';
        if (additionalType) {
            messageClass += ' ' + additionalType.trim();
        }

        let senderName = 'Sistema MedAssist';
        let avatarIcon = 'fas fa-shield-heart';

        if (type === 'user') {
            senderName = 'Usted';
            avatarIcon = 'fas fa-user';
        } else if (type === 'assistant') {
            senderName = 'Asistente Médico';
            avatarIcon = 'fas fa-robot';
        }

        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="${avatarIcon}"></i>
            </div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-sender">${senderName}</span>
                    <span class="message-time">${timestamp}</span>
                </div>
                <div class="message-body">
                    ${this.formatMessageContent(content)}
                </div>
            </div>
        `;

        // CORRECCIÓN: Usar classList.add correctamente sin espacios
        messageDiv.className = 'message';
        messageDiv.classList.add(messageClass.split(' ')[0]); // Solo la clase principal
        if (messageClass.includes(' ')) {
            const additionalClasses = messageClass.split(' ').slice(1);
            additionalClasses.forEach(className => {
                if (className.trim()) {
                    messageDiv.classList.add(className.trim());
                }
            });
        }

        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        
        // Add subtle animation
        messageDiv.style.animation = 'messageSlideIn 0.3s ease-out';
    }

    formatMessageContent(content) {
        // Format content for better display
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>')
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    showLoading(message = 'Procesando...') {
        const spinnerText = this.loadingOverlay.querySelector('.spinner-text span');
        spinnerText.textContent = message;
        this.loadingOverlay.classList.add('active');
    }

    hideLoading() {
        this.loadingOverlay.classList.remove('active');
    }

    // Utility method for external calls (like emergency button)
    triggerEmergencyCall() {
        this.showEmergencyModal();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.medAssistApp = new MedicalChatApp();
});

// Global error handling
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

// Service Worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}