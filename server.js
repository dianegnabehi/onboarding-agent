const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Stockage en mémoire (pour une version simple)
let users = {};
let evaluations = [];
let appointments = [];

// Route principale
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API Endpoints

// Sauvegarder une évaluation
app.post('/api/evaluations', (req, res) => {
    const evaluation = {
        id: Date.now().toString(),
        userId: req.body.userId || 'anonymous',
        responses: req.body.responses,
        score: req.body.score,
        date: new Date().toISOString(),
        recommendations: generateRecommendations(req.body.score, req.body.responses)
    };
    
    evaluations.push(evaluation);
    
    res.json({
        success: true,
        evaluation: evaluation
    });
});

// Récupérer les évaluations d'un utilisateur
app.get('/api/evaluations/:userId', (req, res) => {
    const userEvaluations = evaluations.filter(e => e.userId === req.params.userId);
    res.json(userEvaluations);
});

// Planifier un rendez-vous
app.post('/api/appointments', (req, res) => {
    const appointment = {
        id: Date.now().toString(),
        userId: req.body.userId || 'anonymous',
        type: req.body.type,
        date: req.body.date,
        time: req.body.time,
        description: req.body.description,
        status: 'scheduled',
        createdAt: new Date().toISOString()
    };
    
    appointments.push(appointment);
    
    res.json({
        success: true,
        appointment: appointment
    });
});

// Récupérer les rendez-vous d'un utilisateur
app.get('/api/appointments/:userId', (req, res) => {
    const userAppointments = appointments.filter(a => a.userId === req.params.userId);
    res.json(userAppointments);
});

// Endpoint pour l'IA (proxy vers Blackbox AI)
app.post('/api/chat', async (req, res) => {
    const { message, language, history, isPersonalized, checkInContext } = req.body;
    
    try {
        console.log('🤖 Appel BlackBox AI avec message:', message.substring(0, 100) + '...');
        
        // Construire un système prompt avancé pour le coaching bien-être
        let systemPrompt = buildAdvancedWellnessPrompt(language, isPersonalized, checkInContext);
        
        // Construire l'historique des messages pour le contexte
        const messages = [
            { role: 'system', content: systemPrompt }
        ];
        
        // Ajouter l'historique récent pour le contexte (max 4 messages)
        if (history && history.length > 0) {
            const recentHistory = history.slice(-4);
            messages.push(...recentHistory);
        }
        
        // Ajouter le message actuel
        messages.push({ role: 'user', content: message });
        
        let botResponse = null;
        
        // 1. Essayer BlackBox AI avec le format correct
        try {
            console.log('📡 Tentative BlackBox AI...');
            const blackboxResponse = await fetch('https://api.blackbox.ai/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer sk-Oqoog7SlO013R2GnSXEMew'
                },
                body: JSON.stringify({
                    model: 'blackboxai/openai/gpt-4',
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 500,
                    top_p: 0.9
                })
            });
            
            if (blackboxResponse.ok) {
                const data = await blackboxResponse.json();
                botResponse = data.choices?.[0]?.message?.content || data.response || data.message;
                console.log('✅ Réponse BlackBox AI obtenue avec succès');
            } else {
                console.log('❌ BlackBox AI erreur HTTP:', blackboxResponse.status);
                const errorText = await blackboxResponse.text();
                console.log('Détails erreur:', errorText);
            }
        } catch (error) {
            console.log('❌ Erreur BlackBox AI:', error.message);
        }
        
        // 2. Si BlackBox échoue, utiliser notre système de réponse intelligent
        if (!botResponse) {
            console.log('🧠 Génération de réponse intelligente...');
            botResponse = generateIntelligentWellnessResponse(message, checkInContext, language, history);
        }
        
        // 3. Validation et amélioration de la réponse
        botResponse = enhanceWellnessResponse(botResponse, checkInContext, language);
        
        res.json({
            success: true,
            response: botResponse,
            source: botResponse.includes('🧠') ? 'intelligent_fallback' : 'blackbox_ai'
        });
        
    } catch (error) {
        console.error('❌ Erreur générale API chat:', error);
        
        // Réponse de secours avec gestion d'erreur élégante
        const fallbackResponse = generateEmergencyWellnessResponse(language, error.message);
        res.json({
            success: true,
            response: fallbackResponse,
            source: 'emergency_fallback'
        });
    }
});

// Fonction pour construire un prompt système avancé pour le bien-être
function buildAdvancedWellnessPrompt(language, isPersonalized, checkInContext) {
    const basePrompt = language === 'fr' 
        ? `Tu es un coach en bien-être mental professionnel spécialisé dans l'accompagnement en milieu de travail. 

EXPERTISE:
- Psychologie positive et techniques de gestion du stress
- Coaching en développement personnel et professionnel  
- Méthodes validées scientifiquement (TCC, mindfulness, etc.)
- Prévention du burnout et promotion de la résilience

STYLE DE COMMUNICATION:
- Empathique, bienveillant et sans jugement
- Réponses concises (150-300 mots maximum)
- Conseils pratiques et immédiatement applicables
- Ton professionnel mais chaleureux
- Utilise des émojis avec parcimonie pour humaniser

APPROCHE:
- Écoute active et validation des émotions
- Questions ouvertes pour approfondir la réflexion
- Techniques concrètes adaptées au contexte professionnel
- Encouragement à l'autonomie et à l'auto-efficacité

INTERDICTIONS:
- Ne jamais donner de diagnostic médical
- Ne pas remplacer un suivi psychologique professionnel
- Éviter les conseils génériques ou répétitifs
- Ne pas minimiser les difficultés exprimées`

        : `You are a professional mental wellness coach specialized in workplace support.

EXPERTISE:
- Positive psychology and stress management techniques
- Personal and professional development coaching
- Scientifically validated methods (CBT, mindfulness, etc.)
- Burnout prevention and resilience building

COMMUNICATION STYLE:
- Empathetic, caring and non-judgmental
- Concise responses (150-300 words maximum)
- Practical, immediately applicable advice
- Professional yet warm tone
- Use emojis sparingly to humanize

APPROACH:
- Active listening and emotion validation
- Open questions to deepen reflection
- Concrete techniques adapted to work context
- Encourage autonomy and self-efficacy

RESTRICTIONS:
- Never provide medical diagnosis
- Don't replace professional psychological support
- Avoid generic or repetitive advice
- Don't minimize expressed difficulties`;

    // Ajouter le contexte personnalisé si disponible
    if (isPersonalized && checkInContext) {
        const { score, responses, analysis } = checkInContext;
        
        const contextAddition = language === 'fr'
            ? `\n\nCONTEXTE UTILISATEUR ACTUEL:
- Score bien-être global: ${score}%
- Énergie: ${responses?.energy || 'N/A'}/10
- Stress: ${responses?.stress || 'N/A'}/10  
- Charge travail: ${responses?.workload || 'N/A'}/10
- Soutien équipe: ${responses?.support || 'N/A'}/10
- Satisfaction: ${responses?.satisfaction || 'N/A'}/10

${analysis?.concerns?.length > 0 ? `Préoccupations identifiées: ${analysis.concerns.join(', ')}` : ''}
${analysis?.strengths?.length > 0 ? `Points forts: ${analysis.strengths.join(', ')}` : ''}

Adapte tes conseils à ce contexte spécifique.`
            
            : `\n\nCURRENT USER CONTEXT:
- Overall wellbeing score: ${score}%
- Energy: ${responses?.energy || 'N/A'}/10
- Stress: ${responses?.stress || 'N/A'}/10
- Workload: ${responses?.workload || 'N/A'}/10
- Team support: ${responses?.support || 'N/A'}/10
- Satisfaction: ${responses?.satisfaction || 'N/A'}/10

${analysis?.concerns?.length > 0 ? `Identified concerns: ${analysis.concerns.join(', ')}` : ''}
${analysis?.strengths?.length > 0 ? `Strengths: ${analysis.strengths.join(', ')}` : ''}

Adapt your advice to this specific context.`;
        
        return basePrompt + contextAddition;
    }
    
    return basePrompt;
}

// Fonction pour générer une réponse intelligente de bien-être
function generateIntelligentWellnessResponse(message, checkInContext, language, history) {
    console.log('🧠 Génération de réponse intelligente basée sur l\'analyse...');
    
    // Analyser le message pour comprendre l'intention et l'émotion
    const analysis = analyzeUserMessage(message, language);
    const contextualInsights = checkInContext ? analyzeCheckInContext(checkInContext) : null;
    
    // Générer une réponse personnalisée basée sur l'analyse
    let response = '';
    
    // Commencer par une validation empathique
    response += generateEmpathicValidation(analysis, language);
    
    // Ajouter des conseils spécifiques
    response += generateSpecificAdvice(analysis, contextualInsights, language);
    
    // Terminer par une question ou encouragement
    response += generateEngagementClosing(analysis, language);
    
    return response;
}

// Fonction pour analyser le message utilisateur
function analyzeUserMessage(message, language) {
    const lowerMessage = message.toLowerCase();
    
    const emotionKeywords = {
        stress: ['stress', 'stressé', 'pression', 'anxieux', 'angoisse', 'tension', 'overwhelmed', 'anxious'],
        fatigue: ['fatigué', 'épuisé', 'énergie', 'crevé', 'tired', 'exhausted', 'drained', 'burnout'],
        sadness: ['triste', 'déprimé', 'moral', 'down', 'sad', 'depressed', 'low'],
        anger: ['colère', 'énervé', 'frustré', 'angry', 'frustrated', 'irritated'],
        motivation: ['motivation', 'démotivé', 'envie', 'ennui', 'motivated', 'bored', 'purpose'],
        confidence: ['confiance', 'doute', 'capable', 'confidence', 'doubt', 'imposter'],
        relationships: ['équipe', 'collègue', 'manager', 'team', 'colleague', 'boss', 'conflict'],
        workload: ['travail', 'tâches', 'deadline', 'work', 'tasks', 'busy', 'overload']
    };
    
    const detectedEmotions = [];
    const detectedTopics = [];
    
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
        const matches = keywords.filter(keyword => lowerMessage.includes(keyword));
        if (matches.length > 0) {
            detectedEmotions.push(emotion);
            detectedTopics.push(...matches);
        }
    }
    
    // Détecter l'intensité émotionnelle
    const intensityWords = ['très', 'vraiment', 'extremely', 'really', 'so', 'too', 'beaucoup'];
    const hasHighIntensity = intensityWords.some(word => lowerMessage.includes(word));
    
    return {
        emotions: detectedEmotions,
        topics: detectedTopics,
        intensity: hasHighIntensity ? 'high' : 'moderate',
        length: message.length,
        hasQuestion: message.includes('?') || lowerMessage.includes('comment') || lowerMessage.includes('how')
    };
}

// Fonction pour analyser le contexte du check-in
function analyzeCheckInContext(checkInContext) {
    if (!checkInContext || !checkInContext.responses) return null;
    
    const { score, responses } = checkInContext;
    const insights = {
        riskLevel: score < 40 ? 'high' : score < 60 ? 'moderate' : 'low',
        primaryConcerns: [],
        strengths: []
    };
    
    // Analyser chaque dimension
    if (responses.stress >= 7) insights.primaryConcerns.push('stress_high');
    if (responses.energy <= 4) insights.primaryConcerns.push('energy_low');
    if (responses.workload <= 4) insights.primaryConcerns.push('workload_difficult');
    if (responses.support <= 4) insights.primaryConcerns.push('support_low');
    if (responses.satisfaction <= 4) insights.primaryConcerns.push('satisfaction_low');
    
    // Identifier les forces
    if (responses.stress <= 3) insights.strengths.push('stress_managed');
    if (responses.energy >= 7) insights.strengths.push('energy_high');
    if (responses.support >= 7) insights.strengths.push('support_strong');
    if (responses.satisfaction >= 7) insights.strengths.push('satisfaction_high');
    
    return insights;
}

// Fonction pour générer une validation empathique
function generateEmpathicValidation(analysis, language) {
    const validations = {
        fr: {
            stress: ["Je comprends que vous traversez une période stressante. C'est tout à fait normal de ressentir cela. ", "Il est important de reconnaître ce stress que vous ressentez. "],
            fatigue: ["La fatigue que vous décrivez est un signal important de votre corps. ", "Je reconnais cette sensation d'épuisement que vous exprimez. "],
            sadness: ["Ces sentiments difficiles que vous partagez sont légitimes. ", "Il faut du courage pour exprimer ces émotions. "],
            default: ["Merci de partager votre situation avec moi. ", "Je vous écoute et comprends vos préoccupations. "]
        },
        en: {
            stress: ["I understand you're going through a stressful period. It's completely normal to feel this way. ", "It's important to acknowledge the stress you're experiencing. "],
            fatigue: ["The fatigue you're describing is an important signal from your body. ", "I recognize this feeling of exhaustion you're expressing. "],
            sadness: ["These difficult feelings you're sharing are legitimate. ", "It takes courage to express these emotions. "],
            default: ["Thank you for sharing your situation with me. ", "I hear you and understand your concerns. "]
        }
    };
    
    const langValidations = validations[language] || validations.en;
    const primaryEmotion = analysis.emotions[0] || 'default';
    const validationOptions = langValidations[primaryEmotion] || langValidations.default;
    
    return validationOptions[Math.floor(Math.random() * validationOptions.length)];
}

// Fonction pour générer des conseils spécifiques
function generateSpecificAdvice(analysis, contextualInsights, language) {
    // Cette fonction génère des conseils basés sur l'analyse du message et du contexte
    const advice = {
        fr: {
            stress: [
                "Essayez la technique de respiration 4-7-8 : inspirez 4 secondes, retenez 7 secondes, expirez 8 secondes. Répétez 3 fois pour un effet immédiat.",
                "Prenez une pause de 5 minutes toutes les heures. Même une courte marche peut réduire significativement le stress.",
                "Identifiez vos 3 principales sources de stress aujourd'hui. Laquelle pourriez-vous éliminer ou réduire dès maintenant ?"
            ],
            fatigue: [
                "Hydratez-vous immédiatement avec un grand verre d'eau. La déshydratation amplifie la fatigue.",
                "Faites 10 respirations profondes en vous concentrant sur l'expiration. Cela oxygène le cerveau.",
                "Vérifiez votre posture : redressez-vous, étirez le cou et les épaules pendant 30 secondes."
            ],
            motivation: [
                "Fixez-vous un objectif très petit pour les 30 prochaines minutes. Le succès génère la motivation.",
                "Rappelez-vous pourquoi ce travail a du sens pour vous personnellement.",
                "Changez votre environnement : travaillez depuis un autre endroit si possible."
            ]
        },
        en: {
            stress: [
                "Try the 4-7-8 breathing technique: inhale 4 seconds, hold 7 seconds, exhale 8 seconds. Repeat 3 times for immediate effect.",
                "Take a 5-minute break every hour. Even a short walk can significantly reduce stress.",
                "Identify your top 3 stress sources today. Which one could you eliminate or reduce right now?"
            ],
            fatigue: [
                "Hydrate immediately with a large glass of water. Dehydration amplifies fatigue.",
                "Take 10 deep breaths focusing on the exhale. This oxygenates the brain.",
                "Check your posture: straighten up, stretch your neck and shoulders for 30 seconds."
            ],
            motivation: [
                "Set a very small goal for the next 30 minutes. Success generates motivation.",
                "Remember why this work matters to you personally.",
                "Change your environment: work from another location if possible."
            ]
        }
    };
    
    const langAdvice = advice[language] || advice.en;
    const primaryEmotion = analysis.emotions[0] || 'stress';
    const adviceOptions = langAdvice[primaryEmotion] || langAdvice.stress;
    
    let selectedAdvice = adviceOptions[Math.floor(Math.random() * adviceOptions.length)];
    
    // Ajouter des conseils contextuels si disponible
    if (contextualInsights && contextualInsights.riskLevel === 'high') {
        const urgentNote = language === 'fr' 
            ? "\n\n⚠️ Votre score de bien-être indique que vous pourriez bénéficier d'un soutien supplémentaire. N'hésitez pas à contacter votre manager ou les ressources RH."
            : "\n\n⚠️ Your wellbeing score indicates you might benefit from additional support. Don't hesitate to contact your manager or HR resources.";
        selectedAdvice += urgentNote;
    }
    
    return "\n\n" + selectedAdvice;
}

// Fonction pour générer une conclusion engageante
function generateEngagementClosing(analysis, language) {
    const closings = {
        fr: [
            "\n\nComment vous sentez-vous par rapport à cette suggestion ? Y a-t-il un aspect particulier sur lequel vous aimeriez que nous nous concentrions ?",
            "\n\nQuelle est la première petite action que vous pourriez mettre en place dès maintenant ?",
            "\n\nAvez-vous déjà essayé des techniques similaires ? Qu'est-ce qui fonctionne le mieux pour vous habituellement ?"
        ],
        en: [
            "\n\nHow do you feel about this suggestion? Is there a particular aspect you'd like us to focus on?",
            "\n\nWhat's the first small action you could implement right now?",
            "\n\nHave you tried similar techniques before? What usually works best for you?"
        ]
    };
    
    const langClosings = closings[language] || closings.en;
    return langClosings[Math.floor(Math.random() * langClosings.length)];
}

// Fonction pour améliorer la réponse de bien-être
function enhanceWellnessResponse(response, checkInContext, language) {
    if (!response) return generateEmergencyWellnessResponse(language);
    
    // Ajouter un préfixe contextuel si nécessaire
    if (checkInContext && checkInContext.score < 40) {
        const urgentPrefix = language === 'fr' 
            ? "🤗 Je remarque que votre bien-être nécessite une attention particulière. "
            : "🤗 I notice your wellbeing needs particular attention. ";
        
        if (!response.includes('⚠️') && !response.includes('🤗')) {
            response = urgentPrefix + response;
        }
    }
    
    // S'assurer que la réponse n'est pas trop longue
    if (response.length > 800) {
        const sentences = response.split('. ');
        response = sentences.slice(0, 3).join('. ') + '.';
    }
    
    return response;
}

// Fonction pour générer une réponse d'urgence
function generateEmergencyWellnessResponse(language, errorDetails = '') {
    const responses = {
        fr: [
            "🤗 Je rencontre une difficulté technique, mais je reste là pour vous accompagner. En attendant, prenez trois respirations profondes et rappelez-vous que vous n'êtes pas seul(e). Votre bien-être est important.",
            "💙 Même si j'ai un petit problème technique, votre bien-être reste ma priorité. Prenez un moment pour vous, hydratez-vous, et n'hésitez pas à contacter votre manager ou les ressources RH si vous en ressentez le besoin.",
            "🌟 Un souci technique m'empêche de vous répondre parfaitement, mais voici un conseil universel : accordez-vous une pause de 5 minutes, sortez prendre l'air si possible, et rappelez-vous que chaque difficulté est temporaire."
        ],
        en: [
            "🤗 I'm experiencing a technical difficulty, but I'm still here to support you. In the meantime, take three deep breaths and remember you're not alone. Your wellbeing matters.",
            "💙 Even though I have a small technical issue, your wellbeing remains my priority. Take a moment for yourself, stay hydrated, and don't hesitate to contact your manager or HR resources if needed.",
            "🌟 A technical issue prevents me from responding perfectly, but here's universal advice: give yourself a 5-minute break, step outside if possible, and remember that every difficulty is temporary."
        ]
    };
    
    const langResponses = responses[language] || responses.en;
    const selectedResponse = langResponses[Math.floor(Math.random() * langResponses.length)];
    
    // Ajouter les détails d'erreur en mode debug (seulement en développement)
    if (process.env.NODE_ENV === 'development' && errorDetails) {
        return selectedResponse + `\n\n[Debug: ${errorDetails}]`;
    }
    
    return selectedResponse;
}

// Statistiques globales (pour RH/Managers)
app.get('/api/statistics', (req, res) => {
    const stats = {
        totalEvaluations: evaluations.length,
        averageWellbeingScore: calculateAverageScore(),
        stressLevels: calculateStressDistribution(),
        recentAlerts: getRecentAlerts(),
        trendsData: getTrendsData()
    };
    
    res.json(stats);
});

// Fonctions utilitaires

function generateRecommendations(score, responses) {
    const recommendations = [];
    
    if (score < 40) {
        recommendations.push({
            type: 'urgent',
            title: 'Support immédiat recommandé',
            description: 'Votre score indique que vous pourriez bénéficier d\'un soutien professionnel.',
            action: 'schedule_appointment'
        });
    }
    
    if (responses.q1 >= 4) {
        recommendations.push({
            type: 'stress',
            title: 'Gestion du stress',
            description: 'Des techniques de relaxation pourraient vous aider.',
            action: 'meditation_guide'
        });
    }
    
    if (responses.q3 <= 2) {
        recommendations.push({
            type: 'balance',
            title: 'Équilibre vie pro/perso',
            description: 'Considérez des ajustements dans votre emploi du temps.',
            action: 'time_management'
        });
    }
    
    return recommendations;
}

// Fonction pour générer une réponse dynamique basée sur l'analyse du message
function generateDynamicResponse(message, checkInContext, language) {
    const lang = language || 'fr';
    
    // Analyser le message pour comprendre l'intention
    const lowerMessage = message.toLowerCase();
    const keywords = {
        stress: ['stress', 'stressé', 'pression', 'anxieux', 'angoisse', 'tension'],
        fatigue: ['fatigué', 'épuisé', 'énergie', 'crevé', 'tired', 'exhausted'],
        motivation: ['motivation', 'démotivé', 'envie', 'ennui', 'motivated', 'bored'],
        work: ['travail', 'boulot', 'job', 'work', 'bureau', 'office'],
        team: ['équipe', 'collègue', 'manager', 'team', 'colleague', 'boss'],
        balance: ['équilibre', 'personnel', 'famille', 'temps', 'balance', 'family', 'time']
    };
    
    // Identifier le thème principal
    let mainTheme = 'general';
    let maxMatches = 0;
    
    for (const [theme, words] of Object.entries(keywords)) {
        const matches = words.filter(word => lowerMessage.includes(word)).length;
        if (matches > maxMatches) {
            maxMatches = matches;
            mainTheme = theme;
        }
    }
    
    // Générer une réponse variée et concise
    const responseVariations = getResponseVariations(mainTheme, lang);
    const randomIndex = Math.floor(Math.random() * responseVariations.length);
    let response = responseVariations[randomIndex];
    
    // Ajouter du contexte si disponible (de manière concise)
    if (checkInContext && checkInContext.score) {
        const score = checkInContext.score;
        const contextNote = getContextualNote(score, lang);
        if (contextNote) {
            response = contextNote + ' ' + response;
        }
    }
    
    return response;
}

function getResponseVariations(theme, language) {
    const variations = {
        fr: {
            stress: [
                "Essayez la respiration 4-7-8 : inspirez 4 secondes, retenez 7 secondes, expirez 8 secondes. Répétez 3 fois.",
                "Prenez une pause de 5 minutes toutes les heures. Sortez prendre l'air ou faites quelques étirements.",
                "Identifiez vos 3 principales sources de stress aujourd'hui. Laquelle pouvez-vous éliminer ou réduire ?",
                "Pratiquez la technique du 5-4-3-2-1 : nommez 5 choses que vous voyez, 4 que vous touchez, 3 que vous entendez, 2 que vous sentez, 1 que vous goûtez.",
                "Organisez vos tâches par priorité. Concentrez-vous sur une seule chose à la fois."
            ],
            fatigue: [
                "Hydratez-vous : buvez un grand verre d'eau et observez votre niveau d'énergie dans 10 minutes.",
                "Faites une marche rapide de 2-3 minutes, même à l'intérieur. Le mouvement réveille le corps.",
                "Vérifiez votre posture : redressez-vous, étirez le cou et les épaules.",
                "Prenez une collation riche en protéines : noix, yaourt grec, ou fruits avec du beurre d'amande.",
                "Exposez-vous à la lumière naturelle pendant quelques minutes si possible."
            ],
            motivation: [
                "Fixez-vous un petit objectif réalisable pour les 2 prochaines heures.",
                "Rappelez-vous pourquoi ce travail est important pour vous personnellement.",
                "Changez d'environnement : travaillez depuis un autre endroit si possible.",
                "Récompensez-vous après avoir terminé la prochaine tâche.",
                "Parlez à un collègue de ce sur quoi vous travaillez pour retrouver l'enthousiasme."
            ],
            work: [
                "Clarifiez vos priorités avec votre manager si nécessaire.",
                "Documentez vos préoccupations et proposez des solutions concrètes.",
                "Demandez du feedback sur votre travail récent.",
                "Identifiez les ressources ou formations qui pourraient vous aider.",
                "Planifiez votre journée en blocs de temps dédiés à chaque tâche."
            ],
            team: [
                "Proposez un café ou déjeuner informel avec un collègue.",
                "Participez activement à la prochaine réunion d'équipe.",
                "Offrez votre aide sur un projet où vous pourriez contribuer.",
                "Partagez une réussite récente avec l'équipe.",
                "Demandez conseil à un collègue sur un sujet professionnel."
            ],
            balance: [
                "Définissez une heure de fin de travail et respectez-la aujourd'hui.",
                "Planifiez une activité personnelle agréable pour ce soir.",
                "Éteignez les notifications professionnelles après 19h.",
                "Prenez votre pause déjeuner complète, loin de votre bureau.",
                "Déléguez ou reportez une tâche non urgente à demain."
            ],
            general: [
                "Prenez trois respirations profondes et concentrez-vous sur le moment présent.",
                "Notez une chose positive qui s'est passée aujourd'hui.",
                "Faites une pause de 2 minutes pour vous étirer.",
                "Buvez un verre d'eau et prenez un moment pour vous.",
                "Contactez quelqu'un qui vous fait du bien."
            ]
        },
        en: {
            stress: [
                "Try 4-7-8 breathing: inhale 4 seconds, hold 7 seconds, exhale 8 seconds. Repeat 3 times.",
                "Take a 5-minute break every hour. Step outside or do some stretches.",
                "Identify your top 3 stress sources today. Which one can you eliminate or reduce?",
                "Practice the 5-4-3-2-1 technique: name 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste.",
                "Organize tasks by priority. Focus on one thing at a time."
            ],
            fatigue: [
                "Hydrate: drink a large glass of water and check your energy level in 10 minutes.",
                "Take a quick 2-3 minute walk, even indoors. Movement awakens the body.",
                "Check your posture: straighten up, stretch your neck and shoulders.",
                "Have a protein-rich snack: nuts, Greek yogurt, or fruit with almond butter.",
                "Get some natural light exposure for a few minutes if possible."
            ],
            motivation: [
                "Set a small achievable goal for the next 2 hours.",
                "Remember why this work matters to you personally.",
                "Change your environment: work from another location if possible.",
                "Reward yourself after completing the next task.",
                "Talk to a colleague about what you're working on to regain enthusiasm."
            ],
            work: [
                "Clarify your priorities with your manager if needed.",
                "Document your concerns and propose concrete solutions.",
                "Ask for feedback on your recent work.",
                "Identify resources or training that could help you.",
                "Plan your day in time blocks dedicated to each task."
            ],
            team: [
                "Suggest an informal coffee or lunch with a colleague.",
                "Participate actively in the next team meeting.",
                "Offer help on a project where you could contribute.",
                "Share a recent success with the team.",
                "Ask a colleague for advice on a professional topic."
            ],
            balance: [
                "Set an end-of-work time and stick to it today.",
                "Plan an enjoyable personal activity for tonight.",
                "Turn off work notifications after 7 PM.",
                "Take your full lunch break, away from your desk.",
                "Delegate or postpone a non-urgent task until tomorrow."
            ],
            general: [
                "Take three deep breaths and focus on the present moment.",
                "Write down one positive thing that happened today.",
                "Take a 2-minute break to stretch.",
                "Drink a glass of water and take a moment for yourself.",
                "Contact someone who makes you feel good."
            ]
        }
    };
    
    return variations[language][theme] || variations[language].general;
}

function getContextualNote(score, language) {
    if (language === 'fr') {
        if (score < 40) return "Votre score est préoccupant.";
        if (score < 60) return "Votre bien-être pourrait s'améliorer.";
        if (score > 80) return "Votre score est excellent !";
        return null;
    } else {
        if (score < 40) return "Your score is concerning.";
        if (score < 60) return "Your wellbeing could improve.";
        if (score > 80) return "Your score is excellent!";
        return null;
    }
}


function calculateAverageScore() {
    if (evaluations.length === 0) return 0;
    const sum = evaluations.reduce((acc, eval) => acc + eval.score, 0);
    return Math.round(sum / evaluations.length);
}

function calculateStressDistribution() {
    const distribution = { low: 0, moderate: 0, high: 0 };
    
    evaluations.forEach(eval => {
        const stressLevel = eval.responses.q1 || 3;
        if (stressLevel <= 2) distribution.low++;
        else if (stressLevel <= 3) distribution.moderate++;
        else distribution.high++;
    });
    
    return distribution;
}

function getRecentAlerts() {
    const alerts = [];
    const recentEvals = evaluations.slice(-10);
    
    recentEvals.forEach(eval => {
        if (eval.score < 40) {
            alerts.push({
                userId: eval.userId,
                type: 'low_wellbeing',
                message: 'Score de bien-être faible détecté',
                date: eval.date,
                severity: 'high'
            });
        }
        
        if (eval.responses.q1 >= 4) {
            alerts.push({
                userId: eval.userId,
                type: 'high_stress',
                message: 'Niveau de stress élevé signalé',
                date: eval.date,
                severity: 'medium'
            });
        }
    });
    
    return alerts;
}

function getTrendsData() {
    // Simuler des données de tendance pour les 7 derniers jours
    const trends = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        trends.push({
            date: date.toISOString().split('T')[0],
            averageScore: 65 + Math.random() * 20,
            evaluationCount: Math.floor(Math.random() * 10) + 5
        });
    }
    
    return trends;
}


// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`
    ╔════════════════════════════════════════════╗
    ║                                            ║
    ║   🚀 Agent d'Onboarding Bien-être Mental  ║
    ║                                            ║
    ║   Serveur démarré sur:                    ║
    ║   http://localhost:${PORT}                    ║
    ║                                            ║
    ║   Fonctionnalités:                        ║
    ║   ✅ Chat IA intelligent                  ║
    ║   ✅ Évaluations de bien-être            ║
    ║   ✅ Dashboard personnalisé              ║
    ║   ✅ Recommandations adaptées            ║
    ║   ✅ Support multilingue (FR/EN)         ║
    ║                                            ║
    ╚════════════════════════════════════════════╝
    `);
});
