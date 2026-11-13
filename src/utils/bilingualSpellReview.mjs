const WORDS = /[\p{L}\p{M}]+/gu;

export function createBilingualDictionary(spanish, english) {
  const languageCounts = (text) => {
    let es = 0;
    let en = 0;
    const content = String(text || "");
    for (const match of content.matchAll(WORDS)) {
      const word = match[0];
      if (word.length < 3 || word.length > 32 || word === word.toLocaleUpperCase("es")) continue;
      const before = content[match.index - 1] || "";
      const after = content[match.index + word.length] || "";
      if (/[\p{N}_@./+\-]/u.test(before) || /[\p{N}_@/+\-]/u.test(after)) continue;
      const isEs = spanish.correct(word);
      const isEn = english.correct(word);
      if (isEs && !isEn) es += 1;
      if (isEn && !isEs) en += 1;
    }
    return { es, en };
  };
  const detectLanguage = (text) => {
    const { es, en } = languageCounts(text);
    if (es > en) return "es";
    if (en > es) return "en";
    return "unknown";
  };
  return {
    correct: (word) => spanish.correct(word) || english.correct(word),
    isEnglishWord: (word) => english.correct(word),
    detectLanguage,
    nativeLanguage: (text) => {
      const { es, en } = languageCounts(text);
      return es && en ? "mixed" : en ? "en" : es ? "es" : "unknown";
    },
    suggest: (word, context = "") => {
      const language = detectLanguage(context);
      const es = spanish.suggest(word);
      const en = english.suggest(word);
      let ordered;
      if (language === "en") ordered = [...en, ...es];
      else if (language === "es") ordered = [...es, ...en];
      else {
        ordered = [];
        for (let i = 0; i < Math.max(es.length, en.length); i += 1) {
          if (es[i]) ordered.push(es[i]);
          if (en[i]) ordered.push(en[i]);
        }
      }
      return Array.from(new Set(ordered));
    },
  };
}

export function allowTechnicalSpanishSuggestion(source, text, dictionary) {
  const language = dictionary.detectLanguage(text);
  if (language === "en") return false;
  return language === "es" || source.includes(" ") || !dictionary.isEnglishWord(source);
}
