export type Language = 'Somali' | 'English' | 'Arabic';

export const translations = {
  Somali: {
    // Navigation
    favorite: 'Kaydka',
    home: 'Hoyga',
    profile: 'Profile',

    // HomeScreen
    subtitle: 'Agabka Dhaqanka Soomaaliyeed',
    searchPlaceholder: 'Raadi qalabka hiddaha...',
    addArtifact: 'Ku dar qalab',
    seeDetails: 'Eeg Faahfaahinta',
    noArtifacts: 'Wax qalab ah lama helin.',
    searchResultsFor: 'Natiijooyinka raadinta:',
    categoryAll: 'Dhammaan',
    addSuccess: 'Si guul leh ayaa loo daray qalabka cusub!',

    // FavoritesScreen
    savedTitle: 'Kaydka',
    savedSubtitle: 'KUWA AAD KEYDSATAY',
    savedBadge: 'KAYDSAN',
    emptySaved: 'Wax qalab ah oo aad kaydsatay ma jiraan. Ku dar qalab aad jeceshahay bogga hore!',

    // DetailModal
    historyTitle: 'Taariikhda & Dhaqanka Soomaaliyeed',
    backToHome: 'Ku laabo bogga hore',

    // ProfileScreen
    profileTitle: 'Profile',
    statsSaved: 'kaydsan',
    statsNotifications: 'ogeysiis',
    menuScanHistory: 'Taariikhda Baadhista (Scan History)',
    menuNotifications: 'Ogeysiisyada (Notifications)',
    menuSettings: 'Habaynta Koontada (Settings)',
    menuLanguage: 'Luuqadda (Language)',
    menuSignOut: 'Kabax Koontada (Sign Out)',
    settingsTitle: 'HABAYNTA KOONTADA',
    labelFullName: 'Magacaaga (Full Name)',
    labelEmail: 'Iimaylkaaga (Email Address)',
    btnSaveChanges: 'Kaydi Isbeddellada',
    msgChangesSaved: 'Isbeddellada si guul leh ayaa loo kaydiyay!',
    notifTitle: 'OGEYSIISYADA CUSUB',
    scanTitle: 'TAARIIKHDA BAADHISTA',
    selectLanguage: 'DOORO LUUQADDA',
    selectLanguageSub: 'Select Application Language',

    // Add Artifact Form
    formTitle: 'KU DAR QALAB CUSUB',
    formName: 'Magaca Qalabka',
    formCategory: 'Qaybta',
    formShortDesc: 'Sifayn Kooban',
    formLongDesc: 'Taariikhda & Dhaqanka (Sifayn Dheer)',
    formImage: 'Dooro Sawirka',
    btnCancel: 'Ka noqo',
    btnSubmit: 'Ku dar'
  },
  English: {
    // Navigation
    favorite: 'Favorites',
    home: 'Home',
    profile: 'Profile',

    // HomeScreen
    subtitle: 'Somali Cultural Heritage Hub',
    searchPlaceholder: 'Search cultural heritage...',
    addArtifact: 'Add Artifact',
    seeDetails: 'See Details',
    noArtifacts: 'No artifacts found.',
    searchResultsFor: 'Search results for:',
    categoryAll: 'All',
    addSuccess: 'Successfully added new artifact!',

    // FavoritesScreen
    savedTitle: 'Favorites',
    savedSubtitle: 'YOUR FAVORITES',
    savedBadge: 'SAVED',
    emptySaved: 'No saved artifacts found. Add your favorite artifacts from the home screen!',

    // DetailModal
    historyTitle: 'Somali History & Culture',
    backToHome: 'Back to Home',

    // ProfileScreen
    profileTitle: 'Profile',
    statsSaved: 'saved',
    statsNotifications: 'notifications',
    menuScanHistory: 'Scan History',
    menuNotifications: 'Notifications',
    menuSettings: 'Account Settings',
    menuLanguage: 'Language',
    menuSignOut: 'Sign Out',
    settingsTitle: 'ACCOUNT SETTINGS',
    labelFullName: 'Your Name (Full Name)',
    labelEmail: 'Email Address',
    btnSaveChanges: 'Save Changes',
    msgChangesSaved: 'Changes saved successfully!',
    notifTitle: 'NEW NOTIFICATIONS',
    scanTitle: 'SCAN HISTORY',
    selectLanguage: 'SELECT LANGUAGE',
    selectLanguageSub: 'Select Application Language',

    // Add Artifact Form
    formTitle: 'ADD NEW ARTIFACT',
    formName: 'Artifact Name',
    formCategory: 'Category',
    formShortDesc: 'Short Description',
    formLongDesc: 'History & Culture (Long Description)',
    formImage: 'Select Image',
    btnCancel: 'Cancel',
    btnSubmit: 'Add Artifact'
  },
  Arabic: {
    // Navigation
    favorite: 'المفضلة',
    home: 'الرئيسية',
    profile: 'الملف الشخصي',

    // HomeScreen
    subtitle: 'بوابة التراث الثقافي الصومالي',
    searchPlaceholder: 'البحث عن التراث الثقافي...',
    addArtifact: 'إضافة قطعة أثرية',
    seeDetails: 'عرض التفاصيل',
    noArtifacts: 'لم يتم العثور على قطع أثرية.',
    searchResultsFor: 'نتائج البحث عن:',
    categoryAll: 'الكل',
    addSuccess: 'تم إضافة القطعة الأثرية بنجاح!',

    // FavoritesScreen
    savedTitle: 'المفضلة',
    savedSubtitle: 'المفضلة لديك',
    savedBadge: 'محفوظ',
    emptySaved: 'لا توجد قطع أثرية محفوظة. أضف قطعك المفضلة من الشاشة الرئيسية!',

    // DetailModal
    historyTitle: 'التاريخ والثقافة الصومالية',
    backToHome: 'العودة إلى الرئيسية',

    // ProfileScreen
    profileTitle: 'الملف الشخصي',
    statsSaved: 'محفوظ',
    statsNotifications: 'إشعارات',
    menuScanHistory: 'سجل الفحص',
    menuNotifications: 'الإشعارات',
    menuSettings: 'إعدادات الحساب',
    menuLanguage: 'اللغة',
    menuSignOut: 'تسجيل الخروج',
    settingsTitle: 'إعدادات الحساب',
    labelFullName: 'الاسم الكامل',
    labelEmail: 'البريد الإلكتروني',
    btnSaveChanges: 'حفظ التغييرات',
    msgChangesSaved: 'تم حفظ التغييرات بنجاح!',
    notifTitle: 'إشعارات جديدة',
    scanTitle: 'سجل الفحص',
    selectLanguage: 'اختر اللغة',
    selectLanguageSub: 'اختر لغة التطبيق',

    // Add Artifact Form
    formTitle: 'إضافة قطعة أثرية جديدة',
    formName: 'اسم القطعة الأثرية',
    formCategory: 'الفئة',
    formShortDesc: 'وصف قصير',
    formLongDesc: 'التاريخ والثقافة (وصف تفصيلي)',
    formImage: 'اختر صورة',
    btnCancel: 'إلغاء',
    btnSubmit: 'إضافة'
  }
};

export function translate(lang: Language, key: keyof typeof translations['Somali']): string {
  const dict = translations[lang] || translations['Somali'];
  return dict[key] || translations['Somali'][key] || String(key);
}
