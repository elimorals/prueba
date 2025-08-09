"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  MessageSquare,
  Send,
  Calendar,
  Bot,
  User,
  Paperclip,
  ImageIcon,
  VideoIcon,
  MicIcon,
  MicOffIcon,
  XIcon,
  FileImage,
  Users,
  Activity,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Mensaje {
  id: number;
  tipo: "bot" | "usuario";
  contenido: string;
  timestamp: string;
  archivos?: { tipo: string; nombre: string }[];
}

const mensajesIniciales: Mensaje[] = [
  {
    id: 1,
    tipo: "bot" as const,
    contenido:
      "¡Hola Dr. González! Soy tu asistente de IA médico especializado en radiología. Puedo ayudarte con análisis de imágenes médicas, consultas sobre patologías, interpretación de estudios DICOM, tratamientos y gestión de tu consultorio. También puedes enviarme imágenes, videos o usar el micrófono para dictar. ¿En qué puedo asistirte hoy?",
    timestamp: "09:00",
  },
];

export function ChatIAMedicoPage() {
  const [mensajes, setMensajes] = useState<Mensaje[]>(mensajesIniciales);
  const [mensajeActual, setMensajeActual] = useState("");
  const [escribiendo, setEscribiendo] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [archivosAdjuntos, setArchivosAdjuntos] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [mensajes]);

  // --- SOLUCIÓN DEFINITIVA ANTI-DUPLICACIÓN ---
  const enviarMensaje = async () => {
    if (!mensajeActual.trim() && archivosAdjuntos.length === 0) return;

    const contenidoUsuario = mensajeActual;
    const nuevoMensajeUsuario: Mensaje = {
      id: Date.now(),
      tipo: "usuario",
      contenido: contenidoUsuario,
      timestamp: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
    };

    const mensajeBotInicial: Mensaje = {
      id: Date.now() + 1,
      tipo: "bot",
      contenido: "",
      timestamp: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
    };

    setMensajes((prev) => [...prev, nuevoMensajeUsuario, mensajeBotInicial]);
    setMensajeActual("");
    setArchivosAdjuntos([]);
    setEscribiendo(true);

    const BACKEND_URL = "http://127.0.0.1:8000";

    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/reportes/generar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "text/event-stream"
        },
        body: JSON.stringify({
          paciente_id: "00000000-0000-0000-0000-000000000000", // UUID válido para chat demo
          tipo_estudio: "Consulta General desde Chat",
          contexto_clinico: contenidoUsuario,
          radiologo: "IA Médico Asistente", // Campo requerido
          incluir_contexto_rag: true,
          temperatura: 0.7
        }),
      });

      if (!response.body) {
        throw new Error("La respuesta del servidor no tiene un cuerpo para leer (stream).");
      }
      
      setEscribiendo(false);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      // PARSER SSE ROBUSTO - SOLUCIÓN DEFINITIVA
      let eventBuffer = "";  // Búfer para eventos SSE
      let contentAccumulator = "";  // Acumulador para contenido del mensaje
      
      const processRobustStream = async () => {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          
          // Añadir chunk crudo al búfer de eventos
          eventBuffer += decoder.decode(value, { stream: true });

          // Procesar TODOS los eventos SSE completos disponibles
          let eventBoundary;
          while ((eventBoundary = eventBuffer.indexOf('\n\n')) >= 0) {
            // Extraer evento completo
            const completeSSEEvent = eventBuffer.substring(0, eventBoundary);
            eventBuffer = eventBuffer.substring(eventBoundary + 2);

            // Procesar solo eventos 'data:'
            if (completeSSEEvent.startsWith('data: ')) {
              const eventContent = completeSSEEvent.substring(6).trim();
              
              // Ignorar eventos de control
              if (eventContent && !eventContent.startsWith('[DONE]')) {
                try {
                  const parsedEvent = JSON.parse(eventContent);
                  const deltaText = parsedEvent.choices?.[0]?.delta?.content || "";
                  
                  // Acumular contenido (NO actualizar UI todavía)
                  if (deltaText) {
                    contentAccumulator += deltaText;
                  }
                } catch (parseError) {
                  console.error("Error parsing SSE event:", eventContent, parseError);
                }
              }
            }
          }

          // ACTUALIZACIÓN ATÓMICA: Solo UNA vez por chunk de red
          if (contentAccumulator.length > 0) {
            const finalContent = contentAccumulator;
            contentAccumulator = ""; // Reset para siguiente iteración
            
            // Una sola actualización de estado por chunk procesado
            setMensajes(prev => {
              const updatedMessages = [...prev];
              const lastBotMessage = updatedMessages[updatedMessages.length - 1];
              if (lastBotMessage && lastBotMessage.tipo === 'bot') {
                lastBotMessage.contenido += finalContent;
              }
              return updatedMessages;
            });
          }
        }
      };
      
      await processRobustStream();

    } catch (error) {
      console.error("Error al comunicarse con el backend:", error);
      setMensajes(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage && lastMessage.tipo === 'bot') {
          lastMessage.contenido = "Lo siento, hubo un error al conectar con el asistente de IA. Por favor, inténtalo de nuevo más tarde.";
        }
        return newMessages;
      });
    } finally {
      setEscribiendo(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setArchivosAdjuntos((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setArchivosAdjuntos((prev) => prev.filter((_, i) => i !== index));
  };

  const startRecording = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setMensajeActual((prev) => prev + " [Texto dictado por voz]");
    }, 3000);
  };

  return (
    <SidebarInset>
      <div className="flex h-screen flex-col">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-foreground">Chat IA Médico</h1>
            <p className="text-sm text-muted-foreground">
              Asistente inteligente para consultas médicas y análisis radiológico
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Hoy: {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 flex flex-col">
            {/* ÁREA DE SCROLL INDEPENDIENTE */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full p-4" ref={scrollAreaRef as any}>
                <div className="space-y-4 max-w-4xl mx-auto pb-4">
                  {mensajes.map((mensaje) => (
                    <div
                      key={mensaje.id}
                      className={`flex gap-3 ${mensaje.tipo === "usuario" ? "justify-end" : "justify-start"}`}
                    >
                      {mensaje.tipo === "bot" && (
                        <Avatar className="w-8 h-8 shrink-0">
                          <AvatarFallback className="bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300">
                            <Bot className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          mensaje.tipo === "usuario" ? "bg-teal-600 text-white" : "bg-muted text-foreground"
                        }`}
                      >
                        <div className="whitespace-pre-wrap text-sm">{mensaje.contenido}</div>
                        {mensaje.archivos && mensaje.archivos.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {mensaje.archivos.map((archivo, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 text-xs bg-black/10 dark:bg-white/10 rounded p-1"
                              >
                                {archivo.tipo.startsWith("image/") ? (
                                  <ImageIcon className="w-3 h-3" />
                                ) : archivo.tipo.startsWith("video/") ? (
                                  <VideoIcon className="w-3 h-3" />
                                ) : (
                                  <Paperclip className="w-3 h-3" />
                                )}
                                <span>{archivo.nombre}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        <div
                          className={`text-xs mt-1 ${
                            mensaje.tipo === "usuario" ? "text-teal-100" : "text-muted-foreground"
                          }`}
                        >
                          {mensaje.timestamp}
                        </div>
                      </div>
                      {mensaje.tipo === "usuario" && (
                        <Avatar className="w-8 h-8 shrink-0">
                          <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                            <User className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  {escribiendo && (
                    <div className="flex gap-3 justify-start">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300">
                          <Bot className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                          <span className="text-sm text-muted-foreground ml-2">IA está analizando...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* BARRA DE ENTRADA FIJA */}
            <div className="flex-shrink-0">
              {archivosAdjuntos.length > 0 && (
                <div className="border-t p-2 bg-muted/30">
                  <div className="max-w-4xl mx-auto">
                    <div className="flex flex-wrap gap-2">
                      {archivosAdjuntos.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 bg-background border rounded-lg p-2 text-sm">
                          {file.type.startsWith("image/") ? (
                            <ImageIcon className="w-4 h-4 text-blue-500" />
                          ) : file.type.startsWith("video/") ? (
                            <VideoIcon className="w-4 h-4 text-purple-500" />
                          ) : (
                            <Paperclip className="w-4 h-4 text-gray-500" />
                          )}
                          <span className="text-foreground">{file.name}</span>
                          <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                            <XIcon className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t p-4 bg-background">
                <div className="max-w-4xl mx-auto">
                  <div className="flex gap-2">
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="px-2">
                        <Paperclip className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => imageInputRef.current?.click()} className="px-2">
                        <ImageIcon className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => videoInputRef.current?.click()} className="px-2">
                        <VideoIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={isRecording ? "destructive" : "outline"}
                        size="sm"
                        onClick={startRecording}
                        className="px-2"
                        disabled={isRecording}
                      >
                        {isRecording ? <MicOffIcon className="w-4 h-4" /> : <MicIcon className="w-4 h-4" />}
                      </Button>
                    </div>
                    <Input
                      value={mensajeActual}
                      onChange={(e) => setMensajeActual(e.target.value)}
                      placeholder={
                        isRecording ? "🎤 Grabando... Habla ahora" : "Escribe tu consulta médica o adjunta archivos..."
                      }
                      onKeyPress={(e) => e.key === "Enter" && enviarMensaje()}
                      className="flex-1 bg-background text-foreground"
                      disabled={isRecording}
                    />
                    <Button
                      onClick={enviarMensaje}
                      disabled={(!mensajeActual.trim() && archivosAdjuntos.length === 0) || escribiendo || isRecording}
                      className="bg-teal-600 hover:bg-teal-700"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  {isRecording && (
                    <div className="mt-2 text-center">
                      <span className="text-sm text-red-600 dark:text-red-400">
                        🔴 Grabando... Habla claramente para transcribir tu consulta
                      </span>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.txt,.dicom,.dcm"
                />
                <input
                  ref={imageInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                  accept="image/*"
                />
                <input
                  ref={videoInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                  accept="video/*"
                />
              </div>
            </div>
          </div>

          {/* SIDEBAR SIMPLIFICADA */}
          <div className="w-80 border-l bg-muted/30 hidden flex-col lg:flex">
            <div className="p-4 border-b bg-background/50">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Chat IA Médico
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Herramientas y accesos rápidos</p>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-foreground">Acceso Rápido</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start bg-transparent" asChild>
                      <a href="/estudios">
                        <FileImage className="w-4 h-4 mr-2" />
                        Estudios Pendientes
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start bg-transparent" asChild>
                      <a href="/pacientes">
                        <Users className="w-4 h-4 mr-2" />
                        Gestionar Pacientes
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start bg-transparent" asChild>
                      <a href="/ia/dicom">
                        <Activity className="w-4 h-4 mr-2" />
                        Visor DICOM
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
            <div className="p-2 border-t bg-background/50 text-center">
              <p className="text-xs text-muted-foreground">⬆️ Desliza para ver más opciones ⬆️</p>
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}