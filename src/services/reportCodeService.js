import { supabase } from "@/lib/supabase";

export function normalizeReportCodeValue(inputCode) {
  return String(inputCode || "")
    .replace(/\s+/g, "")
    .replace(/-+$/g, "");
}

export function normalizeReportCodePrefix(inputCode) {
  const normalized = normalizeReportCodeValue(inputCode).replace(/-[0-9]{3,}$/g, "");
  return normalized || "";
}

export function hasReportCodeSequence(inputCode) {
  return /-[0-9]{3,}$/.test(normalizeReportCodeValue(inputCode));
}

export function canSuggestReportCode(inputCode) {
  return normalizeReportCodePrefix(inputCode).length >= 5;
}

export async function getSuggestedReportCode(inputCode) {
  if (!canSuggestReportCode(inputCode)) return "";

  const { data, error } = await supabase.rpc("peek_next_report_code", {
    input_code: inputCode,
  });

  if (error) throw error;
  return data || "";
}

export async function reserveNextReportCode(inputCode) {
  if (!canSuggestReportCode(inputCode)) return inputCode;

  const { data, error } = await supabase.rpc("reserve_next_report_code", {
    input_code: inputCode,
  });

  if (error) throw error;
  return data || inputCode;
}
