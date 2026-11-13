import nspell from "nspell";
import aff from "../../node_modules/dictionary-es/index.aff?raw";
import dic from "../../node_modules/dictionary-es/index.dic?raw";
import { withPersonalSpelling } from "./personalSpelling.mjs";

let dictionary;
export function getSpanishDictionary(scope) {
  if (!dictionary) dictionary = nspell(aff, dic);
  return withPersonalSpelling(dictionary, scope);
}
