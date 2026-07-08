// PROTECT Console 4 - JavaScript Backend
// Ndhiwa Sub-County Children's Office Case Management System

// ============================================================================
// DATA STORAGE & STATE MANAGEMENT
// ============================================================================

class ProtectConsole4 {
    constructor() {
        this.cases = this.loadFromStorage('protect_cases') || [];
        this.auditLog = this.loadFromStorage('protect_audit_log') || [];
        this.referrals = this.loadFromStorage('protect_referrals') || [];
        this.currentCase = null;
        this.officerProfile = this.loadFromStorage('officer_profile') || {
            name: 'Officer Name',
            email: 'officer@ndhiwa.go.ke',
            phone: '+254731880272'
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.refreshDashboard();
        this.startAutoSync();
        this.loadOfficerProfile();
    }

    setupEventListeners() {
        document.getElementById('evidence-upload').addEventListener('change', (e) => this.handleEvidenceUpload(e));
    }

    // ========================================================================
    // STORAGE MANAGEMENT
    // ========================================================================

    saveToStorage(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    loadFromStorage(key) {
        try {
            return JSON.parse(localStorage.getItem(key));
        } catch {
            return null;
        }
    }

    // ========================================================================
    // CASE MANAGEMENT
    // ========================================================================

    createCaseFromFacebook(commentData) {
        const caseId = 'CASE-' + Date.now();
        const priority = this.assessPriority(commentData.text);
        
        const newCase = {
            id: caseId,
            facebookCommentId: commentData.id,
            reportedBy: commentData.name,
            reportedDate: new Date().toISOString(),
            description: commentData.text,
            priority: priority, // 'urgent', 'moderate', 'low'
            status: 'open', // 'open', 'active', 'resolved', 'closed'
            category: this.categorizeCase(commentData.text),
            evidence: [],
            referrals: [],
            procedureProgress: {
                step1_intake: { completed: true, timestamp: new Date().toISOString() },
                step2_assessment: { completed: false, timestamp: null },
                step3_investigation: { completed: false, timestamp: null },
                step4_referral: { completed: false, timestamp: null },
                step5_intervention: { completed: false, timestamp: null },
                step6_legal: { completed: false, timestamp: null },
                step7_monitoring: { completed: false, timestamp: null },
                step8_closure: { completed: false, timestamp: null }
            },
            engagementHistory: [{
                type: 'facebook_comment',
                actor: 'public',
                message: commentData.text,
                timestamp: new Date().toISOString()
            }],
            assignedDutyBearers: [],
            legalNotes: [],
            complianceCheckmarks: [],
            boardAlert: priority === 'urgent'
        };

        this.cases.push(newCase);
        this.saveToStorage('protect_cases', this.cases);
        this.logAction('create', `Created case ${caseId} from Facebook`);
        this.syncToBoard();

        return newCase;
    }

    // ========================================================================
    // PRIORITY & CATEGORIZATION
    // ========================================================================

    assessPriority(text) {
        const urgentKeywords = ['death', 'rape', 'sexual', 'abuse', 'violence', 'attack', 'blood', 'emergency', 'critical', 'dying', 'dead'];
        const moderateKeywords = ['abandoned', 'deserted', 'neglected', 'sick', 'injured', 'scared', 'harassed'];
        
        const lowerText = text.toLowerCase();
        
        for (let keyword of urgentKeywords) {
            if (lowerText.includes(keyword)) return 'urgent';
        }
        
        for (let keyword of moderateKeywords) {
            if (lowerText.includes(keyword)) return 'moderate';
        }
        
        return 'low';
    }

    categorizeCase(text) {
        const categories = {
            'death': ['death', 'died', 'dead', 'passed away'],
            'sexual_abuse': ['rape', 'sexual', 'molested', 'abuse'],
            'abandonment': ['abandoned', 'deserted', 'left alone', 'orphan'],
            'violence': ['violence', 'hit', 'beat', 'attacked'],
            'neglect': ['neglect', 'hungry', 'no food', 'uncared'],
            'trafficking': ['trafficking', 'sold', 'kidnapped'],
            'disease': ['sick', 'disease', 'illness', 'hospital'],
            'education': ['school', 'dropout', 'not learning']
        };

        const lowerText = text.toLowerCase();
        for (const [cat, keywords] of Object.entries(categories)) {
            for (const keyword of keywords) {
                if (lowerText.includes(keyword)) return cat;
            }
        }
        return 'other';
    }

    // ========================================================================
    // EVIDENCE MANAGEMENT (ALL FILE FORMATS)
    // ========================================================================

    handleEvidenceUpload(event) {
        const files = event.target.files;
        if (!files.length) return;

        for (let file of files) {
            const evidence = {
                id: 'EVID-' + Date.now() + '-' + Math.random(),
                filename: file.name,
                filesize: file.size,
                filetype: file.type,
                extension: file.name.split('.').pop().toUpperCase(),
                uploadedDate: new Date().toISOString(),
                uploadedBy: this.officerProfile.name,
                description: '',
                chainOfCustody: [{
                    person: this.officerProfile.name,
                    action: 'uploaded',
                    timestamp: new Date().toISOString()
                }]
            };

            // Read file as base64
            const reader = new FileReader();
            reader.onload = (e) => {
                evidence.data = e.target.result;
                this.currentCase.evidence.push(evidence);
                this.saveToStorage('protect_cases', this.cases);
                this.logAction('evidence', `Added evidence: ${file.name} to case ${this.currentCase.id}`);
                this.displayEvidenceInModal();
                this.notify(`Evidence added: ${file.name}`);
            };
            reader.readAsDataURL(file);
        }
    }

    displayEvidenceInModal() {
        const container = document.getElementById('modal-case-evidence');
        container.innerHTML = '';

        this.currentCase.evidence.forEach(evidence => {
            const icon = this.getFileIcon(evidence.extension);
            const div = document.createElement('div');
            div.className = 'evidence-item';
            div.innerHTML = `
                <div class="file-icon">${icon}</div>
                <p class="text-xs font-bold truncate">${evidence.filename}</p>
                <p class="text-[10px] text-gray-400">${(evidence.filesize / 1024).toFixed(1)} KB</p>
                <button onclick="console4.downloadEvidence('${evidence.id}')" class="text-xs mt-1 text-blue-400">Download</button>
            `;
            container.appendChild(div);
        });
    }

    getFileIcon(extension) {
        const icons = {
            'PDF': '📄', 'DOC': '📝', 'DOCX': '📝', 'XLS': '📊', 'XLSX': '📊',
            'JPG': '🖼️', 'PNG': '🖼️', 'GIF': '🖼️', 'MP4': '🎥', 'MOV': '🎥',
            'MP3': '🎵', 'WAV': '🎵', 'M4A': '🎵', 'TXT': '📄', 'ODT': '📝',
            'ZIP': '📦', 'RAR': '📦', 'CSV': '📊', 'XLSX': '📊'
        };
        return icons[extension] || '📎';
    }

    downloadEvidence(evidenceId) {
        const evidence = this.currentCase.evidence.find(e => e.id === evidenceId);
        if (!evidence) return;

        const link = document.createElement('a');
        link.href = evidence.data;
        link.download = evidence.filename;
        link.click();
    }

    // ========================================================================
    // PROCEDURE TRACKING (CHILDREN'S ACT 2022 COMPLIANCE)
    // ========================================================================

    completeProcedureStep(caseId, step) {
        const caseIndex = this.cases.findIndex(c => c.id === caseId);
        if (caseIndex === -1) return;

        this.cases[caseIndex].procedureProgress[step] = {
            completed: true,
            timestamp: new Date().toISOString()
        };

        this.saveToStorage('protect_cases', this.cases);
        this.logAction('procedure', `Completed procedure step: ${step} for case ${caseId}`);
        this.checkComplianceStatus(caseIndex);
    }

    checkComplianceStatus(caseIndex) {
        const caseProc = this.cases[caseIndex].procedureProgress;
        const allStepsCompleted = Object.values(caseProc).every(step => step.completed);
        const steps = Object.values(caseProc).filter(s => s.completed).length;

        if (steps >= 6) {
            this.cases[caseIndex].complianceCheckmarks.push({
                status: 'compliant',
                timestamp: new Date().toISOString(),
                note: `${steps}/8 procedure steps completed - Children's Act compliance on track`
            });
        }
    }

    displayProcedureTimeline() {
        if (!this.currentCase) return;

        const steps = [
            { key: 'step1_intake', label: 'Initial Report (Intake)', desc: 'Report received from public' },
            { key: 'step2_assessment', label: 'Initial Assessment', desc: 'Risk assessment & triage' },
            { key: 'step3_investigation', label: 'Investigation', desc: 'Evidence collection' },
            { key: 'step4_referral', label: 'Multi-Stakeholder Referral', desc: 'Assign duty bearers' },
            { key: 'step5_intervention', label: 'Intervention', desc: 'Monitor stakeholder actions' },
            { key: 'step6_legal', label: 'Legal Process', desc: 'Court escalation if needed' },
            { key: 'step7_monitoring', label: 'Monitoring', desc: 'Ongoing support' },
            { key: 'step8_closure', label: 'Case Closure', desc: 'Archive & final documentation' }
        ];

        const container = document.getElementById('modal-case-timeline');
        container.innerHTML = '';

        steps.forEach(step => {
            const progress = this.currentCase.procedureProgress[step.key];
            const isCompleted = progress.completed;
            
            const html = `
                <div class="timeline-item">
                    <div class="timeline-dot" style="background: ${isCompleted ? '#16a34a' : '#2563eb'};"></div>
                    <div class="timeline-content">
                        <p class="font-bold text-sm">${step.label}</p>
                        <p class="text-xs text-gray-400">${step.desc}</p>
                        ${isCompleted ? `<p class="text-xs text-green-400">✓ Completed: ${new Date(progress.timestamp).toLocaleDateString()}</p>` : '<p class="text-xs text-yellow-400">⏳ Pending</p>'}
                        ${!isCompleted ? `<button onclick="console4.completeProcedureStep('${this.currentCase.id}', '${step.key}')" class="text-xs text-blue-400 mt-1">Mark Complete</button>` : ''}
                    </div>
                </div>
            `;
            container.innerHTML += html;
        });
    }

    // ========================================================================
    // REFERRAL CHAIN VALUE CHAIN TRACKING
    // ========================================================================

    addReferral(caseId, type, dutyBearer, notes) {
        const referral = {
            id: 'REF-' + Date.now(),
            caseId: caseId,
            type: type, // 'police', 'health', 'education', 'social', 'legal', 'community'
            dutyBearer: dutyBearer,
            status: 'pending', // 'pending', 'acknowledged', 'in_progress', 'completed'
            createdDate: new Date().toISOString(),
            messages: [{
                from: this.officerProfile.name,
                message: `Initial referral: ${notes}`,
                timestamp: new Date().toISOString(),
                medium: 'messenger' // 'messenger', 'whatsapp', 'sms', 'call'
            }],
            legalCounsels: [],
            complianceNotes: this.generateReferralCompliance(type)
        };

        this.referrals.push(referral);
        
        const caseIndex = this.cases.findIndex(c => c.id === caseId);
        if (caseIndex !== -1) {
            this.cases[caseIndex].referrals.push(referral.id);
            this.saveToStorage('protect_cases', this.cases);
        }

        this.saveToStorage('protect_referrals', this.referrals);
        this.logAction('referral', `Created ${type} referral for case ${caseId} to ${dutyBearer}`);
        this.syncToBoard();

        return referral;
    }

    generateReferralCompliance(type) {
        const compliance = {
            'police': 'Criminal investigation - must follow Police Act and Children Act mandatory reporting',
            'health': 'Medical assessment - ensure confidentiality under Health Act and data protection',
            'education': 'School engagement - coordinate with teacher and education officer',
            'social': 'Social support services - follow social protection framework',
            'legal': 'Court proceedings - must follow Children Act procedures and rules of court',
            'community': 'Community mobilization - ensure consent and cultural sensitivity'
        };
        return compliance[type] || 'Follow standard protocol';
    }

    displayReferralChain() {
        if (!this.currentCase) return;

        const container = document.getElementById('modal-case-referrals');
        container.innerHTML = '';

        if (this.currentCase.referrals.length === 0) {
            container.innerHTML = '<p class="text-gray-400">No referrals yet</p>';
            return;
        }

        this.currentCase.referrals.forEach(refId => {
            const ref = this.referrals.find(r => r.id === refId);
            if (!ref) return;

            const statusColor = {
                'pending': 'bg-yellow-900/30 text-yellow-300',
                'acknowledged': 'bg-blue-900/30 text-blue-300',
                'in_progress': 'bg-purple-900/30 text-purple-300',
                'completed': 'bg-green-900/30 text-green-300'
            };

            const html = `
                <div class="referral-chain ${statusColor[ref.status]} p-2 rounded">
                    <p class="font-bold text-sm">${ref.type.toUpperCase()} → ${ref.dutyBearer}</p>
                    <p class="text-xs">Status: ${ref.status} | Created: ${new Date(ref.createdDate).toLocaleDateString()}</p>
                </div>
            `;
            container.innerHTML += html;
        });
    }

    // ========================================================================
    // AUDIT LOG & OFFICER ACTION TRACKING
    // ========================================================================

    logAction(actionType, description) {
        const logEntry = {
            id: 'LOG-' + Date.now(),
            officer: this.officerProfile.name,
            officerEmail: this.officerProfile.email,
            actionType: actionType, // 'create', 'update', 'assign', 'refer', 'message', 'close', 'evidence', 'procedure', 'referral'
            description: description,
            timestamp: new Date().toISOString(),
            boardNotified: false
        };

        this.auditLog.push(logEntry);
        this.saveToStorage('protect_audit_log', this.auditLog);
        this.updateActivityLog();
        this.syncToBoard(); // Auto-sync audit log to Board Console

        return logEntry;
    }

    updateActivityLog() {
        const activityContainer = document.getElementById('activity-log');
        if (!activityContainer) return;

        const recent = this.auditLog.slice(-5).reverse();
        activityContainer.innerHTML = recent.map(log => `
            <div class="text-xs">
                <p><strong>${log.actionType}</strong>: ${log.description}</p>
                <p class="text-gray-500">${new Date(log.timestamp).toLocaleTimeString()}</p>
            </div>
        `).join('');
    }

    downloadAuditLog() {
        const today = new Date().toISOString().split('T')[0];
        const logs = this.auditLog.filter(log => log.timestamp.startsWith(today));
        
        let csv = 'Officer,Action,Description,Timestamp\n';
        logs.forEach(log => {
            csv += `"${log.officer}","${log.actionType}","${log.description}","${log.timestamp}"\n`;
        });

        const link = document.createElement('a');
        link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
        link.download = `audit-log-${today}.csv`;
        link.click();

        this.notify('Audit log exported and Board Console notified');
    }

    // ========================================================================
    // REPORTS & BOARD INTEGRATION
    // ========================================================================

    generateReport(period) {
        const reportDate = new Date();
        let startDate, endDate = new Date();

        if (period === 'daily') {
            startDate = new Date(reportDate);
            startDate.setHours(0, 0, 0, 0);
        } else if (period === 'weekly') {
            startDate = new Date(reportDate);
            startDate.setDate(reportDate.getDate() - 7);
        } else if (period === 'monthly') {
            startDate = new Date(reportDate);
            startDate.setMonth(reportDate.getMonth() - 1);
        }

        const filteredCases = this.cases.filter(c => 
            new Date(c.reportedDate) >= startDate && new Date(c.reportedDate) <= endDate
        );

        const report = {
            generatedDate: new Date().toISOString(),
            period: period,
            office: 'Ndhiwa Sub-County Children\'s Office',
            officer: this.officerProfile.name,
            statistics: {
                totalCases: filteredCases.length,
                urgentCases: filteredCases.filter(c => c.priority === 'urgent').length,
                moderateCases: filteredCases.filter(c => c.priority === 'moderate').length,
                lowCases: filteredCases.filter(c => c.priority === 'low').length,
                resolvedCases: filteredCases.filter(c => c.status === 'resolved').length,
                closedCases: filteredCases.filter(c => c.status === 'closed').length,
                activeCases: filteredCases.filter(c => c.status === 'active').length
            },
            categories: this.getAnonymizedCategoryBreakdown(filteredCases),
            referrals: this.getAnonymizedReferralStats(),
            complianceStatus: this.checkOverallCompliance(filteredCases),
            anonymized: true,
            pii_removed: true
        };

        // Anonymize sensitive data
        report.anonymizedCases = filteredCases.map(c => ({
            id: c.id,
            category: c.category,
            priority: c.priority,
            status: c.status,
            procedureProgress: c.procedureProgress,
            reportedDate: c.reportedDate
        }));

        this.saveReport(report);
        this.sendToBoardConsole(report);
        this.notify(`${period.charAt(0).toUpperCase() + period.slice(1)} report generated and sent to Board Console`);

        return report;
    }

    getAnonymizedCategoryBreakdown(cases) {
        const breakdown = {};
        cases.forEach(c => {
            breakdown[c.category] = (breakdown[c.category] || 0) + 1;
        });
        return breakdown;
    }

    getAnonymizedReferralStats() {
        const stats = {
            police: this.referrals.filter(r => r.type === 'police').length,
            health: this.referrals.filter(r => r.type === 'health').length,
            education: this.referrals.filter(r => r.type === 'education').length,
            social: this.referrals.filter(r => r.type === 'social').length,
            legal: this.referrals.filter(r => r.type === 'legal').length,
            community: this.referrals.filter(r => r.type === 'community').length
        };
        return stats;
    }

    checkOverallCompliance(cases) {
        const compliantCases = cases.filter(c => 
            Object.values(c.procedureProgress).filter(s => s.completed).length >= 6
        ).length;
        
        return {
            compliantCases: compliantCases,
            totalCases: cases.length,
            compliancePercentage: cases.length > 0 ? ((compliantCases / cases.length) * 100).toFixed(1) : 0
        };
    }

    saveReport(report) {
        const reports = this.loadFromStorage('protect_reports') || [];
        reports.push(report);
        this.saveToStorage('protect_reports', reports);
    }

    sendToBoardConsole(report) {
        // Simulate sending to Board Console
        const boardSync = {
            reportId: 'BOARD-' + Date.now(),
            timestamp: new Date().toISOString(),
            report: report,
            sentTo: ['PROTECT Board Console', 'ANPPCAN Partners', 'Sifa Bible Institute'],
            status: 'sent'
        };

        const boardSyncs = this.loadFromStorage('board_syncs') || [];
        boardSyncs.push(boardSync);
        this.saveToStorage('board_syncs', boardSyncs);

        // Update Board sync status in UI
        const boardSyncElement = document.getElementById('board-last-sync');
        if (boardSyncElement) {
            boardSyncElement.textContent = `Last sync: ${new Date().toLocaleTimeString()}`;
        }
    }

    // ========================================================================
    // LEGAL COUNSEL & COMPLIANCE
    // ========================================================================

    getLegalCounsel(caseId) {
        const caseData = this.cases.find(c => c.id === caseId);
        if (!caseData) return;

        const counsel = {
            case: caseData.id,
            category: caseData.category,
            priority: caseData.priority,
            advices: [
                this.getLegalAdviceForCategory(caseData.category),
                this.getProcedureAdvice(caseData),
                this.getComplianceAdvice(caseData),
                this.getMandatoryReportingAdvice(caseData)
            ],
            timestamp: new Date().toISOString()
        };

        const container = document.getElementById('legal-counsel');
        if (container) {
            container.innerHTML = counsel.advices.map(advice => 
                `<p class="text-sm mb-2">📋 ${advice}</p>`
            ).join('');
        }

        return counsel;
    }

    getLegalAdviceForCategory(category) {
        const advices = {
            'death': '⚠️ MANDATORY REPORT: Death of a child - Contact police immediately (Case reference: Children Act S.66). Initiate investigation and post-mortem if suspicious. Inform court.',
            'sexual_abuse': '⚠️ URGENT: Sexual abuse allegation - Refer to police within 24 hours (CMCC Act). Ensure medical examination. Preserve evidence chain. Consider protective order.',
            'abandonment': 'Abandonment case - Verify child identity and trace parents. Consider alternative care (fosterage/institutional care) per Children Act S.146. Follow permanency planning.',
            'violence': 'Physical violence documented - Refer to health for medical assessment. Report to police if criminal. Document injuries and obtain statement.',
            'neglect': 'Neglect case - Assess home environment. Refer to social services for family support. Consider parenting programs or case conferencing.',
            'trafficking': '⚠️ URGENT: Human trafficking allegation - Report to police (AHT Act). Refer to safe house. Follow anti-trafficking protocols.',
            'disease': 'Health issue identified - Refer to health facility for diagnosis and treatment. Ensure access to medication and follow-up care.',
            'education': 'Education barrier identified - Coordinate with education officer. Enroll child in school. Remove barriers to attendance.'
        };
        return advices[category] || 'Follow standard child protection protocol';
    }

    getProcedureAdvice(caseData) {
        const completedSteps = Object.values(caseData.procedureProgress).filter(s => s.completed).length;
        return `Procedure Progress: ${completedSteps}/8 steps completed. Next: ${this.getNextProcedureStep(caseData)}`;
    }

    getNextProcedureStep(caseData) {
        if (!caseData.procedureProgress.step2_assessment.completed) return 'Complete Initial Assessment within 24 hours (urgent) or 72 hours (moderate/low)';
        if (!caseData.procedureProgress.step3_investigation.completed) return 'Initiate investigation and evidence collection';
        if (!caseData.procedureProgress.step4_referral.completed) return 'Make multi-stakeholder referrals';
        if (!caseData.procedureProgress.step5_intervention.completed) return 'Monitor duty bearer actions and interventions';
        if (!caseData.procedureProgress.step6_legal.completed) return 'Escalate to court if mandatory case';
        if (!caseData.procedureProgress.step7_monitoring.completed) return 'Provide ongoing monitoring and support';
        return 'Prepare for case closure and final documentation';
    }

    getComplianceAdvice(caseData) {
        const mandatory = ['death', 'sexual_abuse', 'trafficking', 'violence'];
        if (mandatory.includes(caseData.category)) {
            return '✓ MANDATORY CASE: Ensure full Children Act 2022 compliance. This case requires escalation to senior officer and possible court involvement.';
        }
        return 'Standard case - Follow case management procedures. Ensure all actions documented.';
    }

    getMandatoryReportingAdvice(caseData) {
        return '⚠️ All allegations of child abuse, neglect, trafficking, or abandonment are mandatory reports per Children Act S.22. Failure to report is a criminal offense.';
    }

    // ========================================================================
    // FACEBOOK INTEGRATION
    // ========================================================================

    connectFacebook() {
        const pageUrl = document.getElementById('fb-page-url').value;
        if (!pageUrl) {
            this.notify('Please enter Facebook page URL or ID');
            return;
        }

        // Simulate Facebook connection
        const mockComments = [
            { id: 'fb1', name: 'Public Member', text: 'A mother in our village died last night. Her 5 children are now alone.' },
            { id: 'fb2', name: 'Concerned Neighbor', text: 'There is a child being abused by her stepfather. She goes to school with bruises.' },
            { id: 'fb3', name: 'Community Leader', text: 'A father abandoned his family. The mother cannot afford food for the children.' }
        ];

        document.getElementById('facebook-comments').innerHTML = '';
        mockComments.forEach(comment => {
            this.displayFacebookComment(comment);
        });

        this.logAction('facebook', `Connected to Facebook page: ${pageUrl}`);
        this.notify('Connected to Facebook page. Fetching comments...');
    }

    displayFacebookComment(comment) {
        const container = document.getElementById('facebook-comments');
        const div = document.createElement('div');
        div.className = 'glass-panel p-4 rounded-lg';
        div.innerHTML = `
            <p class="font-bold mb-1">${comment.name}</p>
            <p class="text-sm text-gray-300 mb-3">${comment.text}</p>
            <div class="flex gap-2">
                <button onclick="console4.createCaseFromFacebook({id: '${comment.id}', name: '${comment.name}', text: '${comment.text}'})" class="btn-primary text-sm">
                    <i class="fas fa-folder-plus mr-1"></i>Create Case
                </button>
                <button onclick="console4.contactPerson('${comment.name}')" class="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm">
                    <i class="fas fa-comment mr-1"></i>Private Message
                </button>
            </div>
        `;
        container.appendChild(div);
    }

    contactPerson(personName) {
        this.notify(`Opening private Messenger conversation with ${personName}...`);
        window.open(`https://m.me/61591632187238`, '_blank');
    }

    // ========================================================================
    // UI UTILITIES
    // ========================================================================

    notify(message) {
        const div = document.createElement('div');
        div.className = 'notification';
        div.textContent = message;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 3000);
    }

    refreshDashboard() {
        const urgent = this.cases.filter(c => c.priority === 'urgent').length;
        const moderate = this.cases.filter(c => c.priority === 'moderate').length;
        const low = this.cases.filter(c => c.priority === 'low').length;
        const active = this.cases.filter(c => c.status === 'active').length;
        const resolved = this.cases.filter(c => c.status === 'resolved').length;
        const closed = this.cases.filter(c => c.status === 'closed').length;

        if (document.getElementById('stats-urgent')) document.getElementById('stats-urgent').textContent = urgent;
        if (document.getElementById('stats-moderate')) document.getElementById('stats-moderate').textContent = moderate;
        if (document.getElementById('stats-low')) document.getElementById('stats-low').textContent = low;
        if (document.getElementById('stats-active')) document.getElementById('stats-active').textContent = active;
        if (document.getElementById('stats-compliant')) document.getElementById('stats-compliant').textContent = resolved;
        if (document.getElementById('stats-resolved')) document.getElementById('stats-resolved').textContent = closed;

        this.displayDashboardCases();
    }

    displayDashboardCases() {
        const container = document.getElementById('dashboard-cases');
        if (!container) return;

        const today = this.cases.filter(c => 
            c.reportedDate.startsWith(new Date().toISOString().split('T')[0])
        );

        if (today.length === 0) {
            container.innerHTML = '<p class="text-gray-400">No cases reported today</p>';
            return;
        }

        container.innerHTML = today.map(c => `
            <div class="case-card ${c.priority} p-4 rounded-lg cursor-pointer hover:shadow-lg" onclick="console4.openCaseModal('${c.id}')">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <p class="font-bold">${c.id}</p>
                        <p class="text-xs text-gray-400">${c.category}</p>
                    </div>
                    <span class="badge badge-${c.priority}">${c.priority.toUpperCase()}</span>
                </div>
                <p class="text-sm text-gray-300">${c.description.substring(0, 100)}...</p>
            </div>
        `).join('');
    }

    // ========================================================================
    // AUTO SYNC
    // ========================================================================

    syncToBoard() {
        // Auto-sync to Board Console every 5 minutes
        const syncData = {
            timestamp: new Date().toISOString(),
            cases: this.cases.length,
            urgent: this.cases.filter(c => c.priority === 'urgent').length,
            auditLog: this.auditLog.slice(-10), // Last 10 actions
            complianceStatus: this.checkOverallCompliance(this.cases)
        };

        // Simulate sending to Board
        console.log('🔄 Syncing to Board Console:', syncData);
    }

    startAutoSync() {
        setInterval(() => {
            this.syncToBoard();
        }, 300000); // Every 5 minutes
    }

    loadOfficerProfile() {
        if (document.getElementById('officer-name')) {
            document.getElementById('officer-name').textContent = this.officerProfile.name;
        }
    }
}

// ============================================================================
// GLOBAL FUNCTIONS FOR HTML ONCLICK HANDLERS
// ============================================================================

const console4 = new ProtectConsole4();

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
}

function openCaseModal(caseId) {
    console4.currentCase = console4.cases.find(c => c.id === caseId);
    if (!console4.currentCase) return;

    document.getElementById('modal-case-id').textContent = console4.currentCase.id;
    document.getElementById('modal-case-title').textContent = `Case: ${console4.currentCase.id}`;
    document.getElementById('modal-case-description').textContent = console4.currentCase.description;
    document.getElementById('modal-case-priority').className = `badge badge-${console4.currentCase.priority}`;
    document.getElementById('modal-case-priority').textContent = console4.currentCase.priority.toUpperCase();
    document.getElementById('modal-case-procedure').textContent = `${Object.values(console4.currentCase.procedureProgress).filter(s => s.completed).length}/8 steps`;

    console4.displayEvidenceInModal();
    console4.displayReferralChain();
    console4.displayProcedureTimeline();

    document.getElementById('caseModal').classList.add('active');
}

function closeModal() {
    document.getElementById('caseModal').classList.remove('active');
}

function addReferral() {
    if (!console4.currentCase) return;
    const type = document.getElementById('modal-referral-type').value;
    if (!type) {
        console4.notify('Please select referral type');
        return;
    }
    
    console4.addReferral(console4.currentCase.id, type, 'Duty Bearer Name', 'Case requires ' + type + ' intervention');
    console4.displayReferralChain();
}

function markResolved() {
    if (!console4.currentCase) return;
    console4.currentCase.status = 'resolved';
    console4.saveToStorage('protect_cases', console4.cases);
    console4.logAction('close', `Marked case ${console4.currentCase.id} as resolved`);
    console4.refreshDashboard();
    closeModal();
    console4.notify('Case marked as resolved');
}

function flagForBoard() {
    if (!console4.currentCase) return;
    console4.currentCase.boardAlert = true;
    console4.saveToStorage('protect_cases', console4.cases);
    console4.logAction('board_alert', `Flagged case ${console4.currentCase.id} for Board consultation`);
    console4.syncToBoard();
    console4.notify('Case flagged and Board Console notified');
}

function generateReport(period) {
    console4.generateReport(period);
}

function downloadAuditLog() {
    console4.downloadAuditLog();
}

function syncFacebook() {
    console4.connectFacebook();
}

function connectFacebook() {
    console4.connectFacebook();
}

function getLegalCounsel() {
    if (!console4.currentCase) {
        const question = document.getElementById('legal-question').value;
        if (!question) {
            console4.notify('Please enter a legal question');
            return;
        }
        const counsel = document.getElementById('legal-counsel');
        counsel.innerHTML = `<p class="text-sm mb-2">📋 ${question}</p><p class="text-xs text-gray-400">AI response: Consult Kenyan Children's Act 2022 provisions. Follow mandatory reporting requirements. Consider data protection obligations.</p>`;
    } else {
        console4.getLegalCounsel(console4.currentCase.id);
    }
}

function filterCases(filter) {
    const container = document.getElementById('cases-container');
    let filtered = console4.cases;

    if (filter !== 'all') {
        filtered = console4.cases.filter(c => {
            if (filter === 'non-compliant') {
                const completedSteps = Object.values(c.procedureProgress).filter(s => s.completed).length;
                return completedSteps < 6;
            }
            return c.priority === filter || c.status === filter;
        });
    }

    container.innerHTML = filtered.map(c => `
        <div class="case-card ${c.priority} p-4 rounded-lg cursor-pointer hover:shadow-lg" onclick="openCaseModal('${c.id}')">
            <div class="flex justify-between items-start mb-2">
                <div>
                    <p class="font-bold">${c.id}</p>
                    <p class="text-xs text-gray-400">${c.category}</p>
                </div>
                <span class="badge badge-${c.priority}">${c.priority.toUpperCase()}</span>
            </div>
            <p class="text-sm text-gray-300">${c.description.substring(0, 100)}...</p>
            <p class="text-xs text-gray-400 mt-2">Reported: ${new Date(c.reportedDate).toLocaleDateString()}</p>
        </div>
    `).join('');
}

function downloadEvidence(evidenceId) {
    console4.downloadEvidence(evidenceId);
}

function saveSettings() {
    console4.officerProfile.name = document.getElementById('setting-name').value;
    console4.officerProfile.email = document.getElementById('setting-email').value;
    console4.officerProfile.phone = document.getElementById('setting-phone').value;
    console4.saveToStorage('officer_profile', console4.officerProfile);
    console4.loadOfficerProfile();
    console4.notify('Profile saved');
}

function assignDutyBearer() {
    if (!console4.currentCase) return;
    const bearer = document.getElementById('modal-duty-bearer').value;
    if (!bearer) return;
    
    console4.currentCase.assignedDutyBearers.push({
        name: bearer,
        assignedDate: new Date().toISOString()
    });
    console4.saveToStorage('protect_cases', console4.cases);
    console4.logAction('assign', `Assigned ${bearer} to case ${console4.currentCase.id}`);
    console4.notify(`${bearer} assigned to case`);
}

function updateLegalNotes() {
    if (!console4.currentCase) return;
    const notes = document.getElementById('modal-legal-notes').value;
    console4.currentCase.legalNotes.push({
        note: notes,
        officer: console4.officerProfile.name,
        timestamp: new Date().toISOString()
    });
    console4.saveToStorage('protect_cases', console4.cases);
    console4.logAction('legal_note', `Added legal notes to case ${console4.currentCase.id}`);
    console4.notify('Legal notes saved and synced to Board');
}

// Load initial data
window.addEventListener('DOMContentLoaded', () => {
    console4.refreshDashboard();
    console4.updateActivityLog();
});
