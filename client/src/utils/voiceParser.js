// Speech input parser for numbers and currency amounts
// Supports digits, Indic numerals, decimals, words in English, Telugu, Hindi, Tamil, Kannada, Bengali

const INDIC_DIGITS = {
  // Telugu
  "౦": "0", "౧": "1", "౨": "2", "౩": "3", "౪": "4", "౫": "5", "౬": "6", "౭": "7", "౮": "8", "౯": "9",
  // Devanagari (Hindi, Marathi, Nepali, Sanskrit, Maithili, Dogri, Bodo, Konkani)
  "०": "0", "१": "1", "२": "2", "३": "3", "४": "4", "५": "5", "६": "6", "७": "7", "८": "8", "९": "9",
  // Tamil
  "௦": "0", "௧": "1", "௨": "2", "௩": "3", "௪": "4", "௫": "5", "௬": "6", "௭": "7", "௮": "8", "௯": "9",
  // Bengali / Assamese
  "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4", "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9",
  // Gujarati
  "૦": "0", "૧": "1", "૨": "2", "૩": "3", "૪": "4", "૫": "5", "૬": "6", "૭": "7", "૮": "8", "૯": "9",
  // Kannada
  "೦": "0", "೧": "1", "೨": "2", "೩": "3", "೪": "4", "೫": "5", "೬": "6", "೭": "7", "೮": "8", "೯": "9",
  // Malayalam
  "൦": "0", "൧": "1", "൨": "2", "൩": "3", "൪": "4", "൫": "5", "൬": "6", "൭": "7", "൮": "8", "൯": "9",
  // Odia
  "୦": "0", "୧": "1", "୨": "2", "୩": "3", "୪": "4", "୫": "5", "୬": "6", "୭": "7", "୮": "8", "୯": "9",
  // Gurmukhi / Punjabi
  "੦": "0", "੧": "1", "੨": "2", "੩": "3", "੪": "4", "੫": "5", "੬": "6", "੭": "7", "੮": "8", "੯": "9",
  // Urdu / Arabic
  "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4", "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
};

export function normalizeIndicDigits(str) {
  if (!str) return "";
  return str.replace(/[౦-౯०-९௦-௯০-৯૦-૯೦-೯൦-൯୦-୯੦-੯۰-۹]/g, (ch) => INDIC_DIGITS[ch] || ch);
}

// Number words map for English
const NUMBER_WORDS_EN = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
  seventeen: 17, eighteen: 18, nineteen: 19,
  twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
  hundred: 100, hundreds: 100,
  thousand: 1000, thousands: 1000, k: 1000,
  lakh: 100000, lakhs: 100000, lac: 100000, lacs: 100000,
  crore: 10000000, crores: 10000000,
  million: 1000000, millions: 1000000,
  billion: 1000000000,
};

// Hindi words
const HINDI_NUMBER_WORDS = {
  शून्य: 0, एक: 1, दो: 2, तीन: 3, चार: 4, पाँच: 5, पाच: 5, छह: 6, सात: 7, आठ: 8, नौ: 9,
  दस: 10, ग्यारह: 11, बारह: 12, तेरह: 13, चौदह: 14, पंद्रह: 15, सोलह: 16, सत्रह: 17, अठारह: 18, उन्नीस: 19,
  बीस: 20, इक्कीस: 21, बाईस: 22, तेईस: 23, चौबीस: 24, पच्चीस: 25, छब्बीस: 26, सत्ताईस: 27, अट्ठाईस: 28, उनतीस: 29,
  तीस: 30, इकत्तीस: 31, बत्तीस: 32, तैंतीस: 33, चौंतीस: 34, पैंतीस: 35, छत्तीस: 36, सैंतीस: 37, अड़तीस: 38, उनतालीस: 39,
  चालीस: 40, पचास: 50, साठ: 60, सत्तर: 70, अस्सी: 80, नब्बे: 90,
  सौ: 100, हजार: 1000, हज़ार: 1000, लाख: 100000, करोड़: 10000000,
};

// Telugu words
const TELUGU_NUMBER_WORDS = {
  సున్నా: 0, ఒకటి: 1, రెండు: 2, మూడు: 3, నాలుగు: 4, ఐదు: 5, ఆరు: 6, ఏడు: 7, ఎనిమిది: 8, తొమ్మిది: 9,
  పది: 10, పదకొండు: 11, పన్నెండు: 12, పదమూడు: 13, పద్నాలుగు: 14, పదిహేను: 15, పదహారు: 16, పదిహేడు: 17, పద్దెనిమిది: 18, పందొమ్మిది: 19,
  ఇరవై: 20, ముప్పై: 30, నలభై: 40, యాభై: 50, అరవై: 60, డెబ్బై: 70, ఎనభై: 80, తొంభై: 90,
  వంద: 100, వందల: 100, వందలు: 100,
  వెయ్యి: 1000, వేల: 1000, వేలు: 1000,
  లక్ష: 100000, లక్షల: 100000, లక్షలు: 100000,
  కోటి: 10000000, కోట్ల: 10000000, కోట్లు: 10000000,
};

// Tamil words
const TAMIL_NUMBER_WORDS = {
  பூஜ்ஜியம்: 0, ஒன்று: 1, இரண்டு: 2, மூன்று: 3, நான்கு: 4, ஐந்து: 5, ஆறு: 6, ஏழு: 7, எட்டு: 8, ஒன்பது: 9,
  பத்து: 10, பதினொன்று: 11, பன்னிரண்டு: 12, பதின்மூன்று: 13, பதினான்கு: 14, பதினைந்து: 15, பதினாறு: 16, பதினேழு: 17, பதினெட்டு: 18, பத்தொன்பது: 19,
  இருபது: 20, முப்பது: 30, முப்பத்திரண்டு: 32, நாற்பது: 40, ஐம்பது: 50, அறுபது: 60, எழுபது: 70, எண்பது: 80, தொண்ணூறு: 90,
  நூறு: 100, தொள்ளாயிரம்: 900, ஆயிரம்: 1000, நான்காயிரத்து: 4000, நான்காயிரம்: 4000,
  லட்சம்: 100000, கோடி: 10000000,
};

// Kannada words
const KANNADA_NUMBER_WORDS = {
  ಸೊನ್ನೆ: 0, ಒಂದು: 1, ಎರಡು: 2, ಮೂರು: 3, ನಾಲ್ಕು: 4, ಐದು: 5, ಆರು: 6, ಏಳು: 7, ಎಂಟು: 8, ಒಂಬತ್ತು: 9,
  ಹತ್ತು: 10, ಹನ್ನೊಂದು: 11, ಹನ್ನೆರಡು: 12, ಹದಿಮೂರು: 13, ಹದಿನಾಲ್ಕು: 14, ಹದಿನೈದು: 15, ಹದಿನಾರು: 16, ಹದಿನೇಳು: 17, ಹದಿನೆಂಟು: 18, ಹತ್ತೊಂಬತ್ತು: 19,
  ಇಪ್ಪತ್ತು: 20, ಮೂವತ್ತು: 30, ನಲವತ್ತು: 40, ಐವತ್ತು: 50, ಅರವತ್ತು: 60, ಎಪ್ಪತ್ತು: 70, ಎಂಬತ್ತು: 80, ತೊಂಬತ್ತು: 90,
  ನೂರು: 100, ಸಾವಿರ: 1000, ಲಕ್ಷ: 100000, ಕೋಟಿ: 10000000,
};

// Bengali words
const BENGALI_NUMBER_WORDS = {
  শূন্য: 0, এক: 1, দুই: 2, তিন: 3, চার: 4, পাঁচ: 5, ছয়: 6, সাত: 7, আট: 8, নয়: 9,
  দশ: 10, এগারো: 11, বারো: 12, তেরো: 13, চোদ্দ: 14, পনেরো: 15, ষোলো: 16, সতেরো: 17, আঠারো: 18, উনিশ: 19,
  কুড়ি: 20, তিরিশ: 30, বত্রিশ: 32, চল্লিশ: 40, পঞ্চাশ: 50, ষাট: 60, সত্তর: 70, আশি: 80, নব্বই: 90,
  শত: 100, হাজার: 1000, লাখ: 100000, কোটি: 10000000,
};

export function parseWordTokens(wordsStr) {
  if (!wordsStr) return 0;
  const tokens = wordsStr.split(/[\s-]+/).filter(Boolean);
  let total = 0;
  let current = 0;

  for (const token of tokens) {
    const val =
      NUMBER_WORDS_EN[token] ??
      HINDI_NUMBER_WORDS[token] ??
      TELUGU_NUMBER_WORDS[token] ??
      TAMIL_NUMBER_WORDS[token] ??
      KANNADA_NUMBER_WORDS[token] ??
      BENGALI_NUMBER_WORDS[token];

    if (val !== undefined) {
      if (val === 100) {
        current = current === 0 ? 100 : current * 100;
      } else if (val >= 1000) {
        current = current === 0 ? 1 : current;
        total += current * val;
        current = 0;
      } else {
        current += val;
      }
    }
  }

  total += current;
  return total;
}

export function parseSpokenAmount(rawText) {
  if (!rawText) return null;

  // 1. Normalize Indic script numerals (Telugu, Devanagari, Tamil, etc.) to 0-9
  let clean = normalizeIndicDigits(String(rawText))
    .toLowerCase()
    .replace(/[,₹$£€]/g, " ")
    .replace(/\b(dollars?|rupees?|pounds?|euros?|cents?|pence|paise|fils|రూపాయలు|డాలర్లు|రాయల్|रुपये|डॉलर|पाउंड)\b/gi, " ")
    .trim();

  // 2. Check for explicit decimal points like "4900.32"
  const directDecimalMatch = clean.match(/\b(\d+)\s*[\.]\s*(\d+)\b/);
  if (directDecimalMatch) {
    let num = parseFloat(`${directDecimalMatch[1]}.${directDecimalMatch[2]}`);
    if (/\b(crore|करोड़|కోటి|కోట్ల|கோடி|ಕೋಟಿ|কোটি)\b/i.test(clean)) num *= 10000000;
    else if (/\b(lakh|lac|लाख|లక్ష|లక్షల|லட்சம்|ಲಕ್ಷ|লাখ)\b/i.test(clean)) num *= 100000;
    else if (/\b(thousand|हज़ार|हजार|వేల|వేలు|ஆયிரம்|ಸಾವಿರ|হাজার|k)\b/i.test(clean)) num *= 1000;
    else if (/\b(million)\b/i.test(clean)) num *= 1000000;
    return Number(num.toFixed(4));
  }

  // 3. Check for spoken "point" or Indic decimal markers
  const decimalSplit = clean.split(/\bpoint\b|\bdot\b|\bdecimal\b|दशमलव|पॉइंट|पాయింట్|డాట్|పుள்ளி|দশবিন্দু/i);
  if (decimalSplit.length > 1) {
    const intPartStr = decimalSplit[0].trim();
    const decPartStr = decimalSplit[1].trim();

    let intVal = 0;
    const intNumMatch = intPartStr.match(/\b\d+\b/);
    if (intNumMatch) {
      intVal = parseFloat(intNumMatch[0]);
    } else {
      intVal = parseWordTokens(intPartStr);
    }

    let decVal = 0;
    const decNumMatch = decPartStr.match(/\b\d+\b/);
    if (decNumMatch) {
      decVal = parseFloat(`0.${decNumMatch[0]}`);
    } else {
      const decParsed = parseWordTokens(decPartStr);
      if (decParsed > 0) {
        decVal = decParsed < 10 ? decParsed / 10 : decParsed / 100;
      }
    }

    const total = intVal + decVal;
    if (total > 0) return Number(total.toFixed(4));
  }

  // 4. Check for pure integers like "4900" or with Indian scales like "50 lakh", "2 crore", "10k"
  const intMatch = clean.match(/\b(\d+)\b/);
  if (intMatch) {
    let num = parseFloat(intMatch[1]);
    if (/\b(crore|करोड़|కోటి|కోట్ల|கோடி|ಕೋಟಿ|কোটি)\b/i.test(clean)) num *= 10000000;
    else if (/\b(lakh|lac|लाख|లక్ష|లక్షల|லட்சம்|ಲಕ್ಷ|লাখ)\b/i.test(clean)) num *= 100000;
    else if (/\b(thousand|हज़ार|हजार|వేల|వేలు|ஆயிரம்|ಸಾವಿರ|হাজার|k)\b/i.test(clean)) num *= 1000;
    else if (/\b(million)\b/i.test(clean)) num *= 1000000;
    return Number(num.toFixed(4));
  }

  // 5. Full natural language word parsing (English, Hindi, Telugu, Tamil, Kannada, Bengali)
  const fullParsed = parseWordTokens(clean);
  if (fullParsed > 0) {
    return Number(fullParsed.toFixed(4));
  }

  return null;
}
