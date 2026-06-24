import { supabase } from "@/lib/supabase";
import { createNotification } from "@/services/notificationService";

export async function getChatUsers(currentUserId) {
  let query = supabase
    .from("profiles")
    .select("id, email, full_name, role, department")
    .order("full_name", { ascending: true });

  if (currentUserId) query = query.neq("id", currentUserId);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getOrCreateDirectConversation(otherUserId) {
  const { data, error } = await supabase.rpc("get_or_create_direct_conversation", {
    other_user_id: otherUserId,
  });

  if (error) throw error;
  return data;
}

export async function getMessages(conversationId) {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("id, conversation_id, sender_id, body, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function sendMessage(conversationId, senderId, body) {
  const text = String(body || "").trim();
  if (!text) return null;

  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      body: text,
    })
    .select("id, conversation_id, sender_id, body, created_at")
    .single();

  if (error) throw error;

  try {
    const { data: participantes } = await supabase
      .from("chat_participants")
      .select("user_id")
      .eq("conversation_id", conversationId)
      .neq("user_id", senderId);

    const userIds = (participantes || []).map((p) => p.user_id);

    if (userIds.length > 0) {
      const { data: senderProfile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", senderId)
        .maybeSingle();

      const senderName =
        senderProfile?.full_name || senderProfile?.email || "ASTAP";

      const { data: recipientProfiles } = await supabase
        .from("profiles")
        .select("email")
        .in("id", userIds);

      await Promise.all(
        (recipientProfiles || [])
          .map((profile) => profile.email)
          .filter(Boolean)
          .map((recipientEmail) =>
            createNotification({
              recipient_email: recipientEmail,
              title: `Nuevo mensaje de ${senderName}`,
              message: text.length > 120 ? `${text.slice(0, 120)}...` : text,
              record_type: "chat",
              record_id: conversationId,
            })
          )
      );
    }
  } catch (notificationError) {
    console.error("[Chat] Error creando notificación:", notificationError);
  }

  return data;
}

export async function markConversationRead(conversationId, userId) {
  if (!conversationId || !userId) return;

  const { error } = await supabase
    .from("chat_participants")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("user_id", userId);

  if (error) console.error("[Chat] Error marcando leído:", error);
}
