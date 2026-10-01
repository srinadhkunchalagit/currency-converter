// Currency Voice Matching Engine
// Supports 2-3 letter abbreviations, country names, currency names, aliases,
// common speech recognition variations, fuzzy matching, and all 22 Indian languages.

import { CURRENCIES, CODES } from "../data/currencies.js";

// Comprehensive alias dictionary mapping known terms to currency ISO codes
export const CURRENCY_ALIASES = {
  // --- Indian Rupee ---
  INR: [
    "inr", "ind", "india", "indian", "indian rupee", "indian rupees", "rupee", "rupees", "rupiahs",
    "bharat", "hindustan", "desi",
    // Telugu
    "భారతీయ", "భారత్", "ఇండియా", "రూపాయి", "రూపాయలు",
    // Hindi / Devanagari
    "भारतीय", "भारत", "इंडिया", "रुपया", "रुपये", "रुपैया", "रूपया", "रूपये",
    // Tamil
    "இந்திய", "இந்தியா", "ரூபாய்",
    // Kannada
    "ಭಾರತೀಯ", "ಭಾರತ", "ರೂಪಾಯಿ",
    // Bengali / Assamese
    "ভারতীয়", "ভারত", "রুপি", "টাকা", "ভাৰতীয়",
    // Gujarati
    "ભારતીય", "ભારત", "રૂપિયો", "રૂપિયા",
    // Malayalam
    "ഇന്ത്യൻ", "ഇന്ത്യ", "രൂപ",
    // Marathi
    "भारतीय", "रुपया", "रुपये",
    // Punjabi
    "ਭਾਰਤੀ", "ਭਾਰਤ", "ਰੁਪਿਆ", "ਰੁਪਏ",
    // Odia
    "ଭାରତୀୟ", "ଭାରତ", "ଟଙ୍କା",
    // Urdu
    "ہندوستانی", "بھارت", "روپیہ", "روپے",
  ],

  // --- US Dollar ---
  USD: [
    "usd", "dol", "doll", "dolar", "dollar", "dollars", "doller", "dollor",
    "us dollar", "us dollars", "united states", "usa", "us", "america", "american", "american dollar",
    "states", "buck", "bucks",
    // Telugu
    "యుఎస్", "డాలర్", "డాలర్లు", "అమెరికా", "అమెరికన్",
    // Hindi
    "यूएस", "डॉलर", "अमरीकी", "अमेरिकी", "अमेरिका",
    // Tamil
    "அமெரிக்க", "டாலர்", "டாலர்கள்",
    // Kannada
    "ಯುಎಸ್", "ಡಾಲರ್", "ಅಮೇರಿಕ",
    // Bengali
    "মার্কিন", "ডলার", "আমেরিকান",
    // Gujarati
    "યુએસ", "ડૉલર", "અમેરિકન",
    // Malayalam
    "യുഎസ്", "ഡോളർ", "അമേരിക്കൻ",
    // Urdu
    "امریکی", "ڈالر", "امریکہ",
  ],

  // --- British Pound ---
  GBP: [
    "gbp", "pound", "pounds", "pownd", "poundz", "british pound", "british pounds",
    "quid", "sterling", "pound sterling", "uk", "united kingdom", "britain", "british",
    "england", "english", "london", "great britain",
    // Telugu
    "బ్రిటిష్", "పౌండ్", "పౌండ్లు", "యుకె", "ఇంగ్లాండ్",
    // Hindi
    "ब्रिटिश", "पाउंड", "यूके", "इंग्लैंड", "ग्रेट ब्रिटेन",
    // Tamil
    "பிரிட்டிஷ்", "பவுண்ட்", "பவுண்டுகள்", "இங்கிலாந்து",
    // Kannada
    "ಬ್ರಿಟಿಷ್", "ಪೌಂಡ್",
    // Bengali
    "ব্রিটিশ", "পাউন্ড",
    // Urdu
    "برطانوی", "پاؤنڈ", "برطانیہ",
  ],

  // --- Euro ---
  EUR: [
    "eur", "euro", "euros", "eruo", "uro", "europe", "european", "european union", "eu",
    "germany", "german", "france", "french", "italy", "italian", "spain", "spanish",
    "netherlands", "dutch", "belgium", "ireland", "irish", "austria", "portugal", "greece",
    // Telugu
    "యూరో", "యూరోలు", "యూరప్",
    // Hindi
    "यूरो", "यूरोप",
    // Tamil
    "யூரோ", "ஐரோப்பா",
    // Kannada
    "ಯೂರೋ", "ಯುರೋಪ್",
    // Bengali
    "ইউরো", "ইউরোপীয়",
    // Urdu
    "یورو", "یورپ",
  ],

  // --- Japanese Yen ---
  JPY: [
    "jpy", "yen", "yenn", "yan", "japanese yen", "japan", "japanese", "tokyo",
    // Telugu
    "జపనీస్", "యెన్", "జపాన్",
    // Hindi
    "जापानी", "येन", "जापान",
    // Tamil
    "ஜப்பானிய", "யென்", "ஜப்பான்",
    // Kannada
    "ಜಪಾನೀಸ್", "ಯೆನ್", "ಜಪಾನ್",
    // Bengali
    "জাপানি", "ইয়েন", "জাপান",
    // Urdu
    "جاپانی", "ین", "جاپان",
  ],

  // --- UAE Dirham ---
  AED: [
    "aed", "dirham", "dirhams", "diram", "derham", "uae dirham",
    "uae", "dubai", "abu dhabi", "emirates", "united arab emirates",
    // Telugu
    "దిర్హామ్", "దుబాయ్", "యుఏఈ",
    // Hindi
    "दिरहम", "दुबई", "यूएई",
    // Tamil
    "திர்ஹாம்", "துபாய்",
    // Urdu
    "درہم", "دبئی",
  ],

  // --- Canadian Dollar ---
  CAD: [
    "cad", "can", "canada", "canadian", "canadian dollar", "toronto", "loonie",
    // Telugu
    "కెనడా", "కెనడియన్ డాలర్",
    // Hindi
    "कनाडा", "कनाडाई डॉलर", "कैनेडियन",
  ],

  // --- Australian Dollar ---
  AUD: [
    "aud", "aus", "australia", "australian", "australian dollar", "aussie", "sydney", "melbourne",
    // Telugu
    "ఆస్ట్రేలియా", "ఆస్ట్రేలియన్ డాలర్",
    // Hindi
    "ऑस्ट्रेलिया", "ऑस्ट्रेलियाई डॉलर",
  ],

  // --- Singapore Dollar ---
  SGD: [
    "sgd", "singapore", "singapore dollar", "sing",
    // Telugu
    "సింగపూర్", "సింగపూర్ డాలర్",
    // Hindi
    "सिंगापुर", "सिंगापुर डॉलर",
  ],

  // --- Swiss Franc ---
  CHF: [
    "chf", "swiss", "switzerland", "franc", "francs", "swiss franc", "zurich", "geneva",
    // Telugu
    "స్విట్జర్లాండ్", "స్విస్ ఫ్రాంక్",
    // Hindi
    "स्विट्जरलैंड", "स्विस फ़्रैंक",
  ],

  // --- Saudi Riyal ---
  SAR: [
    "sar", "saudi", "saudi arabia", "riyal", "riyals", "saudi riyal", "riyadh", "mecca", "jeddah",
    // Telugu
    "సౌదీ", "సౌదీ అరేబియా", "రియాల్",
    // Hindi
    "सऊदी", "सऊदी अरब", "रियाल",
    // Urdu
    "سعودی", "سعودی عرب", "ریال",
  ],

  // --- Kuwaiti Dinar ---
  KWD: [
    "kwd", "kuwait", "kuwaiti", "kuwaiti dinar", "dinar",
    // Telugu
    "కువైట్", "దినార్",
    // Hindi
    "कुवैत", "दिनार",
  ],

  // --- Qatari Riyal ---
  QAR: [
    "qar", "qatar", "qatari", "qatari riyal", "doha",
    // Telugu
    "ఖతార్", "రియాల్",
    // Hindi
    "क़तार", "रियाल",
  ],

  // --- Omani Rial ---
  OMR: [
    "omr", "oman", "omani", "omani rial", "muscat",
    // Telugu
    "ఒమన్", "ఒమానీ రియాల్",
    // Hindi
    "ओमान", "ओमानी रियाल",
  ],

  // --- Bahraini Dinar ---
  BHD: [
    "bhd", "bahrain", "bahraini", "bahraini dinar", "manama",
    // Telugu
    "బహ్రెయిన్", "దినార్",
    // Hindi
    "बहरीन", "दिनार",
  ],

  // --- Chinese Yuan ---
  CNY: [
    "cny", "rmb", "yuan", "renminbi", "china", "chinese", "chinese yuan", "beijing", "shanghai",
    // Telugu
    "చైనా", "యువాన్",
    // Hindi
    "चीन", "युआन",
  ],

  // --- New Zealand Dollar ---
  NZD: [
    "nzd", "new zealand", "nz", "kiwi", "auckland",
    // Telugu
    "న్యూజిలాండ్",
    // Hindi
    "न्यूज़ीलैंड",
  ],

  // --- Russian Ruble ---
  RUB: [
    "rub", "ruble", "rubles", "rouble", "russia", "russian", "moscow",
    // Telugu
    "రష్యా", "రూబుల్",
    // Hindi
    "रूस", "रूसी", "रूबल",
  ],

  // --- South Korean Won ---
  KRW: [
    "krw", "won", "korea", "south korea", "korean", "seoul",
    // Telugu
    "కొరియా", "వాన్",
    // Hindi
    "कोरिया", "वॉन",
  ],

  // --- Thai Baht ---
  THB: [
    "thb", "baht", "thailand", "thai", "bangkok",
    // Telugu
    "థాయిలాండ్", "బాట్",
    // Hindi
    "थाईलैंड", "बाह्त",
  ],

  // --- Malaysian Ringgit ---
  MYR: [
    "myr", "ringgit", "malaysia", "malaysian", "kuala lumpur",
    // Telugu
    "మలేషియా", "రింగిట్",
    // Hindi
    "मलेशिया", "रिंगित",
  ],

  // --- Indonesian Rupiah ---
  IDR: [
    "idr", "rupiah", "indonesia", "indonesian", "jakarta",
    // Telugu
    "ఇండోనేషియా", "రూపియా",
    // Hindi
    "इंडोनेशिया", "रुपिया",
  ],

  // --- Philippine Peso ---
  PHP: [
    "php", "philippines", "philippine", "philippine peso", "manila",
    // Telugu
    "ఫిలిప్పీన్స్",
    // Hindi
    "फिलीपींस",
  ],

  // --- Mexican Peso ---
  MXN: [
    "mxn", "mexico", "mexican", "mexican peso",
    // Telugu
    "మెక్సికో",
    // Hindi
    "मैक्सिको",
  ],

  // --- Brazilian Real ---
  BRL: [
    "brl", "real", "brazil", "brazilian", "brazilian real",
    // Telugu
    "బ్రెజిల్",
    // Hindi
    "ब्राज़ील",
  ],

  // --- South African Rand ---
  ZAR: [
    "zar", "rand", "south africa", "south african",
    // Telugu
    "దక్షిణ ఆఫ్రికా",
    // Hindi
    "दक्षिण अफ्रीका",
  ],

  // --- Turkish Lira ---
  TRY: [
    "try", "lira", "turkey", "turkish", "istanbul",
    // Telugu
    "టర్కీ", "లిరా",
    // Hindi
    "तुर्की", "लीरा",
  ],

  // --- Pakistani Rupee ---
  PKR: [
    "pkr", "pakistan", "pakistani", "pakistani rupee",
    // Telugu
    "పాకిస్తాన్",
    // Hindi
    "पाकिस्तान",
  ],

  // --- Bangladeshi Taka ---
  BDT: [
    "bdt", "bangladesh", "bangladeshi", "bangladeshi taka", "dhaka",
    // Telugu
    "బంగ్లాదేశ్",
    // Hindi
    "बांग्लादेश",
  ],

  // --- Sri Lankan Rupee ---
  LKR: [
    "lkr", "sri lanka", "sri lankan", "colombo",
    // Telugu
    "శ్రీలంక",
    // Hindi
    "श्रीलंका",
  ],

  // --- Nepalese Rupee ---
  NPR: [
    "npr", "nepal", "nepalese", "kathmandu",
    // Telugu
    "నేపాల్",
    // Hindi
    "नेपाल",
  ],
};

// Levenshtein distance for fuzzy matching
function levenshtein(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Normalizes speech transcript:
 * - strips punctuation
 * - converts to lowercase
 * - cleans extra whitespace
 */
export function normalizeTranscript(text) {
  if (!text) return "";
  return String(text)
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'–—]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Matches spoken text to a currency code using priority rules:
 * 1. Exact ISO code
 * 2. Exact currency name (English or localized)
 * 3. Exact alias from dictionary
 * 4. Country / regional alias
 * 5. Strong partial / prefix match (>= 3 chars)
 * 6. Fuzzy match with low edit distance
 *
 * Returns: { code, name, flag, confidence: 'exact'|'strong'|'fuzzy'|'ambiguous', candidates?: [...] }
 */
export function matchCurrencyFromVoice(transcript, lang = "en") {
  const norm = normalizeTranscript(transcript);
  if (!norm) return null;

  // Single token cleaning
  const words = norm.split(" ").filter(Boolean);

  // -------------------------------------------------------------
  // Priority 1: Exact ISO Currency Code (e.g. "INR", "USD", "GBP")
  // -------------------------------------------------------------
  const upperNorm = norm.toUpperCase();
  if (CODES.includes(upperNorm)) {
    return {
      code: upperNorm,
      currency: CURRENCIES[upperNorm],
      confidence: "exact",
      matchedTerm: upperNorm,
    };
  }

  // Also check if any individual word is an exact ISO code
  for (const w of words) {
    const upW = w.toUpperCase();
    if (CODES.includes(upW) && upW.length >= 3) {
      return {
        code: upW,
        currency: CURRENCIES[upW],
        confidence: "exact",
        matchedTerm: upW,
      };
    }
  }

  // -------------------------------------------------------------
  // Priority 2: Exact Currency Name in English or Localized Language
  // -------------------------------------------------------------
  for (const code of CODES) {
    const c = CURRENCIES[code];
    if (!c || !c.name) continue;

    const enName = (c.name.en || "").toLowerCase();
    const locName = (c.name[lang] || "").toLowerCase();

    if (norm === enName || (locName && norm === locName)) {
      return {
        code,
        currency: c,
        confidence: "exact",
        matchedTerm: norm === enName ? enName : locName,
      };
    }
  }

  // -------------------------------------------------------------
  // Priority 3 & 4: Exact Alias in Dictionary (Country / Currency / Indic)
  // -------------------------------------------------------------
  // Check full transcript first
  for (const [code, aliases] of Object.entries(CURRENCY_ALIASES)) {
    if (aliases.includes(norm)) {
      return {
        code,
        currency: CURRENCIES[code] || { name: { en: code } },
        confidence: "exact",
        matchedTerm: norm,
      };
    }
  }

  // Check if any word in the transcript matches an alias exactly
  for (const word of words) {
    for (const [code, aliases] of Object.entries(CURRENCY_ALIASES)) {
      if (aliases.includes(word)) {
        return {
          code,
          currency: CURRENCIES[code] || { name: { en: code } },
          confidence: "strong",
          matchedTerm: word,
        };
      }
    }
  }

  // -------------------------------------------------------------
  // Priority 5: Strong Prefix / Partial Match (>= 2 or 3 letters)
  // Handles inputs like "ind", "dol", "gbp", "eur", "jpy", "aed", "aus", "can", "sau"
  // -------------------------------------------------------------
  // Special popular shorthand rules for fast, zero-friction recognition:
  const SHORT_PREFIX_MAP = {
    ind: "INR",
    inr: "INR",
    rup: "INR",
    dol: "USD",
    doll: "USD",
    usd: "USD",
    ame: "USD",
    gbp: "GBP",
    pou: "GBP",
    bri: "GBP",
    eng: "GBP",
    eur: "EUR",
    jpy: "JPY",
    yen: "JPY",
    jap: "JPY",
    aed: "AED",
    dir: "AED",
    dub: "AED",
    cad: "CAD",
    can: "CAD",
    aud: "AUD",
    aus: "AUD",
    sar: "SAR",
    sau: "SAR",
    sin: "SGD",
    sgd: "SGD",
    chf: "CHF",
    swi: "CHF",
    fra: "CHF",
    rub: "RUB",
    rus: "RUB",
    cny: "CNY",
    yua: "CNY",
    chi: "CNY",
    kwr: "KRW",
    krw: "KRW",
    won: "KRW",
    tha: "THB",
    bah: "THB",
    rin: "MYR",
    myr: "MYR",
    kwd: "KWD",
    kuw: "KWD",
    qar: "QAR",
    qat: "QAR",
    omr: "OMR",
    bhd: "BHD",
    nz: "NZD",
    nzd: "NZD",
    bra: "BRL",
    brl: "BRL",
    mex: "MXN",
    mxn: "MXN",
    sou: "ZAR",
    zar: "ZAR",
    tur: "TRY",
    try: "TRY",
    pak: "PKR",
    pkr: "PKR",
    ban: "BDT",
    bdt: "BDT",
    sri: "LKR",
    lkr: "LKR",
    nep: "NPR",
    npr: "NPR",
  };

  const primaryWord = words[0] || norm;
  if (SHORT_PREFIX_MAP[primaryWord]) {
    const code = SHORT_PREFIX_MAP[primaryWord];
    return {
      code,
      currency: CURRENCIES[code],
      confidence: "strong",
      matchedTerm: primaryWord,
    };
  }

  // Check prefix against all aliases (length >= 3)
  if (primaryWord.length >= 3) {
    for (const [code, aliases] of Object.entries(CURRENCY_ALIASES)) {
      for (const alias of aliases) {
        if (alias.startsWith(primaryWord) || primaryWord.startsWith(alias)) {
          return {
            code,
            currency: CURRENCIES[code],
            confidence: "strong",
            matchedTerm: alias,
          };
        }
      }
    }
  }

  // -------------------------------------------------------------
  // Priority 6: Fuzzy Match (Levenshtein Distance <= 2)
  // Handles variations like "doller" -> USD, "rupi" -> INR, "pownd" -> GBP
  // -------------------------------------------------------------
  let bestMatch = null;
  let minDistance = Infinity;

  for (const [code, aliases] of Object.entries(CURRENCY_ALIASES)) {
    for (const alias of aliases) {
      // Only compare with aliases of comparable length
      if (Math.abs(alias.length - primaryWord.length) <= 2) {
        const dist = levenshtein(primaryWord, alias);
        if (dist <= 2 && dist < minDistance) {
          minDistance = dist;
          bestMatch = {
            code,
            currency: CURRENCIES[code],
            confidence: "fuzzy",
            matchedTerm: alias,
            distance: dist,
          };
        }
      }
    }
  }

  if (bestMatch && minDistance <= 2) {
    return bestMatch;
  }

  // -------------------------------------------------------------
  // Priority 7: Partial Substring Match Across Currency Names
  // -------------------------------------------------------------
  for (const code of CODES) {
    const c = CURRENCIES[code];
    const enName = (c?.name?.en || "").toLowerCase();
    if (enName.includes(norm) || (norm.length >= 3 && enName.startsWith(norm))) {
      return {
        code,
        currency: c,
        confidence: "strong",
        matchedTerm: enName,
      };
    }
  }

  return null;
}
