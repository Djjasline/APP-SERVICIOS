import { supabase } from "@/lib/supabase";

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

/*
 Servicio mínimo de notificaciones in-app.

 Asume una tabla `notifications` con columnas mínimas:
  - id uuid primary key default gen_random_uuid()
  - recipient_email text not null
  - title text
  - message text
  - record_type text
  - record_id text
  - read boolean default false
  - created_at timestamptz default now()
*/

export async function createNotification({
  recipient_email,
  title,
  message,
  record_type = "",
  record_id = null,
}) {
  try {
    const recipientEmail = normalizeEmail(recipient_email);
    if (!recipientEmail) return null;

    const payload = {
      recipient_email: recipientEmail,
      title,
      message,
      record_type,
      record_id,
    };

    const notification = await sendPushNotification(payload, { saveNotification: true });
    return notification || createNotificationFallback(payload);
  } catch (err) {
    console.error("Unexpected error creating notification:", err);
    return null;
  }
}

export async function createUserNotifications({
  user_ids = [],
  recipient_emails = [],
  title,
  message,
  record_type = "",
  record_id = null,
}) {
  const userIds = Array.from(new Set((user_ids || []).filter(Boolean).map(String)));
  const recipientEmails = Array.from(
    new Set((recipient_emails || []).map(normalizeEmail).filter(Boolean))
  );

  if (userIds.length === 0 && recipientEmails.length === 0) return null;

  const payload = {
    recipient_email: recipientEmails[0],
    title,
    message,
    record_type,
    record_id,
  };

  try {
    const { data, error } = await invokePushNotification({
      user_ids: userIds,
      recipient_emails: recipientEmails,
      titulo: title || "App Servicios",
      mensaje: message || "Nueva notificación",
      record_type,
      record_id,
      url: getNotificationUrl(payload),
      save_notification: true,
    });

    if (!error) {
      return data || null;
    }

    console.error("Error creating user notifications:", error);
  } catch (err) {
    console.error("Unexpected error creating user notifications:", err);
  }

  return Promise.all(
    recipientEmails.map((recipientEmail) =>
      createNotificationFallback({
        ...payload,
        recipient_email: recipientEmail,
      })
    )
  );
}

async function sendPushNotification(payload, { saveNotification = false } = {}) {
  try {
    const { data, error } = await invokePushNotification({
      recipient_emails: [payload.recipient_email],
      titulo: payload.title || "App Servicios",
      mensaje: payload.message || "Nueva notificación",
      record_type: payload.record_type,
      record_id: payload.record_id,
      url: getNotificationUrl(payload),
      save_notification: saveNotification,
    });

    if (error) {
      console.error("Error sending push notification:", error);
      return null;
    }

    return data || null;
  } catch (err) {
    console.error("Unexpected error sending push notification:", err);
    return null;
  }
}

async function invokePushNotification(body) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return supabase.functions.invoke("send-push-notification", {
    body,
    headers: session?.access_token
      ? { Authorization: `Bearer ${session.access_token}` }
      : undefined,
  });
}

async function createNotificationFallback(payload) {
  try {
    const recipientEmail = normalizeEmail(payload.recipient_email);
    if (!recipientEmail) return null;

    const { data, error } = await supabase
      .from("notifications")
      .insert({
        recipient_email: recipientEmail,
        title: payload.title,
        message: payload.message,
        record_type: payload.record_type,
        record_id: payload.record_id,
        read: false,
        created_at: new Date().toISOString(),
      })
      .select()
      .maybeSingle();

    if (error) {
      console.error("Error creating notification fallback:", error);
      return null;
    }

    return data;
  } catch (fallbackError) {
    console.error("Unexpected error creating notification fallback:", fallbackError);
    return null;
  }
}

function getNotificationUrl(notification) {
  if (notification.record_type === "chat") return "/chat";

  if (notification.record_type === "registro" && notification.record_id) {
    return `/operaciones/registro/${notification.record_id}`;
  }

  if (notification.record_type === "recepcion" && notification.record_id) {
    return `/operaciones/recepcion/${notification.record_id}`;
  }

  if (notification.record_type === "liberacion" && notification.record_id) {
    return `/operaciones/liberacion/${notification.record_id}`;
  }

  return "/notifications";
}

export async function getUnreadCount(recipient_email) {
  const recipientEmail = normalizeEmail(recipient_email);
  if (!recipientEmail) return 0;

  try {
    // head + exact count para no traer filas completas
    const { count, error } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .ilike("recipient_email", recipientEmail)
      .eq("read", false);

    if (error) {
      console.error("Error fetching unread notifications count:", error);
      return 0;
    }

    return count || 0;
  } catch (err) {
    console.error("Unexpected error fetching unread count:", err);
    return 0;
  }
}

export async function getNotifications(recipient_email) {
  const recipientEmail = normalizeEmail(recipient_email);
  if (!recipientEmail) return [];

  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .ilike("recipient_email", recipientEmail)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Unexpected error fetching notifications:", err);
    return [];
  }
}

export async function markNotificationRead(id) {
  if (!id) return false;

  try {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);

    if (error) {
      console.error("Error marking notification read:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Unexpected error marking read:", err);
    return false;
  }
}
