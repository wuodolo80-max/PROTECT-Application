// CONTEXTUAL ADVERTISING ROTATION DICTIONARY
const contextualAds = [
    { text: "Safaricom Shupavu Portal: Protecting child learning across rural zones.", duration: 15 },
    { text: "Co-operative Bank Family Shield: Comprehensive security for your household.", duration: 12 },
    { text: "Kenya National Child Helpline: Dial 116 for immediate intervention lines.", duration: 20 },
    { text: "Sifa Institute Ledger: Programmatic validation tools now open.", duration: 15 }
];

let activeAdIndex = 0;
let adSecondsElapsed = 0;

// INITIALIZE SYSTEM TIMERS AND ADS
window.addEventListener('DOMContentLoaded', () => {
    initializeAdSustenanceStream();
    calculateAdPricingEstimation();
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

// PRIMARY SUB-TITLE ANCHOR INTERACTIVE ROUTER
function routeAnchor(anchorType) {
    const modal = document.getElementById('triage-modal');
    
    if (anchorType === 'child') {
        modal.classList.remove('hidden');
    } else if (anchorType === 'household') {
        smoothScrollTo('console-3');
        calibrateLinguistic('Chuny', 'Household Triage Context Auto-Injected');
    } else if (anchorType === 'dutybearer') {
        smoothScrollTo('console-3');
        alert("Duty-Bearer Triage Status: Interacting via Public Gateway. Escalation nodes log background notifications to the PROTECT Board.");
    } else if (anchorType === 'community') {
        smoothScrollTo('console-3');
        alert("Community Portal Triage: Routed to Public Social Interface. Specialized business/CSR configurations route via hidden enterprise panels.");
    } else if (anchorType === 'act') {
        smoothScrollTo('console-2');
    }
}

function closeTriageModal() {
    document.getElementById('triage-modal').classList.add('hidden');
}

function executeTriageSelection(zone) {
    closeTriageModal();
    
    if (zone === 'ndhiwa') {
        smoothScrollTo('console-4');
        alert("Access Authorized: Localized case tracking activated for Ndhiwa Sub-County Node.");
    } else if (zone === 'outside') {
        alert("Cross-Jurisdiction Alert: Case outside Ndhiwa boundaries. Connecting instantly to National Child Helpline: EMERGENCY 116.");
        window.open('tel:116');
    } else {
        smoothScrollTo('console-3');
    }
}

function smoothScrollTo(elementId) {
    const target = document.getElementById(elementId);
    if(target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// STATUTORY COUNSELING AND LEGAL DESK CONTROLLER
function triggerCounseling(person) {
    const box = document.getElementById('counseling-box');
    if (!box) return;
    
    box.classList.remove('hidden');
    if (person === 'jane') {
        box.innerHTML = "[Aunty Jane Care Prompt]: 'Je, unajisikia vibaya moyoni au una thagruok (anxiety)? Mimi niko hapa kusikiliza mtoto yeyote aliye na lit (pain). Mazungumzo yetu ni siri kabisa.'";
    } else {
        box.innerHTML = "[Uncle Zeph Legal Aid Prompt]: 'Under Section 23 of the Children Act 2022, you have a solid right to absolute parental care, food, and education. If your rights are breached, we issue an automated tracking alert to the Children's Office.'";
    }
}

// PACKET 8 LINGUISTIC COMPLIANCE LOGGER
function calibrateLinguistic(word, type) {
    const logBox = document.getElementById('linguistic-tracker');
    logBox.className = "bg-teal-950 p-2.5 rounded-xl border border-teal-800 font-mono text-[11px] text-teal-300";
    logBox.innerHTML = `<i class="fa-solid fa-fingerprint animate-pulse text-logoYellow"></i> Linguistic Calibration Match: <strong>${word}</strong> → System Mode: [${type}]`;
}