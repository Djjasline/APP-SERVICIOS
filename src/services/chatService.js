import { supabase } from "@/lib/supabase";
import { createUserNotifications } from "@/services/notificationService";
import { formatUserDisplayName } from "@/utils/nameFormat";

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

export async function getUnreadMessageCounts(currentUserId) {
  if (!currentUserId) return {};

  const { data: ownParticipants, error: participantsError } = await supabase
    .from("chat_participants")
    .select("conversation_id, last_read_at")
    .eq("user_id", currentUserId);

  if (participantsError) throw participantsError;

  const conversationIds = (ownParticipants || []).map((p) => p.conversation_id);
  if (conversationIds.length === 0) return {};

  const readByConversation = new Map(
    (ownParticipants || []).map((p) => [p.conversation_id, p.last_read_at])
  );

  const { data: messages, error: messagesError } = await supabase
    .from("chat_messages")
    .select("conversation_id, sender_id, created_at")
    .in("conversation_id", conversationIds)
    .neq("sender_id", currentUserId);

  if (messagesError) throw messagesError;

  const unreadByConversation = {};

  (messages || []).forEach((message) => {
    const lastReadAt = readByConversation.get(message.conversation_id);
    const isUnread = !lastReadAt || new Date(message.created_at) > new Date(lastReadAt);

    if (isUnread) {
      unreadByConversation[message.conversation_id] =
        (unreadByConversation[message.conversation_id] || 0) + 1;
    }
  });

  const unreadConversationIds = Object.keys(unreadByConversation);
  if (unreadConversationIds.length === 0) return {};

  const { data: otherParticipants, error: otherParticipantsError } = await supabase
    .from("chat_participants")
    .select("conversation_id, user_id")
    .in("conversation_id", unreadConversationIds)
    .neq("user_id", currentUserId);

  if (otherParticipantsError) throw otherParticipantsError;

  return (otherParticipants || []).reduce((acc, participant) => {
    acc[participant.user_id] =
      (acc[participant.user_id] || 0) +
      (unreadByConversation[participant.conversation_id] || 0);
    return acc;
  }, {});
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

      const senderName = formatUserDisplayName(senderProfile, "ASTAP");

      const { data: recipientProfiles } = await supabase
        .from("profiles")
        .select("email")
        .in("id", userIds);

      await createUserNotifications({
        user_ids: userIds,
        recipient_emails: (recipientProfiles || []).map((profile) => profile.email),
        title: `Nuevo mensaje de ${senderName}`,
        message: text.length > 120 ? `${text.slice(0, 120)}...` : text,
        record_type: "chat",
        record_id: conversationId,
      });
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
