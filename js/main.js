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
    child: [],
    household: [],
    dutybearer: [],
    community: [],
    practitioner: [],
    government: [],
    enterprise: []
};

// Console metadata and responses
const consoleMetadata = {
    child: {
        name: "Child Counselor",
        icon: "fa-child",
        responses: [
            "I'm here to listen. How are you feeling today?",
            "It's great that you shared that with me. Would you like to talk more?",
            "Remember, you're not alone in this. I'm here to help.",
            "Thank you for trusting me with this. Let's work through it together."
        ]
    },
    household: {
        name: "Family Support Specialist",
        icon: "fa-home",
        responses: [
            "Family wellbeing is important. How can I support you today?",
            "Parenting is a journey. I'm here to help guide you.",
            "Thank you for reaching out. Your family's safety matters.",
            "Let's explore ways to strengthen your household."
        ]
    },
    dutybearer: {
        name: "Professional Guide",
        icon: "fa-user-tie",
        responses: [
            "Welcome. What challenges are you facing in your role?",
            "Your work as a duty bearer is vital. I'm here to support you.",
            "Thank you for your commitment to child protection.",
            "Let's discuss how we can improve outcomes together."
        ]
    },
    community: {
        name: "Community Coordinator",
        icon: "fa-people-group",
        responses: [
            "Community strength drives change. How can we work together?",
            "Your involvement makes a real difference.",
            "Let's build a stronger, safer community together.",
            "Thank you for your leadership and commitment."
        ]
    },
    practitioner: {
        name: "Professional Network",
        icon: "fa-stethoscope",
        responses: [
            "Welcome to our professional network. What insights do you have?",
            "Your expertise is valuable. Let's collaborate.",
            "Thank you for sharing your professional perspective.",
            "How can we advance best practices together?"
        ]
    },
    government: {
        name: "Government Liaison",
        icon: "fa-building",
        responses: [
            "Welcome to the coordination channel. What updates do you have?",
            "Government partnership is essential for systemic change.",
            "Let's align on our child protection objectives.",
            "Thank you for your institutional support and coordination."
        ]
    },
    enterprise: {
        name: "Corporate Partner",
        icon: "fa-briefcase",
        responses: [
            "Welcome to our corporate partnership channel.",
            "Business excellence and child protection go hand in hand.",
            "Your corporate commitment creates lasting impact.",
            "Let's discuss how we can collaborate for greater good."
        ]
    }
};

// INITIALIZE SYSTEM TIMERS AND ADS
window.addEventListener('DOMContentLoaded', () => {
    initializeAdSustenanceStream();
    calculateAdPricingEstimation();
    loadChatHistories();
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
        
        // Rotate ads every 15 seconds to meet 3-ad commitment profile
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
    // Ad pricing model estimation
    console.log("Ad pricing model: Base Rate $20/day, Volume Discount 0%, Estimated Cost: $600 USD");
}

// CONSOLE MANAGEMENT FUNCTIONS
function openConsole(consoleName) {
    // Hide welcome panel and all other consoles
    document.getElementById('console-welcome').classList.add('hidden');
    document.querySelectorAll('.console-section').forEach(el => el.classList.add('hidden'));
    
    // Show selected console
    const consoleId = `console-${consoleName}`;
    const console = document.getElementById(consoleId);
    if (console) {
        console.classList.remove('hidden');
        // Scroll to console
        setTimeout(() => {
            console.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
    
    // Update button states
    document.querySelectorAll('.console-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

function closeConsole(consoleName) {
    const consoleId = `console-${consoleName}`;
    const console = document.getElementById(consoleId);
    if (console) {
        console.classList.add('hidden');
    }
    document.getElementById('console-welcome').classList.remove('hidden');
    document.querySelectorAll('.console-btn').forEach(btn => btn.classList.remove('active'));
}

function sendMessage(consoleName) {
    const inputId = `input-${consoleName}`;
    const chatId = `chat-${consoleName}`;
    const inputElement = document.getElementById(inputId);
    const chatContainer = document.getElementById(chatId);
    const message = inputElement.value.trim();
    
    if (message === '') return;
    
    // Add user message
    const userMessageEl = document.createElement('div');
    userMessageEl.className = 'chat-message p-3 bg-blue-900/40 rounded-lg border border-blue-800/50 text-slate-100 text-sm';
    userMessageEl.innerHTML = `<strong>You:</strong> ${escapeHtml(message)}`;
    chatContainer.appendChild(userMessageEl);
    
    // Store in history
    if (!chatHistories[consoleName]) chatHistories[consoleName] = [];
    chatHistories[consoleName].push({ type: 'user', message: message });
    
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
        chatHistories[consoleName].push({ type: 'assistant', message: responseText });
        
        // Auto-scroll to bottom
        chatContainer.scrollTop = chatContainer.scrollHeight;
        saveChatHistories();
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
                        messageEl.className = 'chat-message p-3 bg-blue-900/40 rounded-lg border border-blue-800/50 text-slate-100 text-sm';
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

// LOCATION TRIAGE MODAL
function closeTriageModal() {
    document.getElementById('triage-modal').classList.add('hidden');
}

function executeTriageSelection(zone) {
    closeTriageModal();
    
    if (zone === 'ndhiwa') {
        alert("Access Authorized: Localized case tracking activated for Ndhiwa Sub-County Node.");
    } else if (zone === 'outside') {
        alert("Cross-Jurisdiction Alert: Case outside Ndhiwa boundaries. Connecting to National Child Helpline: EMERGENCY 116.");
        window.open('tel:116');
    } else if (zone === 'chat') {
        openConsole('child');
    }
}

function smoothScrollTo(elementId) {
    const target = document.getElementById(elementId);
    if(target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Allow Enter key to send message
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.target.id.startsWith('input-')) {
        const consoleName = e.target.id.replace('input-', '');
        sendMessage(consoleName);
    }
});
