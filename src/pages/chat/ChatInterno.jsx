import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { FileText, MessageCircle, Paperclip, Search, Send, UserCircle2, Volume2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { formatUserDisplayName } from "@/utils/nameFormat";
import { getRecordAttachmentSearchText } from "@/utils/chatAttachments.mjs";
import {
  getCompletedRecordPdfAttachmentsForChat,
  getChatUsers,
  getMessages,
  getOrCreateDirectConversation,
  getUnreadMessageCounts,
  markConversationRead,
  sendMessage,
} from "@/services/chatService";
import { playNotificationSound } from "@/utils/notificationSound";

function displayName(user) {
  return formatUserDisplayName(user);
}

function initials(user) {
  const name = displayName(user);
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "U";
}

function formatTime(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("es-EC", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function ChatInterno() {
  const { user, isSuperAdmin } = useAuth();
  const { isLight } = useTheme();
  const { usuariosOnline = {} } = useOutletContext() || {};
  const bottomRef = useRef(null);
  const soundedMessageIdsRef = useRef(new Set());

  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [usuarioActivo, setUsuarioActivo] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto] = useState("");
  const [cargandoUsuarios, setCargandoUsuarios] = useState(true);
  const [cargandoMensajes, setCargandoMensajes] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [noLeidos, setNoLeidos] = useState({});
  const [soundTestResult, setSoundTestResult] = useState("");
  const [adjuntosDisponibles, setAdjuntosDisponibles] = useState([]);
  const [adjuntoSeleccionado, setAdjuntoSeleccionado] = useState(null);
  const [selectorAdjuntosAbierto, setSelectorAdjuntosAbierto] = useState(false);
  const [busquedaAdjuntos, setBusquedaAdjuntos] = useState("");
  const [cargandoAdjuntos, setCargandoAdjuntos] = useState(false);

  const usuariosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return usuarios;
    return usuarios.filter((u) =>
      [u.full_name, u.email, u.role, u.department]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [usuarios, busqueda]);

  const adjuntosFiltrados = useMemo(() => {
    const q = busquedaAdjuntos.trim().toLowerCase();
    if (!q) return adjuntosDisponibles;
    return adjuntosDisponibles.filter((attachment) => getRecordAttachmentSearchText(attachment).includes(q));
  }, [adjuntosDisponibles, busquedaAdjuntos]);

  const cargarUsuarios = useCallback(async () => {
    if (!user?.id) return;
    setCargandoUsuarios(true);
    setError("");
    try {
      const data = await getChatUsers(user.id);
      setUsuarios(data);
    } catch (err) {
      console.error("[Chat] Error cargando usuarios:", err);
      setError("No se pudo cargar la lista de usuarios.");
    } finally {
      setCargandoUsuarios(false);
    }
  }, [user?.id]);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  const cargarNoLeidos = useCallback(async () => {
    if (!user?.id) return;

    try {
      const counts = await getUnreadMessageCounts(user.id);
      setNoLeidos(counts);
    } catch (err) {
      console.error("[Chat] Error cargando no leídos:", err);
    }
  }, [user?.id]);

  const playIncomingMessageSound = useCallback(
    (message) => {
      if (!message?.id || !user?.id) return false;
      if (message.sender_id === user.id) return false;
      if (soundedMessageIdsRef.current.has(message.id)) return false;

      soundedMessageIdsRef.current.add(message.id);
      playNotificationSound();
      return true;
    },
    [user?.id]
  );

  useEffect(() => {
    cargarNoLeidos();
    const timer = setInterval(cargarNoLeidos, 15000);
    return () => clearInterval(timer);
  }, [cargarNoLeidos]);

  const abrirChat = useCallback(
    async (otroUsuario) => {
      if (!user?.id || !otroUsuario?.id) return;
      setUsuarioActivo(otroUsuario);
      setCargandoMensajes(true);
      setError("");

      try {
        const convId = await getOrCreateDirectConversation(otroUsuario.id);
        setConversationId(convId);
        const data = await getMessages(convId);
        setMensajes(data);
        await markConversationRead(convId, user.id);
        setNoLeidos((prev) => ({ ...prev, [otroUsuario.id]: 0 }));
      } catch (err) {
        console.error("[Chat] Error abriendo conversación:", err);
        setError("No se pudo abrir la conversación.");
      } finally {
        setCargandoMensajes(false);
      }
    },
    [user?.id]
  );

  const cargarAdjuntosPdf = useCallback(async () => {
    if (!user?.id) return;

    setCargandoAdjuntos(true);
    setError("");
    try {
      const data = await getCompletedRecordPdfAttachmentsForChat({
        userId: user.id,
        userEmail: user.email,
        isSuperAdmin,
      });
      setAdjuntosDisponibles(data);
    } catch (err) {
      console.error("[Chat] Error cargando adjuntos PDF:", err);
      setError("No se pudieron cargar los PDFs completados.");
    } finally {
      setCargandoAdjuntos(false);
    }
  }, [isSuperAdmin, user?.email, user?.id]);

  const alternarSelectorAdjuntos = async () => {
    const nextOpen = !selectorAdjuntosAbierto;
    setSelectorAdjuntosAbierto(nextOpen);
    if (nextOpen && adjuntosDisponibles.length === 0) {
      await cargarAdjuntosPdf();
    }
  };

  useEffect(() => {
  if (!conversationId) return;

  const channel = supabase
    .channel(`chat-messages-${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        setMensajes((prev) => {
          if (prev.some((m) => m.id === payload.new.id)) return prev;
          return [...prev, payload.new];
        });

        const isIncoming = payload.new?.sender_id !== user?.id;
        if (isIncoming) playIncomingMessageSound(payload.new);

        if (isIncoming && usuarioActivo?.id) {
          markConversationRead(conversationId, user?.id);
          setNoLeidos((prev) => ({ ...prev, [usuarioActivo.id]: 0 }));
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [conversationId, playIncomingMessageSound, user?.id, usuarioActivo?.id]);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`chat-unread-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        (payload) => {
          if (payload.new?.sender_id !== user.id) {
            playIncomingMessageSound(payload.new);
            cargarNoLeidos();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cargarNoLeidos, playIncomingMessageSound, user?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  const enviar = async (e) => {
    e.preventDefault();
    if (!conversationId || !user?.id || (!texto.trim() && !adjuntoSeleccionado) || enviando) return;

    setEnviando(true);
    setError("");
    const textoEnviar = texto;
    const adjuntoEnviar = adjuntoSeleccionado;
    setTexto("");
    setAdjuntoSeleccionado(null);
    setSelectorAdjuntosAbierto(false);

    try {
      await sendMessage(conversationId, user.id, textoEnviar, {
        attachments: adjuntoEnviar ? [adjuntoEnviar] : [],
      });
    } catch (err) {
      console.error("[Chat] Error enviando mensaje:", err);
      setTexto(textoEnviar);
      setAdjuntoSeleccionado(adjuntoEnviar);
      setError("No se pudo enviar el mensaje.");
    } finally {
      setEnviando(false);
    }
  };

  const probarSonido = async () => {
    setSoundTestResult("");
    const ok = await playNotificationSound();
    setSoundTestResult(ok ? "Sonido de prueba enviado." : "El navegador bloqueó el sonido en esta página.");
  };

  const panelClass = isLight
    ? "bg-white border-slate-200 text-slate-900"
    : "bg-slate-950/40 border-white/10 text-white";
  const usuarioActivoOnline = usuarioActivo
  ? !!usuariosOnline[usuarioActivo.id]
  : false;


  return (
    <div className="h-[calc(100vh-9rem)] min-h-[620px] flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle size={26} /> Chat interno
          </h1>
          <p className={isLight ? "text-slate-500 text-sm" : "text-slate-300 text-sm"}>
            Comunicación interna entre usuarios registrados de ASTAP.
          </p>
          {soundTestResult && (
            <p className={isLight ? "mt-1 text-xs text-slate-500" : "mt-1 text-xs text-slate-300"}>
              {soundTestResult}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={probarSonido}
          className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
            isLight
              ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
              : "bg-amber-400/20 text-amber-100 hover:bg-amber-400/30"
          }`}
        >
          <Volume2 size={16} /> Probar sonido
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-300 bg-red-50 text-red-700 px-4 py-2 text-sm">
          {error}
        </div>
      )}

      <div className={`flex-1 grid grid-cols-1 lg:grid-cols-[330px_1fr] rounded-2xl border overflow-hidden ${panelClass}`}>
        <aside className={`border-r ${isLight ? "border-slate-200" : "border-white/10"} flex flex-col min-h-0`}>
          <div className="p-4 border-b border-inherit">
            <div className={`flex items-center gap-2 rounded-xl px-3 py-2 border ${isLight ? "border-slate-200 bg-slate-50" : "border-white/10 bg-white/5"}`}>
              <Search size={17} className={isLight ? "text-slate-500" : "text-slate-300"} />
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar usuario..."
                className={`w-full bg-transparent outline-none text-sm ${
                  isLight
                    ? "text-slate-900 placeholder:text-slate-400"
                    : "text-white placeholder:text-slate-400"
                }`}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {cargandoUsuarios ? (
              <div className="p-4 text-sm opacity-70">Cargando usuarios...</div>
            ) : usuariosFiltrados.length === 0 ? (
              <div className="p-4 text-sm opacity-70">No hay usuarios disponibles.</div>
            ) : (
              usuariosFiltrados.map((u) => {
                const active = usuarioActivo?.id === u.id;

                const online = !!usuariosOnline[u.id];
                const unreadCount = noLeidos[u.id] || 0;
                
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => abrirChat(u)}
                    className={`w-full text-left rounded-xl p-3 flex gap-3 transition ${
                      active
                        ? "bg-blue-600 text-white"
                        : isLight
                        ? "hover:bg-slate-100"
                        : "hover:bg-white/10"
                    }`}
                  >
  <div
  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
    online
      ? "bg-green-500 text-white"
      : active
      ? "bg-white/20"
      : "bg-blue-600/15 text-blue-600"
  }`}
>
  {initials(u)}
</div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold truncate">{displayName(u)}</div>
                      <div className={`text-xs truncate ${active ? "text-blue-100" : "opacity-70"}`}>{u.email}</div>
                      <>
  {u.role && (
    <div
      className={`text-[11px] mt-1 truncate ${
        active ? "text-green-100" : "opacity-60"
      }`}
    >
      {u.role}
    </div>
  )}

  {online && (
    <div className="text-[11px] font-semibold text-green-200">
      ● En línea
    </div>
  )}
</>
</div>
                    {unreadCount > 0 && (
                      <span className="ml-auto self-center min-w-[22px] h-[22px] rounded-full bg-red-600 px-1.5 text-xs font-bold text-white flex items-center justify-center shadow">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section className="flex flex-col min-h-0">
          {usuarioActivo ? (
            <>
              <div className={`p-4 border-b ${isLight ? "border-slate-200 bg-slate-50" : "border-white/10 bg-white/5"} flex items-center gap-3`}>
               <div
  className={`w-11 h-11 rounded-full flex items-center justify-center font-bold ${
    usuarioActivoOnline
      ? "bg-green-500 text-white"
      : "bg-blue-600/15 text-blue-600"
  }`}
>
  {initials(usuarioActivo)}
</div>

<div className="min-w-0">
  <div className="font-bold truncate">
    {displayName(usuarioActivo)}
  </div>

  <div className="text-xs opacity-70 truncate">
    {usuarioActivo.email}
  </div>

 {usuarioActivoOnline && (
  <div className="text-xs font-semibold text-green-600">
    ● En línea
  </div>
)}
</div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cargandoMensajes ? (
                  <div className="text-sm opacity-70">Cargando conversación...</div>
                ) : mensajes.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
                    <MessageCircle size={42} />
                    <p className="mt-2 text-sm">No hay mensajes todavía.</p>
                    <p className="text-xs">Escribe el primer mensaje para iniciar la conversación.</p>
                  </div>
                ) : (
                  mensajes.map((m) => {
                    const mine = m.sender_id === user?.id;
                    return (
                      <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[78%] rounded-2xl px-4 py-2 shadow-sm ${
                          mine
                            ? "bg-blue-600 text-white rounded-br-md"
                            : isLight
                            ? "bg-slate-100 text-slate-900 rounded-bl-md"
                            : "bg-white/10 text-white rounded-bl-md"
                        }`}>
                          <div className="whitespace-pre-wrap break-words text-sm">{m.body}</div>
                          {Array.isArray(m.attachments) && m.attachments.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {m.attachments.map((attachment, index) => (
                                <a
                                  key={`${m.id}-attachment-${index}`}
                                  href={attachment.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-left text-xs transition ${
                                    mine
                                      ? "border-white/25 bg-white/10 text-white hover:bg-white/15"
                                      : isLight
                                      ? "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
                                      : "border-white/10 bg-black/20 text-white hover:bg-white/10"
                                  }`}
                                >
                                  <FileText size={16} className="mt-0.5 shrink-0" />
                                  <span className="min-w-0">
                                    <span className="block font-semibold">{attachment.title || "PDF adjunto"}</span>
                                    {attachment.description && (
                                      <span className={`block truncate ${mine ? "text-blue-100" : "opacity-70"}`}>
                                        {attachment.description}
                                      </span>
                                    )}
                                  </span>
                                </a>
                              ))}
                            </div>
                          )}
                          <div className={`text-[10px] mt-1 text-right ${mine ? "text-blue-100" : "opacity-60"}`}>
                            {formatTime(m.created_at)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={enviar} className={`p-4 border-t ${isLight ? "border-slate-200" : "border-white/10"}`}>
                {selectorAdjuntosAbierto && (
                  <div className={`mb-3 rounded-2xl border p-3 ${isLight ? "border-slate-200 bg-slate-50" : "border-white/10 bg-white/5"}`}>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <FileText size={16} /> Adjuntar PDF completado
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectorAdjuntosAbierto(false)}
                        className="rounded-lg p-1 opacity-70 hover:opacity-100"
                        aria-label="Cerrar adjuntos"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className={`mb-2 flex items-center gap-2 rounded-xl border px-3 py-2 ${isLight ? "border-slate-200 bg-white" : "border-white/10 bg-black/20"}`}>
                      <Search size={15} className="opacity-60" />
                      <input
                        value={busquedaAdjuntos}
                        onChange={(e) => setBusquedaAdjuntos(e.target.value)}
                        placeholder="Buscar por cliente, código o tipo..."
                        className={`w-full bg-transparent text-sm outline-none ${isLight ? "text-slate-900" : "text-white"}`}
                      />
                    </div>
                    {cargandoAdjuntos ? (
                      <div className="py-4 text-center text-sm opacity-70">Cargando PDFs completados...</div>
                    ) : adjuntosFiltrados.length === 0 ? (
                      <div className="py-4 text-center text-sm opacity-70">No hay PDFs completados disponibles.</div>
                    ) : (
                      <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                        {adjuntosFiltrados.map((attachment) => {
                          const selected = adjuntoSeleccionado?.url === attachment.url;
                          return (
                            <button
                              key={`${attachment.record_id}-${attachment.url}`}
                              type="button"
                              onClick={() => {
                                setAdjuntoSeleccionado(attachment);
                                setSelectorAdjuntosAbierto(false);
                              }}
                              className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                                selected
                                  ? "border-blue-500 bg-blue-50 text-blue-900"
                                  : isLight
                                  ? "border-slate-200 bg-white hover:bg-slate-100"
                                  : "border-white/10 bg-black/20 hover:bg-white/10"
                              }`}
                            >
                              <span className="block font-semibold">{attachment.title}</span>
                              <span className="block truncate text-xs opacity-70">{attachment.description}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {adjuntoSeleccionado && (
                  <div className={`mb-3 flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm ${isLight ? "border-blue-200 bg-blue-50 text-blue-900" : "border-blue-300/30 bg-blue-500/15 text-blue-100"}`}>
                    <div className="min-w-0 flex items-center gap-2">
                      <FileText size={16} className="shrink-0" />
                      <span className="min-w-0 truncate">
                        <strong>{adjuntoSeleccionado.title}</strong> · {adjuntoSeleccionado.description}
                      </span>
                    </div>
                    <button type="button" onClick={() => setAdjuntoSeleccionado(null)} className="rounded-lg p-1 hover:bg-black/10" aria-label="Quitar adjunto">
                      <X size={16} />
                    </button>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={alternarSelectorAdjuntos}
                    disabled={!conversationId || cargandoAdjuntos}
                    className={`inline-flex items-center justify-center rounded-xl border px-3 py-2 transition disabled:opacity-50 ${
                      isLight
                        ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                        : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                    }`}
                    title="Adjuntar PDF completado"
                  >
                    <Paperclip size={17} />
                  </button>
                  <textarea
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        enviar(e);
                      }
                    }}
                    placeholder={adjuntoSeleccionado ? "Agrega un comentario opcional..." : "Escribe un mensaje..."}
                    rows={1}
                    className={`flex-1 resize-none rounded-xl border px-3 py-2 text-sm outline-none ${
                      isLight
                        ? "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-400"
                        : "bg-white/5 border-white/10 text-white placeholder:text-slate-400 focus:border-blue-400"
                    }`}
                  />
                  <button
                    type="submit"
                    disabled={(!texto.trim() && !adjuntoSeleccionado) || enviando}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 text-white font-semibold"
                  >
                    <Send size={17} />
                    <span className="hidden sm:inline">Enviar</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-75">
              <UserCircle2 size={58} />
              <h2 className="mt-3 text-xl font-bold">Selecciona un usuario</h2>
              <p className="text-sm max-w-md mt-1">
                Elige un técnico o administrador de la lista para abrir un chat interno directo.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
