import { createContext, useContext, useState, useEffect } from "react";

export const LANGUAGES = [
  { code: "en", name: "English", native: "English", flag: "🇺🇸" },
  { code: "es", name: "Spanish", native: "Español", flag: "🇲🇽" },
  { code: "zh", name: "Chinese - Simplified", native: "中文", flag: "🇨🇳" },
  { code: "hi", name: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
  { code: "ar", name: "Arabic", native: "العربية", flag: "🇸🇦" },
  { code: "fr", name: "French", native: "Français", flag: "🇫🇷" },
  { code: "pt", name: "Portuguese", native: "Português", flag: "🇧🇷" },
  { code: "ru", name: "Russian", native: "Русский", flag: "🇷🇺" },
  { code: "de", name: "German", native: "Deutsch", flag: "🇩🇪" },
  { code: "ja", name: "Japanese", native: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "Korean", native: "한국어", flag: "🇰🇷" },
  { code: "it", name: "Italian", native: "Italiano", flag: "🇮🇹" },
  { code: "tr", name: "Turkish", native: "Türkçe", flag: "🇹🇷" },
  { code: "vi", name: "Vietnamese", native: "Tiếng Việt", flag: "🇻🇳" },
  { code: "pl", name: "Polish", native: "Polski", flag: "🇵🇱" },
  { code: "nl", name: "Dutch", native: "Nederlands", flag: "🇳🇱" },
  { code: "id", name: "Indonesian", native: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "tl", name: "Filipino", native: "Tagalog", flag: "🇵🇭" },
  { code: "th", name: "Thai", native: "ภาษาไทย", flag: "🇹🇭" },
  { code: "uk", name: "Ukrainian", native: "Українська", flag: "🇺🇦" },
];

type TranslationKey =
  | "nav.home" | "nav.bookings" | "nav.profile" | "nav.settings" | "nav.messages"
  | "nav.notifications" | "nav.logout" | "nav.login" | "nav.signup" | "nav.earnings"
  | "nav.myServices"
  | "auth.email" | "auth.password" | "auth.confirmPassword" | "auth.displayName"
  | "auth.login" | "auth.signup" | "auth.forgotPassword" | "auth.forgotPasswordDesc"
  | "auth.sendReset" | "auth.orContinueWith" | "auth.continueGoogle" | "auth.continueApple"
  | "auth.hireProf" | "auth.offerWork" | "auth.createAccount" | "auth.bio"
  | "auth.passwordMismatch" | "auth.iWantTo"
  | "home.findPros" | "home.expertsNearby" | "home.searchPlaceholder" | "home.noServices"
  | "home.tryAdjusting" | "home.findingExperts"
  | "service.requestService" | "service.sendRequest" | "service.free" | "service.step"
  | "service.of" | "service.describeJob" | "service.jobSize" | "service.urgency"
  | "service.preferredDate" | "service.estimatedBudget" | "service.estimatedDuration"
  | "service.back" | "service.next" | "service.requestSent" | "service.requestSentDesc"
  | "service.backToHome" | "service.providerResponse"
  | "settings.language" | "settings.saveLanguage" | "settings.languageSaved"
  | "settings.title" | "settings.appearance" | "settings.darkMode"
  | "common.loading" | "common.error" | "common.done" | "common.cancel" | "common.save";

type Translations = Record<TranslationKey, string>;

const EN: Translations = {
  "nav.home": "Home",
  "nav.bookings": "My Bookings",
  "nav.profile": "Profile",
  "nav.settings": "Settings",
  "nav.messages": "Messages",
  "nav.notifications": "Notifications",
  "nav.logout": "Log out",
  "nav.login": "Log in",
  "nav.signup": "Sign up",
  "nav.earnings": "Earnings",

  "nav.myServices": "My Services",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.confirmPassword": "Confirm Password",
  "auth.displayName": "Display Name",
  "auth.login": "Log In",
  "auth.signup": "Sign Up",
  "auth.forgotPassword": "Forgot your password?",
  "auth.forgotPasswordDesc": "Enter your email and we'll send you instructions to reset your password.",
  "auth.sendReset": "Send Reset Link",
  "auth.orContinueWith": "or",
  "auth.continueGoogle": "Continue with Google",
  "auth.continueApple": "Continue with Apple",
  "auth.hireProf": "Hire Pros",
  "auth.offerWork": "Offer Work",
  "auth.createAccount": "Create Account",
  "auth.bio": "Professional Bio",
  "auth.passwordMismatch": "Passwords do not match",
  "auth.iWantTo": "I want to...",
  "home.findPros": "Find Professionals",
  "home.expertsNearby": "Experts nearby ready to help.",
  "home.searchPlaceholder": "What do you need help with?",
  "home.noServices": "No services found",
  "home.tryAdjusting": "Try adjusting your search or filters.",
  "home.findingExperts": "Finding experts nearby...",
  "service.requestService": "Request This Service",
  "service.sendRequest": "Send Request — Free",
  "service.free": "Free to request",
  "service.step": "Step",
  "service.of": "of",
  "service.describeJob": "Describe your job",
  "service.jobSize": "Job Size",
  "service.urgency": "Urgency",
  "service.preferredDate": "Preferred Date",
  "service.estimatedBudget": "Estimated Budget",
  "service.estimatedDuration": "Estimated Duration",
  "service.back": "Back",
  "service.next": "Next",
  "service.requestSent": "Request Sent!",
  "service.requestSentDesc": "They typically respond in less than 1 hour. You'll receive a notification when they reply.",
  "service.backToHome": "Back to Home",
  "service.providerResponse": "Your request has been sent to",
  "settings.language": "Language / Idioma",
  "settings.saveLanguage": "Save Language",
  "settings.languageSaved": "Language updated successfully!",
  "settings.title": "Settings",
  "settings.appearance": "Appearance",
  "settings.darkMode": "Dark Mode",
  "common.loading": "Loading...",
  "common.error": "Error",
  "common.done": "Done",
  "common.cancel": "Cancel",
  "common.save": "Save",
};

const ES: Translations = {
  "nav.home": "Inicio",
  "nav.bookings": "Mis Reservas",
  "nav.profile": "Perfil",
  "nav.settings": "Ajustes",
  "nav.messages": "Mensajes",
  "nav.notifications": "Notificaciones",
  "nav.logout": "Cerrar sesión",
  "nav.login": "Iniciar sesión",
  "nav.signup": "Registrarse",
  "nav.earnings": "Ganancias",

  "nav.myServices": "Mis Servicios",
  "auth.email": "Correo electrónico",
  "auth.password": "Contraseña",
  "auth.confirmPassword": "Confirmar contraseña",
  "auth.displayName": "Nombre visible",
  "auth.login": "Iniciar sesión",
  "auth.signup": "Registrarse",
  "auth.forgotPassword": "¿Olvidaste tu contraseña?",
  "auth.forgotPasswordDesc": "Ingresa tu correo y te enviaremos instrucciones para restablecer tu contraseña.",
  "auth.sendReset": "Enviar enlace",
  "auth.orContinueWith": "o",
  "auth.continueGoogle": "Continuar con Google",
  "auth.continueApple": "Continuar con Apple",
  "auth.hireProf": "Contratar Pros",
  "auth.offerWork": "Ofrecer Trabajo",
  "auth.createAccount": "Crear cuenta",
  "auth.bio": "Biografía profesional",
  "auth.passwordMismatch": "Las contraseñas no coinciden",
  "auth.iWantTo": "Quiero...",
  "home.findPros": "Encuentra Profesionales",
  "home.expertsNearby": "Expertos cercanos listos para ayudar.",
  "home.searchPlaceholder": "¿Qué necesitas?",
  "home.noServices": "No se encontraron servicios",
  "home.tryAdjusting": "Intenta ajustar tu búsqueda o filtros.",
  "home.findingExperts": "Buscando expertos cercanos...",
  "service.requestService": "Solicitar este servicio",
  "service.sendRequest": "Enviar solicitud — Gratis",
  "service.free": "Gratis para solicitar",
  "service.step": "Paso",
  "service.of": "de",
  "service.describeJob": "Describe tu trabajo",
  "service.jobSize": "Tamaño del trabajo",
  "service.urgency": "Urgencia",
  "service.preferredDate": "Fecha preferida",
  "service.estimatedBudget": "Presupuesto estimado",
  "service.estimatedDuration": "Duración estimada",
  "service.back": "Atrás",
  "service.next": "Siguiente",
  "service.requestSent": "¡Solicitud enviada!",
  "service.requestSentDesc": "Normalmente responden en menos de 1 hora. Recibirás una notificación cuando respondan.",
  "service.backToHome": "Volver al inicio",
  "service.providerResponse": "Tu solicitud fue enviada a",
  "settings.language": "Idioma / Language",
  "settings.saveLanguage": "Guardar idioma",
  "settings.languageSaved": "¡Idioma actualizado correctamente!",
  "settings.title": "Ajustes",
  "settings.appearance": "Apariencia",
  "settings.darkMode": "Modo oscuro",
  "common.loading": "Cargando...",
  "common.error": "Error",
  "common.done": "Listo",
  "common.cancel": "Cancelar",
  "common.save": "Guardar",
};

function makeMinimal(t: Partial<Translations>): Translations {
  return { ...EN, ...t };
}

const ZH = makeMinimal({ "nav.home": "首页", "nav.bookings": "我的预约", "nav.profile": "个人资料", "nav.settings": "设置", "nav.login": "登录", "nav.signup": "注册", "nav.logout": "退出", "auth.email": "电子邮件", "auth.password": "密码", "auth.login": "登录", "auth.signup": "注册", "auth.createAccount": "创建账户", "home.findPros": "寻找专业人士", "service.requestService": "申请服务", "service.sendRequest": "发送请求 — 免费", "service.back": "返回", "service.next": "下一步", "service.requestSent": "请求已发送！", "settings.saveLanguage": "保存语言", "settings.title": "设置" });
const HI = makeMinimal({ "nav.home": "होम", "nav.login": "लॉग इन", "nav.signup": "साइन अप", "nav.logout": "लॉग आउट", "auth.email": "ईमेल", "auth.password": "पासवर्ड", "auth.login": "लॉग इन", "auth.signup": "साइन अप", "auth.createAccount": "खाता बनाएं", "home.findPros": "पेशेवर खोजें", "service.requestService": "सेवा अनुरोध करें", "service.sendRequest": "अनुरोध भेजें — मुफ्त", "service.back": "वापस", "service.next": "आगे", "service.requestSent": "अनुरोध भेजा!", "settings.saveLanguage": "भाषा सहेजें", "settings.title": "सेटिंग्स" });
const AR = makeMinimal({ "nav.home": "الرئيسية", "nav.login": "تسجيل الدخول", "nav.signup": "إنشاء حساب", "nav.logout": "تسجيل الخروج", "auth.email": "البريد الإلكتروني", "auth.password": "كلمة المرور", "auth.login": "تسجيل الدخول", "auth.signup": "إنشاء حساب", "auth.createAccount": "إنشاء حساب", "home.findPros": "ابحث عن محترفين", "service.requestService": "طلب الخدمة", "service.sendRequest": "إرسال الطلب — مجاني", "service.back": "رجوع", "service.next": "التالي", "service.requestSent": "تم إرسال الطلب!", "settings.saveLanguage": "حفظ اللغة", "settings.title": "الإعدادات" });
const FR = makeMinimal({ "nav.home": "Accueil", "nav.bookings": "Mes réservations", "nav.profile": "Profil", "nav.settings": "Paramètres", "nav.login": "Se connecter", "nav.signup": "S'inscrire", "nav.logout": "Se déconnecter", "auth.email": "E-mail", "auth.password": "Mot de passe", "auth.login": "Se connecter", "auth.signup": "S'inscrire", "auth.createAccount": "Créer un compte", "home.findPros": "Trouver des pros", "service.requestService": "Demander ce service", "service.sendRequest": "Envoyer la demande — Gratuit", "service.back": "Retour", "service.next": "Suivant", "service.requestSent": "Demande envoyée!", "settings.saveLanguage": "Enregistrer la langue", "settings.title": "Paramètres" });
const PT = makeMinimal({ "nav.home": "Início", "nav.bookings": "Minhas Reservas", "nav.profile": "Perfil", "nav.settings": "Configurações", "nav.login": "Entrar", "nav.signup": "Cadastrar", "nav.logout": "Sair", "auth.email": "E-mail", "auth.password": "Senha", "auth.login": "Entrar", "auth.signup": "Cadastrar", "auth.createAccount": "Criar conta", "home.findPros": "Encontrar Profissionais", "service.requestService": "Solicitar Serviço", "service.sendRequest": "Enviar Pedido — Grátis", "service.back": "Voltar", "service.next": "Próximo", "service.requestSent": "Pedido Enviado!", "settings.saveLanguage": "Salvar Idioma", "settings.title": "Configurações" });
const RU = makeMinimal({ "nav.home": "Главная", "nav.login": "Войти", "nav.signup": "Регистрация", "nav.logout": "Выйти", "auth.email": "Эл. почта", "auth.password": "Пароль", "auth.login": "Войти", "auth.signup": "Зарегистрироваться", "auth.createAccount": "Создать аккаунт", "home.findPros": "Найти специалистов", "service.requestService": "Запросить услугу", "service.sendRequest": "Отправить запрос — Бесплатно", "service.back": "Назад", "service.next": "Далее", "service.requestSent": "Запрос отправлен!", "settings.saveLanguage": "Сохранить язык", "settings.title": "Настройки" });
const DE = makeMinimal({ "nav.home": "Startseite", "nav.login": "Anmelden", "nav.signup": "Registrieren", "nav.logout": "Abmelden", "auth.email": "E-Mail", "auth.password": "Passwort", "auth.login": "Anmelden", "auth.signup": "Registrieren", "auth.createAccount": "Konto erstellen", "home.findPros": "Profis finden", "service.requestService": "Dienst anfragen", "service.sendRequest": "Anfrage senden — Kostenlos", "service.back": "Zurück", "service.next": "Weiter", "service.requestSent": "Anfrage gesendet!", "settings.saveLanguage": "Sprache speichern", "settings.title": "Einstellungen" });
const JA = makeMinimal({ "nav.home": "ホーム", "nav.login": "ログイン", "nav.signup": "登録", "nav.logout": "ログアウト", "auth.email": "メール", "auth.password": "パスワード", "auth.login": "ログイン", "auth.signup": "登録", "auth.createAccount": "アカウント作成", "home.findPros": "専門家を探す", "service.requestService": "サービスをリクエスト", "service.sendRequest": "リクエストを送信 — 無料", "service.back": "戻る", "service.next": "次へ", "service.requestSent": "リクエスト送信完了!", "settings.saveLanguage": "言語を保存", "settings.title": "設定" });
const KO = makeMinimal({ "nav.home": "홈", "nav.login": "로그인", "nav.signup": "회원가입", "nav.logout": "로그아웃", "auth.email": "이메일", "auth.password": "비밀번호", "auth.login": "로그인", "auth.signup": "회원가입", "auth.createAccount": "계정 만들기", "home.findPros": "전문가 찾기", "service.requestService": "서비스 요청", "service.sendRequest": "요청 보내기 — 무료", "service.back": "뒤로", "service.next": "다음", "service.requestSent": "요청 전송됨!", "settings.saveLanguage": "언어 저장", "settings.title": "설정" });
const IT = makeMinimal({ "nav.home": "Home", "nav.login": "Accedi", "nav.signup": "Registrati", "nav.logout": "Esci", "auth.email": "E-mail", "auth.password": "Password", "auth.login": "Accedi", "auth.signup": "Registrati", "auth.createAccount": "Crea account", "home.findPros": "Trova professionisti", "service.requestService": "Richiedi servizio", "service.sendRequest": "Invia richiesta — Gratis", "service.back": "Indietro", "service.next": "Avanti", "service.requestSent": "Richiesta inviata!", "settings.saveLanguage": "Salva lingua", "settings.title": "Impostazioni" });
const TR = makeMinimal({ "nav.home": "Ana Sayfa", "nav.login": "Giriş Yap", "nav.signup": "Kayıt Ol", "nav.logout": "Çıkış Yap", "auth.email": "E-posta", "auth.password": "Şifre", "auth.login": "Giriş Yap", "auth.signup": "Kayıt Ol", "auth.createAccount": "Hesap Oluştur", "home.findPros": "Uzman Bul", "service.requestService": "Hizmet Talep Et", "service.sendRequest": "Talep Gönder — Ücretsiz", "service.back": "Geri", "service.next": "İleri", "service.requestSent": "Talep Gönderildi!", "settings.saveLanguage": "Dili Kaydet", "settings.title": "Ayarlar" });
const VI = makeMinimal({ "nav.home": "Trang chủ", "nav.login": "Đăng nhập", "nav.signup": "Đăng ký", "nav.logout": "Đăng xuất", "auth.email": "Email", "auth.password": "Mật khẩu", "auth.login": "Đăng nhập", "auth.signup": "Đăng ký", "auth.createAccount": "Tạo tài khoản", "home.findPros": "Tìm chuyên gia", "service.requestService": "Yêu cầu dịch vụ", "service.sendRequest": "Gửi yêu cầu — Miễn phí", "service.back": "Quay lại", "service.next": "Tiếp theo", "service.requestSent": "Đã gửi yêu cầu!", "settings.saveLanguage": "Lưu ngôn ngữ", "settings.title": "Cài đặt" });
const PL = makeMinimal({ "nav.home": "Strona główna", "nav.login": "Zaloguj się", "nav.signup": "Zarejestruj się", "nav.logout": "Wyloguj się", "auth.email": "E-mail", "auth.password": "Hasło", "auth.login": "Zaloguj się", "auth.signup": "Zarejestruj się", "auth.createAccount": "Utwórz konto", "home.findPros": "Znajdź specjalistów", "service.requestService": "Zamów usługę", "service.sendRequest": "Wyślij zapytanie — Bezpłatnie", "service.back": "Wróć", "service.next": "Dalej", "service.requestSent": "Zapytanie wysłane!", "settings.saveLanguage": "Zapisz język", "settings.title": "Ustawienia" });
const NL = makeMinimal({ "nav.home": "Home", "nav.login": "Inloggen", "nav.signup": "Registreren", "nav.logout": "Uitloggen", "auth.email": "E-mail", "auth.password": "Wachtwoord", "auth.login": "Inloggen", "auth.signup": "Registreren", "auth.createAccount": "Account aanmaken", "home.findPros": "Vind professionals", "service.requestService": "Dienst aanvragen", "service.sendRequest": "Aanvraag sturen — Gratis", "service.back": "Terug", "service.next": "Volgende", "service.requestSent": "Aanvraag verstuurd!", "settings.saveLanguage": "Taal opslaan", "settings.title": "Instellingen" });
const ID = makeMinimal({ "nav.home": "Beranda", "nav.login": "Masuk", "nav.signup": "Daftar", "nav.logout": "Keluar", "auth.email": "Email", "auth.password": "Kata sandi", "auth.login": "Masuk", "auth.signup": "Daftar", "auth.createAccount": "Buat akun", "home.findPros": "Temukan Profesional", "service.requestService": "Minta Layanan", "service.sendRequest": "Kirim Permintaan — Gratis", "service.back": "Kembali", "service.next": "Lanjut", "service.requestSent": "Permintaan Terkirim!", "settings.saveLanguage": "Simpan Bahasa", "settings.title": "Pengaturan" });
const TL = makeMinimal({ "nav.home": "Home", "nav.login": "Mag-login", "nav.signup": "Mag-sign up", "nav.logout": "Mag-logout", "auth.email": "Email", "auth.password": "Password", "auth.login": "Mag-login", "auth.signup": "Mag-sign up", "auth.createAccount": "Gumawa ng account", "home.findPros": "Maghanap ng Propesyonal", "service.requestService": "Humiling ng Serbisyo", "service.sendRequest": "Magpadala ng Kahilingan — Libre", "service.back": "Bumalik", "service.next": "Susunod", "service.requestSent": "Naipadala ang Kahilingan!", "settings.saveLanguage": "I-save ang Wika", "settings.title": "Mga Setting" });
const TH = makeMinimal({ "nav.home": "หน้าหลัก", "nav.login": "เข้าสู่ระบบ", "nav.signup": "สมัครสมาชิก", "nav.logout": "ออกจากระบบ", "auth.email": "อีเมล", "auth.password": "รหัสผ่าน", "auth.login": "เข้าสู่ระบบ", "auth.signup": "สมัครสมาชิก", "auth.createAccount": "สร้างบัญชี", "home.findPros": "ค้นหาผู้เชี่ยวชาญ", "service.requestService": "ขอรับบริการ", "service.sendRequest": "ส่งคำขอ — ฟรี", "service.back": "กลับ", "service.next": "ถัดไป", "service.requestSent": "ส่งคำขอแล้ว!", "settings.saveLanguage": "บันทึกภาษา", "settings.title": "การตั้งค่า" });
const UK = makeMinimal({ "nav.home": "Головна", "nav.login": "Увійти", "nav.signup": "Реєстрація", "nav.logout": "Вийти", "auth.email": "Ел. пошта", "auth.password": "Пароль", "auth.login": "Увійти", "auth.signup": "Зареєструватись", "auth.createAccount": "Створити акаунт", "home.findPros": "Знайти фахівців", "service.requestService": "Замовити послугу", "service.sendRequest": "Надіслати запит — Безкоштовно", "service.back": "Назад", "service.next": "Далі", "service.requestSent": "Запит надіслано!", "settings.saveLanguage": "Зберегти мову", "settings.title": "Налаштування" });

export const CERTIGO_TRANSLATIONS: Record<string, Translations> = {
  en: EN, es: ES, zh: ZH, hi: HI, ar: AR, fr: FR, pt: PT, ru: RU,
  de: DE, ja: JA, ko: KO, it: IT, tr: TR, vi: VI, pl: PL, nl: NL,
  id: ID, tl: TL, th: TH, uk: UK,
};

interface LanguageContextType {
  language: string;
  setLanguage: (code: string) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key) => EN[key] || key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem("certigo_language") || "en";
  });

  const setLanguage = (code: string) => {
    setLanguageState(code);
    localStorage.setItem("certigo_language", code);
  };

  const t = (key: TranslationKey): string => {
    const translations = CERTIGO_TRANSLATIONS[language] || EN;
    return translations[key] || EN[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
