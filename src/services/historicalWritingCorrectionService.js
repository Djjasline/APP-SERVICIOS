import { supabase } from "@/lib/supabase";
import { correctWritingData } from "@/utils/writingCorrection.mjs";

const PAGE_SIZE = 100;

export async function correctHistoricalRecordWriting() {
  const summary = { scanned: 0, corrected: 0, skipped: 0 };
  let offset = 0;

  while (true) {
    const { data: records, error } = await supabase
      .from("registros")
      .select("id, data, updated_at")
      .order("id", { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) throw error;
    if (!records?.length) break;

    for (const record of records) {
      summary.scanned += 1;
      const { value, corrections } = correctWritingData(record.data);
      if (corrections === 0) continue;

      // Preserve concurrent edits by only changing the version that was inspected.
      let update = supabase
        .from("registros")
        .update({ data: value, updated_at: new Date().toISOString() })
        .eq("id", record.id);

      update = record.updated_at ? update.eq("updated_at", record.updated_at) : update.is("updated_at", null);
      const { data: updated, error: updateError } = await update.select("id").maybeSingle();

      if (updateError && updateError.code !== "42501") throw updateError;

      if (updateError || !updated) {
        summary.skipped += 1;
        continue;
      }

      summary.corrected += 1;
    }

    if (records.length < PAGE_SIZE) break;
    offset += records.length;
  }

  return summary;
}
