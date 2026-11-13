const PREFIX = "app-servicios-spelling-v1:";
const WORD = /^[\p{L}\p{M}]{2,64}$/u;
const MAX_ITEMS = 1000;

export function spellingKey(word) {
  return String(word || "").trim().normalize("NFC").toLocaleLowerCase("es");
}

function storageKey(scope) {
  return PREFIX + String(scope || "public");
}

function defaultStorage() {
  try { return globalThis.localStorage; } catch { return null; }
}

export function readPersonalSpelling(scope, storage = defaultStorage()) {
  try {
    const data = JSON.parse(storage?.getItem(storageKey(scope)) || "{}");
    const words = Array.isArray(data.words) ? data.words.filter((word) => typeof word === "string" && WORD.test(word)).slice(0, MAX_ITEMS) : [];
    const corrections = {};
    if (data.corrections && typeof data.corrections === "object" && !Array.isArray(data.corrections)) {
      for (const [source, replacement] of Object.entries(data.corrections).slice(0, MAX_ITEMS)) {
        if (WORD.test(source) && typeof replacement === "string" && WORD.test(replacement)) corrections[spellingKey(source)] = replacement;
      }
    }
    return { words, corrections };
  } catch { return { words: [], corrections: {} }; }
}

function writePersonalSpelling(scope, data, storage) {
  try {
    if (!storage) return false;
    storage.setItem(storageKey(scope), JSON.stringify(data));
    return true;
  } catch { return false; }
}

export function rememberSpelling(scope, word, source = "", storage = defaultStorage()) {
  const target = String(word || "").trim().normalize("NFC");
  const from = String(source || "").trim().normalize("NFC");
  if (!WORD.test(target) || (from && !WORD.test(from))) return false;
  const data = readPersonalSpelling(scope, storage);
  const key = spellingKey(target);
  if (!data.words.some((entry) => spellingKey(entry) === key)) {
    if (data.words.length >= MAX_ITEMS) return false;
    data.words.push(target);
  }
  if (from && spellingKey(from) !== key) {
    const sourceKey = spellingKey(from);
    if (!Object.hasOwn(data.corrections, sourceKey) && Object.keys(data.corrections).length >= MAX_ITEMS) return false;
    data.corrections[sourceKey] = target;
  }
  return writePersonalSpelling(scope, data, storage);
}

export function forgetSpelling(scope, word, storage = defaultStorage()) {
  const data = readPersonalSpelling(scope, storage);
  const key = spellingKey(word);
  data.words = data.words.filter((entry) => spellingKey(entry) !== key);
  data.corrections = Object.fromEntries(Object.entries(data.corrections).filter(([, target]) => spellingKey(target) !== key));
  return writePersonalSpelling(scope, data, storage);
}

export function withPersonalSpelling(dictionary, scope, storage = defaultStorage()) {
  const data = readPersonalSpelling(scope, storage);
  const words = new Set(data.words.map(spellingKey));
  // Término habitual de los informes técnicos de servicios.
  words.add("hidrosuccionador");
  return {
    correct: (word) => words.has(spellingKey(word)) || dictionary.correct(word),
    detectLanguage: (text) => dictionary.detectLanguage?.(text) || "unknown",
    nativeLanguage: (text) => dictionary.nativeLanguage?.(text) || "unknown",
    isEnglishWord: (word) => dictionary.isEnglishWord?.(word) || false,
    suggest: (word, context = "") => {
      const key = spellingKey(word);
      const remembered = Object.hasOwn(data.corrections, key) ? data.corrections[key] : "";
      const adapted = remembered && /^\p{Lu}/u.test(word) ? remembered[0].toLocaleUpperCase("es") + remembered.slice(1) : remembered;
      const suggestions = dictionary.suggest(word, context);
      return adapted ? [adapted, ...suggestions.filter((item) => spellingKey(item) !== spellingKey(adapted))] : suggestions;
    },
  };
}
