import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Activity, Clock, ChevronDown, ChevronUp, Award, 
  TrendingUp, Info, RotateCcw, 
  Zap, Heart, Sparkles, Footprints,
  Dumbbell, Gauge, BarChart3, BookOpen, CheckCircle, Brain, Target,
  Calendar as CalendarIcon, Ruler, GraduationCap,
  ShieldCheck, Layers, FlaskConical, AlertTriangle, ThumbsDown, ThumbsUp, Calendar, ArrowLeft, Shuffle, X, ExternalLink, HelpCircle, Filter, Check, ZapOff, TrendingDown, Dna, Save, Square, CheckSquare,
  Minus, Plus, Coffee, Smartphone, Share, Flame, Battery, MousePointerClick, Timer, Volume2, Move, ArrowUp, ArrowDown, ArrowRightLeft, Undo2, Trash2, RefreshCw, SkipForward, Medal
} from 'lucide-react';

// ==================================================================================
// 👇👇👇 ZONE DE CONFIGURATION UTILISATEUR 👇👇👇
const LOGO_URL = "https://i.postimg.cc/KcQDQ1z4/Capture-d-e-cran-2025-12-08-a-02-13-55.png"; 
const DONATION_URL = "https://www.buymeacoffee.com/charles.viennot";
// 👆👆👆 FIN DE LA ZONE DE CONFIGURATION 👆👆👆
// ==================================================================================

// --- HELPERS (LOGIQUE PURE) ---

const parseRestTime = (restStr) => {
    if (!restStr || restStr === '-' || restStr === '0') return 0;
    if (typeof restStr === 'string' && restStr.includes('min')) {
        const minutes = parseInt(restStr.replace(/\D/g, ''));
        return isNaN(minutes) ? 60 : minutes * 60;
    }
    if (typeof restStr === 'string' && restStr.includes('s')) {
         const seconds = parseInt(restStr.replace(/\D/g, ''));
         return isNaN(seconds) ? 30 : seconds;
    }
    const val = parseInt(restStr);
    if (!isNaN(val)) {
        return val > 10 ? val : val * 60;
    }
    return 60; 
};

const formatPace = (val) => {
    if (!val || val === Infinity || isNaN(val)) return "-:--";
    const min = Math.floor(val);
    const sec = Math.round((val - min) * 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
};

const formatGoalTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = Math.floor(minutes % 60);
    const s = Math.round((minutes - Math.floor(minutes)) * 60);
    
    if (h > 0) {
        return `${h}h ${m.toString().padStart(2, '0')}${s > 0 ? ':' + s.toString().padStart(2, '0') : ''}`;
    }
    return `${m}m ${s > 0 ? s.toString().padStart(2, '0') : ''}`;
};

const calcDist = (minutes, pacePerKm) => {
    if (!pacePerKm || pacePerKm <= 0) return "N/A";
    return (minutes / pacePerKm).toFixed(1) + " km";
};

const generateICS = (plan) => {
    // Simulation pour éviter l'erreur si alert est bloqué
    console.log("Génération ICS...");
};

// --- LOGIQUE D'ALLURES ---
const getPaceForWeek = (week, totalWeeks, goalTime, startPercent, difficultyFactor, distanceKm) => {
    // goalTime est en minutes
    const racePace = goalTime / distanceKm;
    
    const progressRatio = (week - 1) / Math.max(1, totalWeeks - 1);
    const startFactor = 1 + (startPercent / 100);
    const currentFactor = startFactor - (progressRatio * (startFactor - 1.0));
    const currentRacePace = racePace * currentFactor;
    
    let easyRatio = 1.35; 
    let thresholdRatio = 1.08;
    let intervalRatio = 0.90;

    // Adaptation physio selon la distance
    if (distanceKm === 5) {
        easyRatio = 1.45; 
        thresholdRatio = 1.15; 
        intervalRatio = 0.95; 
    } else if (distanceKm === 21.1) {
        easyRatio = 1.25;
        thresholdRatio = 1.02; 
        intervalRatio = 0.90;
    } else if (distanceKm > 40) { 
        easyRatio = 1.20; 
        thresholdRatio = 0.96; 
        intervalRatio = 0.88; 
    }

    const valEasy = currentRacePace * easyRatio;
    const valThreshold = currentRacePace * thresholdRatio;
    const valInterval = currentRacePace * intervalRatio;

    const easyLow = formatPace(valEasy);
    const easyHigh = formatPace(valEasy + 0.5);

    return {
      gap: Math.round((currentFactor - 1) * 100),
      race: formatPace(currentRacePace),
      threshold: formatPace(valThreshold),
      interval: formatPace(valInterval),
      easy: formatPace(valEasy),
      easyRange: `${easyLow} - ${easyHigh}`,
      valEasy, valThreshold, valInterval, valRace: currentRacePace
    };
};

const getRecommendedSchedule = (sessions, isHyrox = false) => {
    const scheduleData = Array(7).fill(null).map((_, i) => ({
        dayName: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"][i],
        sessions: [],
        focus: ""
    }));

    if (isHyrox) {
        // --- LOGIQUE HYROX ---
        // Priorité aux séances Hyrox, puis Force, puis Run
        const hyroxSessions = sessions.filter(s => s.category === 'hyrox');
        const strengthSessions = sessions.filter(s => s.category === 'strength');
        const runSessions = sessions.filter(s => s.category === 'run');

        // Distribution idéale Hyrox
        // Hyrox WODs: Mar, Jeu, Sam
        const hyroxDays = [1, 3, 5, 0, 2, 4, 6]; 
        hyroxSessions.forEach((s, i) => {
            const day = hyroxDays[i % 7];
            scheduleData[day].sessions.push(s);
            scheduleData[day].focus = "HYROX WOD";
        });

        // Force: Lun, Ven
        const strengthDays = [0, 4, 2, 6, 1, 3, 5];
        let strIdx = 0;
        strengthDays.forEach(day => {
            if (strIdx < strengthSessions.length && scheduleData[day].sessions.length === 0) {
                scheduleData[day].sessions.push(strengthSessions[strIdx]);
                scheduleData[day].focus = "Renfo Pur";
                strIdx++;
            }
        });

        // Run: Mer, Dim (Endurance)
        const runDays = [2, 6, 0, 4, 1, 3, 5];
        let runIdx = 0;
        runDays.forEach(day => {
            if (runIdx < runSessions.length) {
                // Si jour vide
                if (scheduleData[day].sessions.length === 0) {
                    scheduleData[day].sessions.push(runSessions[runIdx]);
                    scheduleData[day].focus = "Endurance";
                    runIdx++;
                } 
                // Bi-quotidien possible si jour de renfo pur (pas Hyrox WOD car trop intense)
                else if (scheduleData[day].sessions.length === 1 && scheduleData[day].sessions[0].category === 'strength') {
                    scheduleData[day].sessions.push(runSessions[runIdx]);
                    runIdx++;
                }
            }
        });

    } else {
        // --- LOGIQUE RUNNING CLASSIQUE ---
        const runs = sessions.filter(s => s.category === 'run');
        const gyms = sessions.filter(s => s.category === 'strength');

        // 1. Sortie Longue (Dimanche)
        const longRun = runs.find(r => r.type.includes("Sortie Longue") || r.type.includes("Endurance"));
        if (longRun) {
            scheduleData[6].sessions.push(longRun);
            scheduleData[6].focus = "Volume";
        }

        // 2. Séance Qualité (Mardi)
        const qualityRun = runs.find(r => (r.intensity === 'high' || r.intensity === 'medium') && r.id !== longRun?.id);
        if (qualityRun) {
            scheduleData[1].sessions.push(qualityRun);
            scheduleData[1].focus = "Intensité";
        }

        // 3. Muscu (Mercredi ou Vendredi)
        const heavySession = gyms.find(g => g.type.includes("Sled") || g.type.includes("Jambes") || g.type.includes("Legs"));
        const otherGyms = gyms.filter(g => g.id !== heavySession?.id);

        if (heavySession) {
            if (scheduleData[4].sessions.length === 0) {
                scheduleData[4].sessions.push(heavySession);
                scheduleData[4].focus = "Force";
            } else if (scheduleData[3].sessions.length === 0) {
                scheduleData[3].sessions.push(heavySession);
                scheduleData[3].focus = "Force";
            }
        }

        // 4. Remplissage
        let gymIdx = 0;
        const fillOrder = [0, 2, 3, 5]; 
        
        fillOrder.forEach(dayIdx => {
            if (scheduleData[dayIdx].sessions.length === 0 && gymIdx < otherGyms.length) {
                scheduleData[dayIdx].sessions.push(otherGyms[gymIdx]);
                scheduleData[dayIdx].focus = "Renfo"; 
                gymIdx++;
            }
        });

        const easyRuns = runs.filter(r => r.id !== longRun?.id && r.id !== qualityRun?.id);
        let runIdx = 0;
        [3, 5, 0, 2].forEach(dayIdx => { 
            if (runIdx < easyRuns.length) {
                 if (scheduleData[dayIdx].sessions.length === 0) {
                     scheduleData[dayIdx].sessions.push(easyRuns[runIdx]);
                     scheduleData[dayIdx].focus = "Endurance";
                     runIdx++;
                 } 
                 else if (scheduleData[dayIdx].sessions.length === 1 && scheduleData[dayIdx].sessions[0].category !== 'run') {
                     const s = scheduleData[dayIdx].sessions[0];
                     if (!s.type.includes("Jambes")) {
                         scheduleData[dayIdx].sessions.push(easyRuns[runIdx]);
                         runIdx++;
                     }
                 }
            }
        });
    }

    return scheduleData.map(day => {
        if (day.sessions.length === 0) return { day: day.dayName, activity: "Repos", focus: "Récupération", sessionIds: [] };
        const names = day.sessions.map(s => s.type).join(' + ');
        const ids = day.sessions.map(s => s.id);
        return { 
            day: day.dayName, 
            activity: names, 
            focus: day.focus || "Entraînement", 
            sessionIds: ids 
        };
    });
};

// --- DATA : PROTOCOLES ---
const RUN_PROTOCOLS = {
  steady: [
    { name: "Mise en action", sets: "10 min", reps: "Continu", rest: "-", rpe: 2, note: "Progressif", imageKeyword: "jogging", instructions: "Commencez très lentement. Laissez le corps monter en température. Respiration par le nez recommandée." },
    { name: "Corps de séance", sets: "30-40 min", reps: "Continu", rest: "-", rpe: 3, note: "Zone 2", imageKeyword: "running", instructions: "Allure de croisière. Vous devez pouvoir tenir une conversation complète sans essoufflement." },
    { name: "Lignes Droites (Option)", sets: "5", reps: "80m", rest: "Retour marché", rpe: 6, note: "Technique", imageKeyword: "sprint track", instructions: "Accélération progressive sur 80m. Focus sur la pose de pied et le redressement. Ce n'est pas un sprint max." }
  ],
  interval_short: [
    { name: "Échauffement Complet", sets: "20 min", reps: "Continu", rest: "-", rpe: 3, note: "Préparation", imageKeyword: "stretching run", instructions: "15' footing lent + 5' de gammes (talons-fesses, montées de genoux, pas chassés) pour activer l'élasticité." },
    { name: "Fractions 30/30", sets: "2 blocs", reps: "8-10 reps", rest: "2' entre blocs", rpe: 8, note: "VMA", imageKeyword: "track running", instructions: "30 sec vite (dynamique) / 30 sec trot lent. Ne partez pas au sprint, visez la régularité." },
    { name: "Retour au calme", sets: "10 min", reps: "Lent", rest: "-", rpe: 2, note: "Lactate clearance", imageKeyword: "cooling down", instructions: "Trot très lent pour faire redescendre la fréquence cardiaque et rincer les muscles." }
  ],
  interval_long: [
    { name: "Échauffement", sets: "20 min", reps: "Continu", rest: "-", rpe: 3, note: "Préparation", imageKeyword: "road running", instructions: "Footing + 3 accélérations progressives." },
    { name: "Fractions Longues", sets: "4-5", reps: "3-4 min", rest: "2 min", rpe: 8, note: "VMA Longue", imageKeyword: "fast run", instructions: "90-95% VMA. C'est dur mais tenable sur la durée." },
    { name: "Retour au calme", sets: "10 min", reps: "Lent", rest: "-", rpe: 2, note: "Cool down", imageKeyword: "sunset run", instructions: "Relâchez tout." }
  ],
  threshold: [
    { name: "Échauffement", sets: "20 min", reps: "Continu", rest: "-", rpe: 3, note: "Aérobie", imageKeyword: "road running", instructions: "Footing progressif. Finir par 2-3 accélérations sur 20 secondes pour monter le cardio." },
    { name: "Blocs au Seuil", sets: "3", reps: "8 à 10 min", rest: "2 min trot", rpe: 7, note: "Seuil Anaérobie", imageKeyword: "fast run", instructions: "Allure 'confortablement difficile'. On ne peut plus parler, mais on ne souffre pas. Concentration sur le souffle." },
    { name: "Retour au calme", sets: "10 min", reps: "Lent", rest: "-", rpe: 2, note: "Récupération", imageKeyword: "sunset run", instructions: "Relâchez totalement les épaules et les bras." }
  ],
  hills: [
    { name: "Échauffement", sets: "20 min", reps: "Continu", rest: "-", rpe: 3, note: "Préparation", imageKeyword: "trail running", instructions: "Footing sur terrain plat avant d'attaquer la pente." },
    { name: "Cote courtes", sets: "8-10", reps: "30-45 sec", rest: "Descente marchée", rpe: 9, note: "Puissance", imageKeyword: "uphill run", instructions: "Montez dynamique. Poussez fort sur les orteils, levez les genoux, aidez-vous des bras. Récupérez en descendant." },
    { name: "Retour au calme", sets: "10 min", reps: "Lent", rest: "-", rpe: 2, note: "Cool down", imageKeyword: "forest run", instructions: "Sur le plat pour dérouler les jambes." }
  ],
  long_run: [
    { name: "Première partie", sets: "1/3 temps", reps: "Lent", rest: "-", rpe: 3, note: "Économie", imageKeyword: "long run", instructions: "Départ très prudent. Économisez le glycogène. Hydratez-vous dès les 20 premières minutes." },
    { name: "Cœur de sortie", sets: "1/3 temps", reps: "Allure Endurance", rest: "-", rpe: 4, note: "Volume", imageKeyword: "marathon training", instructions: "Allure cible endurance. Fluidité, relâchement. Visualisez la course." },
    { name: "Fin de sortie", sets: "1/3 temps", reps: "Libre", rest: "-", rpe: 5, note: "Mental", imageKeyword: "tired runner", instructions: "Si vous vous sentez bien, accélérez légèrement (progressive finish). Sinon, maintenez l'allure." }
  ],
  recovery: [
    { name: "Footing", sets: "30-45 min", reps: "Continu", rest: "-", rpe: 2, note: "Récupération", imageKeyword: "jogging morning", instructions: "Aucun objectif d'allure. Courez 'au feeling', très lentement. C'est un massage pour les jambes." }
  ]
};

const STRENGTH_PROTOCOLS = {
  force: {
    legs: [
      { name: "Back Squat", sets: 5, reps: "3-5", rest: "3-4 min", rpe: 9, note: "Explosif à la montée", imageKeyword: "squat", instructions: "Barre sur les trapèzes, pieds largeur épaules. Descendez fesses en arrière jusqu'à la parallèle. Gardez le dos droit et gainé. Poussez fort dans les talons pour remonter.", imageUrl: "" }, 
      { name: "Deadlift", sets: 3, reps: "5", rest: "3 min", rpe: 8, note: "Chaîne post.", imageKeyword: "deadlift", instructions: "Barre au sol contre les tibias. Dos plat, poitrine sortie. Poussez le sol avec les jambes avant de tirer avec le dos. Extension complète de hanche en haut.", imageUrl: "" },
      { name: "Fentes Arrière (Lourd)", sets: 3, reps: "6/jambe", rest: "2 min", rpe: 8, note: "Stabilité.", imageKeyword: "lunge", instructions: "Un grand pas en arrière. Descendez le genou arrière proche du sol. Gardez le buste droit. Poussez avec la jambe avant pour revenir.", imageUrl: "" },
      { name: "Box Jumps", sets: 5, reps: "3", rest: "2 min", rpe: 10, note: "Explosivité.", imageKeyword: "boxjump", instructions: "Saut explosif sur une boite (~60cm). Atterrissez en douceur, genoux fléchis. Extension complète des hanches en l'air.", imageUrl: "" }
    ],
    upper: [
      { name: "Weighted Pull-ups", sets: 5, reps: "5", rest: "3 min", rpe: 9, note: "Lesté.", imageKeyword: "pullup", instructions: "Tractions prise pronation. Menton au-dessus de la barre. Contrôlez la descente. Ajoutez du poids si > 8 reps faciles.", imageUrl: "" },
      { name: "Military Press", sets: 5, reps: "5", rest: "3 min", rpe: 8, note: "Force épaules.", imageKeyword: "shoulder press", instructions: "Debout, barre sur les clavicules. Développez au-dessus de la tête sans cambrer le dos (gainage fort). Verrouillez les coudes.", imageUrl: "" },
      { name: "Pendlay Row", sets: 4, reps: "6", rest: "2 min", rpe: 8, note: "Explosif.", imageKeyword: "barbell row", instructions: "Buste parallèle au sol. Tirez la barre explosivement vers le bas de la poitrine. Reposez la barre au sol à chaque rep.", imageUrl: "" },
      { name: "Core Hold (Lesté)", sets: 4, reps: "30s", rest: "90s", rpe: 8, note: "Gainage.", imageKeyword: "plank", instructions: "Planche abdominale avec un disque sur le dos. Corps aligné, fessiers serrés. Ne laissez pas le bassin tomber.", imageUrl: "" }
    ],
    full: [
      { name: "Trap Bar Deadlift", sets: 5, reps: "5", rest: "3 min", rpe: 9, note: "Force globale.", imageKeyword: "deadlift", instructions: "Variante plus sûre du deadlift. Poussez dans les jambes comme un squat inversé. Gardez les bras tendus.", imageUrl: "" },
      { name: "Bench Press", sets: 5, reps: "5", rest: "3 min", rpe: 9, note: "Poussée.", imageKeyword: "bench press", instructions: "Dos plat sur le banc, pieds ancrés au sol. Descendez la barre milieu de poitrine. Poussez explosivement.", imageUrl: "" },
      { name: "Weighted Squat", sets: 4, reps: "6", rest: "3 min", rpe: 8, note: "Jambes.", imageKeyword: "squat", instructions: "Voir Back Squat.", imageUrl: "" },
      { name: "Farmers Walk", sets: 3, reps: "20m", rest: "2 min", rpe: 9, note: "Grip & Core.", imageKeyword: "gym", instructions: "Marchez avec deux haltères très lourds. Posture parfaite, épaules en arrière. Ne pas dandiner.", imageUrl: "" }
    ]
  },
  hypertrophy: {
    push: [ 
      { name: "Développé Couché Haltères", sets: 4, reps: "10-12", rest: "90s", rpe: 8, note: "Pecs / Triceps", imageKeyword: "bench press dumbbells", instructions: "Plus d'amplitude qu'à la barre. Bien étirer les pecs en bas. Resserrer en haut sans claquer les haltères.", imageUrl: "https://i.postimg.cc/pLfpNd9Q/De-veloppe-Couche-Halte-res.png" },
      { name: "Développé Militaire", sets: 4, reps: "12", rest: "90s", rpe: 8, note: "Épaules", imageKeyword: "shoulder press", instructions: "Assis ou debout. Contrôlez la descente (3 sec) pour maximiser le temps sous tension.", imageUrl: "https://i.postimg.cc/T1vJpxSR/dev_militaire.png" },
      { name: "Extensions Triceps Poulie", sets: 4, reps: "15", rest: "45s", rpe: 9, note: "Triceps", imageKeyword: "triceps", instructions: "Coudes collés au corps. Seuls les avant-bras bougent. Contractez fort en bas.", imageUrl: "https://i.postimg.cc/prQYj7bn/Extensions_Triceps_Poulie.png" },
      { name: "Élévations Latérales", sets: 4, reps: "15-20", rest: "45s", rpe: 9, note: "Deltoïde Latéral", imageKeyword: "gym workout", instructions: "Bras légèrement fléchis. Montez les coudes, pas les mains. Imaginez verser une carafe d'eau en haut.", imageUrl: "https://i.postimg.cc/Xq6kpWh7/elevation_late_rale.png" },
      { name: "Écarté Poulie Vis-à-vis", sets: 3, reps: "15-20", rest: "45s", rpe: 9, note: "Finition Pecs.", imageKeyword: "cable crossover", instructions: "Cherchez la contraction maximale en croisant les mains. Gardez les coudes ouverts.", imageUrl: "https://i.postimg.cc/9M7Bm0Lf/ecarte_poulie.png" }
    ],
    pull: [
      { name: "Tirage Vertical", sets: 4, reps: "12", rest: "90s", rpe: 8, note: "Dos Largeur", imageKeyword: "lat pulldown", instructions: "Tirez la barre vers le haut de la poitrine. Sortez la cage thoracique. Ne balancez pas le buste.", imageUrl: "https://i.postimg.cc/Lsg7r9F4/tirage_vertical.png" },
      { name: "Rowing Barre", sets: 4, reps: "10", rest: "90s", rpe: 8, note: "Dos Épaisseur", imageKeyword: "rowing", instructions: "Buste penché à 45°. Tirez vers le nombril en resserrant les omoplates.", imageUrl: "https://i.postimg.cc/3xcVSyVw/rowing.png" },
      { name: "Curl Barre", sets: 4, reps: "12", rest: "60s", rpe: 9, note: "Biceps", imageKeyword: "bicep curl", instructions: "Coudes fixes. Ne pas utiliser le dos pour lancer la barre.", imageUrl: "https://i.postimg.cc/fT56dqvY/curl_barre.png" },
      { name: "Hammer Curls", sets: 3, reps: "12", rest: "60s", rpe: 9, note: "Brachial", imageKeyword: "hammer curl", instructions: "Prise marteau (neutre). Cible l'épaisseur du bras et l'avant-bras.", imageUrl: "https://i.postimg.cc/QdtvJg6n/Hammer_curl.png" },
      { name: "Crunchs", sets: 4, reps: "20", rest: "45s", rpe: 8, note: "Abdos", imageKeyword: "abs", instructions: "Enroulez la colonne, ne tirez pas sur la nuque. Soufflez en montant.", imageUrl: "https://i.postimg.cc/7Z6jn1Bj/crunchs.png" }
    ],
    legs: [ 
      { name: "Squat", sets: 4, reps: "10-12", rest: "3 min", rpe: 8, note: "Base Jambes", imageKeyword: "squat", instructions: "Amplitude complète. Le creux de la hanche doit passer sous le genou si la mobilité le permet.", imageUrl: "https://i.postimg.cc/ry7vNRBY/squat.png" },
      { name: "Presse à cuisses", sets: 4, reps: "12-15", rest: "2 min", rpe: 9, note: "Volume Quads", imageKeyword: "leg press", instructions: "Pieds largeur épaules. Descendez genoux vers épaules. Ne verrouillez pas les genoux en haut.", imageUrl: "https://i.postimg.cc/tgD5S8YP/legs_press.png" },
      { name: "Fentes Marchées", sets: 3, reps: "12/jambe", rest: "90s", rpe: 8, note: "Unilatéral", imageKeyword: "lunges", instructions: "Faites des pas de géant. Le genou arrière frôle le sol. Gardez le rythme.", imageUrl: "https://i.postimg.cc/FKGZWw7S/fente_marche.png" },
      { name: "Leg Curl", sets: 4, reps: "15", rest: "60s", rpe: 9, note: "Ischios", imageKeyword: "leg curl", instructions: "Contrôlez la phase retour (excentrique). Ne décollez pas les hanches du banc.", imageUrl: "https://i.postimg.cc/6Qz0jFyn/Legs_curl.png" },
      { name: "Mollets Debout", sets: 4, reps: "15", rest: "45s", rpe: 9, note: "Mollets", imageKeyword: "calves", instructions: "Extension maximale sur la pointe des pieds. Pause 1sec en haut, 1sec en bas.", imageUrl: "https://i.postimg.cc/brS9vJL1/mollet_debout.png" }
    ],
    shoulders_arms: [
      { name: "Développé Militaire", sets: 4, reps: "10-12", rest: "90s", rpe: 8, note: "Base Épaules", imageKeyword: "military press", instructions: "Barre ou haltères. Dos droit, abdos serrés. Poussez la charge au-dessus de la tête sans cambrer.", imageUrl: "" },
      { name: "Élévations Latérales Haltères", sets: 4, reps: "15-20", rest: "45s", rpe: 9, note: "Deltoïde Latéral", imageKeyword: "lateral raise", instructions: "Coude légèrement fléchi. Montez les coudes, pas les mains. Contrôlez la descente.", imageUrl: "" },
      { name: "Curl Biceps Incliné", sets: 3, reps: "12", rest: "60s", rpe: 9, note: "Biceps Chef Long", imageKeyword: "incline curl", instructions: "Banc à 45°. Laissez les bras pendre derrière le corps pour étirer le biceps. Gardez les coudes fixes.", imageUrl: "" },
      { name: "Extension Triceps Corde", sets: 4, reps: "15", rest: "45s", rpe: 9, note: "Chef Latéral Triceps", imageKeyword: "tricep pushdown", instructions: "Poulie haute. Écartez la corde en bas du mouvement. Gardez les coudes collés aux côtes.", imageUrl: "" },
      { name: "Curl Marteau", sets: 3, reps: "12", rest: "60s", rpe: 8, note: "Brachial", imageKeyword: "hammer curl", instructions: "Prise marteau (neutre). Cible l'épaisseur du bras et l'avant-bras.", imageUrl: "https://i.postimg.cc/QdtvJg6n/Hammer_curl.png" }
    ],
    chest_back: [
      { name: "Développé Incliné", sets: 4, reps: "10", rest: "90s", rpe: 8, note: "Haut Pecs", imageKeyword: "incline bench", instructions: "Banc à 30°. Cible le haut des pectoraux. Touchez la poitrine, poussez.", imageUrl: "" },
      { name: "Tirage Horizontal", sets: 4, reps: "10", rest: "90s", rpe: 8, note: "Dos", imageKeyword: "seated row", instructions: "Dos droit. Tirez la poignée au bas ventre. Sortez la poitrine.", imageUrl: "" },
      { name: "Écarté Couché", sets: 3, reps: "15", rest: "60s", rpe: 9, note: "Isolation Pecs", imageKeyword: "flyes", instructions: "Ouvrez la cage thoracique. Gardez une légère flexion des coudes.", imageUrl: "" },
      { name: "Pull-over", sets: 3, reps: "15", rest: "60s", rpe: 8, note: "Dos/Pecs", imageKeyword: "pullover", instructions: "Allongé en travers du banc. Descendez l'haltère derrière la tête bras tendus.", imageUrl: "" },
      { name: "Shrugs", sets: 4, reps: "15", rest: "45s", rpe: 8, note: "Trapèzes", imageKeyword: "shrugs", instructions: "Haussement d'épaules. Ne roulez pas les épaules, juste haut/bas.", imageUrl: "" }
    ]
  },
  street_workout: {
    push: [
        { name: "Dips", sets: 4, reps: "8-12", rest: "2 min", rpe: 8, note: "Pecs/Triceps/Épaules", imageKeyword: "dips calisthenics", instructions: "Mouvement roi de la poussée. Bras tendus au départ. Descendez à 90°.", imageUrl: "https://i.postimg.cc/cCGBrWjx/dips.png" },
        { name: "Pike Push-ups", sets: 4, reps: "8-10", rest: "90s", rpe: 8, note: "Épaules", imageKeyword: "pike pushup", instructions: "Corps en V inversé.", imageUrl: "https://i.postimg.cc/nzSktsnG/Pike-Push-ups.png" },
        { name: "Pseudo Planche Push-ups", sets: 3, reps: "8-12", rest: "90s", rpe: 9, note: "Avant d'épaule", imageKeyword: "planche lean", instructions: "Mains tournées vers l'extérieur. Penchez-vous en avant.", imageUrl: "https://i.postimg.cc/2y2fY7V0/Pseudo_Planche_Push_ups.png" },
        { name: "Pompes Diamant", sets: 3, reps: "Max", rest: "60s", rpe: 9, note: "Triceps", imageKeyword: "diamond pushups", instructions: "Mains jointes sous la poitrine.", imageUrl: "https://i.postimg.cc/P5ZTpZcL/pompe_diamant.png" }
    ],
    pull: [
        { name: "Tractions Pronation", sets: 4, reps: "8-12", rest: "2 min", rpe: 9, note: "Dos", imageKeyword: "pullups", instructions: "Prise large. Menton au-dessus de la barre.", imageUrl: "" },
        { name: "Tractions Australiennes", sets: 4, reps: "12", rest: "90s", rpe: 8, note: "Rhomboïdes", imageKeyword: "australian pullups", instructions: "Barre basse. Corps gainé.", imageUrl: "" },
        { name: "Chin-ups", sets: 3, reps: "8-10", rest: "90s", rpe: 9, note: "Biceps", imageKeyword: "chinups", instructions: "Prise supination.", imageUrl: "" },
        { name: "Skin The Cat", sets: 3, reps: "3-5", rest: "2 min", rpe: 8, note: "Mobilité", imageKeyword: "skin the cat", instructions: "Enroulez le corps. Étirement épaules.", imageUrl: "" }
    ],
    legs: [
        { name: "Pistol Squat", sets: 4, reps: "5-8/jambe", rest: "2 min", rpe: 9, note: "Unilatéral", imageKeyword: "pistol squat", instructions: "Squat sur une jambe. Assisté si besoin.", imageUrl: "" },
        { name: "Fentes Sautées", sets: 4, reps: "20", rest: "90s", rpe: 8, note: "Explosivité", imageKeyword: "jump lunges", instructions: "Alternez en l'air. Réception souple.", imageUrl: "" },
        { name: "Squat Bulgare", sets: 3, reps: "10/jambe", rest: "90s", rpe: 8, note: "Chaîne Post.", imageKeyword: "bulgarian split squat", instructions: "Pied arrière surélevé.", imageUrl: "" },
        { name: "Glute Bridge Unilatéral", sets: 3, reps: "15/jambe", rest: "60s", rpe: 8, note: "Fessiers", imageKeyword: "glute bridge", instructions: "Dos au sol, une jambe levée.", imageUrl: "" }
    ],
    skills_core: [
        { name: "Muscle-Up Transition", sets: 5, reps: "3-5", rest: "3 min", rpe: 9, note: "Technique", imageKeyword: "muscle up", instructions: "Travail du passage buste sur la barre.", imageUrl: "" },
        { name: "L-Sit Hold", sets: 4, reps: "Max sec", rest: "90s", rpe: 9, note: "Gainage", imageKeyword: "l-sit", instructions: "Jambes à l'équerre.", imageUrl: "" },
        { name: "Toes to Bar", sets: 4, reps: "8-12", rest: "90s", rpe: 8, note: "Abdos", imageKeyword: "toes to bar", instructions: "Pieds à la barre.", imageUrl: "" },
        { name: "Hollow Body", sets: 3, reps: "45s", rest: "60s", rpe: 7, note: "Gainage", imageKeyword: "hollow body", instructions: "Dos plaqué au sol.", imageUrl: "" }
    ],
    full_body: [
        { name: "Burpees", sets: 4, reps: "15", rest: "60s", rpe: 8, note: "Cardio", imageKeyword: "burpees", instructions: "Rythme constant.", imageUrl: "" },
        { name: "Tractions", sets: 4, reps: "Max-2", rest: "90s", rpe: 9, note: "Tirage", imageKeyword: "pullups", instructions: "Volume.", imageUrl: "" },
        { name: "Dips", sets: 4, reps: "Max-2", rest: "90s", rpe: 9, note: "Poussée", imageKeyword: "dips", instructions: "Volume.", imageUrl: "" },
        { name: "Squats", sets: 4, reps: "25", rest: "60s", rpe: 7, note: "Jambes", imageKeyword: "air squat", instructions: "Rapide.", imageUrl: "" }
    ]
  },
  hyrox: {
    sleds_strength: [
        { name: "Sled Push (Lourd)", sets: 5, reps: "20m", rest: "2 min", rpe: 9, note: "Puissance Poussée", imageKeyword: "sled push", instructions: "Bras tendus ou pliés, dos plat. Poussez avec les jambes. Charge lourde (simu Hyrox : 125-175kg).", imageUrl: "" },
        { name: "Sled Pull (Corde)", sets: 5, reps: "20m", rest: "2 min", rpe: 9, note: "Chaîne Postérieure", imageKeyword: "sled pull", instructions: "Tirez le traîneau avec une corde ou harnais. Reculez en gardant le dos droit et les jambes fléchies.", imageUrl: "" },
        { name: "Farmers Carry", sets: 4, reps: "40m", rest: "90s", rpe: 8, note: "Grip / Gainage", imageKeyword: "farmers walk", instructions: "Deux kettlebells lourdes (24/32kg). Marchez vite, épaules en arrière, sans dandiner.", imageUrl: "" },
        { name: "Dead Hang", sets: 3, reps: "Max sec", rest: "60s", rpe: 9, note: "Grip Endurance", imageKeyword: "dead hang", instructions: "Suspendez-vous à une barre. Relâchez tout sauf les mains.", imageUrl: "" }
    ],
    functional_endurance: [
        { name: "Wall Balls", sets: 5, reps: "20", rest: "60s", rpe: 8, note: "Cardio / Jambes", imageKeyword: "wall balls", instructions: "Squat complet, lancez la balle sur la cible (3m). Enchaînez la réception avec le squat suivant.", imageUrl: "" },
        { name: "Burpee Broad Jumps", sets: 4, reps: "10-15", rest: "90s", rpe: 9, note: "Explosivité", imageKeyword: "burpee jump", instructions: "Faites un burpee, puis un saut en longueur vers l'avant. Répétez sur la distance.", imageUrl: "" },
        { name: "Box Jumps Over", sets: 4, reps: "15", rest: "60s", rpe: 8, note: "Plyométrie", imageKeyword: "box jump", instructions: "Sautez sur la boite, passez de l'autre côté. Rythme constant.", imageUrl: "" },
        { name: "Hand Release Push-ups", sets: 4, reps: "15", rest: "60s", rpe: 7, note: "Endurance Poussée", imageKeyword: "pushups", instructions: "Décollez les mains du sol en bas du mouvement. Poussez explosif.", imageUrl: "" }
    ],
    legs_compromised: [
        { name: "Sandbag Lunges", sets: 4, reps: "20m", rest: "90s", rpe: 9, note: "Jambes sous charge", imageKeyword: "sandbag lunges", instructions: "Sac sur les épaules (10-20kg). Fentes marchées. Genou arrière touche le sol.", imageUrl: "" },
        { name: "Goblet Squats", sets: 4, reps: "15", rest: "60s", rpe: 8, note: "Volume Jambes", imageKeyword: "goblet squat", instructions: "KB contre la poitrine. Squat profond. Gardez le dos droit.", imageUrl: "" },
        { name: "Step Ups (Lestés)", sets: 3, reps: "10/jambe", rest: "60s", rpe: 8, note: "Unilatéral", imageKeyword: "step up", instructions: "Montez sur une box avec une KB ou Dumbbell. Extension complète de la hanche en haut.", imageUrl: "" },
        { name: "Calf Raises", sets: 4, reps: "20", rest: "45s", rpe: 7, note: "Mollets", imageKeyword: "calf raise", instructions: "Indispensable pour la poussée du traîneau.", imageUrl: "" }
    ],
    ergs_power: [
        { name: "Rowing Intervals", sets: 5, reps: "500m", rest: "2 min", rpe: 9, note: "Puissance Aérobie", imageKeyword: "rowing machine", instructions: "Tirage puissant. Cadence ~28-30 s/m.", imageUrl: "" },
        { name: "SkiErg (ou Band Pulls)", sets: 5, reps: "500m (ou 2min)", rest: "2 min", rpe: 9, note: "Haut du corps", imageKeyword: "skierg", instructions: "Utilisez le poids du corps pour tirer les poignées vers le bas. Flexion de hanche.", imageUrl: "" },
        { name: "Thrusters (KB/Barre)", sets: 4, reps: "12", rest: "90s", rpe: 9, note: "Transfert Wall Ball", imageKeyword: "thrusters", instructions: "Front squat + développé au dessus de la tête en un seul mouvement fluide.", imageUrl: "" },
        { name: "Kettlebell Swings", sets: 4, reps: "20", rest: "60s", rpe: 8, note: "Hanche / Cardio", imageKeyword: "kettlebell swing", instructions: "Mouvement de balancier initié par les hanches, pas les épaules.", imageUrl: "" }
    ],
    full_race_sim: [
        { name: "Run 1km (Pré-fatigue)", sets: 1, reps: "1km", rest: "0", rpe: 8, note: "Seuil", imageKeyword: "treadmill run", instructions: "Allure course cible.", imageUrl: "" },
        { name: "Sled Push", sets: 2, reps: "25m", rest: "1 min", rpe: 9, note: "Force", imageKeyword: "sled push", instructions: "Poussez lourd.", imageUrl: "" },
        { name: "Run 1km", sets: 1, reps: "1km", rest: "0", rpe: 8, note: "Seuil", imageKeyword: "running", instructions: "Reprenez le rythme immédiatement.", imageUrl: "" },
        { name: "Wall Balls", sets: 1, reps: "50", rest: "2 min", rpe: 9, note: "Mental", imageKeyword: "wall balls", instructions: "Série longue. Gérez le souffle.", imageUrl: "" }
    ]
  }
};

// --- COMPOSANT MODAL EXERCICE ---
const ExerciseModal = ({ exercise, exerciseId, category, onClose, onComplete, exerciseIndex }) => {
  const [imgError, setImgError] = useState(false);
  const [setsStatus, setSetsStatus] = useState([]);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeSetIndex, setActiveSetIndex] = useState(null);
  
  const isRun = category === 'run'; 
  const audioRef = useRef(null);
  
  useEffect(() => {
    if (exercise && !isRun) {
        let setsCount = 1;
        if (typeof exercise.sets === 'number') {
            setsCount = exercise.sets;
        } else if (typeof exercise.sets === 'string') {
            const match = exercise.sets.match(/^(\d+)/);
            if (match) setsCount = parseInt(match[1]);
        }
        setSetsStatus(new Array(setsCount).fill(false));
    }
  }, [exercise, isRun]);

  // Logique du Timer
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timer > 0) {
        interval = setInterval(() => {
            setTimer((prev) => prev - 1);
        }, 1000);
    } else if (timer === 0 && isTimerRunning) {
        setIsTimerRunning(false);
        setActiveSetIndex(null);
        if (audioRef.current) {
            audioRef.current.play().catch(e => console.log("Audio play failed", e));
        }
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer]);

  // Nouveau : Fonction Skip (Passer le repos sans son)
  const handleSkip = () => {
    setIsTimerRunning(false);
    setTimer(0);
    setActiveSetIndex(null);
  };

  const toggleSet = (index) => {
    const newStatus = [...setsStatus];
    const isChecking = !newStatus[index];
    newStatus[index] = isChecking;
    setSetsStatus(newStatus);

    if (isChecking) {
        if (index < setsStatus.length - 1) {
            const restSeconds = parseRestTime(exercise.rest);
            if (restSeconds > 0) {
                setTimer(restSeconds);
                setIsTimerRunning(true);
                setActiveSetIndex(index);
            }
        }
    } else {
        if (activeSetIndex === index) {
            setIsTimerRunning(false);
            setTimer(0);
            setActiveSetIndex(null);
        }
    }
  };

  const handleComplete = () => {
      if (isRun) {
          onComplete(exerciseId); 
      } else {
          const uniqueExerciseId = `${exerciseId}-ex-${exerciseIndex}`;
          onComplete(uniqueExerciseId, true); 
      }
      onClose();
  };

  const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!exercise) return null;

  const imageSrc = !isRun && (exercise.imageUrl && exercise.imageUrl !== "" && !imgError) 
    ? exercise.imageUrl 
    : `https://source.unsplash.com/800x600/?fitness,${exercise.imageKeyword}`;

  const objectFitClass = "object-cover opacity-90";
  const allSetsDone = !isRun && setsStatus.length > 0 && setsStatus.every(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col relative">
        <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto"></audio>

        {isRun ? (
            <div className="bg-slate-50 p-6 border-b border-slate-100 relative">
                 <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full transition hover:bg-slate-100"><X size={24}/></button>
                <div className="flex items-center gap-2 mb-2">
                     <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Footprints size={20}/></div>
                     <span className="text-xs font-bold uppercase text-indigo-500 tracking-wider">Course à Pied</span>
                </div>
                <h3 className="text-2xl font-black text-slate-800 leading-tight">{exercise.name}</h3>
                <div className="flex items-center gap-2 mt-2 text-sm text-slate-500 font-medium"><Clock size={16}/> {exercise.sets} • {exercise.reps}</div>
            </div>
        ) : (
            <div className="h-56 bg-slate-100 relative overflow-hidden bg-white shrink-0 group">
                <img src={imageSrc} alt={exercise.name} className={`w-full h-full ${objectFitClass}`} onError={() => setImgError(true)}/>
                <button onClick={onClose} className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition backdrop-blur-md z-50 border border-white/20 shadow-lg"><X size={20}/></button>
                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                    <h3 className="text-2xl font-black text-white/80 leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{exercise.name}</h3>
                    <span className="text-white/60 text-xs font-bold uppercase tracking-wider mt-1 block drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                        {exercise.sets.toString().includes('bloc') || exercise.sets.toString().includes('temps') ? exercise.sets : `${exercise.sets} Séries`} x {exercise.reps}
                    </span>
                </div>
            </div>
        )}

        <div className="p-6 space-y-6 overflow-y-auto">
            {!isRun && (
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-slate-700 flex items-center gap-2"><Activity size={16} className="text-indigo-500"/> Suivi de séance</h4>
                    {isTimerRunning && (
                        <div className="flex items-center gap-2 animate-in slide-in-from-top-2">
                            <button onClick={() => setTimer(t => Math.max(0, t - 5))} className="bg-indigo-100 text-indigo-700 p-1 rounded-full hover:bg-indigo-200 transition"><Minus size={14}/></button>
                            <div className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 shadow-md shadow-indigo-200"><Timer size={14}/> {formatTime(timer)}</div>
                            <button onClick={() => setTimer(t => t + 5)} className="bg-indigo-100 text-indigo-700 p-1 rounded-full hover:bg-indigo-200 transition"><Plus size={14}/></button>
                            <button onClick={handleSkip} className="bg-rose-100 text-rose-700 p-1 rounded-full hover:bg-rose-200 transition ml-1" title="Passer le repos"><SkipForward size={14}/></button>
                        </div>
                    )}
                </div>
                <div className="space-y-3">
                    {setsStatus.map((isDone, idx) => (
                        <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isDone ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200'}`}>
                            <div className="flex items-center gap-3"><span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${isDone ? 'bg-green-200 text-green-700' : 'bg-slate-100 text-slate-400'}`}>{idx + 1}</span><span className={`text-sm font-medium ${isDone ? 'text-green-800' : 'text-slate-600'}`}>{exercise.reps} reps</span></div>
                            <button onClick={() => toggleSet(idx)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isDone ? 'bg-green-500 text-white shadow-sm' : 'bg-slate-100 text-slate-300 hover:bg-slate-200'}`}>{isDone ? <Check size={18}/> : <Square size={18} className="fill-white"/>}</button>
                        </div>
                    ))}
                </div>
            </div>
            )}

            <div className="flex gap-4">
                <div className="flex-1 bg-white p-3 rounded-2xl border border-slate-100 text-center shadow-sm"><div className="text-xs text-slate-400 font-bold uppercase">Repos</div><div className="text-lg font-black text-slate-700">{exercise.rest}</div></div>
                <div className="flex-1 bg-rose-50 p-3 rounded-2xl border border-rose-100 text-center shadow-sm"><div className="text-xs text-rose-400 font-bold uppercase">Intensité</div><div className="text-lg font-black text-rose-600">RPE {exercise.rpe}</div></div>
            </div>
            <div>
                <div className="flex items-center gap-2 mb-2"><div className="bg-indigo-100 p-1.5 rounded-lg text-indigo-600"><Brain size={18}/></div><h4 className="font-bold text-slate-800">Consigne Technique</h4></div>
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">{exercise.instructions}</p>
            </div>
            <div>
                 <div className="flex items-center gap-2 mb-2"><div className="bg-emerald-100 p-1.5 rounded-lg text-emerald-600"><Target size={18}/></div><h4 className="font-bold text-slate-800">Objectif Physiologique</h4></div>
                <p className="text-xs font-medium text-slate-500">{exercise.note}</p>
            </div>
            {(isRun || allSetsDone) && (
                <button onClick={handleComplete} className="w-full py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-200 mt-2 animate-in slide-in-from-bottom-2 fade-in">{isRun ? "Terminer la séance" : "Valider l'exercice"}</button>
            )}
        </div>
      </div>
    </div>
  );
};

// ... (InteractiveInterference, StatCard, PolarizationChart, WeeklyVolumeChart, BanisterChart, TrimpChart, InstallGuide, WorkoutViz, RpeBadge)
// (Note: ces composants sont définis ici pour la complétude du fichier final, je les inclus pour éviter les erreurs de référence)

const InteractiveInterference = () => {
    const [scenario, setScenario] = useState('far'); 
    return (
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                <button onClick={() => setScenario('close')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${scenario === 'close' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Séances Rapprochées (&lt;6h)</button>
                <button onClick={() => setScenario('far')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${scenario === 'far' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Séances Espacées (&gt;24h)</button>
            </div>
            <div className="relative h-48 bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center p-4">
                <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '10px 10px'}}></div>
                <div className="relative z-10 w-full flex justify-between items-center">
                    <div className={`flex flex-col items-center transition-all duration-700 ${scenario === 'close' ? 'translate-x-8 scale-110' : 'translate-x-0'}`}>
                        <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/50 mb-2 animate-pulse"><Zap size={20} /></div>
                        <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Cardio (AMPk)</div>
                        {scenario === 'far' && <div className="text-[9px] text-green-400 mt-1 animate-in fade-in slide-in-from-bottom-2">Active ✅</div>}
                    </div>
                    {scenario === 'close' && (<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-in zoom-in duration-300"><div className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-rose-500/50"><X size={24} className="text-white"/></div><div className="bg-rose-600 text-white text-[9px] font-bold px-2 py-1 rounded mt-2">INTERFÉRENCE</div></div>)}
                    <div className={`flex flex-col items-center transition-all duration-700 ${scenario === 'close' ? '-translate-x-8 scale-90 opacity-50' : 'translate-x-0'}`}>
                        <div className="w-12 h-12 rounded-full bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/50 mb-2 animate-pulse"><Dumbbell size={20} /></div>
                        <div className="text-[10px] font-bold text-rose-300 uppercase tracking-widest">Muscle (mTOR)</div>
                         {scenario === 'far' && <div className="text-[9px] text-green-400 mt-1 animate-in fade-in slide-in-from-bottom-2">Active ✅</div>}
                    </div>
                </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">{scenario === 'close' ? "⚠️ Le signal 'Cardio' bloque la construction musculaire. Vos gains en force sont compromis." : "✅ Les deux signaux ont le temps de s'exprimer. Vous progressez en endurance ET en muscle."}</p>
        </div>
    );
};

const StatCard = ({ label, value, unit, icon: Icon, color }) => (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
        <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p><div className="text-2xl font-black text-slate-800 flex items-baseline gap-1">{value} <span className="text-xs font-medium text-slate-400">{unit}</span></div></div>
        <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}><Icon size={20} /></div>
    </div>
);

const PolarizationChart = ({ low, high }) => {
    const total = low + high || 1;
    const lowPercent = Math.round((low / total) * 100);
    const highPercent = Math.round((high / total) * 100);
    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-end mb-4"><h4 className="font-bold text-slate-700 flex items-center gap-2"><Activity size={18} className="text-indigo-500"/> Polarisation (Prévisionnelle)</h4><span className="text-xs font-medium text-slate-400">Cible: 80/20</span></div>
            <div className="flex h-6 w-full rounded-full overflow-hidden bg-slate-100 relative">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-1000 relative group" style={{ width: `${lowPercent}%` }}><span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">Endurance</span></div>
                <div className="h-full bg-gradient-to-r from-rose-500 to-rose-600 transition-all duration-1000 relative group" style={{ width: `${highPercent}%` }}><span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">Intensité</span></div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-white z-10" style={{left: '80%'}}></div>
                <div className="absolute -bottom-1 left-[80%] -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-b-4 border-b-slate-800"></div>
            </div>
            <div className="flex justify-between mt-2 text-xs font-bold"><div className="text-emerald-600">{lowPercent}% <span className="text-[10px] font-normal text-slate-400">Volume</span></div><div className="text-rose-600">{highPercent}% <span className="text-[10px] font-normal text-slate-400">Intensité</span></div></div>
        </div>
    );
};

const WeeklyVolumeChart = ({ plannedData, realizedData }) => {
  const [selectedWeek, setSelectedWeek] = useState(null);
  if (!plannedData || plannedData.length === 0) return <div className="text-xs text-slate-400 italic text-center p-4">Générez votre plan pour voir les données.</div>;
  const max = Math.max(...plannedData, 1);
  return (
    <div className="space-y-4">
        <div className="flex justify-end gap-3 text-[10px] font-bold uppercase text-slate-400 mb-2"><div className="flex items-center gap-1"><div className="w-2 h-2 bg-slate-200 border border-slate-300 rounded-sm"></div> Prévu</div><div className="flex items-center gap-1"><div className="w-2 h-2 bg-indigo-500 rounded-sm"></div> Réalisé</div></div>
        <div className="flex items-end justify-between h-32 gap-1 mt-2 px-2 relative">
            <div className="absolute inset-0 flex flex-col justify-between px-2 pointer-events-none opacity-20 z-0"><div className="w-full h-px bg-slate-400 border-dashed border-t"></div><div className="w-full h-px bg-slate-400 border-dashed border-t"></div><div className="w-full h-px bg-slate-400 border-dashed border-t"></div></div>
            {plannedData.map((val, i) => {
                const planVal = val || 0;
                const realVal = realizedData[i] || 0;
                return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group cursor-pointer relative h-full justify-end z-10" onClick={() => setSelectedWeek(i === selectedWeek ? null : i)}>
                <div className="w-full relative flex items-end justify-center h-full rounded-t-sm">
                    <div className={`w-full absolute bottom-0 border-2 border-dashed border-slate-300 bg-slate-50 transition-all duration-500 rounded-t-sm z-0 ${planVal === 0 ? 'h-1' : ''}`} style={{ height: `${planVal > 0 ? (planVal / max) * 100 : 1}%` }}></div>
                    <div className={`w-full absolute bottom-0 transition-all duration-700 rounded-t-sm z-10 ${selectedWeek === i ? 'bg-indigo-600' : 'bg-indigo-400 hover:bg-indigo-500'}`} style={{ height: `${planVal > 0 ? (realVal / max) * 100 : 0}%` }}></div>
                </div>
                <span className={`text-[9px] font-bold z-20 ${selectedWeek === i ? 'text-indigo-600 scale-125' : 'text-slate-400'}`}>S{i + 1}</span>
                </div>
            )})}
        </div>
        {selectedWeek !== null && (
             <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 text-xs text-indigo-800 animate-in slide-in-from-top-2 shadow-sm">
                 <div className="flex justify-between items-center mb-1"><span className="font-bold flex items-center gap-1"><Clock size={12}/> Semaine {selectedWeek + 1}</span><span className="bg-white px-2 py-0.5 rounded shadow-sm text-[10px] font-black border border-indigo-100">{realizedData[selectedWeek] || 0} / {plannedData[selectedWeek] || 0} min</span></div>
                 <div className="text-slate-600 italic">{(realizedData[selectedWeek] || 0) >= (plannedData[selectedWeek] || 1) ? "🎉 Objectif de volume atteint ! Bravo." : "L'objectif est la barre grise. Continuez vos efforts !"}</div>
             </div>
        )}
    </div>
  );
};

const BanisterChart = ({ duration }) => {
    if (!duration) return <div className="text-xs text-slate-400 italic text-center p-4">En attente de données...</div>;
    const weeks = Array.from({length: duration + 2}, (_, i) => i); 
    const data = weeks.map(w => {
        const ramp = w / duration; 
        const fitness = 20 + (ramp * 60); 
        const fatigue = w >= duration ? 15 : 10 + (ramp * 70) + (Math.sin(w)*10); 
        const form = fitness - fatigue + 30; 
        return { w, fitness, fatigue, form };
    });
    return (
        <div className="w-full h-48 flex items-end gap-1 mt-6 relative bg-white/50 rounded-xl p-2 border border-slate-100 overflow-hidden">
             <div className="absolute inset-0 flex flex-col justify-between p-4 opacity-10 pointer-events-none"><div className="w-full h-px bg-slate-900"></div><div className="w-full h-px bg-slate-900"></div><div className="w-full h-px bg-slate-900"></div></div>
             {data.map((d, i) => (
                 <div key={i} className="flex-1 flex flex-col justify-end h-full relative group">
                     <div className="w-2 h-2 bg-green-500 rounded-full absolute left-1/2 -translate-x-1/2 transition-all duration-500 z-20 shadow-sm shadow-green-200" style={{ bottom: `${Math.min(d.form, 95)}%` }}></div>
                     <div className="w-1 bg-indigo-400/40 absolute left-1/2 -translate-x-1/2 bottom-0 rounded-t-full" style={{ height: `${Math.min(d.fitness, 95)}%` }}></div>
                      <div className="w-1 bg-rose-400/40 absolute left-1/2 -translate-x-1/2 bottom-0 -translate-x-[2px] rounded-t-full" style={{ height: `${Math.min(d.fatigue, 95)}%` }}></div>
                 </div>
             ))}
             <div className="absolute top-2 left-2 flex flex-wrap gap-3 text-[9px] font-bold bg-white/80 p-1 rounded backdrop-blur-sm z-30 border border-slate-100 shadow-sm">
                 <span className="text-green-600 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Forme</span>
                 <span className="text-indigo-400 flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-indigo-300"></div> Fitness</span>
                 <span className="text-rose-400 flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-rose-300"></div> Fatigue</span>
             </div>
        </div>
    );
};

const TrimpChart = ({ plannedData, realizedData }) => {
    const [selectedPoint, setSelectedPoint] = useState(null);
    if (!plannedData || plannedData.length === 0) return <div className="text-xs text-slate-400 italic text-center p-4">En attente de données...</div>;
    const trimpData = plannedData.map((val, i) => { const intensityFactor = (i % 4 === 0) ? 0.7 : (i % 4 === 1) ? 0.9 : 0.8; return Math.round(val * intensityFactor); });
    const realizedTrimpData = realizedData.map((val, i) => { const intensityFactor = (i % 4 === 0) ? 0.7 : (i % 4 === 1) ? 0.9 : 0.8; return Math.round(val * intensityFactor); });
    const maxTrimp = Math.max(...trimpData, 1);
    return (
        <div className="space-y-4">
             <div className="flex justify-end gap-3 text-[10px] font-bold uppercase text-slate-400 mb-2"><div className="flex items-center gap-1"><div className="w-2 h-2 bg-slate-200 border border-slate-300 rounded-sm"></div> Cible</div><div className="flex items-center gap-1"><div className="w-2 h-2 bg-purple-500 rounded-sm"></div> Fait</div></div>
            <div className="flex items-end justify-between h-32 gap-1 mt-4 px-2 relative">
                <div className="absolute inset-0 flex flex-col justify-between px-2 pointer-events-none opacity-10"><div className="w-full h-px bg-purple-900 border-dashed border-t"></div><div className="w-full h-px bg-purple-900 border-dashed border-t"></div><div className="w-full h-px bg-purple-900 border-dashed border-t"></div></div>
                {trimpData.map((trimp, i) => {
                     const realizedTrimp = realizedTrimpData[i] || 0;
                     return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group cursor-pointer relative h-full justify-end z-10" onClick={() => setSelectedPoint(i === selectedPoint ? null : i)}>
                        <div className="w-full relative flex items-end justify-center h-full rounded-t-sm">
                            <div className="w-full absolute bottom-0 bg-slate-100 border-2 border-dashed border-slate-300 opacity-60 rounded-t-sm z-0" style={{ height: `${(trimp / maxTrimp) * 80 + 10}%` }}></div>
                            <div className={`w-full absolute bottom-0 transition-all duration-1000 z-10 rounded-t-sm ${selectedPoint === i ? 'bg-purple-600' : 'bg-gradient-to-t from-purple-300 to-purple-500'}`} style={{ height: `${(realizedTrimp / maxTrimp) * 80 + 10}%` }}></div>
                        </div>
                        <span className={`text-[9px] font-mono z-20 ${selectedPoint === i ? 'text-purple-600 font-bold scale-125' : 'text-slate-400'}`}>S{i + 1}</span>
                    </div>
                )})}
            </div>
            {selectedPoint !== null && (
                 <div className="bg-purple-50 p-3 rounded-xl border border-purple-100 text-xs text-purple-800 animate-in slide-in-from-top-2 flex items-start gap-2 shadow-sm">
                     <Flame size={16} className="shrink-0 mt-0.5 text-purple-600"/>
                     <div>
                        <span className="font-bold block mb-1">Charge Semaine {selectedPoint + 1}</span>
                        <div className="flex gap-4 mb-1 text-[10px]"><span className="text-slate-500">Prévu: {trimpData[selectedPoint]}</span><span className="font-black bg-white px-1.5 py-0.5 rounded border border-purple-100">Fait: {realizedTrimpData[selectedPoint] || 0}</span></div>
                        <div className="text-slate-600 italic">{realizedTrimpData[selectedPoint] > trimpData[selectedPoint] ? "Attention, charge plus élevée que prévu." : "Charge maîtrisée."}</div>
                     </div>
                 </div>
            )}
        </div>
    );
};

const InstallGuide = ({ onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300">
        <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden text-center p-8 relative animate-in zoom-in-95 duration-300">
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"><X size={24}/></button>
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-600"><Smartphone size={32} /></div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">Installer l'App 📱</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">Pour une meilleure expérience, ajoutez C-Lab Performance à votre écran d'accueil. C'est gratuit et sans téléchargement !</p>
            <div className="space-y-4 text-left bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3"><span className="w-6 h-6 flex items-center justify-center bg-indigo-600 text-white rounded-full text-xs font-bold">1</span><span className="text-sm text-slate-700">Appuyez sur le bouton <strong>Partager</strong> <Share size={14} className="inline ml-1"/> dans Safari.</span></div>
                <div className="flex items-center gap-3"><span className="w-6 h-6 flex items-center justify-center bg-indigo-600 text-white rounded-full text-xs font-bold">2</span><span className="text-sm text-slate-700">Faites défiler vers le bas.</span></div>
                <div className="flex items-center gap-3"><span className="w-6 h-6 flex items-center justify-center bg-indigo-600 text-white rounded-full text-xs font-bold">3</span><span className="text-sm text-slate-700">Sélectionnez <strong>"Sur l'écran d'accueil"</strong>.</span></div>
            </div>
            <button onClick={onClose} className="mt-6 w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition">C'est compris !</button>
        </div>
    </div>
);


// --- VISUALISATION SÉANCE (Mini-Graph) ---
const WorkoutViz = ({ structure, intensity }) => {
  let bars = [];
  const color = intensity === 'high' ? 'bg-rose-500' : intensity === 'medium' ? 'bg-amber-500' : 'bg-emerald-500';
  
  if (structure === 'interval') bars = [20, 20, 20, 80, 20, 80, 20, 80, 20, 80, 20, 20, 20];
  else if (structure === 'threshold') bars = [20, 20, 30, 60, 60, 60, 60, 60, 30, 20, 20];
  else if (structure === 'steady') bars = [30, 30, 30, 30, 30, 30, 30, 30, 30, 30];
  else bars = [20, 40, 60, 80, 100, 80, 60, 40, 20];

  return (
    <div className="flex items-end gap-[2px] h-6 w-16 md:w-20 opacity-80">
      {bars.map((height, i) => (
        <div key={i} className={`flex-1 rounded-t-[1px] ${height > 40 ? color : 'bg-slate-200'}`} style={{ height: `${height}%` }}></div>
      ))}
    </div>
  );
};

const RpeBadge = ({ level }) => {
    let color = "bg-emerald-100 text-emerald-700";
    if(level >= 5) color = "bg-amber-100 text-amber-700";
    if(level >= 8) color = "bg-rose-100 text-rose-700";
    return <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${color} border border-white/20`}>RPE {level}/10</div>;
};

// --- MAIN APP ---
export default function App() {
  // Déplacement des objets de configuration dans le composant pour éviter les pbs de scope
  const defaultUserData = { 
      name: "User", 
      weight: 75, 
      goalTime: 50, 
      targetDistance: '10k',
      runDaysPerWeek: 3, 
      strengthDaysPerWeek: 2, 
      hyroxSessionsPerWeek: 3, 
      extraRunSessions: 0,
      extraStrengthSessions: 0,
      strengthFocus: 'hypertrophy', 
      durationWeeks: 10, 
      progressionStart: 15, 
      difficultyFactor: 1.0 
  };

  const loadState = (key, defaultValue) => {
    if (typeof window === 'undefined') return defaultValue;
    try {
        const saved = localStorage.getItem('clab_storage');
        if (saved) {
            const parsed = JSON.parse(saved);
            
            // Fix crucial pour la rétrocompatibilité des sauvegardes
            if (key === 'userData') {
                return { ...defaultValue, ...(parsed[key] || {}) };
            }

            if (key === 'completedSessions') return new Set(parsed.completedSessions || []);
            if (key === 'completedExercises') return new Set(parsed.completedExercises || []); 
            return parsed[key] !== undefined ? parsed[key] : defaultValue;
        }
    } catch (e) {
        console.error("Erreur chargement sauvegarde", e);
    }
    return defaultValue;
  };

  useEffect(() => {
    const updateIcons = () => {
      let appleLink = document.querySelector("link[rel~='apple-touch-icon']");
      if (!appleLink) { appleLink = document.createElement('link'); appleLink.rel = 'apple-touch-icon'; document.head.appendChild(appleLink); }
      appleLink.href = LOGO_URL;
      let favLink = document.querySelector("link[rel~='icon']");
      if (!favLink) { favLink = document.createElement('link'); favLink.rel = 'icon'; document.head.appendChild(favLink); }
      favLink.href = LOGO_URL;
    };
    updateIcons();
  }, []);

  const [step, setStep] = useState(() => loadState('step', 'input'));
  const [activeTab, setActiveTab] = useState(() => loadState('activeTab', 'plan'));
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  const [userData, setUserData] = useState(() => loadState('userData', defaultUserData));
  const [plan, setPlan] = useState(() => loadState('plan', []));
  const [expandedWeek, setExpandedWeek] = useState(() => loadState('expandedWeek', 1));
  const [completedSessions, setCompletedSessions] = useState(() => loadState('completedSessions', new Set()));
  const [completedExercises, setCompletedExercises] = useState(() => loadState('completedExercises', new Set()));

  useEffect(() => {
    const dataToSave = { step, activeTab, userData, plan, expandedWeek, completedSessions: Array.from(completedSessions), completedExercises: Array.from(completedExercises) };
    localStorage.setItem('clab_storage', JSON.stringify(dataToSave));
  }, [step, activeTab, userData, plan, expandedWeek, completedSessions, completedExercises]);

  const [modalExercise, setModalExercise] = useState(null); 
  const [filteredSessionIds, setFilteredSessionIds] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [expandedSession, setExpandedSession] = useState(null);
  const [swapSelection, setSwapSelection] = useState(null);

  // --- HANDLERS DÉFINIS DANS APP ---

  const handleDistanceSelect = (dist) => {
      let defaultTime = 50;
      let defaultDuration = 10;

      if (dist === '5k') { defaultTime = 25; defaultDuration = 8; } 
      if (dist === '10k') { defaultTime = 50; defaultDuration = 10; }
      if (dist === '21k') { defaultTime = 100; defaultDuration = 12; } 
      if (dist === '42k') { defaultTime = 240; defaultDuration = 16; } 
      if (dist === 'hyrox') { defaultTime = 90; defaultDuration = 10; } 

      setUserData({
          ...userData, 
          targetDistance: dist, 
          goalTime: defaultTime,
          durationWeeks: defaultDuration
      });
  };

  const handleTimeChange = (delta) => {
      const isShort = ['5k', '10k', 'hyrox'].includes(userData.targetDistance); 
      const step = isShort ? 0.5 : 1; 
      const newTime = Math.max(15, userData.goalTime + (delta * step));
      setUserData({...userData, goalTime: newTime});
  };

  const handleSwapRequest = (weekIdx, dayIdx) => {
      if (swapSelection && swapSelection.weekIdx === weekIdx && swapSelection.dayIdx === dayIdx) {
          setSwapSelection(null);
          return;
      }
      if (!swapSelection) {
          setSwapSelection({ weekIdx, dayIdx });
          return;
      }
      if (swapSelection.weekIdx === weekIdx) {
          handleSwap(weekIdx, swapSelection.dayIdx, dayIdx);
          setSwapSelection(null);
      } else {
          setSwapSelection({ weekIdx, dayIdx });
      }
  };

  const handleSwap = (weekIdx, sourceDayIdx, targetDayIdx) => {
      const newPlan = plan.map(w => {
        if (w.weekNumber !== weekIdx) return w;
        const newSchedule = [...w.schedule];
        const source = newSchedule[sourceDayIdx];
        const target = newSchedule[targetDayIdx];
        const tempActivity = source.activity;
        const tempFocus = source.focus;
        const tempSessionIds = source.sessionIds;
        source.activity = target.activity;
        source.focus = target.focus;
        source.sessionIds = target.sessionIds;
        target.activity = tempActivity;
        target.focus = tempFocus;
        target.sessionIds = tempSessionIds;
        return { ...w, schedule: newSchedule };
      });
      setPlan(newPlan);
  };

  const resetWeekOrder = (weekNumber) => {
    // Suppression du confirm() bloquant pour compatibilité iframe
    const newPlan = plan.map((week) => {
      if (week.weekNumber !== weekNumber) return week; 
      const originalSessions = week.sessions;
      const defaultSchedule = getRecommendedSchedule(originalSessions, userData.targetDistance === 'hyrox');
      return {
        ...week,
        schedule: defaultSchedule
      };
    });
    setPlan(newPlan);
  };

  const resetWeekProgress = (week) => {
      const newCompletedSessions = new Set(completedSessions);
      const newCompletedExercises = new Set(completedExercises);

      week.sessions.forEach(session => {
          if (newCompletedSessions.has(session.id)) {
              newCompletedSessions.delete(session.id);
          }
          if (session.exercises) {
              session.exercises.forEach((_, idx) => {
                  const exId = `${session.id}-ex-${idx}`;
                  if (newCompletedExercises.has(exId)) {
                      newCompletedExercises.delete(exId);
                  }
              });
          }
      });
      setCompletedSessions(newCompletedSessions);
      setCompletedExercises(newCompletedExercises);
  };

  const stats = useMemo(() => {
    if (plan.length === 0) return null;
    let totalSessions = 0, completedCount = 0, totalKm = 0;
    const weeklyVolume = plan.map(() => 0);
    const plannedWeeklyVolume = plan.map(() => 0);
    let plannedIntensityBuckets = { low: 0, high: 0 };

    plan.forEach((week, i) => {
      week.sessions.forEach(session => {
        plannedWeeklyVolume[i] += session.durationMin;
        if (session.intensity === 'low') plannedIntensityBuckets.low += session.durationMin;
        else plannedIntensityBuckets.high += session.durationMin;
        
        totalSessions++;
        const isDone = completedSessions.has(session.id);
        if (isDone) {
          completedCount++;
          weeklyVolume[i] += session.durationMin;
          if (session.category === 'run' && session.distance) {
            const km = parseFloat(session.distance);
            if(!isNaN(km)) totalKm += km;
          }
        }
      });
    });

    return { progress: totalSessions > 0 ? Math.round((completedCount / totalSessions) * 100) : 0, totalKm: totalKm.toFixed(1), sessionsDone: completedCount, totalSessions, intensityBuckets: plannedIntensityBuckets, weeklyVolume: plannedWeeklyVolume, realizedWeeklyVolume: weeklyVolume };
  }, [plan, completedSessions]);

  const toggleSession = (id) => {
    const newSet = new Set(completedSessions);
    if (!newSet.has(id)) {
        newSet.add(id);
        setCompletedSessions(newSet);
    }
  };

  const unvalidateSession = (id) => {
      const newSet = new Set(completedSessions);
      if (newSet.has(id)) {
          newSet.delete(id);
          setCompletedSessions(newSet);
      }
  };

  const toggleExercise = (exerciseUniqueId) => {
      const newSet = new Set(completedExercises);
      if (newSet.has(exerciseUniqueId)) {
        newSet.delete(exerciseUniqueId);
      } else {
        newSet.add(exerciseUniqueId);
      }
      setCompletedExercises(newSet);
  };

  const handleSessionCompleteFromModal = (sessionId, isExercise = false) => {
       if (isExercise) {
           toggleExercise(sessionId); 
       } else {
           if (!completedSessions.has(sessionId)) {
               toggleSession(sessionId);
           }
       }
  };

  const adaptDifficulty = (weekNum, action) => {
      let message = ""; let type = 'neutral';
      if (action === 'easier') { const newFactor = userData.difficultyFactor + 0.05; setUserData(prev => ({ ...prev, difficultyFactor: newFactor })); message = "Plan adapté : Allures ralenties de 5% pour la suite (récupération)."; type = 'warning'; } 
      else if (action === 'harder') { const newFactor = Math.max(0.8, userData.difficultyFactor - 0.05); setUserData(prev => ({ ...prev, difficultyFactor: newFactor })); message = "Plan adapté : Allures accélérées de 5% pour la suite (performance) !"; type = 'success'; } 
      else { message = "Semaine validée ! Maintien de la progression prévue."; type = 'success'; }
      setFeedbackMessage({ text: message, type });
      if (weekNum < userData.durationWeeks) setExpandedWeek(weekNum + 1); else setExpandedWeek(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDayClick = (daySessionIds) => {
      if (!daySessionIds || daySessionIds.length === 0) { setFilteredSessionIds(null); return; }
      if (filteredSessionIds && JSON.stringify(filteredSessionIds) === JSON.stringify(daySessionIds)) { setFilteredSessionIds(null); } else { setFilteredSessionIds(daySessionIds); }
  };

  const generatePlan = () => {
    const newPlan = [];
    const { durationWeeks: totalWeeks, targetDistance } = userData;
    const adaptationWeeks = Math.ceil(totalWeeks * 0.3);
    const taperWeeks = 2;
    let hypertrophySessionIndex = 0;
    let streetSessionIndex = 0; 
    let hyroxSessionIndex = 0; 

    // --- PARAMÈTRES DE DISTANCE ---
    let distanceKm = 10; // Default
    if (targetDistance === '5k') distanceKm = 5;
    if (targetDistance === '21k') distanceKm = 21.1;
    if (targetDistance === '42k') distanceKm = 42.195;
    if (targetDistance === 'hyrox') distanceKm = 8; // Hyrox = 8x1km run

    for (let i = 1; i <= totalWeeks; i++) {
      const isRaceWeek = i === totalWeeks;
      const isTaper = i > totalWeeks - taperWeeks;
      const isAdaptation = i <= adaptationWeeks;
      const paces = getPaceForWeek(i, totalWeeks, userData.goalTime, userData.progressionStart, userData.difficultyFactor, distanceKm);
      
      let sessions = [];
      let focus = isRaceWeek ? "OBJECTIF" : isTaper ? "AFFÛTAGE" : isAdaptation ? "ADAPTATION" : "DÉVELOPPEMENT";
      let volumeLabel = isAdaptation ? "Volume bas" : isTaper ? "Récupération" : "Charge haute";
      const isTechWeek = i % 2 !== 0;

      // --- BRANCHE HYROX ---
      if (targetDistance === 'hyrox') {
          // Logique Hyrox spécifique
          focus = isRaceWeek ? "HYROX RACE" : focus;

          // 1. Run "Moteur"
          sessions.push({ id: `w${i}-h1`, day: "RUN ENGINE", category: 'run', type: "Running Intervals", structure: 'interval', intensity: 'high', duration: "45 min", durationMin: 45, distance: "8 km", paceTarget: paces.interval, paceGap: paces.gap, rpe: 8, description: "Travail de VMA pour supporter les transitions.", scienceNote: "VO2max Running.", planningAdvice: "Essentiel pour le temps global.", exercises: RUN_PROTOCOLS.interval_short });

          // 2. Séance Hyrox Spécifique (Sleds / Wall Balls...)
          const splitNames = ["Hyrox Sleds & Force", "Hyrox Functional Capacité", "Hyrox Erg & Power", "Hyrox Compromised Legs", "Hyrox Full Race Sim"];
          const splitExos = [STRENGTH_PROTOCOLS.hyrox.sleds_strength, STRENGTH_PROTOCOLS.hyrox.functional_endurance, STRENGTH_PROTOCOLS.hyrox.ergs_power, STRENGTH_PROTOCOLS.hyrox.legs_compromised, STRENGTH_PROTOCOLS.hyrox.full_race_sim];
          
          for(let h=0; h < userData.hyroxSessionsPerWeek; h++) {
             const currentSplitIndex = (hyroxSessionIndex + h) % 5;
             sessions.push({ 
                 id: `w${i}-h${h}`, 
                 day: `HYROX ${h+1}`, 
                 category: 'hyrox', 
                 type: splitNames[currentSplitIndex], 
                 structure: 'pyramid', 
                 intensity: 'high', 
                 duration: "60-90 min", 
                 durationMin: 75, 
                 paceTarget: "N/A", 
                 paceGap: 0, 
                 rpe: 9, 
                 description: `Entraînement spécifique ${splitNames[currentSplitIndex]}.`, 
                 scienceNote: "Endurance de force.", 
                 planningAdvice: "Simulez les conditions de course.", 
                 exercises: splitExos[currentSplitIndex], 
                 tags: ['legs'] 
             });
          }
          hyroxSessionIndex += userData.hyroxSessionsPerWeek; // Incrémenter pour la semaine suivante

          // 2. Ajout Bonus Run
          for(let r=0; r < userData.extraRunSessions; r++) {
               sessions.push({ 
                   id: `w${i}-bonus-r${r}`, 
                   day: `BONUS RUN ${r+1}`, 
                   category: 'run', 
                   type: "Endurance Fondamentale", 
                   structure: 'steady', 
                   intensity: 'low', 
                   duration: "45 min", 
                   durationMin: 45, 
                   distance: calcDist(45, paces.valEasy), 
                   paceTarget: paces.easyRange, 
                   paceGap: paces.gap, 
                   rpe: 3, 
                   description: "Footing souple pour augmenter le volume aérobie.", 
                   scienceNote: "Capillarisation.", 
                   planningAdvice: "À placer un jour de repos ou en bi-quotidien.", 
                   exercises: RUN_PROTOCOLS.steady 
               });
          }

          // 3. Ajout Bonus Muscu (Force Pure)
          for(let s=0; s < userData.extraStrengthSessions; s++) {
               sessions.push({ 
                   id: `w${i}-bonus-s${s}`, 
                   day: `BONUS MUSCU ${s+1}`, 
                   category: 'strength', 
                   type: "Force Max", 
                   structure: 'pyramid', 
                   intensity: 'high', 
                   duration: "60 min", 
                   durationMin: 60, 
                   paceTarget: "N/A", 
                   paceGap: 0, 
                   rpe: 8, 
                   description: "Renforcement pur pour soutenir la charge Hyrox.", 
                   scienceNote: "Recrutement unités motrices.", 
                   planningAdvice: "Loin des séances intenses.", 
                   exercises: STRENGTH_PROTOCOLS.force.full 
               });
          }

      } else {
        // --- BRANCHE RUNNING CLASSIQUE (5k, 10k, 21k, 42k) ---
        
        // Run 1: Endurance
        sessions.push({ id: `w${i}-r1`, day: "RUN 1", category: 'run', type: isTechWeek ? "Endurance + Lignes Droites" : "Endurance Fondamentale", structure: 'steady', intensity: 'low', duration: "45 min", durationMin: 45, distance: calcDist(45, paces.valEasy), paceTarget: paces.easyRange, paceGap: paces.gap, rpe: 3, description: isTechWeek ? "40' cool + 5x80m progressif (lignes droites) pour la foulée." : "Aisance respiratoire stricte. Capacité à parler.", scienceNote: "Zone 1/2 : Densité mitochondriale.", planningAdvice: "Idéal après une journée de repos ou de muscu haut du corps.", exercises: RUN_PROTOCOLS.steady });

        // Run 2: Qualité (adapté à la distance)
        if (userData.runDaysPerWeek >= 2) {
            let sessionType = "";
            let sessionExo = [];
            
            if (targetDistance === '5k') {
                 sessionType = "VMA Courte"; sessionExo = RUN_PROTOCOLS.interval_short;
            } else if (targetDistance === '10k') {
                 // VARIATION SEMAINE PAR SEMAINE POUR 10K
                 const cycle = i % 4;
                 if (cycle === 1) { sessionType = "VMA Courte"; sessionExo = RUN_PROTOCOLS.interval_short; }
                 else if (cycle === 2) { sessionType = "Seuil Anaérobie"; sessionExo = RUN_PROTOCOLS.threshold; }
                 else if (cycle === 3) { sessionType = "Côtes / Force"; sessionExo = RUN_PROTOCOLS.hills; }
                 else { sessionType = "VMA Longue"; sessionExo = RUN_PROTOCOLS.interval_long; }
            } else if (targetDistance === '21k') {
                 sessionType = "Seuil Long"; sessionExo = RUN_PROTOCOLS.threshold;
            } else { // 42k
                 // Alternance VMA et Seuil Marathon
                 sessionType = (i%2===0) ? "Allure Marathon" : "Seuil"; 
                 sessionExo = (i%2===0) ? RUN_PROTOCOLS.long_run : RUN_PROTOCOLS.threshold; 
            }
            
            sessions.push({ id: `w${i}-r2`, day: "RUN 2", category: 'run', type: sessionType, structure: 'interval', intensity: 'high', duration: "60 min", durationMin: 60, distance: "Varié", paceTarget: paces.interval, paceGap: paces.gap, rpe: 8, description: `Séance clé pour ${targetDistance}.`, scienceNote: "Développement moteur.", planningAdvice: "Fraîcheur requise.", exercises: sessionExo });
        }

        // Run 3: Sortie Longue (Durée adaptée)
        if (userData.runDaysPerWeek >= 3) {
            let longRunDuration = 60;
            let longRunType = "Sortie Longue";
            
            if (targetDistance === '21k') {
                longRunDuration = 80 + (i * 5); // Monte jusqu'à ~1h50
                if (longRunDuration > 130) longRunDuration = 90; // Tapering
            }
            if (targetDistance === '42k') {
                // Cycle ondulatoire pour éviter la fatigue chronique
                if (i % 3 === 0) { // Semaine de récupération
                    longRunDuration = 90; 
                    longRunType = "Sortie Longue (Récup)";
                } else {
                    longRunDuration = 100 + (i * 10); // Monte progressivement
                    if (longRunDuration > 180) longRunDuration = 150; // Cap à 3h
                }
            }

            // Tapering strict pour la fin
            if (isTaper) longRunDuration = longRunDuration * 0.6;

            sessions.push({ id: `w${i}-r3`, day: "RUN 3", category: 'run', type: longRunType, structure: 'steady', intensity: 'low', duration: `${longRunDuration} min`, durationMin: longRunDuration, distance: calcDist(longRunDuration, paces.valEasy), paceTarget: paces.easyRange, paceGap: paces.gap, rpe: 4, description: "Volume indispensable. Hydratation test.", scienceNote: "Endurance fondamentale.", planningAdvice: "Le weekend.", exercises: RUN_PROTOCOLS.long_run });
        }
        
        // --- RENFORCEMENT POUR RUNNERS (Force / Hypertrophie / Street) ---
        const strengthCount = isTaper ? Math.max(0, userData.strengthDaysPerWeek - 2) : userData.strengthDaysPerWeek;
        
        for(let s=1; s<=strengthCount; s++) {
            let gymType = ""; let exercises = []; let gymAdvice = ""; let gymTags = [];
            
            if (userData.strengthFocus === 'force') {
                if (strengthCount === 2) { if(s===1) { gymType = "Jambes (Force)"; exercises = STRENGTH_PROTOCOLS.force.legs; gymTags=['legs']; gymAdvice = "⚠️ Évitez la veille du Run 2."; } else { gymType = "Haut du Corps"; exercises = STRENGTH_PROTOCOLS.force.upper; gymAdvice = "Récupération active possible."; } }
                else { if(s===1) { gymType = "Jambes (Force)"; exercises = STRENGTH_PROTOCOLS.force.legs; gymTags=['legs']; } else { gymType = "Full Body"; exercises = STRENGTH_PROTOCOLS.force.full; } }
            
            } else if (userData.strengthFocus === 'street_workout') {
                const splitNames = ["Street Push", "Street Pull", "Street Legs", "Street Skills", "Street Full Body"];
                const splitExos = [STRENGTH_PROTOCOLS.street_workout.push, STRENGTH_PROTOCOLS.street_workout.pull, STRENGTH_PROTOCOLS.street_workout.legs, STRENGTH_PROTOCOLS.street_workout.skills_core, STRENGTH_PROTOCOLS.street_workout.full_body];
                const currentSplitIndex = streetSessionIndex % 5;
                gymType = splitNames[currentSplitIndex]; exercises = splitExos[currentSplitIndex];
                if (currentSplitIndex === 2) gymTags = ['legs'];
                streetSessionIndex++;

            } else {
                // Hypertrophie (CORRIGÉ SELON DEMANDE UTILISATEUR)
                const splitNames = ["Push (Pecs/Épaules)", "Pull (Dos/Biceps/Abdos)", "Legs (Jambes)", "Épaules & Bras", "Dos & Pecs"];
                const splitExos = [STRENGTH_PROTOCOLS.hypertrophy.push, STRENGTH_PROTOCOLS.hypertrophy.pull, STRENGTH_PROTOCOLS.hypertrophy.legs, STRENGTH_PROTOCOLS.hypertrophy.shoulders_arms, STRENGTH_PROTOCOLS.hypertrophy.chest_back];
                const currentSplitIndex = hypertrophySessionIndex % 5;
                gymType = splitNames[currentSplitIndex]; exercises = splitExos[currentSplitIndex];
                if (currentSplitIndex === 2) gymTags = ['legs'];
                hypertrophySessionIndex++;
            }

            sessions.push({ id: `w${i}-s${s}`, day: `GYM ${s}`, category: 'strength', type: gymType, structure: 'pyramid', intensity: 'high', duration: "60-90 min", durationMin: 75, paceTarget: "N/A", paceGap: 0, rpe: 8, description: `Séance ${gymType}.`, scienceNote: "Renforcement.", planningAdvice: gymAdvice, exercises: exercises, tags: gymTags });
        }
      }

      // Finalisation semaine
      const weeklySchedule = getRecommendedSchedule(sessions);
      newPlan.push({ weekNumber: i, focus, volumeLabel, sessions, schedule: weeklySchedule });
    }
    setPlan(newPlan);
    setStep('result');
  };

  const resetPlan = () => {
    localStorage.removeItem('clab_storage'); 
    setCompletedSessions(new Set());
    setCompletedExercises(new Set());
    setUserData(defaultUserData);
    setStep('input');
    setPlan([]);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center sm:py-10 text-slate-800 font-sans">
      <div className="w-full max-w-md sm:max-w-3xl bg-slate-50 min-h-screen sm:min-h-fit sm:rounded-3xl sm:shadow-2xl overflow-hidden flex flex-col relative">
       
      {step === 'input' && (
        <div className="bg-slate-900 relative overflow-hidden text-white pt-12 pb-24 rounded-b-[3rem] shadow-2xl">
            <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
            <div className="absolute -top-20 -right-20 bg-indigo-600 rounded-full w-64 h-64 blur-3xl opacity-30"></div>
            <div className="absolute top-20 -left-20 bg-rose-600 rounded-full w-64 h-64 blur-3xl opacity-20"></div>

            <div className="max-w-3xl mx-auto px-6 relative z-10 text-center">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6 animate-in fade-in slide-in-from-top-4 duration-700">
                    <GraduationCap size={14} className="text-yellow-400"/> Ingénierie de la Performance
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 leading-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
                    C-Lab <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-rose-400">Performance</span>
                </h1>
                <p className="text-slate-300 text-lg md:text-xl max-w-xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000">
                    La science de l'entraînement au service de votre objectif. <br/>
                    <span className="text-sm opacity-75">Optimisation de l'interférence • Planification Polarisée</span>
                </p>
                <div className="flex justify-center gap-8 mt-8 text-xs font-bold text-slate-400 uppercase tracking-widest animate-in fade-in duration-1000 delay-300">
                    <div className="flex items-center gap-2"><ShieldCheck size={16}/> Scientifique</div>
                    <div className="flex items-center gap-2"><Layers size={16}/> Hybride</div>
                    <div className="flex items-center gap-2"><FlaskConical size={16}/> C-Lab</div>
                </div>
            </div>
        </div>
      )}

      {step === 'result' && (
        <div className="bg-slate-900 text-white p-6 rounded-b-3xl shadow-lg sticky top-0 z-50">
            <div className="max-w-3xl mx-auto flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-3">
                <button onClick={() => setStep('input')} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition" title="Retour Menu">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <div className="flex items-center gap-2 text-yellow-400 text-xs font-bold uppercase tracking-wider mb-1">
                    <FlaskConical size={12}/> C-Lab Performance
                    </div>
                    <h1 className="text-xl md:text-2xl font-black">Plan {userData.targetDistance === 'hyrox' ? 'HYROX' : 'Running'}</h1>
                </div>
            </div>
             <div className="flex w-full sm:w-auto bg-slate-800 rounded-lg p-1">
                    <button onClick={() => setActiveTab('plan')} className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-xs font-bold transition text-center ${activeTab === 'plan' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>Programme</button>
                    <button onClick={() => setActiveTab('stats')} className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-xs font-bold transition text-center ${activeTab === 'stats' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>Science</button>
              </div>
            </div>
        </div>
      )}

      <main className="max-w-3xl mx-auto px-4 mt-6 flex-1 w-full relative z-20 pb-20">
        
        {modalExercise && (
            <ExerciseModal 
                exercise={modalExercise.data} 
                exerciseId={modalExercise.id} 
                category={modalExercise.category} 
                exerciseIndex={modalExercise.index} 
                onClose={() => setModalExercise(null)} 
                onComplete={(uniqueId, isExercise) => handleSessionCompleteFromModal(uniqueId, isExercise)}
            />
        )}

        {step === 'input' ? (
          <div className="-mt-16 bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 md:p-10 space-y-8 animate-in slide-in-from-bottom-12 duration-500">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4">
                <Award className="text-indigo-600"/> Objectif Principal
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {['5k', '10k', '21k', '42k', 'hyrox'].map((type) => (
                    <button 
                        key={type}
                        onClick={() => handleDistanceSelect(type)}
                        className={`py-3 px-2 rounded-xl text-sm font-black transition-all ${userData.targetDistance === type 
                            ? type === 'hyrox' ? 'bg-yellow-400 text-yellow-900 shadow-lg scale-105 ring-2 ring-yellow-200' : 'bg-indigo-600 text-white shadow-lg scale-105 ring-2 ring-indigo-200' 
                            : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50'}`}
                    >
                        {type === 'hyrox' ? 'HYROX' : type.toUpperCase()}
                    </button>
                ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-400 uppercase">
                    {userData.targetDistance === 'hyrox' ? "Temps Cible Hyrox" : `Chrono ${userData.targetDistance.toUpperCase()}`}
                </label>
                <div className="flex items-center bg-slate-50 p-1 rounded-xl border-2 border-transparent focus-within:border-indigo-100 transition">
                    <button onClick={() => handleTimeChange(-1)} className="p-4 bg-white rounded-lg shadow-sm text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition active:scale-95"><Minus size={20} /></button>
                    <div className="flex-1 text-center relative">
                        <div className="w-full bg-transparent text-center font-black text-3xl text-indigo-600 p-2">
                            {formatGoalTime(userData.goalTime)}
                        </div>
                        <Target className="absolute top-1/2 -translate-y-1/2 right-2 text-indigo-100 opacity-50 pointer-events-none" size={40} />
                    </div>
                    <button onClick={() => handleTimeChange(1)} className="p-4 bg-white rounded-lg shadow-sm text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition active:scale-95"><Plus size={20} /></button>
                </div>
                {userData.targetDistance !== 'hyrox' && (
                    <p className="text-xs text-slate-400 text-center mt-2">Allure cible : {formatPace(userData.goalTime / (userData.targetDistance === '21k' ? 21.1 : userData.targetDistance === '42k' ? 42.195 : parseInt(userData.targetDistance)))}/km</p>
                )}
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-400 uppercase">Durée Prépa</label>
                <div className="flex items-center bg-slate-50 p-1 rounded-xl border-2 border-transparent focus-within:border-slate-300 transition">
                    <button onClick={() => setUserData({...userData, durationWeeks: Math.max(4, userData.durationWeeks - 1)})} className="p-4 bg-white rounded-lg shadow-sm text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition active:scale-95"><Minus size={20} /></button>
                    <div className="flex-1 text-center relative">
                        <input type="number" value={userData.durationWeeks} onChange={(e) => setUserData({...userData, durationWeeks: Number(e.target.value)})} className="w-full bg-transparent text-center font-black text-3xl text-slate-700 outline-none p-2"/>
                        <Clock className="absolute top-1/2 -translate-y-1/2 right-2 text-slate-200 opacity-50 pointer-events-none" size={40} />
                    </div>
                    <button onClick={() => setUserData({...userData, durationWeeks: userData.durationWeeks + 1})} className="p-4 bg-white rounded-lg shadow-sm text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition active:scale-95"><Plus size={20} /></button>
                </div>
                <p className="text-xs text-slate-400 text-center mt-2">{userData.durationWeeks} semaines de progression</p>
              </div>
            </div>

            {userData.targetDistance === 'hyrox' ? (
                <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-200 space-y-6">
                    <h3 className="font-bold text-yellow-800 flex items-center gap-2"><Medal size={18}/> Configuration Hyrox</h3>
                    <div className="space-y-3">
                         <label className="text-xs font-bold text-yellow-800 uppercase flex items-center gap-2">Séances HYROX (Mixte)</label>
                         <div className="flex gap-2">
                             {[2,3,4,5].map(n => (
                                 <button key={n} onClick={() => setUserData({...userData, hyroxSessionsPerWeek: n})} className={`flex-1 py-3 rounded-xl text-sm font-bold transition ${userData.hyroxSessionsPerWeek === n ? 'bg-yellow-500 text-white shadow-lg' : 'bg-white border border-yellow-200 text-yellow-700'}`}>{n}</button>
                             ))}
                         </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                             <label className="text-xs font-bold text-indigo-800 uppercase">Run Pur (+)</label>
                             <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-yellow-200">
                                 <button onClick={() => setUserData({...userData, extraRunSessions: Math.max(0, userData.extraRunSessions - 1)})} className="p-2 bg-indigo-100 rounded-lg text-indigo-700"><Minus size={14}/></button>
                                 <span className="flex-1 text-center font-bold text-indigo-900">{userData.extraRunSessions}</span>
                                 <button onClick={() => setUserData({...userData, extraRunSessions: Math.min(3, userData.extraRunSessions + 1)})} className="p-2 bg-indigo-100 rounded-lg text-indigo-700"><Plus size={14}/></button>
                             </div>
                         </div>
                         <div className="space-y-2">
                             <label className="text-xs font-bold text-rose-800 uppercase">Renfo Pur (+)</label>
                             <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-yellow-200">
                                 <button onClick={() => setUserData({...userData, extraStrengthSessions: Math.max(0, userData.extraStrengthSessions - 1)})} className="p-2 bg-rose-100 rounded-lg text-rose-700"><Minus size={14}/></button>
                                 <span className="flex-1 text-center font-bold text-rose-900">{userData.extraStrengthSessions}</span>
                                 <button onClick={() => setUserData({...userData, extraStrengthSessions: Math.min(3, userData.extraStrengthSessions + 1)})} className="p-2 bg-rose-100 rounded-lg text-rose-700"><Plus size={14}/></button>
                             </div>
                         </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-indigo-400 uppercase flex items-center gap-2"><Footprints size={14}/> Runs / Semaine</label>
                        <div className="flex gap-2">{[2,3,4].map(n => (<button key={n} onClick={() => setUserData({...userData, runDaysPerWeek: n})} className={`flex-1 py-3 rounded-xl text-sm font-bold transition ${userData.runDaysPerWeek === n ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white border border-slate-200 text-slate-400 hover:border-indigo-300'}`}>{n}</button>))}</div>
                    </div>
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-rose-400 uppercase flex items-center gap-2"><Dumbbell size={14}/> Muscu / Semaine</label>
                        <div className="flex gap-2 flex-wrap">{[0,1,2,3,4,5].map(n => (<button key={n} onClick={() => setUserData({...userData, strengthDaysPerWeek: n})} className={`flex-1 py-3 min-w-[30px] rounded-xl text-sm font-bold transition ${userData.strengthDaysPerWeek === n ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'bg-white border border-slate-200 text-slate-400 hover:border-rose-300'}`}>{n}</button>))}</div>
                    </div>
                </div>
            )}

            {userData.strengthDaysPerWeek > 0 && userData.targetDistance !== 'hyrox' && (
                <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Target size={14}/> Objectif Renforcement</label>
                    <div className="flex gap-4 bg-slate-50 p-1 rounded-xl border border-slate-200">
                        <button onClick={() => setUserData({...userData, strengthFocus: 'force'})} className={`flex-1 py-3 rounded-lg text-sm font-bold flex flex-col items-center gap-1 transition ${userData.strengthFocus === 'force' ? 'bg-white shadow-md text-rose-600 border border-rose-100' : 'text-slate-400 hover:bg-white/50'}`}><span>Force & Puissance</span><span className="text-[9px] font-normal opacity-70">5 reps • Repos long • Lourd</span></button>
                        <button onClick={() => setUserData({...userData, strengthFocus: 'hypertrophy'})} className={`flex-1 py-3 rounded-lg text-sm font-bold flex flex-col items-center gap-1 transition ${userData.strengthFocus === 'hypertrophy' ? 'bg-white shadow-md text-indigo-600 border border-indigo-100' : 'text-slate-400 hover:bg-white/50'}`}><span>Hypertrophie & Volume</span><span className="text-[9px] font-normal opacity-70">12 reps • Repos court • Pump</span></button>
                        <button onClick={() => setUserData({...userData, strengthFocus: 'street_workout'})} className={`flex-1 py-3 rounded-lg text-sm font-bold flex flex-col items-center gap-1 transition ${userData.strengthFocus === 'street_workout' ? 'bg-white shadow-md text-orange-600 border border-orange-100' : 'text-slate-400 hover:bg-white/50'}`}><span>Street Workout</span><span className="text-[9px] font-normal opacity-70">Poids du corps • Skills • Agilité</span></button>
                    </div>
                </div>
            )}

            <button onClick={generatePlan} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-xl hover:bg-slate-800 transition transform active:scale-[0.98] flex items-center justify-center gap-3">
                <Sparkles size={20} className="text-yellow-400"/>
                Générer mon Plan
            </button>
          </div>
        ) : activeTab === 'plan' ? (
          // --- ONGLET PROGRAMME ---
          <div className="space-y-4 animate-in slide-in-from-right-4">
            
            {userData.difficultyFactor > 1 && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 animate-in fade-in">
                    <AlertTriangle className="text-amber-500 shrink-0" size={20}/>
                    <div>
                        <h4 className="font-bold text-amber-800 text-sm">Mode Adapté Activé</h4>
                        <p className="text-xs text-amber-700 mt-1">Le plan a été ralenti de {Math.round((userData.difficultyFactor - 1)*100)}% suite à votre feedback. Les allures sont plus douces pour favoriser la récupération.</p>
                    </div>
                </div>
            )}
            
            {feedbackMessage && (
                <div className={`p-3 rounded-xl text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 ${feedbackMessage.type === 'warning' ? 'bg-amber-100 text-amber-800' : feedbackMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-indigo-100 text-indigo-800'}`}>
                    {feedbackMessage.type === 'warning' ? <AlertTriangle size={16}/> : <CheckCircle size={16}/>}
                    {feedbackMessage.text}
                </div>
            )}

            {activeTab === 'plan' && step === 'result' && (
             <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl mb-4 flex items-start gap-3 text-xs text-indigo-800 animate-in fade-in">
                <Move size={16} className="shrink-0 mt-0.5"/>
                <p>
                    <strong>Flexibilité :</strong> Vous pouvez réorganiser votre semaine en cliquant sur les flèches <ArrowRightLeft className="inline w-3 h-3"/> pour échanger deux jours.
                </p>
             </div>
            )}

            {plan.map((week, weekIdx) => {
                const isOpen = expandedWeek === week.weekNumber;
                const sessionsToShow = filteredSessionIds ? week.sessions.filter(s => filteredSessionIds.includes(s.id)) : week.sessions;
                const allSessionsCompleted = week.sessions.every(s => completedSessions.has(s.id));
                const headerBgClass = allSessionsCompleted ? 'bg-green-50 border-green-200' : isOpen ? 'bg-slate-50/50 border-slate-200' : 'bg-white border-slate-100';
                const headerIconClass = allSessionsCompleted ? 'bg-green-600 text-white' : isOpen ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 border border-slate-200';

                return (
                  <div key={week.weekNumber} className={`rounded-xl shadow-sm border overflow-hidden transition-all ${allSessionsCompleted ? 'border-green-200' : 'border-slate-100 bg-white'} ${isOpen ? 'ring-2 ring-indigo-500' : ''}`}>
                    <button onClick={() => setExpandedWeek(isOpen ? null : week.weekNumber)} className={`w-full p-4 flex items-center justify-between ${headerBgClass}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${headerIconClass}`}>{allSessionsCompleted ? <Check size={18}/> : week.weekNumber}</div>
                        <div className="text-left"><h3 className={`font-bold text-sm ${allSessionsCompleted ? 'text-green-800' : 'text-slate-700'}`}>{week.focus}</h3>{allSessionsCompleted && <span className="text-[10px] text-green-600 font-medium">Semaine validée</span>}</div>
                      </div>
                      {isOpen ? <ChevronUp size={16} className="text-indigo-500"/> : <ChevronDown size={16} className="text-slate-300"/>}
                    </button>
                    
                    {isOpen && (
                      <div className="p-2 space-y-2">
                        {/* PLANNING IDEAL SUGGÉRÉ (DND) */}
                        {week.schedule && week.schedule.length > 0 && (
                            <div className="mx-1 mb-4 border-2 border-slate-100 rounded-xl overflow-hidden bg-slate-50/50">
                                <div className="bg-slate-100 px-4 py-2 flex items-center justify-between border-b border-slate-200">
                                    <div className="flex items-center gap-2"><Calendar size={14} className="text-slate-500"/><h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide">Planning Semaine</h4></div>
                                    <div className="flex items-center gap-3">
                                        {filteredSessionIds && (
                                            <button onClick={() => setFilteredSessionIds(null)} className="text-[10px] text-indigo-600 font-bold flex items-center gap-1 hover:underline"><RotateCcw size={10}/> Voir tout</button>
                                        )}
                                        <button onClick={() => resetWeekOrder(week.weekNumber)} className="text-[10px] text-slate-400 hover:text-indigo-600 font-bold flex items-center gap-1 transition-colors" title="Réinitialiser l'ordre"><RotateCcw size={10}/> Ordre</button>
                                        <button onClick={() => resetWeekProgress(week)} className="text-[10px] text-slate-400 hover:text-rose-600 font-bold flex items-center gap-1 transition-colors" title="Réinitialiser la progression"><Trash2 size={10}/> Zéro</button>
                                    </div>
                                </div>
                                <div className="p-3 grid grid-cols-1 gap-2 text-xs">
                                    {week.schedule.map((day, i) => {
                                        const isSelected = filteredSessionIds && day.sessionIds !== null && day.sessionIds.length === filteredSessionIds.length && day.sessionIds.every((val, index) => val === filteredSessionIds[index]);
                                        const hasActivity = day.sessionIds.length > 0;
                                        const isDayCompleted = hasActivity && day.sessionIds.every(id => completedSessions.has(id));
                                        const isSwapSource = swapSelection && swapSelection.weekIdx === week.weekNumber && swapSelection.dayIdx === i;

                                        return (
                                            <div key={i} className={`flex items-center justify-between p-2 rounded border transition select-none ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : isDayCompleted ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'} ${isSwapSource ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50 animate-pulse' : ''} ${swapSelection && !isSwapSource ? 'cursor-pointer hover:bg-slate-50' : ''}`}
                                                onClick={() => {
                                                    if (swapSelection) { handleSwapRequest(week.weekNumber, i); }
                                                    else if (hasActivity) { const idsToFilter = day.sessionIds; handleDayClick(idsToFilter); }
                                                }}
                                            >
                                                <div className="flex items-center gap-3">
                                                     <button onClick={(e) => { e.stopPropagation(); handleSwapRequest(week.weekNumber, i); }} className={`p-1 rounded-md transition-colors ${isSwapSource ? 'bg-indigo-200 text-indigo-700' : 'bg-slate-100 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`} title="Déplacer ce jour"><ArrowRightLeft size={12}/></button>
                                                     <span className={`font-bold w-16 ${isSelected ? 'text-white' : 'text-slate-800'}`}>{day.day}</span>
                                                </div>
                                                <div className="flex items-center gap-1 overflow-hidden">
                                                     {isDayCompleted && !isSelected && <CheckCircle size={10} className="text-green-500 shrink-0"/>}
                                                     <span className={`font-medium truncate ${isSelected ? 'text-indigo-100' : day.activity.includes('Repos') ? 'text-slate-400' : 'text-indigo-600'}`}>{day.activity}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {sessionsToShow.length > 0 ? (
                            sessionsToShow.map((session) => {
                            const isDone = completedSessions.has(session.id);
                            const isExpandedSession = expandedSession === session.id;
                            const completedCount = session.exercises ? session.exercises.filter((_, i) => completedExercises.has(`${session.id}-ex-${i}`)).length : 0;
                            const isSessionFullyDone = session.exercises && completedCount === session.exercises.length;

                            return (
                                <div key={session.id} className={`rounded-lg border transition animate-in slide-in-from-bottom-2 ${isDone ? 'bg-green-50 border-green-200 opacity-100' : 'bg-white border-slate-100 hover:border-indigo-200 shadow-sm'}`}>
                                <div onClick={() => { if(session.exercises) { setExpandedSession(isExpandedSession ? null : session.id); } else { toggleSession(session.id); } }} className="p-3 cursor-pointer relative">
                                    {isDone && (
                                        <button onClick={(e) => { e.stopPropagation(); unvalidateSession(session.id); }} className="absolute top-2 right-2 text-green-600 hover:text-green-800 bg-white p-1 rounded-full shadow-sm z-20" title="Annuler la validation"><Undo2 size={14} /></button>
                                    )}
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-2">
                                        {isDone ? <CheckCircle size={16} className="text-green-500"/> : session.category === 'run' ? <Footprints size={16} className="text-indigo-500"/> : <Dumbbell size={16} className="text-rose-500"/>}
                                        <span className={`font-bold text-xs uppercase ${isDone ? 'text-green-700' : 'text-slate-700'}`}>{session.type}</span>
                                        </div>
                                        <div className="flex items-center gap-2"><RpeBadge level={session.rpe} /><WorkoutViz structure={session.structure} intensity={session.intensity}/></div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                                                <div className="flex items-center gap-1"><Clock size={12}/> {session.duration}</div>
                                                {session.category === 'run' && session.distance && (<div className="flex items-center gap-1 text-indigo-600 bg-indigo-50 px-1.5 rounded"><Ruler size={12}/> {session.distance}</div>)}
                                            </div>
                                            <p className="text-xs text-slate-600 leading-relaxed">{session.description}</p>
                                            {!isDone && session.planningAdvice && (<div className="flex items-start gap-1.5 mt-1 bg-amber-50 p-2 rounded-lg text-[10px] text-amber-800 border border-amber-100"><Info size={12} className="shrink-0 mt-0.5"/><span><strong>Conseil :</strong> {session.planningAdvice}</span></div>)}
                                    </div>
                                    {session.category === 'run' && session.paceGap > -1 && (<div className="mt-3 pt-2 border-t border-slate-100 flex justify-end items-baseline gap-1"><span className="text-[10px] text-slate-400 uppercase font-bold">Cible</span><span className="font-black text-slate-800 text-sm">{session.paceTarget}</span><span className="text-[9px] text-slate-400">min/km</span></div>)}
                                    {session.exercises && !isDone && (<div className="mt-2 text-center text-[10px] text-slate-400 font-medium">{session.category === 'run' ? "Cliquez pour voir la séance ▼" : "Cliquez pour le suivi série ▼"}</div>)}
                                </div>
                                {isExpandedSession && session.exercises && !isDone && (
                                    <div className="bg-slate-50 border-t border-slate-100 p-3 rounded-b-lg animate-in slide-in-from-top-2">
                                        <h4 className="text-[10px] font-bold uppercase text-slate-400 mb-2">Protocole Scientifique (Cliquer pour info)</h4>
                                        <div className="space-y-2">
                                            {session.exercises.map((exo, idx) => {
                                                const uniqueExerciseId = `${session.id}-ex-${idx}`;
                                                const isChecked = completedExercises.has(uniqueExerciseId);
                                                return (
                                                    <div key={idx} className={`bg-white p-2 rounded border transition-colors flex items-center gap-3 ${isChecked ? 'border-green-200 bg-green-50' : 'border-slate-200 hover:border-indigo-200 hover:bg-indigo-50'}`}>
                                                        {session.category !== 'run' && (
                                                        <div onClick={(e) => { e.stopPropagation(); toggleExercise(uniqueExerciseId); }} className="cursor-pointer">
                                                            {isChecked ? <CheckSquare size={20} className="text-green-500" /> : <Square size={20} className="text-slate-300 hover:text-indigo-400" />}
                                                        </div>
                                                        )}
                                                        <div className="flex-1 flex justify-between items-center cursor-help" onClick={() => setModalExercise({data: exo, id: session.id, category: session.category, index: idx})}>
                                                            <div className="flex items-center gap-2">
                                                                <HelpCircle size={14} className="text-slate-300"/>
                                                                <div className={isChecked ? 'opacity-50' : ''}>
                                                                    <div className="font-bold text-xs text-slate-800">{exo.name}</div>
                                                                    <div className="text-[10px] text-slate-500">{exo.sets.toString().includes('min') || exo.sets.toString().includes('bloc') ? exo.sets : `${exo.sets} séries`} • {exo.reps.includes('reps') ? exo.reps : `${exo.reps}`} {exo.rest !== '-' ? `• R: ${exo.rest}` : ''}</div>
                                                                </div>
                                                            </div>
                                                            <div className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isChecked ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>RPE {exo.rpe}</div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {/* Bouton global pour valider la séance entière */}
                                        { (session.category === 'run' || isSessionFullyDone) && (
                                            <button onClick={() => toggleSession(session.id)} className="mt-3 w-full py-2 bg-green-500 text-white rounded font-bold text-xs flex items-center justify-center gap-1 animate-in fade-in slide-in-from-bottom-2"><CheckCircle size={12} /> {session.category === 'run' ? "Terminer la séance" : "Valider toute la séance"}</button>
                                        )}
                                    </div>
                                )}
                                </div>
                            );
                            })
                        ) : (
                            <div className="p-8 text-center text-slate-400 text-xs italic animate-in fade-in">Aucune séance prévue ce jour-là. Repos ! 💤</div>
                        )}
                      </div>
                    )}
                    
                    {/* FEEDBACK SEMAINE - SEULEMENT SI TOUT EST FINI */}
                    {isOpen && allSessionsCompleted && (
                        <div className="p-4 border-t border-green-100 bg-green-50 flex flex-col gap-3 animate-in slide-in-from-bottom-2">
                            <div className="flex items-center gap-2 text-green-800 text-sm font-bold"><Award size={18}/> Semaine Terminée ! Bilan ?</div>
                            <div className="flex gap-2">
                                <button onClick={() => adaptDifficulty(week.weekNumber, 'easier')} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-white border border-green-200 text-slate-600 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-50 transition"><ThumbsDown size={14}/> Trop dur</button>
                                <button onClick={() => adaptDifficulty(week.weekNumber, 'keep')} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 border border-green-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-green-700 transition"><CheckCircle size={14}/> Parfait</button>
                                <button onClick={() => adaptDifficulty(week.weekNumber, 'harder')} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-white border border-green-200 text-slate-600 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-50 transition"><Zap size={14}/> Trop facile</button>
                            </div>
                        </div>
                    )}
                  </div>
                );
            })}
          </div>
        ) : (
          // --- ONGLET STATS & SCIENCE (Complet) ---
          <div className="space-y-6 animate-in slide-in-from-left-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6"><BarChart3 className="text-indigo-600"/> Votre Progression</h3>
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center p-3 bg-slate-50 rounded-xl"><div className="text-2xl font-black text-indigo-600">{stats ? stats.progress : 0}%</div><div className="text-[10px] font-bold text-slate-400 uppercase">Programme</div></div>
                <div className="text-center p-3 bg-slate-50 rounded-xl"><div className="text-2xl font-black text-slate-800">{stats ? stats.totalKm : 0}</div><div className="text-[10px] font-bold text-slate-400 uppercase">Km Courus</div></div>
                <div className="text-center p-3 bg-slate-50 rounded-xl"><div className="text-2xl font-black text-slate-800">{stats ? stats.sessionsDone : 0}</div><div className="text-[10px] font-bold text-slate-400 uppercase">Séances</div></div>
              </div>
              <div className="space-y-8">
                <div><h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Respect du modèle Polarisé (80/20)</h4><PolarizationChart low={stats?.intensityBuckets.low || 0} high={stats?.intensityBuckets.high || 0} /></div>
                <div><h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Volume Hebdomadaire (Minutes)</h4><WeeklyVolumeChart plannedData={stats?.weeklyVolume || []} realizedData={stats?.realizedWeeklyVolume || []} /></div>
              </div>
            </div>
            <div className="bg-slate-900 text-white rounded-2xl shadow-lg p-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-6 opacity-10"><Brain size={120}/></div>
               <h3 className="font-bold text-xl flex items-center gap-2 mb-6 relative z-10"><BookOpen className="text-yellow-400"/> Validation Scientifique</h3>
               <div className="space-y-4 relative z-10">
                 <div className="bg-white/10 backdrop-blur border border-white/10 p-4 rounded-xl">
                   <div className="flex items-start gap-3"><div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400"><Activity size={18}/></div>
                     <div><h4 className="font-bold text-sm">Entraînement Polarisé</h4><p className="text-xs text-slate-300 mt-1 leading-relaxed">Votre plan suit la distribution des intensités de <strong>Stephen Seiler (2010)</strong>. 80% du volume est effectué à basse intensité (Zone 1/2) pour maximiser la densité mitochondriale sans fatigue excessive.</p></div>
                   </div>
                 </div>
                 <div className="bg-white/10 backdrop-blur border border-white/10 p-4 rounded-xl">
                   <div className="flex items-start gap-3"><div className="bg-indigo-500/20 p-2 rounded-lg text-indigo-400"><TrendingUp size={18}/></div>
                     <div><h4 className="font-bold text-sm">RPE (Ressenti)</h4><p className="text-xs text-slate-300 mt-1 leading-relaxed">Nous utilisons l'échelle <strong>Borg CR-10</strong> modifiée par Foster pour quantifier la charge interne. C'est souvent plus fiable que la fréquence cardiaque seule.</p></div>
                   </div>
                 </div>
                 {userData.strengthDaysPerWeek > 0 && (
                   <div className="bg-white/10 backdrop-blur border border-white/10 p-4 rounded-xl">
                    <div className="flex items-start gap-3"><div className="bg-amber-500/20 p-2 rounded-lg text-amber-400"><Dumbbell size={18}/></div>
                      <div><h4 className="font-bold text-sm">Effet d'Interférence</h4><p className="text-xs text-slate-300 mt-1 leading-relaxed">Pour éviter que la muscu ne nuise au run, les séances "Jambes" sont placées de manière stratégique (éloignées des séances VMA) selon <strong>Murach & Bagley (2016)</strong>.</p></div>
                    </div>
                  </div>
                 )}
                 <div className="bg-white/10 backdrop-blur border border-white/10 p-4 rounded-xl">
                   <div className="flex items-start gap-3"><div className="bg-purple-500/20 p-2 rounded-lg text-purple-400"><Target size={18}/></div>
                     <div><h4 className="font-bold text-sm">Modèle de Banister</h4><BanisterChart duration={userData.durationWeeks} /><p className="text-[10px] text-slate-300 mt-2 leading-relaxed italic">Modélisation théorique de la performance (Forme = Fitness - Fatigue). Notez le pic de forme prévu à la fin grâce à l'affûtage.</p></div>
                   </div>
                 </div>
                  <div className="bg-white/10 backdrop-blur border border-white/10 p-4 rounded-xl">
                   <div className="flex items-start gap-3"><div className="bg-blue-500/20 p-2 rounded-lg text-blue-400"><BarChart3 size={18}/></div>
                     <div><h4 className="font-bold text-sm">Charge TRIMP (Training Impulse)</h4><TrimpChart plannedData={stats?.weeklyVolume || []} realizedData={stats?.realizedWeeklyVolume || []} /><p className="text-[10px] text-slate-300 mt-2 leading-relaxed italic">Quantification de la charge interne hebdomadaire pour assurer une surcharge progressive sans blessure.</p></div>
                   </div>
                 </div>
                 {userData.strengthDaysPerWeek > 0 && (
                     <div className="bg-white/10 backdrop-blur border border-white/10 p-4 rounded-xl">
                       <h4 className="font-bold text-sm mb-3">Mécanismes Moléculaires (Interactif)</h4>
                       <InteractiveInterference />
                       <p className="text-[10px] text-slate-300 mt-2 leading-relaxed italic">Testez l'impact de l'espacement des séances sur vos gains musculaires et cardio.</p>
                     </div>
                 )}
               </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER SIGNATURE */}
      {step === 'result' && (
        <footer className="py-8 text-center border-t border-slate-200 mt-12 bg-white/50 backdrop-blur-sm">
            <p className="text-slate-500 font-medium text-sm">Créé par <span className="bg-gradient-to-r from-indigo-600 to-rose-500 bg-clip-text text-transparent font-black">Charles Viennot</span></p>
            <p className="text-slate-400 text-xs mt-1 uppercase tracking-widest flex items-center justify-center gap-2"><GraduationCap size={12} /> Étudiant en Ingénierie du Sport</p>
            <button onClick={resetPlan} className="mt-4 text-[10px] text-slate-300 hover:text-rose-400 flex items-center justify-center gap-1 w-full transition-colors"><RotateCcw size={10}/> Réinitialiser les données</button>
        </footer>
      )}
      </div>
    </div>
  );
}
