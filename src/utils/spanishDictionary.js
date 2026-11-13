import nspell from "nspell";
import aff from "../../node_modules/dictionary-es/index.aff?raw";
import dic from "../../node_modules/dictionary-es/index.dic?raw";

let dictionary;
export function getSpanishDictionary() {
  if (!dictionary) dictionary = nspell(aff, dic);
  return dictionary;
}
