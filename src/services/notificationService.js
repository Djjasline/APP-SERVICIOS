import { supabase } from "@/lib/supabase";

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
    const payload = {
      recipient_email,
      title,
      message,
      record_type,
      record_id,
      read: false,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("notifications")
      .insert(payload)
      .select()
      .maybeSingle();

    if (error) {
      console.error("Error creating notification:", error);
      return null;
    }

    sendPushForNotification(payload).catch((pushError) => {
      console.error("Error sending push notification:", pushError);
    });

    return data;
  } catch (err) {
    console.error("Unexpected error creating notification:", err);
    return null;
  }
}

async function sendPushForNotification(notification) {
  if (!notification?.recipient_email) return;

  const { error } = await supabase.functions.invoke("send-push-notification", {
    body: {
      recipient_emails: [notification.recipient_email],
      titulo: notification.title || "App Servicios",
      mensaje: notification.message || "Nueva notificación",
      url: getNotificationUrl(notification),
    },
  });

  if (error) throw error;
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
  if (!recipient_email) return 0;

  try {
    // head + exact count para no traer filas completas
    const { count, error } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("recipient_email", recipient_email)
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
  if (!recipient_email) return [];

  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("recipient_email", recipient_email)
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
