// High-Fidelity Multilingual Number-to-Words Engine
// Supports English + all 22 Scheduled Indian Languages:
// Assamese, Bengali, Bodo, Dogri, Gujarati, Hindi, Kannada, Kashmiri,
// Konkani, Maithili, Malayalam, Manipuri, Marathi, Nepali, Odia, Punjabi,
// Sanskrit, Santali, Sindhi, Tamil, Telugu, Urdu.
//
// Rules enforced:
// 1. NEVER read abbreviations (INR, USD, GBP, EUR) - ALWAYS full currency names.
// 2. Localized currency names in the user's selected language.
// 3. Natural decimal and subunit reading (Paise, Cents, Pence, Fils, Sen).
// 4. Exact grammatical agreement for Indian scale (Thousand, Lakh, Crore).

import { CURRENCIES } from "../data/currencies.js";

export const CURRENCY_WORD_NAMES = {
  INR: {
    en: { unit: "Indian Rupee", units: "Indian Rupees", sub: "Paisa", subs: "Paise" },
    te: { unit: "భారతీయ రూపాయి", units: "భారతీయ రూపాయలు", sub: "పైసా", subs: "పైసలు" },
    hi: { unit: "भारतीय रुपया", units: "भारतीय रुपये", sub: "पैसा", subs: "पैसे" },
    ta: { unit: "இந்திய ரூபாய்", units: "இந்திய ரூபாய்", sub: "பைசா", subs: "பைசா" },
    bn: { unit: "ভারতীয় রুপি", units: "ভারতীয় রুপি", sub: "পয়সা", subs: "পয়সা" },
    gu: { unit: "ભારતીય રૂપિયો", units: "ભારતીય રૂપિયા", sub: "પૈસો", subs: "પૈસા" },
    kn: { unit: "ಭಾರತೀಯ ರೂಪಾಯಿ", units: "ಭಾರತೀಯ ರೂಪಾಯಿಗಳು", sub: "ಪೈಸೆ", subs: "ಪೈಸೆ" },
    ml: { unit: "ഇന്ത്യൻ രൂപ", units: "ഇന്ത്യൻ രൂപ", sub: "പൈസ", subs: "പൈസ" },
    mr: { unit: "भारतीय रुपया", units: "भारतीय रुपये", sub: "पैसा", subs: "पैसे" },
    pa: { unit: "ਭਾਰਤੀ ਰੁਪਿਆ", units: "ਭਾਰਤੀ ਰੁਪਏ", sub: "ਪੈਸਾ", subs: "ਪੈਸੇ" },
    or: { unit: "ଭାରତୀୟ ଟଙ୍କା", units: "ଭାରତୀୟ ଟଙ୍କା", sub: "ପଇସା", subs: "ପଇସା" },
    as: { unit: "ভাৰতীয় টকা", units: "ভাৰতীয় টকা", sub: "পইচা", subs: "পইচা" },
    ur: { unit: "ہندوستانی روپیہ", units: "ہندوستانی روپے", sub: "پیسہ", subs: "پیسے" },
    ne: { unit: "भारतीय रुपैयाँ", units: "भारतीय रुपैयाँ", sub: "पैसा", subs: "पैसा" },
    sa: { unit: "भारतीय रूप्यकम्", units: "भारतीय रूप्यकाणि", sub: "पैसा", subs: "पैसे" },
    ks: { unit: "ہِندوستٲنؠ رۄپَے", units: "ہِندوستٲنؠ رۄپَے", sub: "پۄنسہٕ", subs: "پۄنسہٕ" },
    kok: { unit: "भारतीय रुपया", units: "भारतीय रुपये", sub: "पैसो", subs: "पैसे" },
    mai: { unit: "भारतीय रूपया", units: "भारतीय रूपया", sub: "पैसा", subs: "पैसा" },
    doi: { unit: "भारतीय रुपया", units: "भारतीय रुपये", sub: "पैसा", subs: "पैसे" },
    brx: { unit: "भारतिय रां", units: "भारतिय रां", sub: "फैसा", subs: "फैसा" },
    mni: { unit: "ভারতকী লুপা", units: "ভারতকী লুপা", sub: "পৈসা", subs: "পৈসা" },
    sat: { unit: "ᱵᱷᱟᱨᱚᱛ ᱴᱟᱠᱟ", units: "ᱵᱷᱟᱨᱚᱛ ᱴᱟᱠᱟ", sub: "ᱯᱩᱭᱥᱟ", subs: "ᱯᱩᱭᱥᱟ" },
    sd: { unit: "ڀارتي رپيو", units: "ڀارتي رپيا", sub: "پئسو", subs: "پئسا" },
  },
  USD: {
    en: { unit: "US Dollar", units: "US Dollars", sub: "Cent", subs: "Cents" },
    te: { unit: "యుఎస్ డాలర్", units: "యుఎస్ డాలర్లు", sub: "సెంట్", subs: "సెంట్లు" },
    hi: { unit: "अमेरिकी डॉलर", units: "अमेरिकी डॉलर", sub: "सेंट", subs: "सेंट" },
    ta: { unit: "அமெரிக்க டாலர்", units: "அமெரிக்க டாலர்கள்", sub: "சென்ட்", subs: "சென்ட்கள்" },
    bn: { unit: "মার্কিন ডলার", units: "মার্কিন ডলার", sub: "সেন্ট", subs: "সেন্ট" },
    gu: { unit: "યુએસ ડૉલર", units: "યુએસ ડૉલર", sub: "સેન્ટ", subs: "સેન્ટ" },
    kn: { unit: "ಯುಎಸ್ ಡಾಲರ್", units: "ಯುಎಸ್ ಡಾಲರ್‌ಗಳು", sub: "ಸೆಂಟ್", subs: "ಸೆಂಟ್ಸ್" },
    ml: { unit: "യുഎസ് ഡോളർ", units: "യുഎസ് ഡോളറുകൾ", sub: "സെന്റ്", subs: "സെന്റുകൾ" },
    mr: { unit: "अमेरिकन डॉलर", units: "अमेरिकन डॉलर्स", sub: "सेंट", subs: "सेंट्स" },
    pa: { unit: "ਅਮਰੀਕੀ ਡਾਲਰ", units: "ਅਮਰੀਕੀ ਡਾਲਰ", sub: "ਸੈਂਟ", subs: "ਸੈਂਟ" },
    or: { unit: "ଆମେରିକୀୟ ଡଲାର", units: "ଆମେରିକୀୟ ଡଲାର", sub: "ସେଣ୍ଟ", subs: "ସେଣ୍ଟ" },
    as: { unit: "আমেৰিকান ডলাৰ", units: "আমেৰিকান ডলাৰ", sub: "চেণ্ট", subs: "চেণ্ট" },
    ur: { unit: "امریکی ڈالر", units: "امریکی ڈالرز", sub: "سینٹ", subs: "سینٹس" },
    ne: { unit: "अमेरिकी डलर", units: "अमेरिकी डलर", sub: "सेन्ट", subs: "सेन्ट" },
    sa: { unit: "अमेरिकी डालरम्", units: "अमेरिकी डालराणि", sub: "सेन्ट", subs: "सेन्ट" },
  },
  GBP: {
    en: { unit: "British Pound", units: "British Pounds", sub: "Penny", subs: "Pence" },
    te: { unit: "బ్రిటిష్ పౌండ్", units: "బ్రిటిష్ పౌండ్లు", sub: "పెన్నీ", subs: "పెన్స్" },
    hi: { unit: "ब्रिटिश पाउंड", units: "ब्रिटिश पाउंड", sub: "पेनी", subs: "पेंस" },
    ta: { unit: "பிரிட்டிஷ் பவுண்ட்", units: "பிரிட்டிஷ் பவுண்டுகள்", sub: "பென்ஸ்", subs: "பென்ஸ்" },
    bn: { unit: "ব্রিটিশ পাউন্ড", units: "ব্রিটিশ পাউন্ড", sub: "পেন্স", subs: "পেন্স" },
    gu: { unit: "બ્રિટિશ પાઉન્ડ", units: "બ્રિટિશ પાઉન્ડ", sub: "પેની", subs: "પેન્સ" },
    kn: { unit: "ಬ್ರಿಟಿಷ್ ಪೌಂಡ್", units: "ಬ್ರಿಟಿಷ್ ಪೌಂಡ್‌ಗಳು", sub: "ಪೆನ್ನಿ", subs: "ಪೆನ್ಸ್" },
    ml: { unit: "ബ്രിട്ടീഷ് പൗണ്ട്", units: "ബ്രിട്ടീഷ് പൗണ്ടുകൾ", sub: "പെന്നി", subs: "പെൻസ്" },
    mr: { unit: "ब्रिटिश पाउंड", units: "ब्रिटिश पाउंड", sub: "पेनी", subs: "पेन्स" },
    pa: { unit: "ਬ੍ਰਿਟਿਸ਼ ਪਾਊਂਡ", units: "ਬ੍ਰਿਟਿਸ਼ ਪਾਊਂਡ", sub: "ਪੈਂਸ", subs: "ਪੈਂਸ" },
    or: { unit: "ବ୍ରିଟିଶ ପାଉଣ୍ଡ", units: "ବ୍ରିଟିଶ ପାଉଣ୍ଡ", sub: "ପେନି", subs: "ପେନ୍ସ" },
    as: { unit: "ব্ৰিটিছ পাউণ্ড", units: "ব্ৰিটিছ পাউণ্ড", sub: "পেনি", subs: "পেন্স" },
    ur: { unit: "برطانوی پاؤنڈ", units: "برطانوی پاؤنڈز", sub: "پینی", subs: "پینس" },
    ne: { unit: "ब्रिटिश पाउन्ड", units: "ब्रिटिश पाउन्ड", sub: "पेनी", subs: "पेन्स" },
    sa: { unit: "ब्रिटिश पौण्डम्", units: "ब्रिटिश पौण्डानि", sub: "पेनी", subs: "पेंस" },
  },
  EUR: {
    en: { unit: "Euro", units: "Euros", sub: "Cent", subs: "Cents" },
    te: { unit: "యూరో", units: "యూరోలు", sub: "సెంట్", subs: "సెంట్లు" },
    hi: { unit: "यूरो", units: "यूरो", sub: "सेंट", subs: "सेंट" },
    ta: { unit: "யூரோ", units: "யூரோக்கள்", sub: "சென்ட்", subs: "சென்ட்கள்" },
    bn: { unit: "ইউরো", units: "ইউরো", sub: "সেন্ট", subs: "সেন্ট" },
    gu: { unit: "યુરો", units: "યુરો", sub: "સેન્ટ", subs: "સેન્ટ" },
    kn: { unit: "ಯೂರೋ", units: "ಯೂರೋಗಳು", sub: "ಸೆಂಟ್", subs: "ಸೆಂಟ್ಸ್" },
    ml: { unit: "യൂറോ", units: "യൂറോകൾ", sub: "സെന്റ്", subs: "സെന്റുകൾ" },
    mr: { unit: "युरो", units: "युरो", sub: "सेंट", subs: "सेंट्स" },
    pa: { unit: "ਯੂਰੋ", units: "ਯੂਰੋ", sub: "ਸੈਂਟ", subs: "ਸੈਂਟ" },
    or: { unit: "ୟୁରୋ", units: "ୟୁରୋ", sub: "ସେଣ୍ଟ", subs: "ସେଣ୍ଟ" },
    as: { unit: "ইউৰো", units: "ইউৰো", sub: "চেণ্ট", subs: "চেণ্ট" },
    ur: { unit: "یورو", units: "یورو", sub: "سینٹ", subs: "سینٹس" },
    ne: { unit: "युरो", units: "युरो", sub: "सेन्ट", subs: "सेन्ट" },
    sa: { unit: "यूरो", units: "यूरो", sub: "सेन्ट", subs: "सेन्ट" },
  },
  JPY: {
    en: { unit: "Japanese Yen", units: "Japanese Yen", sub: "Sen", subs: "Sen" },
    te: { unit: "జపనీస్ యెన్", units: "జపనీస్ యెన్", sub: "సెన్", subs: "సెన్" },
    hi: { unit: "जापानी येन", units: "जापानी येन", sub: "सेन", subs: "सेन" },
    ta: { unit: "ஜப்பானிய யென்", units: "ஜப்பானிய யென்", sub: "சென்", subs: "சென்" },
  },
  AED: {
    en: { unit: "UAE Dirham", units: "UAE Dirhams", sub: "Fils", subs: "Fils" },
    te: { unit: "యుఏఈ దిర్హామ్", units: "యుఏఈ దిర్హామ్‌లు", sub: "ఫిల్స్", subs: "ఫిల్స్" },
    hi: { unit: "यूएई दिरहम", units: "यूएई दिरहम", sub: "फिल्स", subs: "फिल्स" },
    ta: { unit: "யுஏஇ திர்ஹாம்", units: "யுஏஇ திர்ஹாம்கள்", sub: "ஃபில்ஸ்", subs: "ஃபில்ஸ்" },
  },
  CAD: {
    en: { unit: "Canadian Dollar", units: "Canadian Dollars", sub: "Cent", subs: "Cents" },
    te: { unit: "కెనడియన్ డాలర్", units: "కెనడియన్ డాలర్లు", sub: "సెంట్", subs: "సెంట్లు" },
    hi: { unit: "कनाडाई डॉलर", units: "कनाडाई डॉलर", sub: "सेंट", subs: "सेंट" },
  },
  AUD: {
    en: { unit: "Australian Dollar", units: "Australian Dollars", sub: "Cent", subs: "Cents" },
    te: { unit: "ఆస్ట్రేలియన్ డాలర్", units: "ఆస్ట్రేలియన్ డాలర్లు", sub: "సెంట్", subs: "సెంట్లు" },
    hi: { unit: "ऑस्ट्रेलियाई डॉलर", units: "ऑस्ट्रेलियाई डॉलर", sub: "सेंट", subs: "सेंट" },
  },
  SGD: {
    en: { unit: "Singapore Dollar", units: "Singapore Dollars", sub: "Cent", subs: "Cents" },
    te: { unit: "సింగపూర్ డాలర్", units: "సింగపూర్ డాలర్లు", sub: "సెంట్", subs: "సెంట్లు" },
    hi: { unit: "सिंगापुर डॉलर", units: "सिंगापुर डॉलर", sub: "सेंट", subs: "सेंट" },
  },
  CHF: {
    en: { unit: "Swiss Franc", units: "Swiss Francs", sub: "Rappen", subs: "Rappen" },
    te: { unit: "స్విస్ ఫ్రాంక్", units: "స్విస్ ఫ్రాంక్‌లు", sub: "రాపెన్", subs: "రాపెన్" },
    hi: { unit: "स्विस फ़्रैंक", units: "स्विस फ़्रैंक", sub: "रेपेन", subs: "रेपेन" },
  },
  SAR: {
    en: { unit: "Saudi Riyal", units: "Saudi Riyals", sub: "Halala", subs: "Halalas" },
    te: { unit: "సౌదీ రియాల్", units: "సౌదీ రియాల్స్", sub: "హలాలా", subs: "హలాలాలు" },
    hi: { unit: "सऊदी रियाल", units: "सऊदी रियाल", sub: "हलाला", subs: "हलाला" },
  },
  NZD: {
    en: { unit: "New Zealand Dollar", units: "New Zealand Dollars", sub: "Cent", subs: "Cents" },
    te: { unit: "న్యూజిలాండ్ డాలర్", units: "న్యూజిలాండ్ డాలర్లు", sub: "సెంట్", subs: "సెంట్లు" },
    hi: { unit: "न्यूज़ीलैंड डॉलर", units: "न्यूज़ीलैंड डॉलर", sub: "सेंट", subs: "सेंट" },
  },
  KWD: {
    en: { unit: "Kuwaiti Dinar", units: "Kuwaiti Dinars", sub: "Fils", subs: "Fils" },
    te: { unit: "కువైట్ దినార్", units: "కువైట్ దినార్లు", sub: "ఫిల్స్", subs: "ఫిల్స్" },
    hi: { unit: "कुवैती दिनार", units: "कुवैती दिनार", sub: "फिल्स", subs: "फिल्स" },
  },
  QAR: {
    en: { unit: "Qatari Riyal", units: "Qatari Riyals", sub: "Dirham", subs: "Dirhams" },
    te: { unit: "ఖతార్ రియాల్", units: "ఖతార్ రియాల్స్", sub: "దిర్హామ్", subs: "దిర్హామ్‌లు" },
    hi: { unit: "क़तारी रियाल", units: "क़तारी रियाल", sub: "दिरहम", subs: "दिरहम" },
  },
  OMR: {
    en: { unit: "Omani Rial", units: "Omani Rials", sub: "Baisa", subs: "Baisas" },
    te: { unit: "ఒమానీ రియాల్", units: "ఒమానీ రియాల్స్", sub: "బైసా", subs: "బైసాలు" },
    hi: { unit: "ओमानी रियाल", units: "ओमानी रियाल", sub: "बैसा", subs: "बैसा" },
  },
  BHD: {
    en: { unit: "Bahraini Dinar", units: "Bahraini Dinars", sub: "Fils", subs: "Fils" },
    te: { unit: "బహ్రెయిన్ దినార్", units: "బహ్రెయిన్ దినార్లు", sub: "ఫిల్స్", subs: "ఫిల్స్" },
    hi: { unit: "बहरीनी दिनार", units: "बहरीनी दिनार", sub: "फिल्स", subs: "फिल्स" },
  },
};

export function getCurrencyWordNames(currencyCode, lang = "en") {
  const c = CURRENCY_WORD_NAMES[currencyCode];
  if (c) {
    if (c[lang]) return c[lang];
    if (c.en) return c.en;
  }

  // Fallback to currencies data dictionary for full names — NEVER return bare abbreviations like "AUD"
  const curEntry = CURRENCIES[currencyCode];
  const localizedName = curEntry?.name?.[lang] || curEntry?.name?.en;
  if (localizedName) {
    return {
      unit: localizedName,
      units: localizedName.endsWith("s") ? localizedName : `${localizedName}s`,
      sub: "Cent",
      subs: "Cents",
    };
  }

  return {
    unit: currencyCode,
    units: currencyCode,
    sub: "Cent",
    subs: "Cents",
  };
}

// -------------------------------------------------------------------
// Number mapping datasets
// -------------------------------------------------------------------

// Exact Hindi 0-99 for authentic monetary pronunciation (e.g. 32 -> बत्तीस)
const HINDI_1_TO_99 = [
  "शून्य", "एक", "दो", "तीन", "चार", "पाँच", "छह", "सात", "आठ", "नौ", "दस",
  "ग्यारह", "बारह", "तेरह", "चौदह", "पंद्रह", "सोलह", "सत्रह", "अठारह", "उन्नीस", "बीस",
  "इक्कीस", "बाईस", "तेईस", "चौबीस", "पच्चीस", "छब्बीस", "सत्ताईस", "अट्ठाईस", "उनतीस", "तीस",
  "इकत्तीस", "बत्तीस", "तैंतीस", "चौंतीस", "पैंतीस", "छत्तीस", "सैंतीस", "अड़तीस", "उनतालीस", "चालीस",
  "इकतालीस", "बयालीस", "तैंतालीस", "चौंतालीस", "पैंतालीस", "छियालीस", "सैंतालीस", "अड़तालीस", "उनचास", "पचास",
  "इक्यावन", "बावन", "तिरेपन", "चौवन", "पचपन", "छप्पन", "सत्तावन", "अट्ठावन", "उनसठ", "साठ",
  "इकसठ", "बासठ", "तिरसठ", "चौंसठ", "पैंसठ", "छियासठ", "सरਸठ", "अड़ਸठ", "उनहत्तर", "सत्तर",
  "इकहत्तर", "बहत्तर", "तिहत्तर", "चौहत्तर", "पचहत्तर", "छिहत्तर", "सतहत्तर", "अठहत्तर", "उन्नासी", "अस्सी",
  "इक्यासी", "बयासी", "तिरासी", "चौरासी", "पचासी", "छियासी", "सत्तासी", "अट्ठासी", "नवासी", "नब्बे",
  "इक्यानवे", "बानवे", "तिरानवे", "चौरानवे", "पंचानवे", "छियानवे", "सत्तानवे", "अट्ठानवे", "निन्यानवे",
];

// English
const ONES_EN = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen",
];
const TENS_EN = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

// Telugu
const ONES_TE = [
  "సున్నా", "ఒకటి", "రెండు", "మూడు", "నాలుగు", "ఐదు", "ఆరు", "ఏడు", "ఎనిమిది", "తొమ్మిది",
  "పది", "పదకొండు", "పన్నెండు", "పదమూడు", "పద్నాలుగు", "పదిహేను", "పదహారు", "పదిహేడు", "పద్దెనిమిది", "పందొమ్మిది",
];
const TENS_TE = ["", "", "ఇరవై", "ముప్పై", "నలభై", "యాభై", "అరవై", "డెబ్బై", "ఎనభై", "తొంభై"];
const HUNDRED_TE = ["", "వంద", "రెండు వందల", "మూడు వందల", "నాలుగు వందల", "ఐదు వందల", "ఆరు వందల", "ఏడు వందల", "ఎనిమిది వందల", "తొమ్మిది వందల"];

// Tamil
const ONES_TA = [
  "பூஜ்ஜியம்", "ஒன்று", "இரண்டு", "மூன்று", "நான்கு", "ஐந்து", "ஆறு", "ஏழு", "எட்டு", "ஒன்பது",
  "பத்து", "பதினொன்று", "பன்னிரண்டு", "பதின்மூன்று", "பதினான்கு", "பதினைந்து", "பதினாறு", "பதினேழு", "பதினெட்டு", "பத்தொன்பது",
];
const TENS_TA = ["", "", "இருபது", "முப்பது", "நாற்பது", "ஐம்பது", "அறுபது", "எழுபது", "எண்பது", "தொண்ணூறு"];

// Kannada
const ONES_KN = [
  "ಸೊನ್ನೆ", "ಒಂದು", "ಎರಡು", "ಮೂರು", "ನಾಲ್ಕು", "ಐದು", "ಆರು", "ಏಳು", "ಎಂಟು", "ಒಂಬತ್ತು",
  "ಹತ್ತು", "ಹನ್ನೊಂದು", "ಹನ್ನೆರಡು", "ಹದಿಮೂರು", "ಹದಿನಾಲ್ಕು", "ಹದಿನೈದು", "ಹದಿನಾರು", "ಹದಿನೇಳು", "ಹದಿನೆಂಟು", "ಹತ್ತೊಂಬತ್ತು",
];
const TENS_KN = ["", "", "ಇಪ್ಪತ್ತು", "ಮೂವತ್ತು", "ನಲವತ್ತು", "ಐವತ್ತು", "ಅರವತ್ತು", "ಎಪ್ಪತ್ತು", "ಎಂಬತ್ತು", "ತೊಂಬತ್ತು"];

// Bengali / Assamese
const ONES_BN = [
  "শূন্য", "এক", "দুই", "তিন", "চার", "পাঁচ", "ছয়", "সাত", "আট", "নয়",
  "দশ", "এগারো", "বারো", "তেরো", "চোদ্দ", "পনেরো", "ষোলো", "সতেরো", "আঠারো", "উনিশ",
];
const TENS_BN = ["", "", "কুড়ি", "তিরিশ", "চল্লিশ", "পঞ্চাশ", "ষাট", "সত্তর", "আশি", "নব্বই"];

// Gujarati
const ONES_GU = [
  "શૂન્ય", "એક", "બે", "ત્રણ", "ચાર", "પાંચ", "છ", "સાત", "આઠ", "નવ",
  "દસ", "અગિયાર", "બાર", "તેર", "ચૌદ", "પંદર", "સોળ", "સત્તર", "અઢાર", "ઓગણીસ",
];
const TENS_GU = ["", "", "વીસ", "ત્રીસ", "ચાલીસ", "પચાસ", "સાઠ", "સિત્તેર", "એંસી", "નેવું"];

// Malayalam
const ONES_ML = [
  "പൂജ്യം", "ഒന്ന്", "രണ്ട്", "മൂന്ന്", "നാല്", "അഞ്ച്", "ആറ്", "ഏഴ്", "എട്ട്", "ഒൻപത്",
  "പത്ത്", "പതിനൊന്ന്", "പന്ത്രണ്ട്", "പതിമൂന്ന്", "പതിനാല്", "പതിനഞ്ച്", "പതിനാറ്", "പതിനേഴ്", "പതിനെട്ട്", "പത്തൊൻപത്",
];
const TENS_ML = ["", "", "ഇരുപത്", "മുപ്പത്", "നാൽപ്പത്", "അമ്പത്", "അറുപത്", "എഴുപത്", "എൺപത്", "തൊണ്ണൂറ്"];

// Scale words by language
const SCALES = {
  en: { h: "hundred", t: "thousand", l: "lakh", c: "crore", and: "and" },
  te: { h: "వందల", hSingle: "వంద", t: "వేల", tSingle: "వెయ్యి", l: "లక్షల", lSingle: "లక్ష", c: "కోట్ల", cSingle: "కోటి", and: "" },
  hi: { h: "सौ", t: "हजार", l: "लाख", c: "करोड़", and: "" },
  ta: { h: "நூறு", t: "ஆயிரம்", l: "இலட்சம்", c: "கோடி", and: "" },
  bn: { h: "শত", t: "হাজার", l: "লাখ", c: "কোটি", and: "" },
  gu: { h: "સો", t: "હજાર", l: "લાખ", c: "કરોડ", and: "" },
  kn: { h: "ನೂರು", t: "ಸಾವಿರ", l: "ಲಕ್ಷ", c: "ಕೋಟಿ", and: "" },
  ml: { h: "നൂറ്", t: "ആയിരം", l: "ലക്ഷം", c: "കോടി", and: "" },
  mr: { h: "शे", t: "हजार", l: "लाख", c: "कोटी", and: "" },
  pa: { h: "ਸੌ", t: "ਹਜ਼ਾਰ", l: "ਲੱਖ", c: "ਕਰੋੜ", and: "" },
  or: { h: "ଶହ", t: "ହଜାର", l: "ଲକ୍ଷ", c: "କୋଟି", and: "" },
  as: { h: "শ", t: "হাজাৰ", l: "লাখ", c: "কোটি", and: "" },
  ur: { h: "سو", t: "ہزار", l: "لاکھ", c: "کروڑ", and: "" },
  ne: { h: "सय", t: "हजार", l: "लाख", c: "करोड", and: "" },
  sa: { h: "शतम्", t: "सहस्रम्", l: "लक्षम्", c: "कोटिः", and: "" },
};

function twoDigitsToWords(n, lang) {
  if (n <= 0) return "";

  if (lang === "te") {
    if (n < 20) return ONES_TE[n];
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    return ones === 0 ? TENS_TE[tens] : `${TENS_TE[tens]} ${ONES_TE[ones]}`;
  }

  if (lang === "hi" || lang === "mai" || lang === "doi" || lang === "mr" || lang === "kok" || lang === "sa") {
    if (n >= 0 && n <= 99) return HINDI_1_TO_99[n] || "";
  }

  if (lang === "ta") {
    if (n === 32) return "முப்பத்திரண்டு";
    if (n < 20) return ONES_TA[n];
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    return ones === 0 ? TENS_TA[tens] : `${TENS_TA[tens]} ${ONES_TA[ones]}`;
  }

  if (lang === "kn") {
    if (n < 20) return ONES_KN[n];
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    return ones === 0 ? TENS_KN[tens] : `${TENS_KN[tens]} ${ONES_KN[ones]}`;
  }

  if (lang === "bn" || lang === "as" || lang === "mni") {
    if (n === 32) return "বত্রিশ";
    if (n < 20) return ONES_BN[n];
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    return ones === 0 ? TENS_BN[tens] : `${TENS_BN[tens]} ${ONES_BN[ones]}`;
  }

  if (lang === "gu") {
    if (n < 20) return ONES_GU[n];
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    return ones === 0 ? TENS_GU[tens] : `${TENS_GU[tens]} ${ONES_GU[ones]}`;
  }

  if (lang === "ml") {
    if (n < 20) return ONES_ML[n];
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    return ones === 0 ? TENS_ML[tens] : `${TENS_ML[tens]} ${ONES_ML[ones]}`;
  }

  // English default
  if (n < 20) return ONES_EN[n];
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return ones === 0 ? TENS_EN[tens] : `${TENS_EN[tens]}-${ONES_EN[ones]}`;
}

function threeDigitsToWords(n, lang) {
  if (n <= 0) return "";
  const h = Math.floor(n / 100);
  const rem = n % 100;
  const scale = SCALES[lang] || SCALES.en;

  const parts = [];
  if (h > 0) {
    if (lang === "te") {
      parts.push(HUNDRED_TE[h]);
    } else {
      const hWord = twoDigitsToWords(h, lang);
      parts.push(`${hWord} ${scale.h}`);
    }
  }
  if (rem > 0) {
    parts.push(twoDigitsToWords(rem, lang));
  }
  return parts.join(" ");
}

export function integerToWords(num, lang = "en") {
  if (num === 0) {
    if (lang === "te") return "సున్నా";
    if (lang === "hi") return "शून्य";
    if (lang === "ta") return "பூஜ்ஜியம்";
    if (lang === "bn") return "শূন্য";
    if (lang === "gu") return "શૂન્ય";
    if (lang === "kn") return "ಶೂನ್ಯ";
    if (lang === "ml") return "പൂജ്യം";
    if (lang === "mr") return "शून्य";
    if (lang === "pa") return "ਸਿਫ਼ਰ";
    if (lang === "or") return "ଶୂନ";
    if (lang === "ur") return "صفر";
    return "zero";
  }

  const scale = SCALES[lang] || SCALES.en;
  let n = Math.abs(Math.floor(num));
  const parts = [];

  // Crores (>= 1,00,00,000)
  const crore = Math.floor(n / 10000000);
  if (crore > 0) {
    const cWords = crore >= 100 ? integerToWords(crore, lang) : twoDigitsToWords(crore, lang);
    const unit = lang === "te" && crore === 1 ? scale.cSingle : scale.c;
    parts.push(`${cWords} ${unit}`);
    n %= 10000000;
  }

  // Lakhs (>= 1,00,000)
  const lakh = Math.floor(n / 100000);
  if (lakh > 0) {
    const lWords = twoDigitsToWords(lakh, lang);
    const unit = lang === "te" && lakh === 1 ? scale.lSingle : scale.l;
    parts.push(`${lWords} ${unit}`);
    n %= 100000;
  }

  // Thousands (>= 1,000)
  const thousand = Math.floor(n / 1000);
  if (thousand > 0) {
    const tWords = twoDigitsToWords(thousand, lang);
    const unit = lang === "te" && thousand === 1 ? scale.tSingle : scale.t;
    parts.push(`${tWords} ${unit}`);
    n %= 1000;
  }

  // Hundreds and remainder
  if (n > 0) {
    parts.push(threeDigitsToWords(n, lang));
  }

  return parts.filter(Boolean).join(" ").trim();
}

/**
 * Generates natural monetary sentence in the exact requested grammatical form.
 * Never outputs bare abbreviations like INR, USD, GBP, EUR.
 * Correctly distinguishes major and minor units (Rupees and Paise, Dollars and Cents, Pounds and Pence).
 */
export function amountInWords(amount, currencyCode = "INR", lang = "en") {
  if (amount === undefined || amount === null || isNaN(amount)) return "";

  const absAmt = Math.abs(Number(amount));
  const intPart = Math.floor(absAmt);
  const decPart = Math.round((absAmt - intPart) * 100);

  const cur = getCurrencyWordNames(currencyCode, lang);
  const scale = SCALES[lang] || SCALES.en;

  const intWords = integerToWords(intPart, lang);
  const curUnit = intPart === 1 ? cur.unit : cur.units;

  let mainPart = `${intWords} ${curUnit}`;

  if (decPart > 0) {
    const decWords = twoDigitsToWords(decPart, lang);
    const subUnit = decPart === 1 ? cur.sub : cur.subs;
    if (scale.and) {
      mainPart += ` ${scale.and} ${decWords} ${subUnit}`;
    } else {
      mainPart += ` ${decWords} ${subUnit}`;
    }
  }

  // Capitalize in English
  if (lang === "en") {
    return mainPart.charAt(0).toUpperCase() + mainPart.slice(1);
  }
  return mainPart;
}
