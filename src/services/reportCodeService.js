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

export async function getReportCodeSequences() {
  const { data, error } = await supabase.rpc("list_report_code_sequences");

  if (error) throw error;
  return data || [];
}

export async function updateReportCodeSequence(prefix, lastNumber) {
  const normalizedPrefix = normalizeReportCodePrefix(prefix);
  const parsedLastNumber = Number(lastNumber);

  if (!normalizedPrefix || normalizedPrefix.length < 5) {
    throw new Error("Ingresa un prefijo válido. Ej: P-26-006-57");
  }

  if (!Number.isInteger(parsedLastNumber) || parsedLastNumber < 0) {
    throw new Error("El último número debe ser un entero mayor o igual a cero.");
  }

  const { data, error } = await supabase.rpc("update_report_code_sequence", {
    input_prefix: normalizedPrefix,
    input_last_number: parsedLastNumber,
  });

  if (error) throw error;
  return data;
}
