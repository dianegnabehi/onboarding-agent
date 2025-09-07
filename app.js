// Configuration de l'API Blackbox
const API_KEY = 'sk-Oqoog7SlO013R2GnSXEMew';
const API_URL = 'https://api.blackbox.ai/v1';

// État de l'application
let currentLanguage = 'fr';
let userResponses = {};
let wellbeingScore = 0;
let conversationHistory = [];
let dailyCheckIns = [];
let currentQuestionIndex = 0;

// Variables pour le suivi journalier
let dailyCheckIn = {
    date: new Date().toISOString().split('T')[0],
    responses: {},
    score: 0,
    completed: false
};

// Questions pour le check-in journalier
let checkInQuestions = [
    {
        id: 'energy',
        text: {
            fr: 'Sur une échelle de 1 à 10, quel est votre niveau d\'énergie ce matin ?',
            en: 'On a scale of 1 to 10, what is your energy level this morning?'
        }
    },
    {
        id: 'stress',
        text: {
            fr: 'De 1 à 10, comment évaluez-vous votre niveau de stress actuel ?',
            en: 'From 1 to 10, how would you rate your current stress level?'
        }
    },
    {
        id: 'workload',
        text: {
            fr: 'De 1 à 10, comment gérez-vous votre charge de travail aujourd\'hui ?',
            en: 'From 1 to 10, how are you managing your workload today?'
        }
    },
    {
        id: 'support',
        text: {
            fr: 'De 1 à 10, vous sentez-vous soutenu(e) par votre équipe ?',
            en: 'From 1 to 10, do you feel supported by your team?'
        }
    },
    {
        id: 'satisfaction',
        text: {
            fr: 'De 1 à 10, êtes-vous satisfait(e) de votre journée de travail ?',
            en: 'From 1 to 10, are you satisfied with your work day?'
        }
    }
];

// Traductions
const translations = {
    fr: {
        'logo': 'WellBoard',
        'nav-home': 'Accueil',
        'nav-chat': 'Check-in Quotidien',
        'nav-eval': 'Évaluation',
        'nav-dashboard': 'Tableau de bord',
        'nav-resources': 'Ressources',
        'nav-calendar': 'Calendrier',
        'nav-settings': 'Paramètres',
        'sidebar-title': 'Navigation rapide',
        'menu-welcome': 'Accueil',
        'menu-chat': 'Check-in Quotidien',
        'menu-eval': 'Évaluation',
        'menu-stats': 'Statistiques',
        'menu-calendar': 'Calendrier',
        'menu-resources': 'Ressources',
        'menu-settings': 'Paramètres',
        'welcome-title': 'Bienvenue - Onboarding Bien-être au Travail',
        'welcome-subtitle': 'Votre compagnon pour une intégration réussie et un bien-être durable',
        'welcome-alert': '💡 Commencez votre check-in quotidien pour suivre votre bien-être',
        'action-chat': 'Check-in Quotidien',
        'action-chat-desc': 'Évaluez votre bien-être en 5 questions rapides',
        'action-eval': 'Évaluation Complète',
        'action-eval-desc': 'Analyse approfondie de votre bien-être au travail',
        'action-progress': 'Statistiques',
        'action-progress-desc': 'Suivez votre évolution mensuelle',
        'chat-title': 'Check-in Bien-être Quotidien',
        'chat-subtitle': '5 questions rapides pour évaluer votre journée',
        'chat-welcome': 'Bonjour ! Prêt(e) pour votre check-in quotidien ? Cliquez sur "Commencer" pour démarrer.',
        'chat-placeholder': 'Tapez votre message...',
        'chat-send': 'Envoyer',
        'start-checkin': 'Commencer le Check-in',
        'resources-title': 'Ressources Internes - Nouveaux Employés',
        'onboarding-docs': 'Documents d\'Onboarding',
        'company-policies': 'Politiques d\'Entreprise',
        'team-contacts': 'Contacts de l\'Équipe',
        'wellness-program': 'Programme Bien-être',
        'it-support': 'Support Informatique',
        'hr-contact': 'Contact RH',
        // Nouvelles traductions pour la page d'accueil
        'user-role': 'Développeur Full Stack',
        'days-in-company': 'Jour 15 dans l\'entreprise',
        'user-level': 'Niveau: Explorateur',
        'wellness-points': 'Points Bien-être',
        'daily-activities': 'Activités du Jour - Gagnez des Points!',
        'daily-checkin': 'Check-in quotidien',
        'exercise-5min': 'Exercice de 5 min',
        'guided-meditation': 'Méditation guidée',
        'team-coffee': 'Pause café équipe',
        'action-calendar': 'Calendrier',
        'action-calendar-desc': 'Vos rendez-vous et événements',
        'action-resources': 'Ressources',
        'action-resources-desc': 'Documents et contacts',
        'action-statistics': 'Statistiques',
        'action-statistics-desc': 'Votre progression',
        'your-badges': 'Vos Badges',
        'first-week': 'Première Semaine',
        '5-checkins': '5 Check-ins',
        '30-days': '30 Jours',
        'wellness-expert': 'Expert Bien-être',
        // Sidebar exercices
        'office-exercises': 'Exercices au Bureau',
        'eye-gym': 'Gym des Yeux',
        'eye-gym-desc': '2 min - Reposez vos yeux de l\'écran',
        'chair-stretching': 'Étirements sur Chaise',
        'chair-stretching-desc': '5 min - Détendez dos et épaules',
        'deep-breathing': 'Respiration Profonde',
        'deep-breathing-desc': '3 min - Réduisez le stress',
        'neck-rotation': 'Rotation du Cou',
        'neck-rotation-desc': '2 min - Soulagez les tensions',
        'wrist-exercises': 'Exercices Poignets',
        'wrist-exercises-desc': '2 min - Prévenez le syndrome du canal carpien',
        'tip-message': 'Conseil: Faites une pause active toutes les heures pour maintenir votre énergie et concentration.'
    },
    en: {
        'logo': 'WellBoard',
        'nav-home': 'Home',
        'nav-chat': 'Daily Check-in',
        'nav-eval': 'Assessment',
        'nav-dashboard': 'Dashboard',
        'nav-resources': 'Resources',
        'nav-calendar': 'Calendar',
        'nav-settings': 'Settings',
        'sidebar-title': 'Quick Navigation',
        'menu-welcome': 'Home',
        'menu-chat': 'Daily Check-in',
        'menu-eval': 'Assessment',
        'menu-stats': 'Statistics',
        'menu-calendar': 'Calendar',
        'menu-resources': 'Resources',
        'menu-settings': 'Settings',
        'welcome-title': 'Welcome - Workplace Wellness Onboarding',
        'welcome-subtitle': 'Your companion for successful integration and lasting well-being',
        'welcome-alert': '💡 Start your daily check-in to track your well-being',
        'action-chat': 'Daily Check-in',
        'action-chat-desc': 'Assess your well-being in 5 quick questions',
        'action-eval': 'Full Assessment',
        'action-eval-desc': 'In-depth analysis of your workplace well-being',
        'action-progress': 'Statistics',
        'action-progress-desc': 'Track your monthly progress',
        'chat-title': 'Daily Wellness Check-in',
        'chat-subtitle': '5 quick questions to assess your day',
        'chat-welcome': 'Hello! Ready for your daily check-in? Click "Start" to begin.',
        'chat-placeholder': 'Type your message...',
        'chat-send': 'Send',
        'start-checkin': 'Start Check-in',
        'resources-title': 'Internal Resources - New Employees',
        'onboarding-docs': 'Onboarding Documents',
        'company-policies': 'Company Policies',
        'team-contacts': 'Team Contacts',
        'wellness-program': 'Wellness Program',
        'it-support': 'IT Support',
        'hr-contact': 'HR Contact',
        // Nouvelles traductions pour la page d'accueil
        'user-role': 'Full Stack Developer',
        'days-in-company': 'Day 15 in the company',
        'user-level': 'Level: Explorer',
        'wellness-points': 'Wellness Points',
        'daily-activities': 'Daily Activities - Earn Points!',
        'daily-checkin': 'Daily check-in',
        'exercise-5min': '5 min Exercise',
        'guided-meditation': 'Guided Meditation',
        'team-coffee': 'Team Coffee Break',
        'action-calendar': 'Calendar',
        'action-calendar-desc': 'Your appointments and events',
        'action-resources': 'Resources',
        'action-resources-desc': 'Documents and contacts',
        'action-statistics': 'Statistics',
        'action-statistics-desc': 'Your progress',
        'your-badges': 'Your Badges',
        'first-week': 'First Week',
        '5-checkins': '5 Check-ins',
        '30-days': '30 Days',
        'wellness-expert': 'Wellness Expert',
        // Sidebar exercices
        'office-exercises': 'Office Exercises',
        'eye-gym': 'Eye Gym',
        'eye-gym-desc': '2 min - Rest your eyes from the screen',
        'chair-stretching': 'Chair Stretching',
        'chair-stretching-desc': '5 min - Relax back and shoulders',
        'deep-breathing': 'Deep Breathing',
        'deep-breathing-desc': '3 min - Reduce stress',
        'neck-rotation': 'Neck Rotation',
        'neck-rotation-desc': '2 min - Relieve tension',
        'wrist-exercises': 'Wrist Exercises',
        'wrist-exercises-desc': '2 min - Prevent carpal tunnel syndrome',
        'tip-message': 'Tip: Take an active break every hour to maintain your energy and concentration.'
    }
};

// Fonction pour changer de langue
function setLanguage(lang) {
    currentLanguage = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    document.querySelectorAll('[data-lang]').forEach(element => {
        const key = element.getAttribute('data-lang');
        if (translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
    
    document.querySelectorAll('[data-lang-placeholder]').forEach(element => {
        const key = element.getAttribute('data-lang-placeholder');
        if (translations[lang][key]) {
            element.placeholder = translations[lang][key];
        }
    });
    
    localStorage.setItem('preferredLanguage', lang);
}

// Fonction pour basculer le menu mobile
function toggleMenu() {
    const nav = document.getElementById('nav');
    const menuToggle = document.querySelector('.menu-toggle');
    nav.classList.toggle('active');
    menuToggle.classList.toggle('active');
}

// Fonction pour afficher une section
function showSection(sectionName) {
    document.querySelectorAll('.welcome-screen, .chat-container, .questionnaire-container, .dashboard-container, .resources-container, .calendar-container, .settings-container').forEach(section => {
        if (section) {
            section.classList.remove('active');
            section.style.display = 'none';
        }
    });
    
    const sectionId = sectionName + '-section';
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
        section.style.display = 'block';
    }
    
    document.querySelectorAll('.nav a, .sidebar-menu a').forEach(link => {
        link.classList.remove('active');
    });
    
    document.querySelectorAll(`[onclick*="showSection('${sectionName}')"]`).forEach(link => {
        link.classList.add('active');
    });
    
    const nav = document.getElementById('nav');
    const menuToggle = document.querySelector('.menu-toggle');
    if (nav) nav.classList.remove('active');
    if (menuToggle) menuToggle.classList.remove('active');
    
    switch(sectionName) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'calendar':
            showCalendar();
            break;
        case 'settings':
            showSettings();
            break;
        case 'resources':
            loadWorkplaceResources();
            break;
        case 'chat':
            initializeDailyCheckIn();
            break;
        case 'questionnaire':
            initializeAdvancedEvaluation();
            break;
    }
}

// Fonction pour initialiser le check-in quotidien
function initializeDailyCheckIn() {
    // Réinitialiser le flag quand on revient à la section
    isCheckInInProgress = false;
    currentQuestionIndex = 0;
    
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
        // MODE TEST - Toujours permettre le check-in pour les tests locaux
        const welcomeText = currentLanguage === 'fr' 
            ? 'Bonjour ! Je suis votre assistant bien-être. Comment puis-je vous aider aujourd\'hui ?'
            : 'Hello! I am your wellness assistant. How can I help you today?';
        
        const testModeText = currentLanguage === 'fr'
            ? '<strong>🧪 Mode Test Local</strong> - Check-ins multiples autorisés pour les tests'
            : '<strong>🧪 Local Test Mode</strong> - Multiple check-ins allowed for testing';
        
        const optionsText = currentLanguage === 'fr' ? 'Vous pouvez :' : 'You can:';
        
        const optionsList = currentLanguage === 'fr' 
            ? `<li>Faire votre check-in quotidien (tests multiples autorisés)</li>
               <li>Poser des questions sur le bien-être au travail</li>
               <li>Demander des conseils pour gérer le stress</li>
               <li>Discuter de vos préoccupations professionnelles</li>`
            : `<li>Do your daily check-in (multiple tests allowed)</li>
               <li>Ask questions about workplace wellness</li>
               <li>Request advice for managing stress</li>
               <li>Discuss your professional concerns</li>`;
        
        chatMessages.innerHTML = `
            <div class="message bot">
                <div class="message-content">
                    <span>${welcomeText}</span>
                    <br><br>
                    <div style="padding: 10px; background: #fff3cd; border-radius: 5px; margin: 10px 0; font-size: 0.9rem;">
                        ${testModeText}
                    </div>
                    <span>${optionsText}</span>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                        ${optionsList}
                    </ul>
                    <button id="start-checkin-btn" class="btn btn-primary" style="margin-top: 15px;" onclick="startDailyCheckIn()">
                        ${translations[currentLanguage]['start-checkin'] || 'Commencer le Check-in'}
                    </button>
                </div>
            </div>
        `;
    }
}

// Variable pour empêcher les clics multiples
let isCheckInInProgress = false;

// Fonction pour démarrer le check-in journalier
function startDailyCheckIn() {
    // Empêcher les clics multiples
    if (isCheckInInProgress) {
        return;
    }
    
    isCheckInInProgress = true;
    currentQuestionIndex = 0;
    dailyCheckIn = {
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
        responses: {},
        score: 0,
        completed: false
    };
    
    // Masquer le bouton "Commencer le Check-in"
    const startButton = document.querySelector('button[onclick="startDailyCheckIn()"]');
    if (startButton) {
        startButton.style.display = 'none';
    }
    
    showNextQuestion();
}

// Fonction pour afficher la prochaine question
function showNextQuestion() {
    if (currentQuestionIndex < checkInQuestions.length) {
        const question = checkInQuestions[currentQuestionIndex];
        const questionLabel = currentLanguage === 'fr' ? 'Question' : 'Question';
        const botMessage = `
            <div style="margin-bottom: 15px;">
                <strong>${questionLabel} ${currentQuestionIndex + 1}/5</strong><br>
                ${question.text[currentLanguage]}
            </div>
            <div class="number-scale" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-top: 15px;">
                ${[1,2,3,4,5,6,7,8,9,10].map(num => `
                    <button class="scale-btn" onclick="answerDailyQuestion('${question.id}', ${num})" style="
                        padding: 15px;
                        border: 2px solid var(--border-color);
                        background: white;
                        border-radius: 8px;
                        cursor: pointer;
                        transition: all 0.3s;
                        font-weight: bold;
                        font-size: 1.1rem;
                        color: ${num <= 3 ? '#e74c3c' : num <= 6 ? '#f39c12' : '#27ae60'};
                    " onmouseover="this.style.background='${num <= 3 ? '#ffe5e5' : num <= 6 ? '#fff3e0' : '#e8f5e9'}'" 
                       onmouseout="this.style.background='white'">${num}</button>
                `).join('')}
            </div>
        `;
        
        addMessageToChat('bot', botMessage, true);
    } else {
        completeDailyCheckIn();
    }
}

// Fonction pour répondre aux questions journalières
function answerDailyQuestion(questionId, value) {
    dailyCheckIn.responses[questionId] = value;
    addMessageToChat('user', `${value}/10`);
    
    currentQuestionIndex++;
    
    setTimeout(() => {
        showNextQuestion();
    }, 500);
}

// Fonction pour compléter le check-in journalier
function completeDailyCheckIn() {
    const values = Object.values(dailyCheckIn.responses);
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    dailyCheckIn.score = Math.round(average * 10);
    dailyCheckIn.completed = true;
    
    // Réinitialiser le flag
    isCheckInInProgress = false;
    
    // Sauvegarder dans le localStorage
    let allCheckIns = JSON.parse(localStorage.getItem('dailyCheckIns') || '[]');
    allCheckIns.push(dailyCheckIn);
    localStorage.setItem('dailyCheckIns', JSON.stringify(allCheckIns));
    
    // Sauvegarder le contexte du check-in pour les conseils personnalisés
    localStorage.setItem('lastCheckInContext', JSON.stringify({
        date: dailyCheckIn.date,
        score: dailyCheckIn.score,
        responses: dailyCheckIn.responses,
        analysis: analyzeCheckInResponses(dailyCheckIn.responses)
    }));
    
    // Afficher le résultat
    const completedTitle = currentLanguage === 'fr' ? '✨ Check-in Complété!' : '✨ Check-in Completed!';
    const scoreLabel = currentLanguage === 'fr' ? 'Score du jour:' : 'Today\'s score:';
    const statsButtonText = currentLanguage === 'fr' ? 'Voir mes statistiques' : 'View my statistics';
    
    const resultMessage = `
        <div style="padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px;">
            <h3 style="margin-bottom: 15px;">${completedTitle}</h3>
            <div style="font-size: 2rem; margin: 20px 0;">
                ${scoreLabel} <strong>${dailyCheckIn.score}%</strong>
            </div>
            <div style="margin-top: 20px;">
                ${getWellbeingAdvice(dailyCheckIn.score)}
            </div>
            <button class="btn" style="background: white; color: #667eea; margin-top: 15px;" onclick="showSection('dashboard')">
                ${statsButtonText}
            </button>
        </div>
    `;
    
    addMessageToChat('bot', resultMessage, true);
    
    // Ajouter le champ libre pour conseils personnalisés
    setTimeout(() => {
        const adviceTitle = currentLanguage === 'fr' ? '💬 Obtenir des conseils personnalisés' : '💬 Get personalized advice';
        const adviceDescription = currentLanguage === 'fr' 
            ? 'Basé sur votre check-in d\'aujourd\'hui, posez-moi une question spécifique pour recevoir des conseils adaptés à votre situation.'
            : 'Based on today\'s check-in, ask me a specific question to receive advice tailored to your situation.';
        const placeholderText = currentLanguage === 'fr' 
            ? 'Ex: Comment gérer mon stress au travail ?'
            : 'Ex: How can I manage my work stress?';
        const buttonText = currentLanguage === 'fr' ? 'Demander conseil' : 'Ask for advice';
        
        const personalizedAdviceMessage = `
            <div style="margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 10px; border-left: 4px solid #667eea;">
                <h4 style="color: #667eea; margin-bottom: 15px;">${adviceTitle}</h4>
                <p style="color: #666; margin-bottom: 15px;">
                    ${adviceDescription}
                </p>
                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <input type="text" id="personalized-advice-input" placeholder="${placeholderText}" 
                           style="flex: 1; padding: 12px; border: 1px solid #ddd; border-radius: 25px; outline: none;">
                    <button onclick="sendPersonalizedAdviceRequest()" 
                            style="padding: 12px 20px; background: #667eea; color: white; border: none; border-radius: 25px; cursor: pointer;">
                        ${buttonText}
                    </button>
                </div>
            </div>
        `;
        
        addMessageToChat('bot', personalizedAdviceMessage, true);
    }, 1000);
}

// Fonction pour analyser les réponses du check-in
function analyzeCheckInResponses(responses) {
    const analysis = {
        strengths: [],
        concerns: [],
        recommendations: []
    };
    
    // Analyser chaque dimension
    if (responses.energy) {
        if (responses.energy >= 7) {
            analysis.strengths.push("Niveau d'énergie élevé");
        } else if (responses.energy <= 4) {
            analysis.concerns.push("Fatigue importante");
            analysis.recommendations.push("Améliorer la qualité du sommeil et prendre des pauses régulières");
        }
    }
    
    if (responses.stress) {
        if (responses.stress >= 7) {
            analysis.concerns.push("Niveau de stress élevé");
            analysis.recommendations.push("Pratiquer des techniques de relaxation et identifier les sources de stress");
        } else if (responses.stress <= 3) {
            analysis.strengths.push("Gestion du stress efficace");
        }
    }
    
    if (responses.workload) {
        if (responses.workload <= 4) {
            analysis.concerns.push("Difficulté à gérer la charge de travail");
            analysis.recommendations.push("Prioriser les tâches et demander de l'aide si nécessaire");
        } else if (responses.workload >= 7) {
            analysis.strengths.push("Bonne gestion de la charge de travail");
        }
    }
    
    if (responses.support) {
        if (responses.support <= 4) {
            analysis.concerns.push("Manque de soutien de l'équipe");
            analysis.recommendations.push("Communiquer davantage avec les collègues et le manager");
        } else if (responses.support >= 7) {
            analysis.strengths.push("Bon soutien de l'équipe");
        }
    }
    
    if (responses.satisfaction) {
        if (responses.satisfaction <= 4) {
            analysis.concerns.push("Satisfaction professionnelle faible");
            analysis.recommendations.push("Identifier les aspects du travail à améliorer");
        } else if (responses.satisfaction >= 7) {
            analysis.strengths.push("Satisfaction professionnelle élevée");
        }
    }
    
    return analysis;
}

// Fonction pour obtenir des conseils basés sur le score
function getWellbeingAdvice(score) {
    if (currentLanguage === 'fr') {
        if (score >= 70) {
            return "🎉 Excellent ! Vous semblez en pleine forme aujourd'hui. Continuez ainsi !";
        } else if (score >= 50) {
            return "😊 Journée correcte. Pensez à prendre quelques pauses pour recharger vos batteries.";
        } else {
            return "🤗 Journée difficile ? N'hésitez pas à parler à votre manager ou à consulter nos ressources bien-être.";
        }
    } else {
        if (score >= 70) {
            return "🎉 Excellent! You seem to be in great shape today. Keep it up!";
        } else if (score >= 50) {
            return "😊 Decent day. Remember to take some breaks to recharge your batteries.";
        } else {
            return "🤗 Difficult day? Don't hesitate to talk to your manager or check out our wellness resources.";
        }
    }
}

// Fonction pour envoyer une demande de conseil personnalisé
async function sendPersonalizedAdviceRequest() {
    const input = document.getElementById('personalized-advice-input');
    const question = input.value.trim();
    
    if (!question) {
        const alertMessage = currentLanguage === 'fr' ? 'Veuillez saisir votre question' : 'Please enter your question';
        showAlert('warning', alertMessage);
        return;
    }
    
    // Récupérer le contexte du check-in
    const checkInContext = JSON.parse(localStorage.getItem('lastCheckInContext') || '{}');
    
    // Ajouter la question de l'utilisateur
    addMessageToChat('user', question);
    input.value = '';
    
    // Afficher le loader
    const loading = document.getElementById('chat-loading');
    if (loading) loading.style.display = 'inline-block';
    
    try {
        // Construire le contexte enrichi pour l'IA
        const contextualMessage = buildContextualMessage(question, checkInContext);
        
        // Appel à notre backend avec le contexte du check-in
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: contextualMessage,
                language: currentLanguage,
                history: [],
                isPersonalized: true,
                checkInContext: checkInContext
            })
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success && data.response) {
            addMessageToChat('bot', data.response);
        } else {
            throw new Error('Réponse invalide du serveur');
        }
        
    } catch (error) {
        console.error('Erreur conseil personnalisé:', error);
        const errorMessage = currentLanguage === 'fr' 
            ? "Je suis désolé, je rencontre une difficulté technique. Voici quelques conseils généraux basés sur votre check-in."
            : "I'm sorry, I'm experiencing a technical difficulty. Here are some general tips based on your check-in.";
        
        // Fournir des conseils de fallback basés sur le contexte
        const fallbackAdvice = generateFallbackAdvice(checkInContext, question);
        addMessageToChat('bot', errorMessage + "\n\n" + fallbackAdvice);
    } finally {
        if (loading) loading.style.display = 'none';
    }
}

// Fonction pour construire un message contextuel
function buildContextualMessage(question, checkInContext) {
    if (!checkInContext.responses) {
        return question;
    }
    
    const context = `Contexte du check-in d'aujourd'hui:
- Score global: ${checkInContext.score}%
- Énergie: ${checkInContext.responses.energy}/10
- Stress: ${checkInContext.responses.stress}/10
- Charge de travail: ${checkInContext.responses.workload}/10
- Soutien équipe: ${checkInContext.responses.support}/10
- Satisfaction: ${checkInContext.responses.satisfaction}/10

Points forts identifiés: ${checkInContext.analysis?.strengths?.join(', ') || 'Aucun'}
Préoccupations: ${checkInContext.analysis?.concerns?.join(', ') || 'Aucune'}

Question de l'utilisateur: ${question}

Réponds en tenant compte de ce contexte spécifique pour donner des conseils personnalisés et pratiques.`;
    
    return context;
}

// Fonction pour générer des conseils de fallback
function generateFallbackAdvice(checkInContext, question) {
    if (!checkInContext.analysis) {
        return currentLanguage === 'fr' 
            ? "Basé sur votre question, je vous recommande de prendre des pauses régulières et de communiquer avec votre équipe."
            : "Based on your question, I recommend taking regular breaks and communicating with your team.";
    }
    
    const concerns = checkInContext.analysis.concerns || [];
    const recommendations = checkInContext.analysis.recommendations || [];
    
    let advice = currentLanguage === 'fr' 
        ? "Basé sur votre check-in d'aujourd'hui:\n\n"
        : "Based on today's check-in:\n\n";
    
    if (concerns.length > 0) {
        const concernsTitle = currentLanguage === 'fr' ? "🔍 Préoccupations identifiées:" : "🔍 Identified concerns:";
        advice += concernsTitle + "\n";
        concerns.forEach(concern => {
            advice += `• ${concern}\n`;
        });
        advice += "\n";
    }
    
    if (recommendations.length > 0) {
        const recommendationsTitle = currentLanguage === 'fr' ? "💡 Recommandations personnalisées:" : "💡 Personalized recommendations:";
        advice += recommendationsTitle + "\n";
        recommendations.forEach(rec => {
            advice += `• ${rec}\n`;
        });
    }
    
    return advice;
}

// Fonction pour ajouter un message au chat
function addMessageToChat(sender, message, isHTML = false) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    if (isHTML) {
        contentDiv.innerHTML = message;
    } else {
        contentDiv.textContent = message;
    }
    
    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Variables pour le système de gamification
let userPoints = parseInt(localStorage.getItem('userPoints') || '250');
let completedActivities = JSON.parse(localStorage.getItem('completedActivities') || '{}');
let userProfile = JSON.parse(localStorage.getItem('userProfile') || JSON.stringify({
    name: 'Jean Dupont',
    role: 'Développeur Full Stack',
    startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    level: 'Explorateur',
    badges: ['first-week', '5-checkins']
}));

// Fonction pour calculer les jours dans l'entreprise
function getDaysInCompany() {
    const start = new Date(userProfile.startDate);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// Fonction pour compléter une activité et gagner des points
function completeActivity(activityType) {
    const today = new Date().toISOString().split('T')[0];
    if (!completedActivities[today]) {
        completedActivities[today] = [];
    }
    
    if (completedActivities[today].includes(activityType)) {
        showAlert('warning', 'Vous avez déjà complété cette activité aujourd\'hui !');
        return;
    }
    
    let points = 0;
    let message = '';
    
    switch(activityType) {
        case 'checkin':
            points = 50;
            message = 'Check-in quotidien complété !';
            showSection('chat');
            return;
        case 'exercise':
            points = 30;
            message = 'Exercice de 5 minutes complété !';
            break;
        case 'meditation':
            points = 40;
            message = 'Méditation guidée complétée !';
            break;
        case 'social':
            points = 20;
            message = 'Pause café équipe effectuée !';
            break;
    }
    
    userPoints += points;
    completedActivities[today].push(activityType);
    
    localStorage.setItem('userPoints', userPoints.toString());
    localStorage.setItem('completedActivities', JSON.stringify(completedActivities));
    
    updatePointsDisplay();
    showAlert('success', `${message} +${points} points !`);
    
    // Animation visuelle
    animatePoints(points);
}

// Fonction pour animer les points gagnés
function animatePoints(points) {
    const pointsDisplay = document.querySelector('[data-points-display]');
    if (pointsDisplay) {
        pointsDisplay.style.transform = 'scale(1.2)';
        setTimeout(() => {
            pointsDisplay.style.transform = 'scale(1)';
        }, 300);
    }
}

// Fonction pour mettre à jour l'affichage des points
function updatePointsDisplay() {
    const pointsElements = document.querySelectorAll('[data-points]');
    pointsElements.forEach(el => {
        el.textContent = `⭐ ${userPoints}`;
    });
}

// Fonction pour démarrer un exercice au bureau
function startExercise(exerciseType) {
    const exercises = {
        'eyes': {
            title: 'Gym des Yeux',
            instructions: [
                '1. Fermez les yeux pendant 5 secondes',
                '2. Regardez en haut, puis en bas (5 fois)',
                '3. Regardez à gauche, puis à droite (5 fois)',
                '4. Faites des cercles avec vos yeux (5 fois)',
                '5. Regardez un objet éloigné pendant 20 secondes'
            ],
            duration: 2
        },
        'stretching': {
            title: 'Étirements sur Chaise',
            instructions: [
                '1. Levez les bras au-dessus de la tête, étirez-vous',
                '2. Tournez doucement le torse à gauche, puis à droite',
                '3. Penchez la tête vers l\'épaule gauche, puis droite',
                '4. Roulez les épaules vers l\'arrière (10 fois)',
                '5. Étirez les jambes devant vous'
            ],
            duration: 5
        },
        'breathing': {
            title: 'Respiration Profonde',
            instructions: [
                '1. Inspirez lentement par le nez (4 secondes)',
                '2. Retenez votre respiration (4 secondes)',
                '3. Expirez lentement par la bouche (6 secondes)',
                '4. Répétez 5 fois',
                '5. Terminez par une respiration normale'
            ],
            duration: 3
        },
        'neck': {
            title: 'Rotation du Cou',
            instructions: [
                '1. Tournez lentement la tête à droite',
                '2. Maintenez 5 secondes',
                '3. Tournez lentement la tête à gauche',
                '4. Maintenez 5 secondes',
                '5. Répétez 5 fois de chaque côté'
            ],
            duration: 2
        },
        'wrists': {
            title: 'Exercices Poignets',
            instructions: [
                '1. Tendez le bras, pliez le poignet vers le bas',
                '2. Maintenez 10 secondes',
                '3. Pliez le poignet vers le haut',
                '4. Maintenez 10 secondes',
                '5. Faites des rotations des poignets (10 fois)'
            ],
            duration: 2
        }
    };
    
    const exercise = exercises[exerciseType];
    if (!exercise) return;
    
    // Créer une modal pour l'exercice
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 30px;
        border-radius: 15px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        z-index: 10000;
        max-width: 500px;
        width: 90%;
    `;
    
    modal.innerHTML = `
        <h2 style="color: var(--primary-color); margin-bottom: 20px;">🏃 ${exercise.title}</h2>
        <p style="color: #666; margin-bottom: 20px;">Durée: ${exercise.duration} minutes</p>
        <ol style="line-height: 2; color: #333;">
            ${exercise.instructions.map(inst => `<li>${inst}</li>`).join('')}
        </ol>
        <div style="margin-top: 25px; display: flex; gap: 10px;">
            <button onclick="this.parentElement.parentElement.remove(); completeExercise('${exerciseType}')" 
                    style="flex: 1; padding: 12px; background: var(--success-color); color: white; border: none; border-radius: 8px; cursor: pointer;">
                ✅ J'ai terminé l'exercice
            </button>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="flex: 1; padding: 12px; background: #e0e0e0; color: #333; border: none; border-radius: 8px; cursor: pointer;">
                Annuler
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Fonction pour compléter un exercice
function completeExercise(exerciseType) {
    completeActivity('exercise');
    showAlert('success', 'Bravo ! Exercice complété. Vous vous sentirez mieux !');
}

// Fonction pour charger les ressources d'entreprise
function loadWorkplaceResources() {
    const resourcesSection = document.getElementById('resources-section');
    if (!resourcesSection) return;
    
    resourcesSection.innerHTML = `
        <h2>${translations[currentLanguage]['resources-title']}</h2>
        
        <!-- Documents Métier -->
        <div class="resource-category" style="margin: 30px 0;">
            <h3 style="color: var(--primary-color); margin-bottom: 20px;">📂 Documents Métier</h3>
            <div class="resources-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                <div class="resource-card" onclick="openInternalResource('procedures')" style="background: white; padding: 20px; border-radius: 10px; cursor: pointer; box-shadow: var(--shadow);">
                    <h4 style="color: var(--secondary-color);">Procédures Métier</h4>
                    <p style="color: #666; font-size: 0.9rem;">Processus et workflows de votre département</p>
                    <span style="color: var(--accent-color); font-weight: bold;">→ Consulter</span>
                </div>
                <div class="resource-card" onclick="openInternalResource('best-practices')" style="background: white; padding: 20px; border-radius: 10px; cursor: pointer; box-shadow: var(--shadow);">
                    <h4 style="color: var(--secondary-color);">Bonnes Pratiques</h4>
                    <p style="color: #666; font-size: 0.9rem;">Standards de qualité et méthodes de travail</p>
                    <span style="color: var(--accent-color); font-weight: bold;">→ Lire</span>
                </div>
                <div class="resource-card" onclick="openInternalResource('technical-docs')" style="background: white; padding: 20px; border-radius: 10px; cursor: pointer; box-shadow: var(--shadow);">
                    <h4 style="color: var(--secondary-color);">Documentation Technique</h4>
                    <p style="color: #666; font-size: 0.9rem;">Guides techniques et références API</p>
                    <span style="color: var(--accent-color); font-weight: bold;">→ Explorer</span>
                </div>
                <div class="resource-card" onclick="openInternalResource('project-templates')" style="background: white; padding: 20px; border-radius: 10px; cursor: pointer; box-shadow: var(--shadow);">
                    <h4 style="color: var(--secondary-color);">Modèles de Projets</h4>
                    <p style="color: #666; font-size: 0.9rem;">Templates et exemples de livrables</p>
                    <span style="color: var(--accent-color); font-weight: bold;">→ Télécharger</span>
                </div>
            </div>
        </div>
        
        <!-- Documents d'Onboarding -->
        <div class="resource-category" style="margin: 30px 0;">
            <h3 style="color: var(--primary-color); margin-bottom: 20px;">📋 ${translations[currentLanguage]['onboarding-docs']}</h3>
            <div class="resources-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                <div class="resource-card" onclick="openInternalResource('welcome-guide')" style="background: white; padding: 20px; border-radius: 10px; cursor: pointer; box-shadow: var(--shadow);">
                    <h4 style="color: var(--secondary-color);">Guide de Bienvenue</h4>
                    <p style="color: #666; font-size: 0.9rem;">Tout ce que vous devez savoir pour vos premiers jours</p>
                    <span style="color: var(--accent-color); font-weight: bold;">→ Consulter</span>
                </div>
                <div class="resource-card" onclick="openInternalResource('org-chart')" style="background: white; padding: 20px; border-radius: 10px; cursor: pointer; box-shadow: var(--shadow);">
                    <h4 style="color: var(--secondary-color);">Organigramme</h4>
                    <p style="color: #666; font-size: 0.9rem;">Structure de l'entreprise et équipes</p>
                    <span style="color: var(--accent-color); font-weight: bold;">→ Voir</span>
                </div>
                <div class="resource-card" onclick="openInternalResource('tools-access')" style="background: white; padding: 20px; border-radius: 10px; cursor: pointer; box-shadow: var(--shadow);">
                    <h4 style="color: var(--secondary-color);">Accès aux Outils</h4>
                    <p style="color: #666; font-size: 0.9rem;">Slack, Email, Intranet, etc.</p>
                    <span style="color: var(--accent-color); font-weight: bold;">→ Configurer</span>
                </div>
            </div>
        </div>
        
        <!-- Contacts Importants -->
        <div class="resource-category" style="margin: 30px 0;">
            <h3 style="color: var(--primary-color); margin-bottom: 20px;">👥 Contacts Clés</h3>
            <div class="contacts-grid" style="background: white; padding: 20px; border-radius: 10px; box-shadow: var(--shadow);">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                    <div style="padding: 15px; background: var(--background-color); border-radius: 8px;">
                        <h4 style="color: var(--secondary-color);">👤 Votre Manager</h4>
                        <p>Marie Dupont</p>
                        <p style="color: #666;">📧 marie.dupont@entreprise.com</p>
                        <p style="color: #666;">📱 +33 1 23 45 67 89</p>
                    </div>
                    <div style="padding: 15px; background: var(--background-color); border-radius: 8px;">
                        <h4 style="color: var(--secondary-color);">🤝 Buddy/Mentor</h4>
                        <p>Jean Martin</p>
                        <p style="color: #666;">📧 jean.martin@entreprise.com</p>
                        <p style="color: #666;">💬 Slack: @jmartin</p>
                    </div>
                    <div style="padding: 15px; background: var(--background-color); border-radius: 8px;">
                        <h4 style="color: var(--secondary-color);">💼 Ressources Humaines</h4>
                        <p>Service RH</p>
                        <p style="color: #666;">📧 rh@entreprise.com</p>
                        <p style="color: #666;">📍 Bureau 2.15</p>
                    </div>
                    <div style="padding: 15px; background: var(--background-color); border-radius: 8px;">
                        <h4 style="color: var(--secondary-color);">💻 Support IT</h4>
                        <p>Helpdesk</p>
                        <p style="color: #666;">📧 it-support@entreprise.com</p>
                        <p style="color: #666;">☎️ Extension: 1234</p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Programme Bien-être -->
        <div class="resource-category" style="margin: 30px 0;">
            <h3 style="color: var(--primary-color); margin-bottom: 20px;">🌟 Programme Bien-être au Travail</h3>
            <div class="wellness-resources" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                <div class="resource-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px;">
                    <h4>Salle de Sport</h4>
                    <p style="opacity: 0.9;">Accès gratuit - Bâtiment B, RDC</p>
                    <p style="opacity: 0.9;">Ouvert 7h-20h</p>
                </div>
                <div class="resource-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 10px;">
                    <h4>Espace Détente</h4>
                    <p style="opacity: 0.9;">Salle de repos - 3ème étage</p>
                    <p style="opacity: 0.9;">Méditation, sieste, lecture</p>
                </div>
                <div class="resource-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 20px; border-radius: 10px;">
                    <h4>Psychologue d'Entreprise</h4>
                    <p style="opacity: 0.9;">Consultations confidentielles</p>
                    <p style="opacity: 0.9;">Sur RDV: psy@entreprise.com</p>
                </div>
            </div>
        </div>
        
        <!-- Liens Utiles -->
        <div class="resource-category" style="margin: 30px 0;">
            <h3 style="color: var(--primary-color); margin-bottom: 20px;">🔗 Liens Rapides</h3>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px;">
                <ul style="list-style: none; padding: 0;">
                    <li style="margin: 10px 0;">
                        <a href="#" style="color: var(--secondary-color); text-decoration: none;">
                            📅 Réserver une salle de réunion
                        </a>
                    </li>
                    <li style="margin: 10px 0;">
                        <a href="#" style="color: var(--secondary-color); text-decoration: none;">
                            🍽️ Menu de la cantine
                        </a>
                    </li>
                    <li style="margin: 10px 0;">
                        <a href="#" style="color: var(--secondary-color); text-decoration: none;">
                            📝 Demande de congés
                        </a>
                    </li>
                    <li style="margin: 10px 0;">
                        <a href="#" style="color: var(--secondary-color); text-decoration: none;">
                            🎓 Plateforme de formation
                        </a>
                    </li>
                    <li style="margin: 10px 0;">
                        <a href="#" style="color: var(--secondary-color); text-decoration: none;">
                            💰 Notes de frais
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    `;
}

// Fonction pour ouvrir une ressource interne
function openInternalResource(type) {
    const resources = {
        'welcome-guide': {
            title: 'Guide de Bienvenue',
            content: `
                <h3>Bienvenue chez [Nom de l'Entreprise] !</h3>
                <div style="margin: 20px 0;">
                    <h4>Vos premiers jours</h4>
                    <ul>
                        <li>Jour 1: Tour des bureaux et rencontre avec l'équipe</li>
                        <li>Jour 2-3: Formation aux outils et processus</li>
                        <li>Semaine 1: Premières missions avec votre buddy</li>
                        <li>Mois 1: Point d'étape avec votre manager</li>
                    </ul>
                </div>
                <div style="margin: 20px 0;">
                    <h4>Horaires de travail</h4>
                    <p>Flexibles: 8h30-10h00 arrivée, 17h00-19h00 départ</p>
                    <p>Télétravail: 2 jours/semaine après période d'essai</p>
                </div>
            `
        },
        'org-chart': {
            title: 'Organigramme de l\'Entreprise',
            content: `
                <h3>Structure Organisationnelle</h3>
                <div style="text-align: center; margin: 20px 0;">
                    <p>Direction Générale</p>
                    <p>↓</p>
                    <p>Départements: Commercial | Tech | RH | Finance | Marketing</p>
                    <p>↓</p>
                    <p>Équipes spécialisées</p>
                </div>
            `
        },
        'tools-access': {
            title: 'Configuration des Outils',
            content: `
                <h3>Accès aux Outils de Travail</h3>
                <ol>
                    <li><strong>Email</strong>: prenom.nom@entreprise.com</li>
                    <li><strong>Slack</strong>: Rejoindre workspace.slack.com</li>
                    <li><strong>Intranet</strong>: intranet.entreprise.com</li>
                    <li><strong>VPN</strong>: Voir avec IT pour configuration</li>
                </ol>
            `
        }
    };
    
    const resource = resources[type];
    if (resource) {
        showAlert('info', resource.title + ' - ' + resource.content.replace(/<[^>]*>/g, '').substring(0, 100) + '...');
    }
}

// Fonction pour mettre à jour le dashboard
function updateDashboard() {
    const allCheckIns = JSON.parse(localStorage.getItem('dailyCheckIns') || '[]');
    const last30Days = allCheckIns.slice(-30);
    
    let dashboardSection = document.getElementById('dashboard-section');
    if (!dashboardSection) {
        dashboardSection = document.createElement('div');
        dashboardSection.id = 'dashboard-section';
        dashboardSection.className = 'dashboard-container';
        document.querySelector('.central-content').appendChild(dashboardSection);
    }
    
    const averageScore = last30Days.length > 0 
        ? Math.round(last30Days.reduce((sum, ci) => sum + ci.score, 0) / last30Days.length)
        : 0;
    
    const todayCheckIn = last30Days.find(ci => ci.date === new Date().toISOString().split('T')[0]);
    
    dashboardSection.innerHTML = `
        <h2>Tableau de Bord Bien-être au Travail</h2>
        
        <div class="stats-grid">
            <div class="stat-card" style="background: linear-gradient(135deg, #3498db, #27ae60);">
                <div class="stat-label">Score Moyen (30 jours)</div>
                <div class="stat-value">${averageScore}%</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${averageScore}%">${averageScore}%</div>
                </div>
            </div>
            
            <div class="stat-card" style="background: linear-gradient(135deg, #667eea, #764ba2);">
                <div class="stat-label">Check-ins Complétés</div>
                <div class="stat-value">${last30Days.length}/30</div>
            </div>
            
            <div class="stat-card" style="background: linear-gradient(135deg, #f093fb, #f5576c);">
                <div class="stat-label">Score du Jour</div>
                <div class="stat-value">${todayCheckIn ? todayCheckIn.score + '%' : 'À faire'}</div>
            </div>
            
            <div class="stat-card" style="background: linear-gradient(135deg, #4facfe, #00f2fe);">
                <div class="stat-label">Tendance</div>
                <div class="stat-value">${getTrend(last30Days)}</div>
            </div>
        </div>
        
        <div class="chart-container">
            <h3>Évolution sur 30 jours</h3>
            <div style="height: 200px; background: var(--background-color); border-radius: 10px; padding: 20px;">
                ${generateSimpleChart(last30Days)}
            </div>
        </div>
        
        <div class="insights-container" style="margin-top: 30px;">
            <h3>Insights Bien-être</h3>
            ${generateInsights(last30Days)}
        </div>
    `;
}

// Fonction pour obtenir la tendance
function getTrend(checkIns) {
    if (checkIns.length < 2) return '→ Stable';
    
    const recent = checkIns.slice(-7);
    const previous = checkIns.slice(-14, -7);
    
    if (recent.length === 0 || previous.length === 0) return '→ Stable';
    
    const recentAvg = recent.reduce((sum, ci) => sum + ci.score, 0) / recent.length;
    const previousAvg = previous.reduce((sum, ci) => sum + ci.score, 0) / previous.length;
    
    if (recentAvg > previousAvg + 5) return '↑ En hausse';
    if (recentAvg < previousAvg - 5) return '↓ En baisse';
    return '→ Stable';
}

// Fonction pour générer un graphique simple
function generateSimpleChart(checkIns) {
    if (checkIns.length === 0) {
        return '<p style="text-align: center; color: #666;">Pas encore de données. Commencez vos check-ins quotidiens !</p>';
    }
    
    const maxScore = 100;
    const chartHeight = 200;
    const last30Days = checkIns.slice(-30);
    
    return `
        <div style="position: relative; height: ${chartHeight + 50}px;">
            <!-- Lignes de grille horizontales -->
            <div style="position: absolute; width: 100%; height: ${chartHeight}px; display: flex; flex-direction: column; justify-content: space-between;">
                ${[100, 75, 50, 25, 0].map(val => `
                    <div style="border-top: 1px solid #e0e0e0; width: 100%; position: relative;">
                        <span style="position: absolute; left: -30px; top: -8px; font-size: 11px; color: #666;">${val}%</span>
                    </div>
                `).join('')}
            </div>
            
            <!-- Barres du graphique -->
            <div style="display: flex; align-items: flex-end; justify-content: space-between; height: ${chartHeight}px; padding: 0 10px; position: relative; z-index: 1;">
                ${last30Days.map(ci => {
                    const height = (ci.score / maxScore) * chartHeight;
                    const color = ci.score >= 70 ? '#27ae60' : ci.score >= 40 ? '#f39c12' : '#e74c3c';
                    const date = new Date(ci.date);
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                    
                    return `
                        <div style="display: flex; flex-direction: column; align-items: center; flex: 1; margin: 0 1px;">
                            <div style="
                                width: 100%;
                                max-width: 20px;
                                height: ${height}px;
                                background: linear-gradient(to top, ${color}, ${color}dd);
                                border-radius: 3px 3px 0 0;
                                position: relative;
                                cursor: pointer;
                                transition: all 0.3s;
                                ${isWeekend ? 'opacity: 0.5;' : ''}
                            " title="Score: ${ci.score}% - ${date.toLocaleDateString()}">
                                <span style="
                                    position: absolute;
                                    top: -20px;
                                    left: 50%;
                                    transform: translateX(-50%);
                                    font-size: 10px;
                                    font-weight: bold;
                                    color: ${color};
                                    display: none;
                                ">${ci.score}%</span>
                            </div>
                            <small style="font-size: 9px; margin-top: 5px; color: #666; ${isWeekend ? 'font-weight: bold;' : ''}">
                                ${date.getDate()}
                            </small>
                        </div>
                    `;
                }).join('')}
            </div>
            
            <!-- Légende des mois -->
            <div style="text-align: center; margin-top: 10px; font-size: 11px; color: #666;">
                ${new Date(last30Days[0]?.date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </div>
        </div>
    `;
}

// Fonction pour générer des insights
function generateInsights(checkIns) {
    if (checkIns.length === 0) {
        return '<p>Commencez vos check-ins quotidiens pour obtenir des insights personnalisés.</p>';
    }
    
    const insights = [];
    const avgScore = checkIns.reduce((sum, ci) => sum + ci.score, 0) / checkIns.length;
    
    // Analyse du stress
    const stressScores = checkIns.map(ci => ci.responses.stress || 5);
    const avgStress = stressScores.reduce((a, b) => a + b, 0) / stressScores.length;
    
    if (avgStress > 7) {
        insights.push({
            type: 'warning',
            text: '⚠️ Niveau de stress élevé détecté. Pensez à utiliser nos ressources bien-être et exercices de relaxation.'
        });
    } else if (avgStress < 3) {
        insights.push({
            type: 'success',
            text: '✨ Excellent ! Votre niveau de stress est très bas. Continuez vos bonnes pratiques.'
        });
    }
    
    // Analyse du support
    const supportScores = checkIns.map(ci => ci.responses.support || 5);
    const avgSupport = supportScores.reduce((a, b) => a + b, 0) / supportScores.length;
    
    if (avgSupport < 5) {
        insights.push({
            type: 'info',
            text: '🤝 Le soutien de l\'équipe semble faible. N\'hésitez pas à en parler à votre manager ou participer aux activités d\'équipe.'
        });
    } else if (avgSupport > 8) {
        insights.push({
            type: 'success',
            text: '💪 Excellent soutien d\'équipe ! C\'est un facteur clé de bien-être au travail.'
        });
    }
    
    // Analyse de l'énergie
    const energyScores = checkIns.map(ci => ci.responses.energy || 5);
    const avgEnergy = energyScores.reduce((a, b) => a + b, 0) / energyScores.length;
    
    if (avgEnergy < 4) {
        insights.push({
            type: 'warning',
            text: '🔋 Niveau d\'énergie faible. Assurez-vous de bien dormir et de prendre des pauses régulières.'
        });
    } else if (avgEnergy > 7) {
        insights.push({
            type: 'success',
            text: '⚡ Énergie au top ! Profitez-en pour avancer sur vos projets importants.'
        });
    }
    
    // Analyse de la charge de travail
    const workloadScores = checkIns.map(ci => ci.responses.workload || 5);
    const avgWorkload = workloadScores.reduce((a, b) => a + b, 0) / workloadScores.length;
    
    if (avgWorkload < 4) {
        insights.push({
            type: 'warning',
            text: '📊 Charge de travail difficile à gérer. Considérez la priorisation et la délégation.'
        });
    }
    
    // Analyse de satisfaction
    const satisfactionScores = checkIns.map(ci => ci.responses.satisfaction || 5);
    const avgSatisfaction = satisfactionScores.reduce((a, b) => a + b, 0) / satisfactionScores.length;
    
    if (avgSatisfaction > 7) {
        insights.push({
            type: 'success',
            text: '😊 Satisfaction élevée ! Vous êtes épanoui dans votre travail.'
        });
    } else if (avgSatisfaction < 4) {
        insights.push({
            type: 'info',
            text: '🎯 Satisfaction faible. Identifiez ce qui pourrait améliorer votre quotidien professionnel.'
        });
    }
    
    // Régularité
    const daysWithCheckIn = checkIns.length;
    if (daysWithCheckIn < 5) {
        insights.push({
            type: 'info',
            text: '📅 Pensez à faire votre check-in quotidien pour un meilleur suivi de votre bien-être.'
        });
    } else if (daysWithCheckIn >= 20) {
        insights.push({
            type: 'success',
            text: '🏆 Excellente régularité ! Vous suivez bien votre bien-être avec ' + daysWithCheckIn + ' check-ins.'
        });
    }
    
    // Tendance générale
    if (checkIns.length >= 7) {
        const recentAvg = checkIns.slice(-7).reduce((sum, ci) => sum + ci.score, 0) / 7;
        const previousAvg = checkIns.slice(-14, -7).reduce((sum, ci) => sum + ci.score, 0) / Math.min(7, checkIns.length - 7);
        
        if (recentAvg > previousAvg + 10) {
            insights.push({
                type: 'success',
                text: '📈 Amélioration notable de votre bien-être cette semaine ! (+' + Math.round(recentAvg - previousAvg) + '%)'
            });
        } else if (recentAvg < previousAvg - 10) {
            insights.push({
                type: 'warning',
                text: '📉 Baisse de bien-être détectée. Prenez soin de vous et utilisez les ressources disponibles.'
            });
        }
    }
    
    // Recommandations basées sur le jour de la semaine
    const today = new Date().getDay();
    if (today === 1) { // Lundi
        insights.push({
            type: 'info',
            text: '💙 C\'est lundi ! Commencez la semaine en douceur avec un check-in matinal.'
        });
    } else if (today === 5) { // Vendredi
        insights.push({
            type: 'info',
            text: '🎉 C\'est vendredi ! Félicitations pour cette semaine de travail accomplie.'
        });
    }
    
    // Limiter à 5 insights maximum pour ne pas surcharger
    return insights.slice(0, 5).map(insight => `
        <div class="alert alert-${insight.type}" style="margin: 10px 0; padding: 15px; border-radius: 8px;">
            ${insight.text}
        </div>
    `).join('');
}

// Fonction pour afficher une alerte
function showAlert(type, message) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    alert.style.cssText = `
        padding: 15px 20px;
        border-radius: 8px;
        margin-bottom: 20px;
        animation: slideIn 0.3s ease;
    `;
    
    const container = document.querySelector('.central-content');
    if (container) {
        container.insertBefore(alert, container.firstChild);
        setTimeout(() => alert.remove(), 5000);
    }
}

// Fonction pour afficher le calendrier
function showCalendar() {
    const calendarSection = document.getElementById('calendar-section');
    if (!calendarSection) {
        // Créer la section calendrier si elle n'existe pas
        const section = document.createElement('div');
        section.id = 'calendar-section';
        section.className = 'calendar-container';
        section.style.display = 'none';
        document.querySelector('.central-content').appendChild(section);
    }
    
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const currentDate = today.getDate();
    
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                       'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    
    // Générer des événements uniquement en semaine
    const events = [];
    for (let i = 0; i < 30; i++) {
        const eventDate = new Date(currentYear, currentMonth, currentDate + i);
        const dayOfWeek = eventDate.getDay();
        
        // Exclure samedi (6) et dimanche (0)
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            if (i === 0) events.push({ date: currentDate + i, title: '10h - Réunion d\'équipe', type: 'meeting' });
            if (i === 2) events.push({ date: currentDate + i, title: '14h - Formation sécurité', type: 'training' });
            if (i === 4) events.push({ date: currentDate + i, title: '9h - Check-in manager', type: 'checkin' });
            if (i === 8) events.push({ date: currentDate + i, title: '15h - Atelier bien-être', type: 'wellness' });
            if (i === 15) events.push({ date: currentDate + i, title: '11h - Bilan mensuel', type: 'review' });
        }
    }
    
    const calendarHTML = `
        <h2>📅 Calendrier - ${monthNames[currentMonth]} ${currentYear}</h2>
        
        <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: var(--shadow); margin-bottom: 20px;">
            <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; text-align: center;">
                <div style="font-weight: bold; color: var(--primary-color);">Lun</div>
                <div style="font-weight: bold; color: var(--primary-color);">Mar</div>
                <div style="font-weight: bold; color: var(--primary-color);">Mer</div>
                <div style="font-weight: bold; color: var(--primary-color);">Jeu</div>
                <div style="font-weight: bold; color: var(--primary-color);">Ven</div>
                <div style="font-weight: bold; color: var(--primary-color);">Sam</div>
                <div style="font-weight: bold; color: var(--primary-color);">Dim</div>
                ${generateCalendarDays(currentYear, currentMonth, currentDate, events)}
            </div>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: var(--shadow);">
            <h3 style="color: var(--primary-color); margin-bottom: 15px;">📌 Événements à venir</h3>
            <div style="display: flex; flex-direction: column; gap: 15px;">
                ${events.map(event => `
                    <div style="padding: 15px; background: var(--background-color); border-left: 4px solid ${getEventColor(event.type)}; border-radius: 5px;">
                        <div style="font-weight: bold; color: var(--primary-color);">Jour ${event.date}</div>
                        <div style="color: #666; margin-top: 5px;">${event.title}</div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 8px;">
            <p style="color: #1976d2;">
                💡 <strong>Conseil:</strong> Planifiez vos check-ins quotidiens à heure fixe pour créer une routine bien-être.
            </p>
        </div>
    `;
    
    document.getElementById('calendar-section').innerHTML = calendarHTML;
}

// Fonction pour générer les jours du calendrier
function generateCalendarDays(year, month, currentDate, events) {
    const firstDay = new Date(year, month, 1).getDay() || 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let days = '';
    
    // Jours vides avant le début du mois
    for (let i = 1; i < firstDay; i++) {
        days += '<div></div>';
    }
    
    // Jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
        const hasEvent = events.some(e => e.date === day);
        const isToday = day === currentDate;
        const style = `
            padding: 10px;
            border-radius: 5px;
            ${isToday ? 'background: var(--secondary-color); color: white; font-weight: bold;' : ''}
            ${hasEvent && !isToday ? 'background: var(--background-color); position: relative;' : ''}
        `;
        
        days += `
            <div style="${style}">
                ${day}
                ${hasEvent ? '<span style="position: absolute; top: 2px; right: 2px; width: 6px; height: 6px; background: var(--danger-color); border-radius: 50%;"></span>' : ''}
            </div>
        `;
    }
    
    return days;
}

// Fonction pour obtenir la couleur selon le type d'événement
function getEventColor(type) {
    const colors = {
        'meeting': '#3498db',
        'training': '#27ae60',
        'checkin': '#f39c12',
        'wellness': '#9b59b6',
        'review': '#e74c3c'
    };
    return colors[type] || '#95a5a6';
}

// Variables pour l'évaluation avancée
let evaluationState = {
    currentTheme: null,
    currentQuestionIndex: 0,
    responses: {},
    profile: null,
    stressLevel: 0,
    anxietyLevel: 0,
    fatigueLevel: 0,
    wellbeingLevel: 0
};

// Fonction pour initialiser l'évaluation avancée
function initializeAdvancedEvaluation() {
    const questionnaireSection = document.getElementById('questionnaire-section');
    if (!questionnaireSection) {
        const section = document.createElement('div');
        section.id = 'questionnaire-section';
        section.className = 'questionnaire-container';
        section.style.display = 'block';
        document.querySelector('.central-content').appendChild(section);
    }
    
    // Déterminer le profil métier
    const userRole = userProfile.role.toLowerCase();
    let profileType = 'general';
    
    if (userRole.includes('développeur') || userRole.includes('it') || userRole.includes('tech')) {
        profileType = 'it';
    } else if (userRole.includes('santé') || userRole.includes('médical') || userRole.includes('infirm')) {
        profileType = 'sante';
    }
    
    evaluationState.profile = profileType;
    
    // Afficher l'interface d'évaluation
    const evaluationHTML = `
        <h2>🎯 Évaluation Personnalisée - Profil ${profileType === 'it' ? 'IT' : profileType === 'sante' ? 'Santé' : 'Général'}</h2>
        
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px; margin-bottom: 30px; color: white;">
            <h3>Parcours adapté à votre métier</h3>
            <p>Cette évaluation est personnalisée selon votre profil professionnel pour mieux comprendre vos besoins spécifiques.</p>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;">
            <div class="theme-card" onclick="startThematicEvaluation('stress')" style="background: white; padding: 25px; border-radius: 10px; box-shadow: var(--shadow); cursor: pointer; transition: all 0.3s;">
                <h3 style="color: #e74c3c;">😰 Évaluation du Stress</h3>
                <p style="color: #666;">Évaluez votre niveau de stress professionnel</p>
                <div class="progress-bar" style="margin-top: 15px;">
                    <div class="progress-fill" style="width: ${evaluationState.stressLevel}%; background: #e74c3c;">${evaluationState.stressLevel}%</div>
                </div>
            </div>
            
            <div class="theme-card" onclick="startThematicEvaluation('anxiety')" style="background: white; padding: 25px; border-radius: 10px; box-shadow: var(--shadow); cursor: pointer; transition: all 0.3s;">
                <h3 style="color: #f39c12;">😟 Évaluation de l'Anxiété</h3>
                <p style="color: #666;">Mesurez votre niveau d'anxiété au travail</p>
                <div class="progress-bar" style="margin-top: 15px;">
                    <div class="progress-fill" style="width: ${evaluationState.anxietyLevel}%; background: #f39c12;">${evaluationState.anxietyLevel}%</div>
                </div>
            </div>
            
            <div class="theme-card" onclick="startThematicEvaluation('wellbeing')" style="background: white; padding: 25px; border-radius: 10px; box-shadow: var(--shadow); cursor: pointer; transition: all 0.3s;">
                <h3 style="color: #27ae60;">😊 Bien-être au Travail</h3>
                <p style="color: #666;">Évaluez votre satisfaction professionnelle</p>
                <div class="progress-bar" style="margin-top: 15px;">
                    <div class="progress-fill" style="width: ${evaluationState.wellbeingLevel}%; background: #27ae60;">${evaluationState.wellbeingLevel}%</div>
                </div>
            </div>
            
            <div class="theme-card" onclick="startThematicEvaluation('fatigue')" style="background: white; padding: 25px; border-radius: 10px; box-shadow: var(--shadow); cursor: pointer; transition: all 0.3s;">
                <h3 style="color: #9b59b6;">😴 Évaluation de la Fatigue</h3>
                <p style="color: #666;">Mesurez votre niveau de fatigue</p>
                <div class="progress-bar" style="margin-top: 15px;">
                    <div class="progress-fill" style="width: ${evaluationState.fatigueLevel}%; background: #9b59b6;">${evaluationState.fatigueLevel}%</div>
                </div>
            </div>
        </div>
        
        <div id="evaluation-content" style="display: none;">
            <!-- Le contenu de l'évaluation sera injecté ici -->
        </div>
        
        <div id="evaluation-results" style="display: none;">
            <!-- Les résultats et conseils seront affichés ici -->
        </div>
    `;
    
    document.getElementById('questionnaire-section').innerHTML = evaluationHTML;
}

// Fonction pour démarrer une évaluation thématique
function startThematicEvaluation(theme) {
    evaluationState.currentTheme = theme;
    evaluationState.currentQuestionIndex = 0;
    evaluationState.responses[theme] = [];
    
    const questions = getQuestionsForTheme(theme, evaluationState.profile);
    showEvaluationQuestion(questions[0]);
    
    // Scroll automatique vers le questionnaire
    setTimeout(() => {
        const evaluationContent = document.getElementById('evaluation-content');
        if (evaluationContent) {
            evaluationContent.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    }, 100);
}

// Fonction pour obtenir les questions selon le thème et le profil
function getQuestionsForTheme(theme, profile) {
    const questionSets = {
        stress: {
            it: [
                "Sur une échelle de 1 à 10, comment évaluez-vous la pression des deadlines ?",
                "Ressentez-vous du stress lié aux bugs en production ?",
                "Comment gérez-vous les interruptions fréquentes ?",
                "Le travail en remote augmente-t-il votre stress ?",
                "Les revues de code vous stressent-elles ?"
            ],
            sante: [
                "Comment gérez-vous le stress des urgences médicales ?",
                "La charge émotionnelle des patients vous affecte-t-elle ?",
                "Les horaires décalés impactent-ils votre stress ?",
                "Comment vivez-vous la pression de la responsabilité médicale ?",
                "Le manque de personnel augmente-t-il votre stress ?"
            ],
            general: [
                "Sur une échelle de 1 à 10, quel est votre niveau de stress actuel ?",
                "Les délais vous mettent-ils sous pression ?",
                "Comment gérez-vous les conflits au travail ?",
                "Votre charge de travail est-elle stressante ?",
                "L'équilibre vie pro/perso vous stresse-t-il ?"
            ]
        },
        anxiety: {
            it: [
                "Ressentez-vous de l'anxiété avant les présentations techniques ?",
                "L'apprentissage de nouvelles technologies vous angoisse-t-il ?",
                "Comment vivez-vous l'imposter syndrome ?",
                "Les mises en production vous rendent-elles anxieux ?",
                "L'évolution rapide du secteur vous inquiète-t-elle ?"
            ],
            sante: [
                "Ressentez-vous de l'anxiété face aux décisions critiques ?",
                "La peur de l'erreur médicale vous angoisse-t-elle ?",
                "Comment gérez-vous l'anxiété liée aux familles des patients ?",
                "Les protocoles changeants vous inquiètent-ils ?",
                "L'anxiété affecte-t-elle votre sommeil ?"
            ],
            general: [
                "Ressentez-vous de l'anxiété au travail ?",
                "Les réunions vous rendent-elles anxieux ?",
                "Comment gérez-vous l'incertitude professionnelle ?",
                "L'anxiété affecte-t-elle votre performance ?",
                "Avez-vous des inquiétudes sur votre avenir professionnel ?"
            ]
        },
        wellbeing: {
            it: [
                "Êtes-vous satisfait de votre environnement de développement ?",
                "Le télétravail améliore-t-il votre bien-être ?",
                "Avez-vous suffisamment de temps pour la veille technologique ?",
                "L'équipe technique vous soutient-elle ?",
                "Êtes-vous épanoui dans vos projets actuels ?"
            ],
            sante: [
                "Vous sentez-vous valorisé dans votre rôle médical ?",
                "L'équipe soignante est-elle solidaire ?",
                "Avez-vous accès à du soutien psychologique ?",
                "Les conditions de travail sont-elles satisfaisantes ?",
                "Trouvez-vous du sens dans votre mission ?"
            ],
            general: [
                "Êtes-vous satisfait de votre travail ?",
                "Vous sentez-vous valorisé ?",
                "L'ambiance d'équipe est-elle positive ?",
                "Avez-vous des opportunités d'évolution ?",
                "Votre travail a-t-il du sens pour vous ?"
            ]
        },
        fatigue: {
            it: [
                "La fatigue oculaire due aux écrans vous affecte-t-elle ?",
                "Les sessions de debug prolongées vous épuisent-elles ?",
                "Comment gérez-vous la fatigue mentale du code ?",
                "Le syndrome du tunnel carpien vous fatigue-t-il ?",
                "Les réunions virtuelles augmentent-elles votre fatigue ?"
            ],
            sante: [
                "Les gardes de nuit affectent-elles votre fatigue ?",
                "La station debout prolongée vous épuise-t-elle ?",
                "Comment gérez-vous la fatigue compassionnelle ?",
                "Le port des EPI augmente-t-il votre fatigue ?",
                "Les horaires irréguliers perturbent-ils votre sommeil ?"
            ],
            general: [
                "Ressentez-vous de la fatigue au travail ?",
                "Votre sommeil est-il réparateur ?",
                "La fatigue affecte-t-elle votre concentration ?",
                "Avez-vous assez de pauses dans la journée ?",
                "La fatigue impacte-t-elle votre vie personnelle ?"
            ]
        }
    };
    
    return questionSets[theme][profile] || questionSets[theme].general;
}

// Fonction pour afficher une question d'évaluation
function showEvaluationQuestion(question) {
    const evaluationContent = document.getElementById('evaluation-content');
    evaluationContent.style.display = 'block';
    
    evaluationContent.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: var(--shadow);">
            <h3 style="color: var(--primary-color); margin-bottom: 20px;">
                ${evaluationState.currentTheme === 'stress' ? '😰' : 
                  evaluationState.currentTheme === 'anxiety' ? '😟' : 
                  evaluationState.currentTheme === 'wellbeing' ? '😊' : '😴'} 
                Question ${evaluationState.currentQuestionIndex + 1}/5
            </h3>
            <p style="font-size: 1.2rem; margin-bottom: 30px;">${question}</p>
            
            <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 20px;">
                ${[1,2,3,4,5,6,7,8,9,10].map(num => `
                    <button onclick="answerEvaluation(${num})" style="
                        padding: 20px;
                        border: 2px solid ${num <= 3 ? '#e74c3c' : num <= 6 ? '#f39c12' : '#27ae60'};
                        background: white;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 1.2rem;
                        font-weight: bold;
                        color: ${num <= 3 ? '#e74c3c' : num <= 6 ? '#f39c12' : '#27ae60'};
                        transition: all 0.3s;
                    " onmouseover="this.style.background='${num <= 3 ? '#ffe5e5' : num <= 6 ? '#fff3e0' : '#e8f5e9'}'"
                       onmouseout="this.style.background='white'">
                        ${num}
                    </button>
                `).join('')}
            </div>
            
            <div style="display: flex; justify-content: space-between; color: #666;">
                <span>Pas du tout</span>
                <span>Moyennement</span>
                <span>Extrêmement</span>
            </div>
        </div>
    `;
}

// Fonction pour répondre à une question d'évaluation
function answerEvaluation(value) {
    const theme = evaluationState.currentTheme;
    evaluationState.responses[theme].push(value);
    evaluationState.currentQuestionIndex++;
    
    const questions = getQuestionsForTheme(theme, evaluationState.profile);
    
    if (evaluationState.currentQuestionIndex < questions.length) {
        showEvaluationQuestion(questions[evaluationState.currentQuestionIndex]);
    } else {
        completeThematicEvaluation();
    }
}

// Fonction pour compléter une évaluation thématique
function completeThematicEvaluation() {
    const theme = evaluationState.currentTheme;
    const responses = evaluationState.responses[theme];
    const average = responses.reduce((a, b) => a + b, 0) / responses.length;
    const score = Math.round(average * 10);
    
    // Mettre à jour les niveaux
    switch(theme) {
        case 'stress':
            evaluationState.stressLevel = score;
            break;
        case 'anxiety':
            evaluationState.anxietyLevel = score;
            break;
        case 'wellbeing':
            evaluationState.wellbeingLevel = 100 - score; // Inversé pour le bien-être
            break;
        case 'fatigue':
            evaluationState.fatigueLevel = score;
            break;
    }
    
    // Vérifier les seuils critiques et générer des alertes si nécessaire
    checkCriticalThresholds(theme, score);
    
    // Afficher les conseils personnalisés
    showPersonalizedAdvice(theme, score);
}

// Fonction pour vérifier les seuils critiques
function checkCriticalThresholds(theme, score) {
    const criticalThreshold = 70;
    
    if ((theme === 'stress' || theme === 'anxiety' || theme === 'fatigue') && score >= criticalThreshold) {
        generateConfidentialAlert(theme, score);
    } else if (theme === 'wellbeing' && score <= 30) {
        generateConfidentialAlert(theme, score);
    }
}

// Fonction pour générer une alerte confidentielle
function generateConfidentialAlert(theme, score) {
    const alert = {
        timestamp: new Date().toISOString(),
        department: 'Service IT', // Anonymisé - seulement le service
        theme: theme,
        severity: score >= 80 ? 'critique' : 'élevé',
        message: `Niveau ${theme} préoccupant détecté dans le ${userProfile.role.includes('IT') ? 'Service IT' : 'Service Général'}`
    };
    
    // Sauvegarder l'alerte (anonymisée)
    let alerts = JSON.parse(localStorage.getItem('anonymousAlerts') || '[]');
    alerts.push(alert);
    localStorage.setItem('anonymousAlerts', JSON.stringify(alerts));
    
    // Notification discrète à l'utilisateur
    showAlert('warning', 'Nous avons détecté un niveau préoccupant. Des ressources d\'aide sont disponibles dans la section Conseils.');
}

// Fonction pour afficher les conseils personnalisés
function showPersonalizedAdvice(theme, score) {
    const evaluationResults = document.getElementById('evaluation-results');
    evaluationResults.style.display = 'block';
    
    const advice = getPersonalizedAdvice(theme, score, evaluationState.profile);
    
    evaluationResults.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: var(--shadow); margin-top: 20px;">
            <h3 style="color: var(--primary-color); margin-bottom: 20px;">
                📋 Résultats et Conseils Personnalisés
            </h3>
            
            <div style="padding: 20px; background: ${score >= 70 ? '#ffe5e5' : score >= 40 ? '#fff3e0' : '#e8f5e9'}; border-radius: 10px; margin-bottom: 20px;">
                <h4>Score ${theme === 'stress' ? 'de Stress' : theme === 'anxiety' ? 'd\'Anxiété' : theme === 'wellbeing' ? 'de Bien-être' : 'de Fatigue'}: ${score}%</h4>
                <p>${score >= 70 ? '⚠️ Niveau préoccupant' : score >= 40 ? '⚡ Niveau modéré' : '✅ Niveau satisfaisant'}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h4 style="color: var(--secondary-color);">💡 Conseils Adaptés à votre Profil ${evaluationState.profile === 'it' ? 'IT' : evaluationState.profile === 'sante' ? 'Santé' : 'Général'}</h4>
                <ul style="line-height: 2;">
                    ${advice.specific.map(a => `<li>${a}</li>`).join('')}
                </ul>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h4 style="color: var(--secondary-color);">🎯 Exercices Recommandés</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                    ${advice.exercises.map(ex => `
                        <div style="padding: 15px; background: var(--background-color); border-radius: 8px; cursor: pointer;" onclick="startExercise('${ex.type}')">
                            <strong>${ex.name}</strong>
                            <p style="color: #666; font-size: 0.9rem; margin-top: 5px;">${ex.description}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h4 style="color: var(--secondary-color);">📚 Ressources Recommandées</h4>
                <ul>
                    ${advice.resources.map(r => `<li><a href="#" style="color: var(--secondary-color);">${r}</a></li>`).join('')}
                </ul>
            </div>
            
            <button onclick="initializeAdvancedEvaluation()" class="btn btn-primary" style="width: 100%;">
                Refaire une Évaluation
            </button>
        </div>
    `;
    
    // Masquer le contenu de l'évaluation
    document.getElementById('evaluation-content').style.display = 'none';
}

// Fonction pour obtenir des conseils personnalisés
function getPersonalizedAdvice(theme, score, profile) {
    const adviceDatabase = {
        stress: {
            it: {
                high: {
                    specific: [
                        "Utilisez la technique Pomodoro pour gérer vos sessions de code",
                        "Configurez des heures de 'focus time' sans interruptions",
                        "Automatisez les tâches répétitives avec des scripts",
                        "Pratiquez le pair programming pour partager la charge mentale"
                    ],
                    exercises: [
                        {type: 'eyes', name: 'Règle 20-20-20', description: 'Toutes les 20 min, regardez à 20 pieds pendant 20 sec'},
                        {type: 'breathing', name: 'Respiration 4-7-8', description: 'Technique de relaxation rapide'},
                        {type: 'stretching', name: 'Étirements cervicaux', description: 'Soulagez les tensions du cou'}
                    ],
                    resources: [
                        "Formation: Gestion du stress en environnement Agile",
                        "Application: Headspace for Work",
                        "Webinar: Burnout prevention in Tech"
                    ]
                },
                moderate: {
                    specific: [
                        "Planifiez des pauses régulières entre les sessions de debug",
                        "Utilisez des outils de gestion de temps comme RescueTime",
                        "Participez aux stand-ups pour partager vos blocages"
                    ],
                    exercises: [
                        {type: 'wrists', name: 'Exercices poignets', description: 'Prévenez le syndrome du canal carpien'},
                        {type: 'breathing', name: 'Cohérence cardiaque', description: '5 min de respiration guidée'}
                    ],
                    resources: [
                        "Guide: Work-Life Balance for Developers",
                        "Slack Channel: #wellbeing-tech"
                    ]
                }
            },
            sante: {
                high: {
                    specific: [
                        "Organisez des débriefings après les situations difficiles",
                        "Utilisez les protocoles de gestion du stress post-traumatique",
                        "Planifiez des rotations pour éviter l'épuisement",
                        "Accédez au soutien psychologique de l'établissement"
                    ],
                    exercises: [
                        {type: 'breathing', name: 'Respiration carrée', description: 'Technique utilisée par les urgentistes'},
                        {type: 'stretching', name: 'Étirements debout', description: 'Soulagez les jambes et le dos'}
                    ],
                    resources: [
                        "Cellule d'écoute psychologique 24/7",
                        "Formation: Gestion du stress en milieu hospitalier",
                        "Groupe de parole hebdomadaire"
                    ]
                }
            },
            general: {
                high: {
                    specific: [
                        "Identifiez vos principaux facteurs de stress",
                        "Établissez des limites claires entre vie pro et perso",
                        "Pratiquez la délégation quand possible",
                        "Communiquez ouvertement avec votre manager"
                    ],
                    exercises: [
                        {type: 'breathing', name: 'Respiration profonde', description: 'Réduisez le stress en 3 minutes'},
                        {type: 'stretching', name: 'Étirements complets', description: 'Relâchez les tensions'}
                    ],
                    resources: [
                        "Service RH: Consultation confidentielle",
                        "Programme d'aide aux employés (PAE)",
                        "Ateliers mensuels de gestion du stress"
                    ]
                }
            }
        }
    };
    
    const level = score >= 70 ? 'high' : 'moderate';
    const defaultAdvice = adviceDatabase.stress.general[level] || adviceDatabase.stress.general.high;
    
    return adviceDatabase[theme]?.[profile]?.[level] || defaultAdvice;
}

// Fonction pour afficher les paramètres
function showSettings() {
    const settingsSection = document.getElementById('settings-section');
    if (!settingsSection) {
        const section = document.createElement('div');
        section.id = 'settings-section';
        section.className = 'settings-container';
        section.style.display = 'none';
        document.querySelector('.central-content').appendChild(section);
    }
    
    const settingsHTML = `
        <h2>⚙️ Paramètres</h2>
        
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: var(--shadow); margin-bottom: 20px;">
            <h3 style="color: var(--primary-color); margin-bottom: 20px;">👤 Profil Personnel</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #666;">Nom</label>
                    <input type="text" value="${userProfile.name}" style="width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 5px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #666;">Fonction</label>
                    <input type="text" value="${userProfile.role}" style="width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 5px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #666;">Email</label>
                    <input type="email" value="jean.dupont@entreprise.com" style="width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 5px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #666;">Département</label>
                    <select style="width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 5px;">
                        <option>IT / Développement</option>
                        <option>Santé</option>
                        <option>RH</option>
                        <option>Finance</option>
                        <option>Marketing</option>
                    </select>
                </div>
            </div>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: var(--shadow); margin-bottom: 20px;">
            <h3 style="color: var(--primary-color); margin-bottom: 20px;">🔔 Notifications</h3>
            <div style="display: flex; flex-direction: column; gap: 15px;">
                <label style="display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox" checked>
                    <span>Rappel quotidien pour le check-in (9h00)</span>
                </label>
                <label style="display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox" checked>
                    <span>Notifications d'exercices (toutes les 2 heures)</span>
                </label>
                <label style="display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox">
                    <span>Alertes bien-être hebdomadaires</span>
                </label>
                <label style="display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox" checked>
                    <span>Rappels d'événements calendrier</span>
                </label>
            </div>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: var(--shadow); margin-bottom: 20px;">
            <h3 style="color: var(--primary-color); margin-bottom: 20px;">🎨 Préférences d'Affichage</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #666;">Langue</label>
                    <select style="width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 5px;">
                        <option>Français</option>
                        <option>English</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #666;">Thème</label>
                    <select style="width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 5px;">
                        <option>Clair</option>
                        <option>Sombre</option>
                        <option>Automatique</option>
                    </select>
                </div>
            </div>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: var(--shadow); margin-bottom: 20px;">
            <h3 style="color: var(--primary-color); margin-bottom: 20px;">🔒 Confidentialité</h3>
            <div style="display: flex; flex-direction: column; gap: 15px;">
                <label style="display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox" checked>
                    <span>Partager mes statistiques anonymisées avec RH</span>
                </label>
                <label style="display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox">
                    <span>Autoriser les alertes automatiques au manager</span>
                </label>
                <label style="display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox" checked>
                    <span>Conserver l'historique de mes évaluations</span>
                </label>
            </div>
            <button onclick="showAlert('info', 'Vos données ont été exportées')" class="btn btn-primary" style="margin-top: 20px;">
                📥 Exporter mes données
            </button>
            <button onclick="showAlert('warning', 'Cette action est irréversible')" class="btn" style="margin-top: 10px; background: var(--danger-color); color: white;">
                🗑️ Supprimer toutes mes données
            </button>
        </div>
        
        <div style="display: flex; gap: 10px;">
            <button onclick="showAlert('success', 'Paramètres sauvegardés avec succès')" class="btn btn-primary" style="flex: 1;">
                💾 Sauvegarder les modifications
            </button>
            <button onclick="showSection('welcome')" class="btn" style="flex: 1; background: #e0e0e0; color: #333;">
                ❌ Annuler
            </button>
        </div>
    `;
    
    document.getElementById('settings-section').innerHTML = settingsHTML;
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // Charger la langue préférée
    const savedLang = localStorage.getItem('preferredLanguage') || 'fr';
    if (savedLang !== 'fr') {
        setLanguage(savedLang);
    }
    
    // Initialiser avec la page d'accueil visible
    showSection('welcome');
    
    // Vérifier si un check-in a déjà été fait aujourd'hui
    const allCheckIns = JSON.parse(localStorage.getItem('dailyCheckIns') || '[]');
    const todayCheckIn = allCheckIns.find(ci => ci.date === new Date().toISOString().split('T')[0]);
    
    if (!todayCheckIn) {
        // Afficher une notification pour faire le check-in
        setTimeout(() => {
            showAlert('info', 'N\'oubliez pas votre check-in quotidien pour suivre votre bien-être !');
        }, 2000);
    }
});

// Fonction pour envoyer un message au chat
async function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Ajouter le message de l'utilisateur
    addMessageToChat('user', message);
    input.value = '';
    
    // Afficher le loader
    const loading = document.getElementById('chat-loading');
    if (loading) loading.style.display = 'inline-block';
    
    try {
        // Récupérer l'historique des messages pour le contexte
        const chatMessages = document.getElementById('chat-messages');
        const messageElements = chatMessages.querySelectorAll('.message');
        const history = [];
        
        // Prendre les 6 derniers messages pour le contexte
        const recentMessages = Array.from(messageElements).slice(-6);
        recentMessages.forEach(msgEl => {
            const isUser = msgEl.classList.contains('user');
            const content = msgEl.querySelector('.message-content').textContent.trim();
            if (content && !content.includes('Commencer le Check-in')) {
                history.push({
                    role: isUser ? 'user' : 'assistant',
                    content: content
                });
            }
        });
        
        // Appel à notre backend qui utilise l'API Blackbox
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                language: currentLanguage,
                history: history
            })
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success && data.response) {
            addMessageToChat('bot', data.response);
        } else {
            throw new Error('Réponse invalide du serveur');
        }
        
    } catch (error) {
        console.error('Erreur chat:', error);
        const errorMessage = currentLanguage === 'fr' 
            ? "Je suis désolé, je rencontre une difficulté technique. Pouvez-vous reformuler votre question ?"
            : "I'm sorry, I'm experiencing a technical difficulty. Could you rephrase your question?";
        addMessageToChat('bot', errorMessage);
    } finally {
        if (loading) loading.style.display = 'none';
    }
}

// Fonction pour gérer l'envoi avec la touche Entrée
function handleChatKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// Export des fonctions pour utilisation globale
window.setLanguage = setLanguage;
window.toggleMenu = toggleMenu;
window.showSection = showSection;
window.startDailyCheckIn = startDailyCheckIn;
window.answerDailyQuestion = answerDailyQuestion;
window.showAlert = showAlert;
window.openInternalResource = openInternalResource;
window.completeActivity = completeActivity;
window.startExercise = startExercise;
window.completeExercise = completeExercise;
window.startThematicEvaluation = startThematicEvaluation;
window.answerEvaluation = answerEvaluation;
window.initializeAdvancedEvaluation = initializeAdvancedEvaluation;
window.sendMessage = sendMessage;
window.handleChatKeyPress = handleChatKeyPress;
window.sendPersonalizedAdviceRequest = sendPersonalizedAdviceRequest;

// Fonction pour mettre à jour le profil utilisateur sur la page d'accueil
function updateUserProfile() {
    const welcomeSection = document.getElementById('welcome-section');
    if (!welcomeSection) return;
    
    const daysInCompany = getDaysInCompany();
    const initials = userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase();
    
    // Mettre à jour les éléments du profil s'ils existent
    const profileElements = welcomeSection.querySelectorAll('[data-profile]');
    profileElements.forEach(el => {
        const field = el.getAttribute('data-profile');
        switch(field) {
            case 'initials':
                el.textContent = initials;
                break;
            case 'name':
                el.textContent = userProfile.name;
                break;
            case 'role':
                el.textContent = userProfile.role;
                break;
            case 'days':
                el.textContent = `📅 Jour ${daysInCompany} dans l'entreprise`;
                break;
            case 'level':
                el.textContent = `🏆 Niveau: ${userProfile.level}`;
                break;
        }
    });
    
    // Mettre à jour les points
    updatePointsDisplay();
}

// Initialisation complète au chargement
document.addEventListener('DOMContentLoaded', function() {
    // Charger la langue préférée
    const savedLang = localStorage.getItem('preferredLanguage') || 'fr';
    if (savedLang !== 'fr') {
        setLanguage(savedLang);
    }
    
    // Mettre à jour le profil utilisateur
    updateUserProfile();
    
    // Initialiser avec la page d'accueil visible
    showSection('welcome');
    
    // Ajouter l'événement pour la touche Entrée dans le chat
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.addEventListener('keypress', handleChatKeyPress);
    }
    
    // Vérifier si un check-in a déjà été fait aujourd'hui
    const allCheckIns = JSON.parse(localStorage.getItem('dailyCheckIns') || '[]');
    const todayCheckIn = allCheckIns.find(ci => ci.date === new Date().toISOString().split('T')[0]);
    
    if (!todayCheckIn) {
        // Afficher une notification pour faire le check-in
        setTimeout(() => {
            showAlert('info', 'N\'oubliez pas votre check-in quotidien pour suivre votre bien-être !');
        }, 2000);
    }
});
