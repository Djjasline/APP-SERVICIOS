import nspell from "nspell";
import aff from "../../node_modules/dictionary-es/index.aff?raw";
import dic from "../../node_modules/dictionary-es/index.dic?raw";
import enAff from "../../node_modules/dictionary-en/index.aff?raw";
import enDic from "../../node_modules/dictionary-en/index.dic?raw";
import { withPersonalSpelling } from "./personalSpelling.mjs";
import { createBilingualDictionary } from "./bilingualSpellReview.mjs";

let dictionary;
export function getSpanishDictionary(scope) {
  if (!dictionary) dictionary = createBilingualDictionary(nspell(aff, dic), nspell(enAff, enDic));
  return withPersonalSpelling(dictionary, scope);
}
