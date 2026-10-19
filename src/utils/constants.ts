import { ProviderCategory, PlaceType, NgoFocusArea } from '../types';

/**
 * FSSAI Guidance & Safe-Window Defaults:
 * Safe-window defaults per food type are demo constants, verify against FSSAI guidance.
 * In Indian ambient climatic conditions, perishable hot-cooked gravies & rice have a strictly limited
 * safe consumable window (ideally under 3-4 hours if not held at >60°C or refrigerated).
 */
export const FOOD_SAFE_WINDOW_HOURS: Record<string, { hours: number; description: string; advice: string }> = {
  'cooked_curry_rice': {
    hours: 3.5,
    description: 'Hot Cooked Meals (Rice, Dal, Gravies, Sabzi)',
    advice: 'Consume within 3.5 hrs. Must be kept insulated and reheated before serving if cooled.'
  },
  'wedding_banquet_buffet': {
    hours: 3.0,
    description: 'Catered Event / Wedding Buffet Surplus',
    advice: 'High-touch buffet food. 3 hrs safe window from end of buffet service.'
  },
  'dry_rotis_parathas': {
    hours: 6.0,
    description: 'Chapatis, Rotis, Puris & Dry Bread',
    advice: 'Store wrapped in clean food-grade cloth/foil; safe up to 6 hours.'
  },
  'dry_snacks_bakery': {
    hours: 12.0,
    description: 'Poha, Idlis, Samosas, Cutlets & Breads',
    advice: 'Safe for 8-12 hours in ventilated, dry container.'
  },
  'mithai_sweets': {
    hours: 24.0,
    description: 'Traditional Sweets, Dry Ladoos, Burfi',
    advice: 'Non-milk sweets safe up to 24-36 hrs. Milk sweets require cold chain.'
  },
  'fresh_salad_cut_fruits': {
    hours: 2.0,
    description: 'Cut Salads, Cut Fruits, Raita',
    advice: 'High bacterial risk if unchilled. Must be consumed within 2 hours.'
  }
};

export const PROVIDER_CATEGORIES: { id: ProviderCategory; label: string; icon: string; description: string }[] = [
  { id: 'restaurants_cafes', label: 'Restaurants & Cafes', icon: 'Utensils', description: 'Daily surplus after lunch or dinner services' },
  { id: 'function_halls_karyalays', label: 'Function Halls & Karyalays', icon: 'Landmark', description: 'Large batch surplus from weddings and celebrations' },
  { id: 'caterers', label: 'Wedding & Event Caterers', icon: 'ChefHat', description: 'Professional catering surplus packed in steel churns/tins' },
  { id: 'hostel_canteen', label: 'Hostel Messes & Canteens', icon: 'GraduationCap', description: 'Institutional university and corporate cafeteria prep' },
  { id: 'hotels', label: 'Hotels & Banquet Suites', icon: 'Hotel', description: 'Star-rated hospitality excess from banquets and buffets' },
  { id: 'sweet_shops_bakeries', label: 'Sweet Shops & Bakeries', icon: 'Cake', description: 'Freshly baked breads, pastries and confectionery' },
  { id: 'others', label: 'Other Food Units', icon: 'Store', description: 'Community kitchens, religious langars, and food processors' }
];

export const PLACE_TYPES: { id: PlaceType; label: string; icon: string }[] = [
  { id: 'orphanage', label: 'Orphanages & Child Care Homes', icon: 'HeartHandshake' },
  { id: 'old_age_home', label: 'Old-Age Homes (Vridhashram)', icon: 'Users' },
  { id: 'shelter', label: 'Shelters & Night Shelters', icon: 'Home' },
  { id: 'community_settlement', label: 'Community & Labor Settlements', icon: 'Tent' },
  { id: 'other', label: 'Other Care Facilities', icon: 'Building2' }
];

export const NGO_FOCUS_AREAS: { id: NgoFocusArea; label: string }[] = [
  { id: 'children', label: 'Children & Orphanages' },
  { id: 'elderly', label: 'Elderly Care' },
  { id: 'homeless', label: 'Homeless & Night Shelters' },
  { id: 'community_kitchen', label: 'Community Kitchens' },
  { id: 'disaster_relief', label: 'Emergency Relief' },
  { id: 'slum_education', label: 'Informal Labor Settlements' }
];

export type SupportedLanguage = 'en' | 'hi' | 'mr';

export const TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    appName: 'AnnaSetu',
    tagline: 'The Trust Bridge Between Surplus Food & Hungry Plates',
    heroHeadline: 'Good food should reach a plate, not a dustbin.',
    heroSub: 'AnnaSetu links banquet halls, messes, and restaurants with verified NGOs. We ensure complete transparency with photo-verified serve reports.',
    iAmProvider: 'I am a Food Provider',
    iAmNgo: 'I am an NGO',
    exploreDirectory: 'Explore Directory',
    foodProviders: 'Food Providers',
    placesInNeed: 'Places in Need',
    ngos: 'NGOs',
    liveOffers: 'Live Food Offers',
    postSurplus: 'Post Surplus Food',
    dashboard: 'Dashboard',
    signOut: 'Sign Out',
    signIn: 'Sign In / Register',
    verifiedDemo: 'Verified (demo)',
    pendingReview: 'Pending review (demo)',
    howItWorks: 'How the Trust Bridge Works',
    step1Title: 'Provider Lists Surplus',
    step1Desc: 'Enter surplus quantity, packaging, and safe consumable window.',
    step2Title: 'NGO Submits Plan',
    step2Desc: 'NGO specifies exact beneficiaries, vehicle, and distribution place.',
    step3Title: 'Handover via Code',
    step3Desc: 'Food is collected using a 4-digit mutual verification code.',
    step4Title: 'Proof of Serving',
    step4Desc: 'NGO posts photos & numbers. Provider sees where their food went.',
    platesRedirected: 'Plates Saved & Served',
    activeNgos: 'Partner NGOs',
    activeProviders: 'Food Donors',
    placesReached: 'Care Centers Reached',
    recentServeReports: 'Recent Verified Serve Reports',
    seeAllReports: 'View All Reports',
    filterByCategory: 'Filter by Category',
    filterByArea: 'Filter by Locality',
    searchPlaceholder: 'Search by name or area...',
    needsFoodToday: 'Needs Food Today',
    regularlyServed: 'Regularly Served',
    demoControls: 'Demo Sandbox'
  },
  hi: {
    appName: 'अन्नसेतु',
    tagline: 'अतिरिक्त भोजन और जरूरतमंद थालियों के बीच का विश्वास सेतु',
    heroHeadline: 'अच्छा भोजन थाली में पहुँचना चाहिए, कचरे में नहीं।',
    heroSub: 'अन्नसेतु बैंक्वेट हॉल, मेस और रेस्तरां को सत्यापित एनजीओ से जोड़ता है। फोटो-सत्यापित वितरण रिपोर्ट के साथ पूर्ण पारदर्शिता।',
    iAmProvider: 'मैं भोजन प्रदाता हूँ',
    iAmNgo: 'मैं एक एनजीओ हूँ',
    exploreDirectory: 'निर्देशिका देखें',
    foodProviders: 'भोजन प्रदाता',
    placesInNeed: 'ज़रूरतमंद स्थान',
    ngos: 'एनजीओ साथी',
    liveOffers: 'उपलब्ध भोजन',
    postSurplus: 'अतिरिक्त भोजन दान करें',
    dashboard: 'डैशबोर्ड',
    signOut: 'लॉग आउट',
    signIn: 'लॉग इन / रजिस्टर',
    verifiedDemo: 'सत्यापित (डेमो)',
    pendingReview: 'समीक्षाधीन (डेमो)',
    howItWorks: 'विश्वास सेतु कैसे काम करता है',
    step1Title: 'प्रदाता भोजन दर्ज करें',
    step1Desc: 'भोजन की मात्रा, पैकेजिंग और सुरक्षित समय सीमा दर्ज करें।',
    step2Title: 'एनजीओ योजना बनाएं',
    step2Desc: 'एनजीओ वितरण स्थल, लाभार्थी और वाहन की जानकारी दें।',
    step3Title: 'कोड से हैंडओवर',
    step3Desc: '४-अंकों के सुरक्षा कोड के साथ भोजन प्राप्त करें।',
    step4Title: 'परोसने का प्रमाण',
    step4Desc: 'एनजीओ फोटो और संख्या पोस्ट करते हैं। प्रदाता को दिखता है कि भोजन कहाँ पहुँचा।',
    platesRedirected: 'थाली भोजन सुरक्षित व वितरित',
    activeNgos: 'संबद्ध एनजीओ',
    activeProviders: 'दाता संस्थान',
    placesReached: 'आश्रय स्थल',
    recentServeReports: 'हालिया सत्यापित रिपोर्ट',
    seeAllReports: 'सभी रिपोर्ट देखें',
    filterByCategory: 'श्रेणी द्वारा फ़िल्टर',
    filterByArea: 'क्षेत्र द्वारा फ़िल्टर',
    searchPlaceholder: 'नाम या क्षेत्र खोजें...',
    needsFoodToday: 'आज भोजन की आवश्यकता है',
    regularlyServed: 'नियमित सेवा प्राप्त',
    demoControls: 'डेमो सैंडबॉक्स'
  },
  mr: {
    appName: 'अन्नसेतू',
    tagline: 'अतिरिक्त अन्न आणि भुकेल्या ताटांमधील विश्वासाचा सेतू',
    heroHeadline: 'चांगले अन्न ताटात पोहोचले पाहिजे, कचराकुंडीत नाही.',
    heroSub: 'अन्नसेतू मंगल कार्यालये, मेस आणि हॉटेल्सना प्रमाणित स्वयंसेवी संस्थांशी जोडते. फोटोसह प्रत्यक्ष वितरणाचा पारदर्शक पुरावा.',
    iAmProvider: 'मी अन्नदाता आहे (Provider)',
    iAmNgo: 'मी स्वयंसेवी संस्था (NGO) आहे',
    exploreDirectory: 'सूची पहा',
    foodProviders: 'अन्नदाते',
    placesInNeed: 'गरजू ठिकाणे',
    ngos: 'एनजीओ संस्था',
    liveOffers: 'उपलब्ध अन्न',
    postSurplus: 'अतिरिक्त अन्न नोंदवा',
    dashboard: 'डॅशबोर्ड',
    signOut: 'बाहेर पडा',
    signIn: 'लॉग इन / नोंदणी',
    verifiedDemo: 'प्रमाणित (डेमो)',
    pendingReview: 'पडताळणी प्रलंबित (डेमो)',
    howItWorks: 'अन्नसेतू कसे कार्य करते?',
    step1Title: 'अन्नाची नोंदणी',
    step1Desc: 'अन्नाचे प्रमाण, पॅकिंग आणि सुरक्षित राहण्याची वेळ नमूद करा.',
    step2Title: 'एनजीओ वितरण योजना',
    step2Desc: 'अन्न कुठे आणि कोणाला देणार याची पक्की योजना द्या.',
    step3Title: 'सुरक्षित हस्तांतरण',
    step3Desc: '४-अंकी गुप्त कोड वापरून अन्न ताब्यात दिले जाते.',
    step4Title: 'वितरणाचा पुरावा',
    step4Desc: 'एनजीओ प्रत्यक्ष वाटपाचे फोटो व माहिती अपलोड करतात.',
    platesRedirected: 'वाटप झालेली ताटे',
    activeNgos: 'सहभागी संस्था',
    activeProviders: 'अन्नदाते हॉटेल्स/हॉल्स',
    placesReached: 'आश्रयस्थाने पोहोचलो',
    recentServeReports: 'प्रत्यक्ष वाटपाचे अहवाल',
    seeAllReports: 'सर्व अहवाल पहा',
    filterByCategory: 'वर्गवारीनुसार',
    filterByArea: 'परिसर निवडा',
    searchPlaceholder: 'नाव किंवा परिसर शोधा...',
    needsFoodToday: 'आज अन्नाची तातडीची गरज',
    regularlyServed: 'नियमित सेवा',
    demoControls: 'डेमो नियंत्रण'
  }
};
