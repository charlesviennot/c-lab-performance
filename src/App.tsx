import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, Clock, ChevronDown, ChevronUp, Award, 
  TrendingUp, Info, RotateCcw, 
  Zap, Heart, Sparkles, Footprints,
  Dumbbell, Gauge, BarChart3, BookOpen, CheckCircle, Brain, Target,
  Calendar as CalendarIcon, Ruler, GraduationCap,
  ShieldCheck, Layers, FlaskConical, AlertTriangle, ThumbsDown, ThumbsUp, Calendar, ArrowLeft, Shuffle, X, ExternalLink, HelpCircle, Filter, Check, ZapOff, TrendingDown, Dna, Save, Square, CheckSquare,
  Minus, Plus
} from 'lucide-react';

// ==================================================================================
// 👇👇👇 ZONE DE CONFIGURATION UTILISATEUR 👇👇👇
//
// INSTRUCTION : Remplace le lien ci-dessous par le "Lien Direct" de ton image.
// (Ton lien doit commencer par "https://" et finir par ".png" ou ".jpg")
//
const LOGO_URL = "https://i.postimg.cc/KcQDQ1z4/Capture-d-e-cran-2025-12-08-a-02-13-55.png"; 
//
// 👆👆👆 FIN DE LA ZONE DE CONFIGURATION 👆👆👆
// ==================================================================================

// --- DATA : PROTOCOLES RUNNING ---
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

// --- DATA : BIBLIOTHÈQUE MUSCU ---
const STRENGTH_PROTOCOLS = {
  force: {
    legs: [
      { name: "Back Squat", sets: 5, reps: "3-5", rest: "3-4 min", rpe: 9, note: "Explosif à la montée", imageKeyword: "squat", instructions: "Barre sur les trapèzes, pieds largeur épaules. Descendez fesses en arrière jusqu'à la parallèle. Gardez le dos droit et gainé. Poussez fort dans les talons pour remonter.", 
        imageUrl: "" }, 
      { name: "Deadlift", sets: 3, reps: "5", rest: "3 min", rpe: 8, note: "Chaîne post.", imageKeyword: "deadlift", instructions: "Barre au sol contre les tibias. Dos plat, poitrine sortie. Poussez le sol avec les jambes avant de tirer avec le dos. Extension complète de hanche en haut.", 
        imageUrl: "" },
      { name: "Fentes Arrière (Lourd)", sets: 3, reps: "6/jambe", rest: "2 min", rpe: 8, note: "Stabilité.", imageKeyword: "lunge", instructions: "Un grand pas en arrière. Descendez le genou arrière proche du sol. Gardez le buste droit. Poussez avec la jambe avant pour revenir.", 
        imageUrl: "" },
      { name: "Box Jumps", sets: 5, reps: "3", rest: "2 min", rpe: 10, note: "Explosivité.", imageKeyword: "boxjump", instructions: "Saut explosif sur une boite (~60cm). Atterrissez en douceur, genoux fléchis. Extension complète des hanches en l'air.", 
        imageUrl: "" }
    ],
    upper: [
      { name: "Weighted Pull-ups", sets: 5, reps: "5", rest: "3 min", rpe: 9, note: "Lesté.", imageKeyword: "pullup", instructions: "Tractions prise pronation. Menton au-dessus de la barre. Contrôlez la descente. Ajoutez du poids si > 8 reps faciles.", 
        imageUrl: "" },
      { name: "Military Press", sets: 5, reps: "5", rest: "3 min", rpe: 8, note: "Force épaules.", imageKeyword: "shoulder press", instructions: "Debout, barre sur les clavicules. Développez au-dessus de la tête sans cambrer le dos (gainage fort). Verrouillez les coudes.", 
        imageUrl: "" },
      { name: "Pendlay Row", sets: 4, reps: "6", rest: "2 min", rpe: 8, note: "Explosif.", imageKeyword: "barbell row", instructions: "Buste parallèle au sol. Tirez la barre explosivement vers le bas de la poitrine. Reposez la barre au sol à chaque rep.", 
        imageUrl: "" },
      { name: "Core Hold (Lesté)", sets: 4, reps: "30s", rest: "90s", rpe: 8, note: "Gainage.", imageKeyword: "plank", instructions: "Planche abdominale avec un disque sur le dos. Corps aligné, fessiers serrés. Ne laissez pas le bassin tomber.", 
        imageUrl: "" }
    ],
    full: [
      { name: "Trap Bar Deadlift", sets: 5, reps: "5", rest: "3 min", rpe: 9, note: "Force globale.", imageKeyword: "deadlift", instructions: "Variante plus sûre du deadlift. Poussez dans les jambes comme un squat inversé. Gardez les bras tendus.", 
        imageUrl: "" },
      { name: "Bench Press", sets: 5, reps: "5", rest: "3 min", rpe: 9, note: "Poussée.", imageKeyword: "bench press", instructions: "Dos plat sur le banc, pieds ancrés au sol. Descendez la barre milieu de poitrine. Poussez explosivement.", 
        imageUrl: "" },
      { name: "Weighted Squat", sets: 4, reps: "6", rest: "3 min", rpe: 8, note: "Jambes.", imageKeyword: "squat", instructions: "Voir Back Squat.", 
        imageUrl: "" },
      { name: "Farmers Walk", sets: 3, reps: "20m", rest: "2 min", rpe: 9, note: "Grip & Core.", imageKeyword: "gym", instructions: "Marchez avec deux haltères très lourds. Posture parfaite, épaules en arrière. Ne pas dandiner.", 
        imageUrl: "" }
    ]
  },
  hypertrophy: {
    push: [ 
      { name: "Développé Couché Haltères", sets: 4, reps: "10-12", rest: "90s", rpe: 8, note: "Amplitude max.", imageKeyword: "bench press dumbbells", instructions: "Plus d'amplitude qu'à la barre. Bien étirer les pecs en bas. Resserrer en haut sans claquer les haltères.", 
        imageUrl: "https://i.postimg.cc/pLfpNd9Q/De-veloppe-Couche-Halte-res.png" },
      { name: "Développé Militaire", sets: 4, reps: "12", rest: "90s", rpe: 8, note: "Contrôle.", imageKeyword: "shoulder press", instructions: "Assis ou debout. Contrôlez la descente (3 sec) pour maximiser le temps sous tension.", 
        imageUrl: "https://i.postimg.cc/T1vJpxSR/dev_militaire.png" },
      { name: "Dips", sets: 3, reps: "Max", rest: "60s", rpe: 9, note: "Finisher.", imageKeyword: "dips", instructions: "Penchez-vous en avant pour cibler les pecs. Descendez jusqu'à ce que les épaules soient sous les coudes.", 
        imageUrl: "https://i.postimg.cc/cCGBrWjx/dips.png" },
      { name: "Élévations Latérales", sets: 4, reps: "15-20", rest: "45s", rpe: 9, note: "Faisceau Latéral.", imageKeyword: "gym workout", instructions: "Bras légèrement fléchis. Montez les coudes, pas les mains. Imaginez verser une carafe d'eau en haut.", 
        imageUrl: "https://i.postimg.cc/Xq6kpWh7/elevation_late_rale.png" },
      { name: "Extensions Triceps Poulie", sets: 4, reps: "15", rest: "45s", rpe: 9, note: "Isolation.", imageKeyword: "triceps", instructions: "Coudes collés au corps. Seuls les avant-bras bougent. Contractez fort en bas.", 
        imageUrl: "https://i.postimg.cc/prQYj7bn/Extensions_Triceps_Poulie.png" },
      { name: "Écarté Poulie Vis-à-vis", sets: 3, reps: "15-20", rest: "45s", rpe: 9, note: "Finition Pecs.", imageKeyword: "cable crossover", instructions: "Cherchez la contraction maximale en croisant les mains. Gardez les coudes ouverts.", 
        imageUrl: "https://i.postimg.cc/9M7Bm0Lf/ecarte_poulie.png" }
    ],
    pull: [
      { name: "Tirage Vertical", sets: 4, reps: "12", rest: "90s", rpe: 8, note: "Largeur dos.", imageKeyword: "lat pulldown", instructions: "Tirez la barre vers le haut de la poitrine. Sortez la cage thoracique. Ne balancez pas le buste.", 
        imageUrl: "https://i.postimg.cc/Lsg7r9F4/tirage_vertical.png" },
      { name: "Rowing Barre", sets: 4, reps: "10", rest: "90s", rpe: 8, note: "Épaisseur.", imageKeyword: "rowing", instructions: "Buste penché à 45°. Tirez vers le nombril en resserrant les omoplates.", 
        imageUrl: "https://i.postimg.cc/3xcVSyVw/rowing.png" },
      { name: "Face Pulls", sets: 4, reps: "15", rest: "60s", rpe: 7, note: "Santé épaules.", imageKeyword: "gym facepull", instructions: "Corde à la poulie haute. Tirez vers le visage en écartant les mains. Cible l'arrière d'épaule.", 
        imageUrl: "https://i.postimg.cc/QxSR7YqH/Face_Pulls.png" },
      { name: "Curl Barre", sets: 4, reps: "12", rest: "60s", rpe: 9, note: "Biceps.", imageKeyword: "bicep curl", instructions: "Coudes fixes. Ne pas utiliser le dos pour lancer la barre.", 
        imageUrl: "https://i.postimg.cc/fT56dqvY/curl_barre.png" },
      { name: "Hammer Curls", sets: 3, reps: "12", rest: "60s", rpe: 9, note: "Brachial.", imageKeyword: "hammer curl", instructions: "Prise marteau (neutre). Cible l'épaisseur du bras et l'avant-bras.", 
        imageUrl: "https://i.postimg.cc/QdtvJg6n/Hammer_curl.png" },
      { name: "Crunchs", sets: 4, reps: "20", rest: "45s", rpe: 8, note: "Abdos.", imageKeyword: "abs", instructions: "Enroulez la colonne, ne tirez pas sur la nuque. Soufflez en montant.", 
        imageUrl: "https://i.postimg.cc/7Z6jn1Bj/crunchs.png" }
    ],
    legs: [ 
      { name: "Squat", sets: 4, reps: "10-12", rest: "3 min", rpe: 8, note: "Base jambes.", imageKeyword: "squat", instructions: "Amplitude complète. Le creux de la hanche doit passer sous le genou si la mobilité le permet.", 
        imageUrl: "https://i.postimg.cc/ry7vNRBY/squat.png" },
      { name: "Presse à cuisses", sets: 4, reps: "12-15", rest: "2 min", rpe: 9, note: "Volume.", imageKeyword: "leg press", instructions: "Pieds largeur épaules. Descendez genoux vers épaules. Ne verrouillez pas les genoux en haut.", 
        imageUrl: "https://i.postimg.cc/tgD5S8YP/legs_press.png" },
      { name: "Fentes Marchées", sets: 3, reps: "12/jambe", rest: "90s", rpe: 8, note: "Unilatéral.", imageKeyword: "lunges", instructions: "Faites des pas de géant. Le genou arrière frôle le sol. Gardez le rythme.", 
        imageUrl: "https://i.postimg.cc/FKGZWw7S/fente_marche.png" },
      { name: "Leg Curl", sets: 4, reps: "15", rest: "60s", rpe: 9, note: "Ischios.", imageKeyword: "leg curl", instructions: "Contrôlez la phase retour (excentrique). Ne décollez pas les hanches du banc.", 
        imageUrl: "https://i.postimg.cc/6Qz0jFyn/Legs_curl.png" },
      { name: "Leg Extension", sets: 3, reps: "20", rest: "45s", rpe: 10, note: "Finition Quads.", imageKeyword: "leg extension", instructions: "Contrôlez la descente. Brûlure garantie.", 
        imageUrl: "https://i.postimg.cc/fk4jSNgv/legs_extension.png" },
      { name: "Mollets Debout", sets: 4, reps: "15", rest: "45s", rpe: 9, note: "Volume.", imageKeyword: "calves", instructions: "Extension maximale sur la pointe des pieds. Pause 1sec en haut, 1sec en bas.", 
        imageUrl: "https://i.postimg.cc/brS9vJL1/mollet_debout.png" }
    ],
    shoulders_arms: [
      { name: "Développé Militaire", sets: 4, reps: "10-12", rest: "90s", rpe: 8, note: "Base Épaules.", imageKeyword: "military press", instructions: "Barre ou haltères. Dos droit, abdos serrés. Poussez la charge au-dessus de la tête sans cambrer.", 
        imageUrl: "" },
      { name: "Élévations Latérales Haltères", sets: 4, reps: "15-20", rest: "45s", rpe: 9, note: "Faisceau Latéral.", imageKeyword: "lateral raise", instructions: "Coude légèrement fléchi. Montez les coudes, pas les mains. Contrôlez la descente.", 
        imageUrl: "" },
      { name: "Curl Biceps Incliné", sets: 3, reps: "12", rest: "60s", rpe: 9, note: "Chef Long Biceps.", imageKeyword: "incline curl", instructions: "Banc à 45°. Laissez les bras pendre derrière le corps pour étirer le biceps. Gardez les coudes fixes.", 
        imageUrl: "" },
      { name: "Extension Triceps Corde", sets: 4, reps: "15", rest: "45s", rpe: 9, note: "Chef Latéral Triceps.", imageKeyword: "tricep pushdown", instructions: "Poulie haute. Écartez la corde en bas du mouvement. Gardez les coudes collés aux côtes.", 
        imageUrl: "" },
      { name: "Élévations Latérales Poulie", sets: 3, reps: "15", rest: "45s", rpe: 9, note: "Tension continue.", imageKeyword: "cable lateral raise", instructions: "Poulie derrière le dos. Mouvement fluide, tension constante sur l'épaule latérale.", 
        imageUrl: "" },
      { name: "Barre au Front (Skullcrusher)", sets: 3, reps: "10-12", rest: "60s", rpe: 8, note: "Masse Triceps.", imageKeyword: "skullcrusher", instructions: "Allongé. Descendez la barre vers le front (ou derrière la tête). Gardez les coudes serrés.", 
        imageUrl: "" },
      { name: "Curl Alterné Haltères", sets: 3, reps: "12/bras", rest: "60s", rpe: 8, note: "Finition Biceps.", imageKeyword: "dumbbell curl", instructions: "Debout. Supination (tournez la paume vers le haut) en montant. Ne balancez pas le buste.", 
        imageUrl: "" }
    ],
    chest_back: [
      { name: "Développé Incliné", sets: 4, reps: "10", rest: "90s", rpe: 8, note: "Haut Pecs.", imageKeyword: "incline bench", instructions: "Banc à 30°. Cible le haut des pectoraux. Touchez la poitrine, poussez.", 
        imageUrl: "" },
      { name: "Tirage Horizontal", sets: 4, reps: "10", rest: "90s", rpe: 8, note: "Dos.", imageKeyword: "seated row", instructions: "Dos droit. Tirez la poignée au bas ventre. Sortez la poitrine.", 
        imageUrl: "" },
      { name: "T-Bar Row", sets: 3, reps: "12", rest: "90s", rpe: 9, note: "Épaisseur Dos.", imageKeyword: "t bar row", instructions: "Dos plat impératif. Tirez avec les coudes.", 
        imageUrl: "" },
      { name: "Écarté Couché", sets: 3, reps: "15", rest: "60s", rpe: 9, note: "Isolation.", imageKeyword: "flyes", instructions: "Ouvrez la cage thoracique. Gardez une légère flexion des coudes.", 
        imageUrl: "" },
      { name: "Pull-over", sets: 3, reps: "15", rest: "60s", rpe: 8, note: "Dos/Pecs.", imageKeyword: "pullover", instructions: "Allongé en travers du banc. Descendez l'haltère derrière la tête bras tendus.", 
        imageUrl: "" },
      { name: "Shrugs", sets: 4, reps: "15", rest: "45s", rpe: 8, note: "Trapèzes.", imageKeyword: "shrugs", instructions: "Haussement d'épaules. Ne roulez pas les épaules, juste haut/bas.", 
        imageUrl: "" }
    ]
  }
};

// --- COMPOSANT MODAL EXERCICE ---
const ExerciseModal = ({ exercise, onClose }) => {
  const [imgError, setImgError] = useState(false);

  if (!exercise) return null;

  const imageSrc = (exercise.imageUrl && exercise.imageUrl !== "" && !imgError) 
    ? exercise.imageUrl 
    : `https://source.unsplash.com/800x600/?fitness,${exercise.imageKeyword}`;

  const objectFitClass = "object-cover opacity-90";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header Image */}
        <div className="h-48 bg-slate-100 relative overflow-hidden bg-white">
            <img 
                src={imageSrc}
                alt={exercise.name}
                className={`w-full h-full ${objectFitClass}`}
                onError={() => setImgError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex items-end p-6 pointer-events-none">
                <div>
                    <h3 className="text-2xl font-black text-white/80 leading-none drop-shadow-md">{exercise.name}</h3>
                    <span className="text-white/60 text-xs font-medium uppercase tracking-wider drop-shadow-sm">
                        {exercise.sets.toString().includes('bloc') || exercise.sets.toString().includes('temps') ? exercise.sets : `${exercise.sets} Séries`} x {exercise.reps}
                    </span>
                </div>
            </div>
            <button onClick={onClose} className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition backdrop-blur-md">
                <X size={20}/>
            </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
            
            {/* Protocole */}
            <div className="flex gap-4">
                <div className="flex-1 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                    <div className="text-xs text-slate-400 font-bold uppercase">Repos / Récup</div>
                    <div className="text-lg font-black text-slate-700">{exercise.rest}</div>
                </div>
                <div className="flex-1 bg-rose-50 p-3 rounded-2xl border border-rose-100 text-center">
                    <div className="text-xs text-rose-400 font-bold uppercase">Intensité</div>
                    <div className="text-lg font-black text-rose-600">RPE {exercise.rpe}</div>
                </div>
            </div>

            {/* Consigne Coach */}
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <div className="bg-indigo-100 p-1.5 rounded-lg text-indigo-600"><Brain size={18}/></div>
                    <h4 className="font-bold text-slate-800">Consigne Technique</h4>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {exercise.instructions}
                </p>
            </div>

            {/* Focus Science */}
            <div>
                 <div className="flex items-center gap-2 mb-2">
                    <div className="bg-emerald-100 p-1.5 rounded-lg text-emerald-600"><Target size={18}/></div>
                    <h4 className="font-bold text-slate-800">Objectif Physiologique</h4>
                </div>
                <p className="text-xs font-medium text-slate-500">
                    {exercise.note}
                </p>
            </div>

            <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition">
                Compris, c'est parti !
            </button>
        </div>
      </div>
    </div>
  );
};

// --- VISUALISATION SÉANCE ---
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

// --- GRAPHIQUES ---
const PolarizationChart = ({ low, high }) => {
  const total = low + high;
  if (total === 0) return <div className="text-xs text-slate-400 italic">Aucune donnée</div>;
  const lowPercent = Math.round((low / total) * 100);
  const highPercent = Math.round((high / total) * 100);
  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex h-4 w-full rounded-full overflow-hidden bg-slate-100">
        <div className="bg-emerald-500 transition-all duration-700" style={{ width: `${lowPercent}%` }}></div>
        <div className="bg-rose-500 transition-all duration-700" style={{ width: `${highPercent}%` }}></div>
      </div>
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
        <span className="text-emerald-600">Endurance ({lowPercent}%)</span>
        <span className="text-rose-600">Intensité ({highPercent}%)</span>
      </div>
    </div>
  );
};

const WeeklyVolumeChart = ({ data }) => {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end justify-between h-24 gap-1 mt-4">
      {data.map((val, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
          <div 
            className="w-full bg-indigo-100 hover:bg-indigo-200 rounded-t-sm transition-all duration-500 relative"
            style={{ height: `${(val / max) * 100}%` }}
          >
             <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
               {val}'
             </div>
          </div>
          <span className="text-[9px] text-slate-400">S{i + 1}</span>
        </div>
      ))}
    </div>
  );
};

const BanisterChart = ({ duration }) => {
    const weeks = Array.from({length: duration + 2}, (_, i) => i); 
    const data = weeks.map(w => {
        const ramp = w / duration; 
        const fitness = 20 + (ramp * 60); 
        const fatigue = w >= duration ? 15 : 10 + (ramp * 70) + (Math.sin(w)*10); 
        const form = fitness - fatigue + 30; 
        return { w, fitness, fatigue, form };
    });

    return (
        <div className="w-full h-48 flex items-end gap-1 mt-6 relative bg-white/50 rounded-xl p-2 border border-slate-100">
             <div className="absolute inset-0 flex flex-col justify-between p-4 opacity-10">
                 <div className="w-full h-px bg-slate-900"></div>
                 <div className="w-full h-px bg-slate-900"></div>
                 <div className="w-full h-px bg-slate-900"></div>
             </div>
             
             {data.map((d, i) => (
                 <div key={i} className="flex-1 flex flex-col justify-end h-full relative group">
                     <div className="w-2 h-2 bg-green-500 rounded-full absolute left-1/2 -translate-x-1/2 transition-all duration-500 z-20 shadow-sm shadow-green-200" style={{ bottom: `${d.form}%` }}></div>
                     <div className="w-1 bg-indigo-400/30 absolute left-1/2 -translate-x-1/2 bottom-0 rounded-t-full" style={{ height: `${d.fitness}%` }}></div>
                      <div className="w-1 bg-rose-400/30 absolute left-1/2 -translate-x-1/2 bottom-0 -translate-x-[2px] rounded-t-full" style={{ height: `${d.fatigue}%` }}></div>
                 </div>
             ))}
             
             <div className="absolute top-2 left-2 flex flex-wrap gap-3 text-[9px] font-bold">
                 <span className="text-green-600 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Forme (Perf)</span>
                 <span className="text-indigo-400 flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-indigo-300"></div> Fitness (CTL)</span>
                 <span className="text-rose-400 flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-rose-300"></div> Fatigue (ATL)</span>
             </div>
        </div>
    );
};

const TrimpChart = ({ volumeData }) => {
    const max = Math.max(...volumeData, 1);
    return (
        <div className="flex items-end justify-between h-32 gap-1 mt-4">
            {volumeData.map((val, i) => {
                const intensityFactor = (i % 4 === 0) ? 0.7 : (i % 4 === 1) ? 0.9 : 0.8;
                const trimp = Math.round(val * intensityFactor);
                return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="w-full bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-sm transition-all duration-1000 relative hover:opacity-80" style={{ height: `${(val / max) * 80 + 10}%` }}>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">TRIMP: {trimp}</div>
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono">S{i + 1}</span>
                </div>
            )})}
        </div>
    );
};

const InterferenceDiagram = () => (
    <div className="relative h-40 bg-slate-50 rounded-xl border border-slate-100 p-4 flex items-center justify-center overflow-hidden mt-4">
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 300 100" preserveAspectRatio="none">
             <path d="M50 30 Q 150 80 250 30" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="5,5" />
        </svg>
        <div className="absolute left-4 top-4 bottom-4 w-1/3 pr-4 flex flex-col justify-between items-end text-right z-10">
            <div className="text-xs font-bold text-indigo-600 flex items-center gap-1">Run <Footprints size={12}/></div>
            <div className="text-[9px] text-slate-400 bg-white/80 px-1 rounded">Stress Métabolique</div>
            <div className="text-xs font-black text-white bg-indigo-500 px-2 py-1 rounded shadow-sm shadow-indigo-200">AMPk ⚡</div>
            <div className="text-[9px] text-indigo-400 font-bold italic">Biogenèse Mito.</div>
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center bg-white/90 p-2 rounded-full border border-rose-100 shadow-sm">
            <div className="bg-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full mb-1">INTERFÉRENCE</div>
            <div className="w-16 h-0.5 bg-slate-200 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-rose-500 rounded-full"></div>
            </div>
            <div className="text-[8px] text-slate-400 text-center mt-1 leading-tight">Si séances<br/>trop proches</div>
        </div>
        <div className="absolute right-4 top-4 bottom-4 w-1/3 pl-4 flex flex-col justify-between items-start z-10">
            <div className="text-xs font-bold text-rose-600 flex items-center gap-1"><Dumbbell size={12}/> Muscu</div>
            <div className="text-[9px] text-slate-400 bg-white/80 px-1 rounded">Tension Mécanique</div>
            <div className="text-xs font-black text-white bg-rose-500 px-2 py-1 rounded shadow-sm shadow-rose-200">mTOR 🧬</div>
            <div className="text-[9px] text-rose-400 font-bold italic">Synthèse Protéique</div>
        </div>
    </div>
);

// --- LOGIQUE PLANNING HEBDO (SLOT FILLING AVEC DOUBLE) ---
const getRecommendedSchedule = (sessions) => {
    const runs = sessions.filter(s => s.category === 'run');
    const gyms = sessions.filter(s => s.category === 'strength');
    
    // Initialisation : chaque jour est un tableau d'activités
    const scheduleData = Array(7).fill(null).map((_, i) => ({
        dayName: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"][i],
        sessions: [],
        focus: ""
    }));

    // --- 1. PLACEMENT DES RUNS (PRIORITÉ) ---
    
    // Dimanche : Longue
    const longRun = runs.find(r => r.type.includes("Longue") || (r.type.includes("Endurance") && r.durationMin >= 50));
    if (longRun) {
        scheduleData[6].sessions.push(longRun);
        scheduleData[6].focus = "Volume Aérobie";
    }

    // Mardi : Qualité
    const qualityRun = runs.find(r => (r.intensity === 'high' || r.intensity === 'medium') && r.id !== longRun?.id);
    if (qualityRun) {
        scheduleData[1].sessions.push(qualityRun);
        scheduleData[1].focus = "Intensité Clé";
    }

    // Jeudi : Endurance 1
    const easyRun1 = runs.find(r => r.id !== longRun?.id && r.id !== qualityRun?.id);
    if (easyRun1) {
        scheduleData[3].sessions.push(easyRun1);
        scheduleData[3].focus = "Assimilation";
    }

    // Samedi : Endurance 2
    const easyRun2 = runs.find(r => r.id !== longRun?.id && r.id !== qualityRun?.id && r.id !== easyRun1?.id);
    if (easyRun2) {
        scheduleData[5].sessions.push(easyRun2);
        scheduleData[5].focus = "Récup Active";
    }

    // --- 2. PLACEMENT DE LA MUSCU (COMBINAISON) ---

    // Identification séance jambes
    const legSession = gyms.find(g => g.exercises?.some(e => e.imageKeyword === "squat" || e.imageKeyword === "lunges"));
    const otherGyms = gyms.filter(g => g.id !== legSession?.id);

    // A. Placement Jambes (Critique)
    if (legSession) {
        // Idéal : Vendredi (Loin du Mardi, veille du Samedi récup)
        // Ou : Jeudi (Doublé avec endurance)
        // Ou : Lundi (Repos course)
        
        if (scheduleData[4].sessions.length === 0) { // Vendredi vide
            scheduleData[4].sessions.push(legSession);
            scheduleData[4].focus = "Force";
        } else if (scheduleData[3].sessions.length > 0) { // Jeudi avec Run (Bi-quotidien ok car run facile)
            scheduleData[3].sessions.push(legSession);
        } else if (scheduleData[0].sessions.length === 0) { // Lundi vide
            scheduleData[0].sessions.push(legSession);
            scheduleData[0].focus = "Force";
        }
    }

    // B. Placement Reste Muscu
    let gymIdx = 0;
    const fillOrder = [0, 2, 4, 5, 3]; 
    
    fillOrder.forEach(dayIdx => {
        if (scheduleData[dayIdx].sessions.length === 0 && gymIdx < otherGyms.length) {
            scheduleData[dayIdx].sessions.push(otherGyms[gymIdx]);
            scheduleData[dayIdx].focus = "Hypertrophie"; 
            gymIdx++;
        }
    });
    
    // Si il reste des séances muscu non placées, on double les jours faciles
    if (gymIdx < otherGyms.length) {
        const doubleDays = [3, 5, 2];
        for (let d of doubleDays) {
            if (gymIdx < otherGyms.length && scheduleData[d].sessions.length === 1 && scheduleData[d].sessions[0].category === 'run') {
                scheduleData[d].sessions.push(otherGyms[gymIdx]);
                gymIdx++;
            }
        }
    }

    // Formatter pour l'affichage
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

// --- APPLICATION MAIN ---
export default function App() {
  
  // --- PERSISTENCE LOGIC (Lazy Initialization) ---
  const loadState = (key, defaultValue) => {
    if (typeof window === 'undefined') return defaultValue;
    try {
        const saved = localStorage.getItem('clab_storage');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Conversion spéciale pour les Sets
            if (key === 'completedSessions') return new Set(parsed.completedSessions || []);
            if (key === 'completedExercises') return new Set(parsed.completedExercises || []); // NOUVEAU
            return parsed[key] !== undefined ? parsed[key] : defaultValue;
        }
    } catch (e) {
        console.error("Erreur chargement sauvegarde", e);
    }
    return defaultValue;
  };

  // NOUVEAU : Effet pour définir l'icône de l'écran d'accueil iPhone
  useEffect(() => {
    // Fonction pour injecter les icônes (Apple + Favicon)
    const updateIcons = () => {
      // Apple Touch Icon
      let appleLink = document.querySelector("link[rel~='apple-touch-icon']");
      if (!appleLink) {
        appleLink = document.createElement('link');
        appleLink.rel = 'apple-touch-icon';
        document.head.appendChild(appleLink);
      }
      appleLink.href = LOGO_URL;

      // Favicon Standard
      let favLink = document.querySelector("link[rel~='icon']");
      if (!favLink) {
        favLink = document.createElement('link');
        favLink.rel = 'icon';
        document.head.appendChild(favLink);
      }
      favLink.href = LOGO_URL;
    };
    updateIcons();
  }, []);

  const [step, setStep] = useState(() => loadState('step', 'input'));
  const [activeTab, setActiveTab] = useState(() => loadState('activeTab', 'plan'));
  
  const defaultUserData = {
    name: "Charles",
    weight: 75,
    goalTime: 50,
    runDaysPerWeek: 3,
    strengthDaysPerWeek: 3, 
    strengthFocus: 'hypertrophy',
    durationWeeks: 10,
    progressionStart: 15, 
    difficultyFactor: 1.0, 
  };

  const [userData, setUserData] = useState(() => loadState('userData', defaultUserData));
  const [plan, setPlan] = useState(() => loadState('plan', []));
  const [expandedWeek, setExpandedWeek] = useState(() => loadState('expandedWeek', 1));
  const [completedSessions, setCompletedSessions] = useState(() => loadState('completedSessions', new Set()));
  const [completedExercises, setCompletedExercises] = useState(() => loadState('completedExercises', new Set())); // NOUVEAU STATE
  
  // Sauvegarde automatique à chaque changement
  useEffect(() => {
    const dataToSave = {
        step,
        activeTab,
        userData,
        plan,
        expandedWeek,
        completedSessions: Array.from(completedSessions),
        completedExercises: Array.from(completedExercises) // NOUVEAU
    };
    localStorage.setItem('clab_storage', JSON.stringify(dataToSave));
  }, [step, activeTab, userData, plan, expandedWeek, completedSessions, completedExercises]);

  const [expandedSession, setExpandedSession] = useState(null);
  
  // Filter State
  const [filteredSessionIds, setFilteredSessionIds] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [modalExercise, setModalExercise] = useState(null);

  const formatPace = (val) => {
    const min = Math.floor(val);
    const sec = Math.round((val - min) * 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const getPaceForWeek = (week, totalWeeks, goalTime, startPercent, difficultyFactor) => {
    const effectiveGoalTime = goalTime * difficultyFactor;
    const racePace = effectiveGoalTime / 10;
    const progressRatio = (week - 1) / Math.max(1, totalWeeks - 1);
    const startFactor = 1 + (startPercent / 100);
    const currentFactor = startFactor - (progressRatio * (startFactor - 1.0));
    const currentRacePace = racePace * currentFactor;
    
    const valEasy = currentRacePace * 1.30;
    const valThreshold = currentRacePace * 1.05;
    const valInterval = currentRacePace * 0.92;

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

  const calcDist = (minutes, pacePerKm) => (minutes / pacePerKm).toFixed(1) + " km";

  const stats = useMemo(() => {
    if (plan.length === 0) return null;
    let totalSessions = 0, completedCount = 0, totalKm = 0;
    let intensityBuckets = { low: 0, high: 0 };
    const weeklyVolume = plan.map(() => 0);
    plan.forEach((week, i) => {
      week.sessions.forEach(session => {
        totalSessions++;
        const isDone = completedSessions.has(session.id);
        if (isDone) {
          completedCount++;
          weeklyVolume[i] += session.durationMin;
          if (session.intensity === 'low') intensityBuckets.low += session.durationMin;
          else intensityBuckets.high += session.durationMin;
          if (session.category === 'run' && session.distance) {
            const km = parseFloat(session.distance);
            if(!isNaN(km)) totalKm += km;
          }
        }
      });
    });
    return { progress: totalSessions > 0 ? Math.round((completedCount / totalSessions) * 100) : 0, totalKm: totalKm.toFixed(1), sessionsDone: completedCount, totalSessions, intensityBuckets, weeklyVolume };
  }, [plan, completedSessions]);

  const toggleSession = (id) => {
    const newSet = new Set(completedSessions);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setCompletedSessions(newSet);
  };

  // NOUVEAU : Fonction pour cocher/décocher un exercice individuel
  const toggleExercise = (exerciseUniqueId) => {
      const newSet = new Set(completedExercises);
      if (newSet.has(exerciseUniqueId)) {
          newSet.delete(exerciseUniqueId);
      } else {
          newSet.add(exerciseUniqueId);
      }
      setCompletedExercises(newSet);
  };

  const adaptDifficulty = (weekNum, action) => {
      let message = "";
      let type = 'neutral';

      if (action === 'easier') {
          const newFactor = userData.difficultyFactor + 0.05; 
          setUserData(prev => ({ ...prev, difficultyFactor: newFactor }));
          message = "Plan adapté : Allures ralenties de 5% pour la suite (récupération).";
          type = 'warning';
      } else if (action === 'harder') {
          const newFactor = Math.max(0.8, userData.difficultyFactor - 0.05); 
          setUserData(prev => ({ ...prev, difficultyFactor: newFactor }));
          message = "Plan adapté : Allures accélérées de 5% pour la suite (performance) !";
          type = 'success';
      } else {
          message = "Semaine validée ! Maintien de la progression prévue.";
          type = 'success';
      }
      setFeedbackMessage({ text: message, type });
      
      if (weekNum < userData.durationWeeks) setExpandedWeek(weekNum + 1);
      else setExpandedWeek(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDayClick = (daySessionIds) => {
      if (!daySessionIds || daySessionIds.length === 0) {
          setFilteredSessionIds(null);
          return;
      }
      if (filteredSessionIds && JSON.stringify(filteredSessionIds) === JSON.stringify(daySessionIds)) {
          setFilteredSessionIds(null);
      } else {
          setFilteredSessionIds(daySessionIds);
      }
  };

  const generatePlan = () => {
    const newPlan = [];
    const { durationWeeks: totalWeeks } = userData;
    const adaptationWeeks = Math.ceil(totalWeeks * 0.3);
    const taperWeeks = 2;
    let hypertrophySessionIndex = 0;

    for (let i = 1; i <= totalWeeks; i++) {
      const isRaceWeek = i === totalWeeks;
      const isTaper = i > totalWeeks - taperWeeks;
      const isAdaptation = i <= adaptationWeeks;
      const paces = getPaceForWeek(i, totalWeeks, userData.goalTime, userData.progressionStart, userData.difficultyFactor);
      let sessions = [];
      let focus = isRaceWeek ? "OBJECTIF" : isTaper ? "AFFÛTAGE" : isAdaptation ? "ADAPTATION" : "DÉVELOPPEMENT";
      let volumeLabel = isAdaptation ? "Volume bas" : isTaper ? "Récupération" : "Charge haute";
      
      const isTechWeek = i % 2 !== 0;
      sessions.push({
        id: `w${i}-r1`, day: "RUN 1", category: 'run', 
        type: isTechWeek ? "Endurance + Lignes Droites" : "Endurance Fondamentale", 
        structure: 'steady', intensity: 'low',
        duration: "45 min", durationMin: 45, distance: calcDist(45, paces.valEasy),
        paceTarget: paces.easyRange, paceGap: paces.gap, rpe: 3,
        description: isTechWeek ? "40' cool + 5x80m progressif (lignes droites) pour la foulée." : "Aisance respiratoire stricte. Capacité à parler.", 
        scienceNote: "Zone 1/2 : Densité mitochondriale.",
        planningAdvice: "Idéal après une journée de repos ou de muscu haut du corps.",
        exercises: RUN_PROTOCOLS.steady
      });

      let run2Type = 'none';
      if (userData.runDaysPerWeek >= 2) {
        if (isAdaptation) {
           const cycleType = i % 3;
           if (cycleType === 1) {
                const distApprox = (15/paces.valEasy) + (15/paces.valInterval) + (15/paces.valEasy);
                sessions.push({
                    id: `w${i}-r2`, day: "RUN 2", category: 'run', type: "Fartlek 30/30", structure: 'interval', intensity: 'medium',
                    duration: "45 min", durationMin: 45, distance: `~${distApprox.toFixed(1)} km`,
                    paceTarget: paces.interval, paceGap: paces.gap, rpe: 7,
                    description: `20' écho + 10 x 30" vite / 30" lent + 10' cool.`, scienceNote: `Sollicitation VO2max et dynamique.`,
                    planningAdvice: "Séance clé. Arrivez frais.",
                    exercises: RUN_PROTOCOLS.interval_short
                });
           } else if (cycleType === 2) {
                sessions.push({
                    id: `w${i}-r2`, day: "RUN 2", category: 'run', type: "Renforcement Côtes", structure: 'hills', intensity: 'high',
                    duration: "40 min", durationMin: 40, distance: "Varié",
                    paceTarget: "Effort", paceGap: 0, rpe: 8,
                    description: `20' écho + 8 x 45" montée dynamique (récup descente).`, scienceNote: `Puissance musculaire spécifique.`,
                    planningAdvice: "Attention aux mollets le lendemain.",
                    exercises: RUN_PROTOCOLS.hills
                });
           } else {
                sessions.push({
                    id: `w${i}-r2`, day: "RUN 2", category: 'run', type: "Pyramide Fartlek", structure: 'pyramid', intensity: 'medium',
                    duration: "45 min", durationMin: 45, distance: "Varié",
                    paceTarget: paces.interval, paceGap: paces.gap, rpe: 7,
                    description: `20' écho + 1'-2'-3'-2'-1' (récup moitié temps) + 10' cool.`, scienceNote: `Variation d'allure.`,
                    planningAdvice: "Séance ludique.",
                    exercises: RUN_PROTOCOLS.interval_short
                });
           }
        } else if (!isRaceWeek) {
           const cycleType = i % 3;
           if (cycleType === 1) {
               const distApprox = (20/paces.valEasy) + (24/paces.valThreshold) + (16/paces.valEasy);
               sessions.push({
                id: `w${i}-r2`, day: "RUN 2", category: 'run', type: "Seuil Fractionné", structure: 'threshold', intensity: 'high',
                duration: "1h00", durationMin: 60, distance: `~${distApprox.toFixed(1)} km`,
                paceTarget: paces.threshold, paceGap: paces.gap, rpe: 8,
                description: `20' écho + 3 x 8min à ${paces.threshold}/km (r=2').`, scienceNote: `Cible : Seuil Anaérobie.`,
                planningAdvice: "Attention : Ne pas faire de jambes lourdes la veille.",
                exercises: RUN_PROTOCOLS.threshold
               });
           } else if (cycleType === 2) {
                sessions.push({
                    id: `w${i}-r2`, day: "RUN 2", category: 'run', type: "Tempo Continu", structure: 'steady', intensity: 'medium',
                    duration: "50 min", durationMin: 50, distance: `~${(50/paces.valThreshold).toFixed(1)} km`,
                    paceTarget: paces.threshold, paceGap: paces.gap, rpe: 7,
                    description: `15' écho + 20min continu à ${paces.threshold}/km + 15' cool.`, scienceNote: `Tenue de l'allure au mental.`,
                    planningAdvice: "Focus relâchement.",
                    exercises: RUN_PROTOCOLS.threshold
                });
           } else {
                sessions.push({
                    id: `w${i}-r2`, day: "RUN 2", category: 'run', type: "VMA Longue", structure: 'interval', intensity: 'high',
                    duration: "55 min", durationMin: 55, distance: `Varié`,
                    paceTarget: paces.interval, paceGap: paces.gap, rpe: 9,
                    description: `20' écho + 5 x 3min (r=2' trot).`, scienceNote: `Soutien de VO2max.`,
                    planningAdvice: "Exigeant.",
                    exercises: RUN_PROTOCOLS.interval_short
                });
           }
        }
      }

      // --- RUN 3 (Long Varié) ---
      if (userData.runDaysPerWeek >= 3 && !isRaceWeek) {
         const longDur = isAdaptation ? 50 + (i * 5) : isTaper ? 50 : 75 + (i%2)*10; 
         const isFastFinish = i % 3 === 0 && !isAdaptation;

         sessions.push({
            id: `w${i}-r3`, day: "RUN 3", category: 'run', 
            type: isFastFinish ? "Sortie Longue + Final" : "Sortie Longue", 
            structure: 'steady', intensity: isFastFinish ? 'medium' : 'low', 
            duration: `${longDur} min`, durationMin: longDur, distance: calcDist(longDur, paces.valEasy),
            paceTarget: isFastFinish ? "Endurance -> Seuil" : paces.easyRange, 
            paceGap: paces.gap, rpe: 4,
            description: isFastFinish ? `Les ${Math.min(15, longDur-30)} dernières minutes à allure 10km. Le reste cool.` : `Endurance durée. Restez dans la zone de confort.`, 
            scienceNote: isFastFinish ? "Pré-fatigue." : "Résistance à la fatigue centrale.",
            planningAdvice: "Weekend. Mangez des glucides avant.",
            exercises: RUN_PROTOCOLS.long_run
          });
      }

      // --- RUN 4 (Récup - Si 4 runs) ---
      if (userData.runDaysPerWeek >= 4 && !isRaceWeek) {
         sessions.push({
            id: `w${i}-r4`, day: "RUN 4", category: 'run', type: "Footing Récupération", structure: 'steady', intensity: 'low',
            duration: "40 min", durationMin: 40, distance: calcDist(40, paces.valEasy),
            paceTarget: paces.easyRange, paceGap: paces.gap, rpe: 2,
            description: "Footing très souple pour assimiler. Option vélo possible.", scienceNote: "Récupération active.",
            planningAdvice: "Le lendemain de la séance dure.",
            exercises: RUN_PROTOCOLS.recovery
          });
      }

      // --- RACE WEEK ---
      if (isRaceWeek) {
        sessions = [
            { 
              id: `w${i}-r1`, day: "J-3", category: 'run', type: "Réveil Neuromusculaire", structure: 'interval', intensity: 'low', 
              duration: "20 min", durationMin: 20, distance: calcDist(20, paces.valEasy),
              paceTarget: paces.easy, paceGap: 0, rpe: 3, description: "Tonus léger.", scienceNote: "Potentiation post-activation (PAP).",
              exercises: RUN_PROTOCOLS.steady
            },
            { 
              id: `w${i}-race`, day: "JOUR J", category: 'run', type: "COMPÉTITION", structure: 'steady', intensity: 'high', 
              duration: "10 KM", durationMin: userData.goalTime, distance: "10.0 km",
              paceTarget: paces.race, paceGap: 0, rpe: 10, description: `Objectif ${paces.race}/km.`, scienceNote: "Gestion de l'effort.",
              exercises: []
            }
        ];
      }

      // --- MUSCU INTELLIGENTE ---
      const strengthCount = isTaper ? Math.max(0, userData.strengthDaysPerWeek - 2) : userData.strengthDaysPerWeek;
      
      for(let s=1; s<=strengthCount; s++) {
        let gymType = "";
        let exercises = [];
        let gymAdvice = "";
        let gymTags = [];

        if (userData.strengthFocus === 'force') {
            // --- LOGIQUE FORCE (Statique) ---
            if (strengthCount === 2) {
                if(s===1) { gymType = "Jambes (Force)"; exercises = STRENGTH_PROTOCOLS.force.legs; gymTags=['legs']; gymAdvice = "⚠️ Évitez la veille du Run 2."; }
                else { gymType = "Haut du Corps"; exercises = STRENGTH_PROTOCOLS.force.upper; gymAdvice = "Récupération active possible."; }
            }
            else if (strengthCount >= 3) {
                if(s===1) { gymType = "Jambes (Force)"; exercises = STRENGTH_PROTOCOLS.force.legs; gymTags=['legs']; }
                else if(s===2) { gymType = "Haut (Force)"; exercises = STRENGTH_PROTOCOLS.force.upper; }
                else { gymType = "Full Body"; exercises = STRENGTH_PROTOCOLS.force.full; gymTags=['legs']; }
            }
        } else {
            // --- LOGIQUE HYPERTROPHIE (Rotation 5 jours) ---
            const splitNames = ["Push (Pecs/Épaules)", "Pull (Dos/Biceps)", "Legs (Jambes)", "Accessory (Bras/Épaules)", "Arnold (Pecs/Dos)"];
            const splitExos = [STRENGTH_PROTOCOLS.hypertrophy.push, STRENGTH_PROTOCOLS.hypertrophy.pull, STRENGTH_PROTOCOLS.hypertrophy.legs, STRENGTH_PROTOCOLS.hypertrophy.shoulders_arms, STRENGTH_PROTOCOLS.hypertrophy.chest_back];
            
            const currentSplitIndex = hypertrophySessionIndex % 5;
            gymType = splitNames[currentSplitIndex];
            exercises = splitExos[currentSplitIndex];
            
            if (currentSplitIndex === 2) gymTags = ['legs']; 
            if (gymTags.includes('legs')) gymAdvice = "⚠️ Attention : Grosse fatigue nerveuse.";
            
            hypertrophySessionIndex++;
        }

        sessions.push({
          id: `w${i}-s${s}`, day: `GYM ${s}`, category: 'strength', type: gymType, structure: 'pyramid', intensity: 'high',
          duration: "1h30", durationMin: 90, paceTarget: "N/A", paceGap: 0, rpe: 8,
          description: `Séance Volume (${gymType}). 3 exos/muscle.`, 
          scienceNote: "Hypertrophie fonctionnelle.",
          planningAdvice: gymAdvice,
          exercises: exercises,
          tags: gymTags
        });
      }

      // Schedule Logic for this week
      const weeklySchedule = getRecommendedSchedule(sessions);
      newPlan.push({ weekNumber: i, focus, volumeLabel, sessions, schedule: weeklySchedule });
    }
    setPlan(newPlan);
    setStep('result');
  };

  useEffect(() => {
      // Pour éviter de re-générer en boucle au chargement, on ne lance generatePlan
      // que si on est sur 'result' mais que le plan est vide (cas rare ou migration)
      // Sinon c'est le bouton "Lancer" qui déclenche.
  }, [userData.difficultyFactor]);

  const resetPlan = () => {
    if(confirm("Recommencer à zéro Charles ? Toutes les données seront effacées.")) {
        localStorage.removeItem('clab_storage'); // On efface la sauvegarde
        setCompletedSessions(new Set());
        setCompletedExercises(new Set()); // RAZ des exos cochés
        setUserData(defaultUserData);
        setStep('input');
        setPlan([]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center sm:py-10 text-slate-800 font-sans">
      <div className="w-full max-w-md sm:max-w-3xl bg-slate-50 min-h-screen sm:min-h-fit sm:rounded-3xl sm:shadow-2xl overflow-hidden flex flex-col relative">
       
      {step === 'input' && (
        <div className="bg-slate-900 relative overflow-hidden text-white pt-12 pb-24 rounded-b-[3rem] shadow-2xl">
            {/* Background Pattern */}
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
                    La science de l'entraînement au service de votre 10km. <br/>
                    <span className="text-sm opacity-75">Optimisation de l'interférence Run/Muscu • Planification Polarisée</span>
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
            <div className="max-w-3xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
                <button onClick={() => setStep('input')} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition" title="Retour Menu">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <div className="flex items-center gap-2 text-yellow-400 text-xs font-bold uppercase tracking-wider mb-1">
                    <FlaskConical size={12}/> C-Lab Performance
                    </div>
                    <h1 className="text-xl md:text-2xl font-black">Plan Hybride</h1>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={() => generateICS(plan)} className="bg-white/10 hover:bg-white/20 p-2 rounded-lg text-white transition" title="Ajouter au calendrier">
                    <CalendarIcon size={18} />
                </button>
                <div className="flex bg-slate-800 rounded-lg p-1">
                    <button onClick={() => setActiveTab('plan')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${activeTab === 'plan' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>Programme</button>
                    <button onClick={() => setActiveTab('stats')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${activeTab === 'stats' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>Science</button>
                </div>
            </div>
            </div>
        </div>
      )}

      <main className="max-w-3xl mx-auto px-4 mt-6 flex-1 w-full relative z-20 pb-20">
        
        {/* MODAL EXERCICE */}
        {modalExercise && (
            <ExerciseModal exercise={modalExercise} onClose={() => setModalExercise(null)} />
        )}

        {step === 'input' ? (
          <div className="-mt-16 bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 md:p-10 space-y-8 animate-in slide-in-from-bottom-12 duration-500">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4">
                <Activity className="text-indigo-600"/> Configuration du Profil
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* MODIFICATION : INPUT -> SELECT POUR L'OBJECTIF */}
              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-400 uppercase">Objectif (min)</label>
                <div className="flex items-center bg-slate-50 p-1 rounded-xl border-2 border-transparent focus-within:border-indigo-100 transition">
                    <button 
                        onClick={() => setUserData({...userData, goalTime: Math.max(25, userData.goalTime - 1)})}
                        className="p-4 bg-white rounded-lg shadow-sm text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition active:scale-95"
                    >
                        <Minus size={20} />
                    </button>
                    <div className="flex-1 text-center relative">
                        <input 
                            type="number" 
                            value={userData.goalTime} 
                            onChange={(e) => setUserData({...userData, goalTime: Number(e.target.value)})} 
                            className="w-full bg-transparent text-center font-black text-3xl text-indigo-600 outline-none p-2"
                        />
                        <Target className="absolute top-1/2 -translate-y-1/2 right-2 text-indigo-100 opacity-50 pointer-events-none" size={40} />
                    </div>
                    <button 
                        onClick={() => setUserData({...userData, goalTime: userData.goalTime + 1})}
                        className="p-4 bg-white rounded-lg shadow-sm text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition active:scale-95"
                    >
                        <Plus size={20} />
                    </button>
                </div>
                <p className="text-xs text-slate-400 text-center mt-2">Allure cible : {formatPace(userData.goalTime/10)}/km</p>
              </div>

              {/* MODIFICATION : INPUT -> SELECT POUR LA DURÉE */}
              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-400 uppercase">Durée Prépa</label>
                <div className="flex items-center bg-slate-50 p-1 rounded-xl border-2 border-transparent focus-within:border-slate-300 transition">
                    <button 
                        onClick={() => setUserData({...userData, durationWeeks: Math.max(4, userData.durationWeeks - 1)})}
                        className="p-4 bg-white rounded-lg shadow-sm text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition active:scale-95"
                    >
                        <Minus size={20} />
                    </button>
                    <div className="flex-1 text-center relative">
                        <input 
                            type="number" 
                            value={userData.durationWeeks} 
                            onChange={(e) => setUserData({...userData, durationWeeks: Number(e.target.value)})} 
                            className="w-full bg-transparent text-center font-black text-3xl text-slate-700 outline-none p-2"
                        />
                        <Clock className="absolute top-1/2 -translate-y-1/2 right-2 text-slate-200 opacity-50 pointer-events-none" size={40} />
                    </div>
                    <button 
                        onClick={() => setUserData({...userData, durationWeeks: userData.durationWeeks + 1})}
                        className="p-4 bg-white rounded-lg shadow-sm text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition active:scale-95"
                    >
                        <Plus size={20} />
                    </button>
                </div>
                <p className="text-xs text-slate-400 text-center mt-2">{userData.durationWeeks} semaines de progression</p>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
               <label className="flex justify-between text-xs font-bold text-slate-500 uppercase mb-4">
                   <span>Progressivité (Douceur de départ)</span>
                   <span className="text-emerald-600">+{userData.progressionStart}%</span>
               </label>
               <input type="range" min="0" max="30" step="5" value={userData.progressionStart} onChange={e => setUserData({...userData, progressionStart: Number(e.target.value)})} className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"/>
               <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-medium">
                   <span>0% (Brutal)</span>
                   <span>15% (Optimal)</span>
                   <span>30% (Retour blessure)</span>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-3">
                 <label className="text-xs font-bold text-indigo-400 uppercase flex items-center gap-2"><Footprints size={14}/> Runs / Semaine</label>
                 <div className="flex gap-2">
                   {[2,3,4].map(n => (<button key={n} onClick={() => setUserData({...userData, runDaysPerWeek: n})} className={`flex-1 py-3 rounded-xl text-sm font-bold transition ${userData.runDaysPerWeek === n ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white border border-slate-200 text-slate-400 hover:border-indigo-300'}`}>{n}</button>))}
                 </div>
               </div>
               <div className="space-y-3">
                 <label className="text-xs font-bold text-rose-400 uppercase flex items-center gap-2"><Dumbbell size={14}/> Muscu / Semaine</label>
                 <div className="flex gap-2 flex-wrap">
                   {[0,1,2,3,4,5].map(n => (<button key={n} onClick={() => setUserData({...userData, strengthDaysPerWeek: n})} className={`flex-1 py-3 min-w-[30px] rounded-xl text-sm font-bold transition ${userData.strengthDaysPerWeek === n ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'bg-white border border-slate-200 text-slate-400 hover:border-rose-300'}`}>{n}</button>))}
                 </div>
               </div>
            </div>

            {userData.strengthDaysPerWeek > 0 && (
                <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Target size={14}/> Objectif Musculation</label>
                    <div className="flex gap-4 bg-slate-50 p-1 rounded-xl border border-slate-200">
                        <button onClick={() => setUserData({...userData, strengthFocus: 'force'})} className={`flex-1 py-3 rounded-lg text-sm font-bold flex flex-col items-center gap-1 transition ${userData.strengthFocus === 'force' ? 'bg-white shadow-md text-rose-600 border border-rose-100' : 'text-slate-400 hover:bg-white/50'}`}>
                            <span>Force & Puissance</span>
                            <span className="text-[9px] font-normal opacity-70">5 reps • Repos long • Lourd</span>
                        </button>
                        <button onClick={() => setUserData({...userData, strengthFocus: 'hypertrophy'})} className={`flex-1 py-3 rounded-lg text-sm font-bold flex flex-col items-center gap-1 transition ${userData.strengthFocus === 'hypertrophy' ? 'bg-white shadow-md text-indigo-600 border border-indigo-100' : 'text-slate-400 hover:bg-white/50'}`}>
                            <span>Hypertrophie & Volume</span>
                            <span className="text-[9px] font-normal opacity-70">12 reps • Repos court • Pump</span>
                        </button>
                    </div>
                </div>
            )}

            <button onClick={generatePlan} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-xl hover:bg-slate-800 transition transform active:scale-[0.98] flex items-center justify-center gap-3">
                <Sparkles size={20} className="text-yellow-400"/>
                Lancer C-Lab Performance
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

            {plan.map((week) => {
                const isOpen = expandedWeek === week.weekNumber;
                
                // Vérifier si TOUTES les séances de la semaine sont complétées
                const allSessionsCompleted = week.sessions.every(s => completedSessions.has(s.id));

                // Filtre d'affichage pour le "Focus Jour"
                const sessionsToShow = filteredSessionIds 
                    ? week.sessions.filter(s => filteredSessionIds.includes(s.id))
                    : week.sessions;

                // Indicateur visuel pour l'en-tête de semaine (Vert si fini)
                const headerBgClass = allSessionsCompleted 
                    ? 'bg-green-50 border-green-200' 
                    : isOpen ? 'bg-slate-50/50 border-slate-200' : 'bg-white border-slate-100';
              
                const headerIconClass = allSessionsCompleted
                    ? 'bg-green-600 text-white'
                    : isOpen ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 border border-slate-200';

                return (
                  <div key={week.weekNumber} className={`rounded-xl shadow-sm border overflow-hidden transition-all ${allSessionsCompleted ? 'border-green-200' : 'border-slate-100 bg-white'} ${isOpen ? 'ring-2 ring-indigo-500' : ''}`}>
                    <button onClick={() => setExpandedWeek(isOpen ? null : week.weekNumber)} className={`w-full p-4 flex items-center justify-between ${headerBgClass}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${headerIconClass}`}>
                            {allSessionsCompleted ? <Check size={18}/> : week.weekNumber}
                        </div>
                        <div className="text-left">
                            <h3 className={`font-bold text-sm ${allSessionsCompleted ? 'text-green-800' : 'text-slate-700'}`}>{week.focus}</h3>
                            {allSessionsCompleted && <span className="text-[10px] text-green-600 font-medium">Semaine validée</span>}
                        </div>
                      </div>
                      {isOpen ? <ChevronUp size={16} className="text-indigo-500"/> : <ChevronDown size={16} className="text-slate-300"/>}
                    </button>
                   
                    {isOpen && (
                      <div className="p-2 space-y-2">
                        {/* PLANNING IDEAL SUGGÉRÉ */}
                        {week.schedule && week.schedule.length > 0 && (
                            <div className="mx-1 mb-4 border-2 border-slate-100 rounded-xl overflow-hidden bg-slate-50/50">
                                <div className="bg-slate-100 px-4 py-2 flex items-center justify-between border-b border-slate-200">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-slate-500"/>
                                        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide">Planning Idéal Suggéré (Cliquable)</h4>
                                    </div>
                                    {filteredSessionIds && (
                                        <button onClick={() => setFilteredSessionIds(null)} className="text-[10px] text-indigo-600 font-bold flex items-center gap-1 hover:underline">
                                            <RotateCcw size={10}/> Voir tout
                                        </button>
                                    )}
                                </div>
                                <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                    {week.schedule.map((day, i) => {
                                        const isSelected = filteredSessionIds && 
                                            day.sessionIds !== null && 
                                            day.sessionIds.length === filteredSessionIds.length &&
                                            day.sessionIds.every((val, index) => val === filteredSessionIds[index]);
                                       
                                        const hasActivity = day.sessionIds.length > 0;
                                       
                                        // Vérifier si ce jour est entièrement complété
                                        const isDayCompleted = hasActivity && day.sessionIds.every(id => completedSessions.has(id));

                                        return (
                                            <div 
                                                key={i} 
                                                onClick={() => {
                                                    if (hasActivity) {
                                                        const idsToFilter = day.sessionIds;
                                                        handleDayClick(idsToFilter);
                                                    }
                                                }}
                                                className={`flex items-center justify-between p-2 rounded border transition 
                                                    ${hasActivity ? 'cursor-pointer' : 'opacity-50 cursor-default'}
                                                    ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 
                                                      isDayCompleted ? 'bg-green-50 border-green-200 text-green-700' :
                                                      'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'}
                                                `}
                                            >
                                                <span className={`font-bold w-16 ${isSelected ? 'text-white' : 'text-slate-800'}`}>{day.day}</span>
                                                <div className="flex items-center gap-1 overflow-hidden">
                                                     {isDayCompleted && !isSelected && <CheckCircle size={10} className="text-green-500 shrink-0"/>}
                                                     <span className={`font-medium truncate ${isSelected ? 'text-indigo-100' : day.activity.includes('Repos') ? 'text-slate-400' : 'text-indigo-600'}`}>
                                                        {day.activity}
                                                     </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="px-4 py-2 bg-indigo-50 text-[10px] text-indigo-700 border-t border-indigo-100 flex items-center gap-2">
                                    <Info size={12}/>
                                    Ce planning sépare optimalement la force (Jambes) des séances intenses (VMA/Seuil).
                                </div>
                            </div>
                        )}

                        {/* LISTE DES SEANCES (FILTREE OU NON) */}
                        {sessionsToShow.length > 0 ? (
                            sessionsToShow.map((session) => {
                            const isDone = completedSessions.has(session.id);
                            const isExpandedSession = expandedSession === session.id;
                            return (
                                <div key={session.id} className={`rounded-lg border transition animate-in slide-in-from-bottom-2 ${isDone ? 'bg-slate-50 border-green-200 opacity-80' : 'bg-white border-slate-100 hover:border-indigo-200 shadow-sm'}`}>
                               
                                <div onClick={() => { if(session.exercises) setExpandedSession(isExpandedSession ? null : session.id); else toggleSession(session.id); }} className="p-3 cursor-pointer">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-2">
                                        {isDone ? <CheckCircle size={16} className="text-green-500"/> : session.category === 'run' ? <Footprints size={16} className="text-indigo-500"/> : <Dumbbell size={16} className="text-rose-500"/>}
                                        <span className={`font-bold text-xs uppercase ${isDone ? 'text-green-700' : 'text-slate-700'}`}>{session.type}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <RpeBadge level={session.rpe} />
                                            <WorkoutViz structure={session.structure} intensity={session.intensity}/>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                                                <div className="flex items-center gap-1"><Clock size={12}/> {session.duration}</div>
                                                {session.category === 'run' && session.distance && (
                                                    <div className="flex items-center gap-1 text-indigo-600 bg-indigo-50 px-1.5 rounded"><Ruler size={12}/> {session.distance}</div>
                                                )}
                                            </div>
                                             
                                            <p className="text-xs text-slate-600 leading-relaxed">{session.description}</p>
                                             
                                            {/* Conseil Planning */}
                                            {!isDone && session.planningAdvice && (
                                                <div className="flex items-start gap-1.5 mt-1 bg-amber-50 p-2 rounded-lg text-[10px] text-amber-800 border border-amber-100">
                                                    <Info size={12} className="shrink-0 mt-0.5"/>
                                                    <span><strong>Conseil :</strong> {session.planningAdvice}</span>
                                                </div>
                                            )}
                                    </div>

                                    {session.category === 'run' && session.paceGap > -1 && (
                                        <div className="mt-3 pt-2 border-t border-slate-100 flex justify-end items-baseline gap-1">
                                            <span className="text-[10px] text-slate-400 uppercase font-bold">Cible</span>
                                            <span className="font-black text-slate-800 text-sm">{session.paceTarget}</span>
                                            <span className="text-[9px] text-slate-400">min/km</span>
                                        </div>
                                    )}
                                     
                                    {session.exercises && !isDone && (
                                        <div className="mt-2 text-center text-[10px] text-slate-400 font-medium">
                                            {isExpandedSession ? "Masquer détails" : "Voir détails séance ▼"}
                                        </div>
                                    )}
                                </div>

                                {/* DETAIL EXERCICES (MUSCU OU RUN) - INTERACTIF */}
                                {isExpandedSession && session.exercises && !isDone && (
                                    <div className="bg-slate-50 border-t border-slate-100 p-3 rounded-b-lg animate-in slide-in-from-top-2">
                                            <h4 className="text-[10px] font-bold uppercase text-slate-400 mb-2">Protocole Scientifique (Cliquer pour info)</h4>
                                            <div className="space-y-2">
                                                {session.exercises.map((exo, idx) => {
                                                    const uniqueExerciseId = `${session.id}-ex-${idx}`;
                                                    const isChecked = completedExercises.has(uniqueExerciseId);
                                                    
                                                    return (
                                                        <div 
                                                            key={idx} 
                                                            className={`bg-white p-2 rounded border transition-colors flex items-center gap-3
                                                                ${isChecked ? 'border-green-200 bg-green-50' : 'border-slate-200 hover:border-indigo-200 hover:bg-indigo-50'}
                                                            `}
                                                        >
                                                            {/* Checkbox Interactive */}
                                                            <div 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleExercise(uniqueExerciseId);
                                                                }}
                                                                className="cursor-pointer"
                                                            >
                                                                {isChecked ? 
                                                                    <CheckSquare size={20} className="text-green-500" /> : 
                                                                    <Square size={20} className="text-slate-300 hover:text-indigo-400" />
                                                                }
                                                            </div>

                                                            <div className="flex-1 flex justify-between items-center cursor-help" onClick={() => setModalExercise(exo)}>
                                                                <div className="flex items-center gap-2">
                                                                    <HelpCircle size={14} className="text-slate-300"/>
                                                                    <div className={isChecked ? 'opacity-50' : ''}>
                                                                        <div className="font-bold text-xs text-slate-800">{exo.name}</div>
                                                                        <div className="text-[10px] text-slate-500">{exo.sets.toString().includes('min') || exo.sets.toString().includes('bloc') ? exo.sets : `${exo.sets} séries`} • {exo.reps.includes('reps') ? exo.reps : `${exo.reps}`} {exo.rest !== '-' ? `• R: ${exo.rest}` : ''}</div>
                                                                    </div>
                                                                </div>
                                                                <div className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isChecked ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                                                    RPE {exo.rpe}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <button onClick={() => toggleSession(session.id)} className="mt-3 w-full py-2 bg-green-500 text-white rounded font-bold text-xs flex items-center justify-center gap-1">
                                                <CheckCircle size={12} /> Valider la séance
                                            </button>
                                    </div>
                                )}

                                </div>
                            );
                            })
                        ) : (
                            <div className="p-8 text-center text-slate-400 text-xs italic animate-in fade-in">
                                Aucune séance prévue ce jour-là. Repos ! 💤
                            </div>
                        )}
                      </div>
                    )}
                   
                    {/* FEEDBACK SEMAINE - SEULEMENT SI TOUT EST FINI */}
                    {isOpen && allSessionsCompleted && (
                        <div className="p-4 border-t border-green-100 bg-green-50 flex flex-col gap-3 animate-in slide-in-from-bottom-2">
                            <div className="flex items-center gap-2 text-green-800 text-sm font-bold">
                                <Award size={18}/> Semaine Terminée ! Bilan ?
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => adaptDifficulty(week.weekNumber, 'easier')} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-white border border-green-200 text-slate-600 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-50 transition">
                                    <ThumbsDown size={14}/> Trop dur
                                </button>
                                <button onClick={() => adaptDifficulty(week.weekNumber, 'keep')} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 border border-green-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-green-700 transition">
                                    <CheckCircle size={14}/> Parfait
                                </button>
                                <button onClick={() => adaptDifficulty(week.weekNumber, 'harder')} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-white border border-green-200 text-slate-600 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-50 transition">
                                    <Zap size={14}/> Trop facile
                                </button>
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
           
            {/* 1. DASHBOARD STATS */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6"><BarChart3 className="text-indigo-600"/> Votre Progression</h3>
             
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center p-3 bg-slate-50 rounded-xl">
                  <div className="text-2xl font-black text-indigo-600">{stats ? stats.progress : 0}%</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Programme</div>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-xl">
                  <div className="text-2xl font-black text-slate-800">{stats ? stats.totalKm : 0}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Km Courus</div>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-xl">
                  <div className="text-2xl font-black text-slate-800">{stats ? stats.sessionsDone : 0}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Séances</div>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Respect du modèle Polarisé (80/20)</h4>
                  <PolarizationChart 
                    low={stats && stats.intensityBuckets ? stats.intensityBuckets.low : 0} 
                    high={stats && stats.intensityBuckets ? stats.intensityBuckets.high : 0} 
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Volume Hebdomadaire (Minutes)</h4>
                  <WeeklyVolumeChart data={stats ? stats.weeklyVolume : []} />
                </div>
              </div>
            </div>

            {/* 2. SECTION SCIENTIFIQUE */}
            <div className="bg-slate-900 text-white rounded-2xl shadow-lg p-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6 opacity-10"><Brain size={120}/></div>
             <h3 className="font-bold text-xl flex items-center gap-2 mb-6 relative z-10"><BookOpen className="text-yellow-400"/> Validation Scientifique</h3>
             <div className="space-y-4 relative z-10">
               <div className="bg-white/10 backdrop-blur border border-white/10 p-4 rounded-xl">
                 <div className="flex items-start gap-3">
                   <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400"><Activity size={18}/></div>
                   <div>
                     <h4 className="font-bold text-sm">Entraînement Polarisé</h4>
                     <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                       Votre plan suit la distribution des intensités de <strong>Stephen Seiler (2010)</strong>. 80% du volume est effectué à basse intensité (Zone 1/2) pour maximiser la densité mitochondriale sans fatigue excessive.
                     </p>
                   </div>
                 </div>
               </div>

               <div className="bg-white/10 backdrop-blur border border-white/10 p-4 rounded-xl">
                 <div className="flex items-start gap-3">
                   <div className="bg-indigo-500/20 p-2 rounded-lg text-indigo-400"><TrendingUp size={18}/></div>
                   <div>
                     <h4 className="font-bold text-sm">RPE (Ressenti)</h4>
                     <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                       Nous utilisons l'échelle <strong>Borg CR-10</strong> modifiée par Foster pour quantifier la charge interne. C'est souvent plus fiable que la fréquence cardiaque seule.
                     </p>
                   </div>
                 </div>
               </div>

               {userData.strengthDaysPerWeek > 0 && (
                 <div className="bg-white/10 backdrop-blur border border-white/10 p-4 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="bg-amber-500/20 p-2 rounded-lg text-amber-400"><Dumbbell size={18}/></div>
                      <div>
                        <h4 className="font-bold text-sm">Effet d'Interférence</h4>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          Pour éviter que la muscu ne nuise au run, les séances "Jambes" sont placées de manière stratégique (éloignées des séances VMA) selon <strong>Murach & Bagley (2016)</strong>.
                        </p>
                      </div>
                    </div>
                  </div>
               )}
                 
               <div className="bg-white/10 backdrop-blur border border-white/10 p-4 rounded-xl">
                 <div className="flex items-start gap-3">
                   <div className="bg-purple-500/20 p-2 rounded-lg text-purple-400"><Target size={18}/></div>
                   <div>
                     <h4 className="font-bold text-sm">Modèle de Banister</h4>
                     <BanisterChart duration={userData.durationWeeks} />
                     <p className="text-[10px] text-slate-300 mt-2 leading-relaxed italic">
                       Modélisation théorique de la performance (Forme = Fitness - Fatigue). Notez le pic de forme prévu à la fin grâce à l'affûtage.
                     </p>
                   </div>
                 </div>
               </div>

                  <div className="bg-white/10 backdrop-blur border border-white/10 p-4 rounded-xl">
                   <div className="flex items-start gap-3">
                     <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400"><BarChart3 size={18}/></div>
                     <div>
                       <h4 className="font-bold text-sm">Charge TRIMP (Training Impulse)</h4>
                       <TrimpChart volumeData={stats ? stats.weeklyVolume : []} />
                       <p className="text-[10px] text-slate-300 mt-2 leading-relaxed italic">
                         Quantification de la charge interne hebdomadaire pour assurer une surcharge progressive sans blessure.
                       </p>
                     </div>
                   </div>
                 </div>
                 
               {userData.strengthDaysPerWeek > 0 && (
                   <div className="bg-white/10 backdrop-blur border border-white/10 p-4 rounded-xl">
                     <div className="flex items-start gap-3">
                       <div className="bg-rose-500/20 p-2 rounded-lg text-rose-400"><Dna size={18}/></div>
                       <div>
                         <h4 className="font-bold text-sm">Mécanismes Moléculaires</h4>
                         <InterferenceDiagram />
                         <p className="text-[10px] text-slate-300 mt-2 leading-relaxed italic">
                           Schématisation du conflit potentiel entre les voies de signalisation AMPk (endurance) et mTOR (hypertrophie).
                         </p>
                       </div>
                     </div>
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