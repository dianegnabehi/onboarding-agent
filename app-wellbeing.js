// Configuration de l'API OpenAI
const API_KEY = 'YOUR_OPENAI_API_KEY';
const API_URL = 'https://api.openai.com/v1/chat/completions';

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
        'logo': 'Bien-être Pro',
        'nav-home': 'Accueil',
        'nav-chat': 'Check-in Quotidien',
        'nav-eval': 'Évaluation',
        'nav-dashboard': 'Tableau de bord',
        'nav-resources': 'Ressources Entreprise',
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
        'hr-contact': 'Contact RH'
    },
    en: {
        'logo': 'Wellness Pro',
        'nav-home': 'Home',
        'nav-chat': 'Daily Check-in',
        'nav-eval': 'Assessment',
        'nav-dashboard': 'Dashboard',
        'nav-resources': 'Company Resources',
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
        'hr-contact': 'HR Contact'
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
    }
}

// Fonction pour initialiser le check-in quotidien
function initializeDailyCheckIn() {
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
        chatMessages.innerHTML = `
            <div class="message bot">
                <div class="message-content">
                    <span>${translations[currentLanguage]['chat-welcome']}</span>
                    <button class="btn btn-primary" style="margin-top: 15px;" onclick="startDailyCheckIn()">
                        ${translations[currentLanguage]['start-checkin']}
                    </button>
                </div>
            </div>
        `;
    }
}

// Fonction pour démarrer le check-in journalier
function startDailyCheckIn() {
    currentQuestionIndex = 0;
    dailyCheckIn = {
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
        responses: {},
        score: 0,
        completed: false
    };
    
    showNextQuestion();
}

// Fonction pour afficher la prochaine question
function showNextQuestion() {
    if (currentQuestionIndex < checkInQuestions.length) {
        const question = checkInQuestions[currentQuestionIndex];
        const botMessage = `
            <div style="margin-bottom: 15px;">
                <strong>Question ${currentQuestionIndex + 1}/5</strong><br>
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
    
    // Sauvegarder dans le localStorage
    let allCheckIns = JSON.parse(localStorage.getItem('dailyCheckIns') || '[]');
    allCheckIns.push(dailyCheckIn);
    localStorage.setItem('dailyCheckIns', JSON.stringify(allCheckIns));
    
    // Afficher le résultat
    const resultMessage = `
        <div style="padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px;">
            <h3 style="margin-bottom: 15px;">✨ Check-in Complété!</h3>
            <div style="font-size: 2rem; margin: 20px 0;">
                Score du jour: <strong>${dailyCheckIn.score}%</strong>
            </div>
            <div style="margin-top: 20px;">
                ${getWellbeingAdvice(dailyCheckIn.score)}
            </div>
            <button class="btn" style="background: white; color: #667eea; margin-top: 15px;" onclick="showSection('dashboard')">
                Voir mes statistiques
            </button>
        </div>
    `;
    
    addMessageToChat('bot', resultMessage, true);
}

// Fonction pour obtenir des conseils basés sur le score
function getWellbeingAdvice(score) {
    if (score >= 70) {
        return "🎉 Excellent ! Vous semblez en pleine forme aujourd'hui. Continuez ainsi !";
    } else if (score >= 50) {
        return "😊 Journée correcte. Pensez à prendre quelques pauses pour recharger vos batteries.";
    } else {
        return "🤗 Journée difficile ? N'hésitez pas à parler à votre manager ou à consulter nos ressources bien-être.";
    }
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

// Fonction pour charger les ressources d'entreprise
function loadWorkplaceResources() {
    const resourcesSection = document.getElementById('resources-section');
    if (!resourcesSection) return;
    
    resourcesSection.innerHTML = `
        <h2>${translations[currentLanguage]['resources-title']}</h2>
        
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
            <div class="stat-card">
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
    const chartHeight = 150;
    
    return `
        <div style="display: flex; align-items: flex-end; justify-content: space-around; height: ${chartHeight}px;">
            ${checkIns.slice(-10).map(ci => {
                const height = (ci.score / maxScore) * chartHeight;
                const color = ci.score >= 70 ? '#27ae60' : ci.score >= 40 ? '#f39c12' : '#e74c3c';
                return `
                    <div style="display: flex; flex-direction: column; align-items: center;">
                        <div style="
                            width: 30px;
                            height: ${height}px;
                            background: ${color};
                            border-radius: 5px 5px 0 0;
                            margin-bottom: 5px;
                        "></div>
                        <small style="font-size: 10px;">${new Date(ci.date).getDate()}/${new Date(ci.date).getMonth() + 1}</small>
                    </div>
                `;
            }).join('')}
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
            text: 'Niveau de stress élevé détecté. Pensez à utiliser nos ressources bien-être.'
        });
    }
    
    // Analyse du support
    const supportScores = checkIns.map(ci => ci.responses.support || 5);
    const avgSupport = supportScores.reduce((a, b) => a + b, 0) / supportScores.length;
    
    if (avgSupport < 5) {
        insights.push({
            type: 'info',
            text: 'Le soutien de l\'équipe semble faible. N\'hésitez pas à en parler à votre manager.'
        });
    }
    
    // Régularité
    const daysWithCheckIn = checkIns.length;
    if (daysWithCheckIn < 5) {
        insights.push({
            type: 'info',
            text: 'Pensez à faire votre check-in quotidien pour un meilleur suivi.'
        });
    } else if (daysWithCheckIn >= 20) {
        insights.push({
            type: 'success',
            text: 'Excellente régularité ! Vous suivez bien votre bien-être.'
        });
    }
    
    return insights.map(insight => `
        <div class="alert alert-${insight.type}" style="margin: 10px 0;">
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
    // Implémentation simplifiée du calendrier
    showAlert('info', 'Calendrier en cours de développement');
}

// Fonction pour afficher les paramètres
function showSettings() {
    // Implémentation simplifiée des paramètres
    showAlert('info', 'Paramètres en cours de développement');
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

// Export des fonctions pour utilisation globale
window.setLanguage = setLanguage;
window.toggleMenu = toggleMenu;
window.showSection = showSection;
window.startDailyCheckIn = startDailyCheckIn;
window.answerDailyQuestion = answerDailyQuestion;
window.showAlert = showAlert;
window.openInternalResource = openInternalResource;
