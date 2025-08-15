const translations = {
    ar: {
        loading: "جاري التحميل...",
        app_title: "GAIA-Scout Pro",
        locate_me: "حدد موقعي",
        login: "دخول",
        locating: "جاري تحديد الموقع...",
        detected: "مكتشف",
        confidence: "الثقة",
        depth: "العمق",
        upload_image: "رفع صورة",
        gpr_controls: "ضوابط GPR",
        shallow: "سطحي",
        medium: "متوسط",
        deep: "عميق",
        map: "الخريطة",
        sync_location: "مزامنة الموقع",
        analysis: "التحليل",
        soil_type: "نوع التربة",
        probability: "الاحتمالية",
        period: "الفترة",
        discoveries: "الاكتشافات",
        detailed_report: "تقرير تفصيلي",
        sign_in: "تسجيل الدخول",
        historical_period: "العصر الروماني",
        analysis_complete: "اكتمل التحليل",
        kmz_synced: "تمت مزامنة الموقع مع الخريطة",
        permission_required: "مطلوب إذن الوصول للموقع"
    },
    fr: {
        loading: "Chargement...",
        app_title: "GAIA-Scout Pro",
        locate_me: "Me localiser",
        login: "Connexion",
        locating: "Localisation en cours...",
        detected: "Détecté",
        confidence: "Confiance",
        depth: "Profondeur",
        upload_image: "Télécharger image",
        gpr_controls: "Contrôles GPR",
        shallow: "Superficiel",
        medium: "Moyen",
        deep: "Profond",
        map: "Carte",
        sync_location: "Sync Position",
        analysis: "Analyse",
        soil_type: "Type de sol",
        probability: "Probabilité",
        period: "Période",
        discoveries: "Découvertes",
        detailed_report: "Rapport détaillé",
        sign_in: "Se connecter",
        historical_period: "Période romaine",
        analysis_complete: "Analyse complète",
        kmz_synced: "Position synchronisée avec la carte",
        permission_required: "Permission d'accès à la position requise"
    },
    en: {
        loading: "Loading...",
        app_title: "GAIA-Scout Pro",
        locate_me: "Locate Me",
        login: "Login",
        locating: "Locating...",
        detected: "Detected",
        confidence: "Confidence",
        depth: "Depth",
        upload_image: "Upload Image",
        gpr_controls: "GPR Controls",
        shallow: "Shallow",
        medium: "Medium",
        deep: "Deep",
        map: "Map",
        sync_location: "Sync Location",
        analysis: "Analysis",
        soil_type: "Soil Type",
        probability: "Probability",
        period: "Period",
        discoveries: "Discoveries",
        detailed_report: "Detailed Report",
        sign_in: "Sign In",
        historical_period: "Roman Period",
        analysis_complete: "Analysis Complete",
        kmz_synced: "Location synced with map",
        permission_required: "Location access permission required"
    }
};

let currentLanguage = 'ar';

function changeLanguage(lang) {
    currentLanguage = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
}

// Initialize with Arabic
document.addEventListener('DOMContentLoaded', () => changeLanguage('ar'));