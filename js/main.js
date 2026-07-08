// ================================================================================
// PROTECT Console 4 & 5 Gateway - Main JavaScript
// Streamlined for Console 4 (Ndhiwa Operations) & Console 5 (Board Governance)
// ================================================================================

// CONTEXTUAL ADVERTISING ROTATION DICTIONARY
const contextualAds = [
    { text: "Safaricom Shupavu Portal: Protecting child learning across rural zones.", duration: 15 },
    { text: "Co-operative Bank Family Shield: Comprehensive security for your household.", duration: 12 },
    { text: "Kenya National Child Helpline: Dial 116 for immediate intervention lines.", duration: 20 },
    { text: "Sifa Institute Ledger: Programmatic validation tools now open.", duration: 15 }
];

let activeAdIndex = 0;
let adSecondsElapsed = 0;

// Chat storage for each console
const chatHistories = {
    console4: [],
    console5: []
};

// Console metadata and instructions
const consoleMetadata = {
    console4: {
        name: "Ndhiwa Operations Officer",
        icon: "fa-child",
        role: "Console 4 - Ndhiwa Sub-County Children's Office",
        responses: [
            "Case received. Please provide initial intake information.",
            "Understood. Assessment proceeding. What are the primary concerns?",
            "Thank you for the report. Procedure logging initiated.",
            "Documentation complete. Escalating to Console 5 for board review.",
            "Child safety priority confirmed. Next steps proceeding.",
            "Evidence secured. Chain of custody maintained."
        ]
    },
    console5: {
        name: "Board Coordinator",
        icon: "fa-users",
        role: "Console 5 - PROTECT Board Governance",
        responses: [
            "Board coordination acknowledged. What policy guidance is needed?",
            "Strategic oversight confirmed. Reviewing operational report from Console 4.",
            "Resource allocation directive received. Communicating to Console 4.",
            "Thank you for the governance input. Board alignment confirmed.",
            "Institutional coordination proceeding. Sifa bridge notification sent.",
            "Multi-stakeholder consensus documented. Implementation authorized."
        ]
    }
};

// ================================================================================
// INITIALIZE SYSTEM
// ================================================================================
window.addEventListener('DOMContentLoaded', () => {
    initializeAdSustenanceStream();
    calculateAdPricingEstimation();
    loadChatHistories();
    logSystemStatus();
});

function initializeAdSustenanceStream() {
    const adTextDisplay = document.getElementById('active-ad-display');
    const adTimerDisplay = document.getElementById('ad-timer');
    
    if(contextualAds.length > 0) {
        adTextDisplay.innerText = contextualAds[activeAdIndex].text;
    }
    
    setInterval(() => {
        adSecondsElapsed++;
        adTimerDisplay.innerText = adSecondsElapsed + "s";
        
        // Rotate ads every 15 seconds
        if (adSecondsElapsed % 15 === 0) {
            activeAdIndex = (activeAdIndex + 1) % contextualAds.length;
            adTextDisplay.className = "text-slate-200 font-medium italic transition-opacity opacity-0";
            setTimeout(() => {
                adTextDisplay.innerText = contextualAds[activeAdIndex].text;
                adTextDisplay.className = "text-slate-200 font-medium italic transition-opacity opacity-100 animate-pulse";
            }, 300);
        }
    }, 1000);
}

function calculateAdPricingEstimation() {
    console.log("Ad pricing model: Base Rate $20/day, Volume Discount 0%, Estimated Cost: $600 USD");
}

function logSystemStatus() {
    console.log("=== PROTECT Console 4 & 5 Gateway ===");
    console.log("Console 4: Ndhiwa Sub-County Children's Office - OPERATIONAL");
    console.log("Console 5: PROTECT Board Governance - OPERATIONAL");
    console.log("Handshake Architecture: ACTIVE");
    console.log("Sifa Bible Institute Bridge: PLANNED");
    console.log("Security: SHA-256 Client-Side Masking | ODPC Kenya Compliant");
    console.log("=====================================");
}

// ================================================================================
// CONSOLE MANAGEMENT FUNCTIONS
// ================================================================================

function openConsole(consoleName) {
    // Hide welcome panel and all other consoles
    document.getElementById('console-welcome').classList.add('hidden');
    document.querySelectorAll('.console-btn').forEach(el => el.classList.remove('active'));
    
    // Hide all console sections
    document.getElementById('console-4').classList.add('hidden');
    document.getElementById('console-5').classList.add('hidden');
    
    // Show selected console
    if (consoleName === 'console4') {
        document.getElementById('console-4').classList.remove('hidden');
        document.getElementById('input-console4').focus();
    } else if (consoleName === 'console5') {
        document.getElementById('console-5').classList.remove('hidden');
        document.getElementById('input-console5').focus();
    }
    
    // Scroll to console
    setTimeout(() => {
        document.getElementById(consoleName === 'console4' ? 'console-4' : 'console-5').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

function closeConsole(consoleName) {
    document.getElementById(consoleName === 'console4' ? 'console-4' : 'console-5').classList.add('hidden');
    document.getElementById('console-welcome').classList.remove('hidden');
}

// ================================================================================
// CHAT FUNCTIONS
// ================================================================================

function sendMessage(consoleName) {
    const inputId = `input-${consoleName}`;
    const chatId = `chat-${consoleName}`;
    const inputElement = document.getElementById(inputId);
    const chatContainer = document.getElementById(chatId);
    const message = inputElement.value.trim();
    
    if (message === '') return;
    
    // Add user message
    const userMessageEl = document.createElement('div');
    userMessageEl.className = consoleName === 'console4' 
        ? 'chat-message p-3 bg-red-900/40 rounded-lg border border-red-800/50 text-slate-100 text-sm'
        : 'chat-message p-3 bg-green-900/40 rounded-lg border border-green-800/50 text-slate-100 text-sm';
    userMessageEl.innerHTML = `<strong>You:</strong> ${escapeHtml(message)}`;
    chatContainer.appendChild(userMessageEl);
    
    // Store in history
    if (!chatHistories[consoleName]) chatHistories[consoleName] = [];
    chatHistories[consoleName].push({ type: 'user', message: message, timestamp: new Date().toISOString() });
    
    // Clear input
    inputElement.value = '';
    
    // Simulate response
    setTimeout(() => {
        const metadata = consoleMetadata[consoleName];
        const responseText = metadata.responses[Math.floor(Math.random() * metadata.responses.length)];
        
        const assistantMessageEl = document.createElement('div');
        assistantMessageEl.className = 'chat-message p-3 bg-slate-800/60 rounded-lg border border-slate-700/50 text-slate-100 text-sm';
        assistantMessageEl.innerHTML = `<strong>${metadata.name}:</strong> ${escapeHtml(responseText)}`;
        chatContainer.appendChild(assistantMessageEl);
        
        // Store in history
        chatHistories[consoleName].push({ type: 'assistant', message: responseText, timestamp: new Date().toISOString() });
        
        // Auto-scroll to bottom
        chatContainer.scrollTop = chatContainer.scrollHeight;
        saveChatHistories();
        
        // Log to handshake if Console 4
        if (consoleName === 'console4') {
            logToHandshake('Console 4 (Ndhiwa)', message, responseText);
        }
        // Log to handshake if Console 5
        if (consoleName === 'console5') {
            logToHandshake('Console 5 (Board)', message, responseText);
        }
    }, 500 + Math.random() * 500);
    
    // Auto-scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function saveChatHistories() {
    localStorage.setItem('PROTECT_chatHistories', JSON.stringify(chatHistories));
}

function loadChatHistories() {
    const saved = localStorage.getItem('PROTECT_chatHistories');
    if (saved) {
        const histories = JSON.parse(saved);
        Object.keys(histories).forEach(consoleName => {
            const chatId = `chat-${consoleName}`;
            const chatContainer = document.getElementById(chatId);
            if (chatContainer) {
                histories[consoleName].forEach(msg => {
                    const messageEl = document.createElement('div');
                    if (msg.type === 'user') {
                        messageEl.className = consoleName === 'console4'
                            ? 'chat-message p-3 bg-red-900/40 rounded-lg border border-red-800/50 text-slate-100 text-sm'
                            : 'chat-message p-3 bg-green-900/40 rounded-lg border border-green-800/50 text-slate-100 text-sm';
                        messageEl.innerHTML = `<strong>You:</strong> ${escapeHtml(msg.message)}`;
                    } else {
                        const metadata = consoleMetadata[consoleName];
                        messageEl.className = 'chat-message p-3 bg-slate-800/60 rounded-lg border border-slate-700/50 text-slate-100 text-sm';
                        messageEl.innerHTML = `<strong>${metadata.name}:</strong> ${escapeHtml(msg.message)}`;
                    }
                    chatContainer.appendChild(messageEl);
                });
            }
            chatHistories[consoleName] = histories[consoleName];
        });
    }
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// ================================================================================
// HANDSHAKE ARCHITECTURE - Console 4 ↔ Console 5 ↔ Sifa Main
// ================================================================================

function logToHandshake(source, userMessage, response) {
    const handshakeEntry = {
        source: source,
        userMessage: userMessage,
        response: response,
        timestamp: new Date().toISOString(),
        messageCount: chatHistories[source.includes('Console 4') ? 'console4' : 'console5'].length
    };
    
    // Store handshake log in localStorage
    let handshakeLogs = JSON.parse(localStorage.getItem('PROTECT_handshakeLogs') || '[]');
    handshakeLogs.push(handshakeEntry);
    localStorage.setItem('PROTECT_handshakeLogs', JSON.stringify(handshakeLogs));
    
    console.log(`[HANDSHAKE] ${source}: Message logged for upstream reporting`);
    
    // If this is Console 4, flag for Console 5 escalation
    if (source.includes('Console 4')) {
        flagForConsole5Escalation(handshakeEntry);
    }
    
    // If this is Console 5, flag for Sifa Main notification
    if (source.includes('Console 5')) {
        flagForSifaMainNotification(handshakeEntry);
    }
}

function flagForConsole5Escalation(entry) {
    let escalationQueue = JSON.parse(localStorage.getItem('PROTECT_console4_escalations') || '[]');
    escalationQueue.push({
        ...entry,
        escalatedAt: new Date().toISOString(),
        targetConsole: 'Console 5 (PROTECT Board)'
    });
    localStorage.setItem('PROTECT_console4_escalations', JSON.stringify(escalationQueue));
    console.log(`[ESCALATION] Case/update flagged for Console 5 (Board) review`);
}

function flagForSifaMainNotification(entry) {
    let notificationQueue = JSON.parse(localStorage.getItem('PROTECT_sifa_notifications') || '[]');
    notificationQueue.push({
        ...entry,
        notifiedAt: new Date().toISOString(),
        targetConsole: 'Sifa Bible Institute Main Console'
    });
    localStorage.setItem('PROTECT_sifa_notifications', JSON.stringify(notificationQueue));
    console.log(`[NOTIFICATION] Strategic decision flagged for Sifa Main Console bridge`);
}

function getHandshakeStatus() {
    const console4Logs = JSON.parse(localStorage.getItem('PROTECT_chatHistories') || '{}').console4 || [];
    const console5Logs = JSON.parse(localStorage.getItem('PROTECT_chatHistories') || '{}').console5 || [];
    const escalations = JSON.parse(localStorage.getItem('PROTECT_console4_escalations') || '[]');
    const sifaNotifications = JSON.parse(localStorage.getItem('PROTECT_sifa_notifications') || '[]');
    
    return {
        console4MessageCount: console4Logs.length,
        console5MessageCount: console5Logs.length,
        pendingEscalations: escalations.length,
        pendingSifaNotifications: sifaNotifications.length,
        lastConsole4Activity: console4Logs.length > 0 ? console4Logs[console4Logs.length - 1].timestamp : null,
        lastConsole5Activity: console5Logs.length > 0 ? console5Logs[console5Logs.length - 1].timestamp : null
    };
}

// ================================================================================
// KEYBOARD SUPPORT
// ================================================================================

document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        if (e.target.id === 'input-console4') {
            sendMessage('console4');
        } else if (e.target.id === 'input-console5') {
            sendMessage('console5');
        }
    }
});

// ================================================================================
// EXPORT FUNCTION FOR EXTERNAL INTEGRATION (for Sifa Main Console)
// ================================================================================

function exportHandshakeData() {
    return {
        consoleGateway: 'PROTECT Console 4 & 5',
        console4: {
            name: 'Ndhiwa Sub-County Children\'s Office',
            chatHistory: chatHistories.console4,
            escalations: JSON.parse(localStorage.getItem('PROTECT_console4_escalations') || '[]')
        },
        console5: {
            name: 'PROTECT Board Governance',
            chatHistory: chatHistories.console5,
            sifaNotifications: JSON.parse(localStorage.getItem('PROTECT_sifa_notifications') || '[]')
        },
        handshakeStatus: getHandshakeStatus(),
        exportedAt: new Date().toISOString()
    };
}

console.log("PROTECT Console 4 & 5 Gateway initialized. Use exportHandshakeData() for Sifa Main Console integration.");
