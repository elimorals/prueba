"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
  Square,
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
  const [generando, setGenerando] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcribiendo, setTranscribiendo] = useState(false);
  const [transcripcion, setTranscripcion] = useState("");
  const [archivosAdjuntos, setArchivosAdjuntos] = useState<File[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [mensajes]);

  // Auto-scroll adicional durante la generación para seguir el texto
  useEffect(() => {
    if (generando && scrollAreaRef.current) {
      const scrollToBottom = () => {
        scrollAreaRef.current?.scrollTo({
          top: scrollAreaRef.current.scrollHeight,
          behavior: "smooth",
        });
      };
      
      // Scroll inmediato y luego cada 100ms durante la generación
      scrollToBottom();
      const interval = setInterval(scrollToBottom, 100);
      
      return () => clearInterval(interval);
    }
  }, [generando, mensajes]);

  // Detectar si estamos en móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Función para convertir archivo a base64
  const convertirArchivoABase64 = (archivo: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Extraer solo la parte base64, sin el prefijo "data:..."
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(archivo);
    });
  };

  // Función para parar la generación
  const pararGeneracion = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setGenerando(false);
      setEscribiendo(false);
      
      // Eliminar el último mensaje del bot (que estaba siendo generado)
      setMensajes(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage && lastMessage.tipo === "bot" && lastMessage.contenido === "") {
          // Si el último mensaje es un placeholder vacío del bot, eliminarlo
          return prev.slice(0, -1);
        } else if (lastMessage && lastMessage.tipo === "bot") {
          // Si el último mensaje del bot tiene contenido parcial, eliminarlo también
          return prev.slice(0, -1);
        }
        return prev;
      });
    }
  };

// --- SOLUCIÓN REFACTORIZADA CON SOPORTE PARA IMÁGENES Y CONTROL DE PARADA ---
const enviarMensaje = async () => {
  if (!mensajeActual.trim() && archivosAdjuntos.length === 0) return;

  const contenidoUsuario = mensajeActual;
  const archivosInfo = archivosAdjuntos.map(file => ({ tipo: file.type, nombre: file.name }));

  // 1. Crear el mensaje del usuario y UN ÚNICO placeholder para el bot.
  const nuevoMensajeUsuario: Mensaje = {
    id: Date.now(),
    tipo: "usuario",
    contenido: contenidoUsuario,
    timestamp: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
    archivos: archivosInfo.length > 0 ? archivosInfo : undefined,
  };

  const mensajeBotPlaceholder: Mensaje = {
    id: Date.now() + 1, // ID único para el placeholder
    tipo: "bot",
    contenido: "", // Contenido vacío que se llenará con el stream
    timestamp: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
  };

  // 2. Actualizar el estado UNA SOLA VEZ con los nuevos mensajes.
  setMensajes((prev) => [...prev, nuevoMensajeUsuario, mensajeBotPlaceholder]);
  setMensajeActual("");
  setArchivosAdjuntos([]);
  setTranscripcion(""); // Limpiar transcripción anterior
  setEscribiendo(true);

  // 3. Crear AbortController para poder cancelar la petición
  const abortController = new AbortController();
  abortControllerRef.current = abortController;

  try {
    const TGI_URL = "https://dbrmcpr7fjvk2cz6.us-east-1.aws.endpoints.huggingface.cloud";
    
    // Preparar mensajes para el LLM
    let mensajes_para_llm = [
      { role: "system", content: "Eres un asistente médico experto en radiología y medicina general. Puedes analizar imágenes médicas, responder consultas clínicas y ayudar con diagnósticos. Siempre responde en español de manera profesional y detallada." }
    ];

    // Si hay imágenes adjuntas, usar formato multimodal si es soportado, sino usar el backend
    if (archivosAdjuntos.some(file => file.type.startsWith('image/'))) {
      const imagenesBase64 = [];
      
      for (const archivo of archivosAdjuntos) {
        if (archivo.type.startsWith('image/')) {
          try {
            const base64 = await convertirArchivoABase64(archivo);
            imagenesBase64.push(base64);
          } catch (error) {
            console.error("Error convirtiendo imagen a base64:", error);
          }
        }
      }

      if (imagenesBase64.length > 0) {
        // Intentar formato multimodal OpenAI-compatible
        const contenido_multimodal: any = [
          {
            type: "text",
            text: contenidoUsuario || "Analiza esta imagen médica y proporciona un análisis detallado."
          }
        ];

        // Añadir cada imagen
        imagenesBase64.forEach(base64 => {
          contenido_multimodal.push({
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64}`
            }
          });
        });

        mensajes_para_llm.push({
          role: "user",
          content: contenido_multimodal
        });
      } else {
        // Solo texto si no se pudieron procesar las imágenes
        mensajes_para_llm.push({
          role: "user",
          content: contenidoUsuario
        });
      }
    } else {
      // Solo texto si no hay imágenes
      mensajes_para_llm.push({
        role: "user",
        content: contenidoUsuario
      });
    }
    
    const response = await fetch(`${TGI_URL}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "tgi",
        messages: mensajes_para_llm,
        stream: true,
        max_tokens: 2048,
        temperature: 0.7,
      }),
      signal: abortController.signal, // Permitir cancelación
    });

    if (!response.ok) {
      throw new Error(`Error en la API: ${response.status} ${response.statusText}`);
    }
    if (!response.body) {
      throw new Error("La respuesta del servidor no tiene un cuerpo para leer (stream).");
    }

    setEscribiendo(false); // La IA ya no está "pensando", ahora está "escribiendo"
    setGenerando(true);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      // Verificar si fue cancelado
      if (abortController.signal.aborted) {
        reader.cancel();
        throw new Error("Generación cancelada por el usuario");
      }

      buffer += decoder.decode(value, { stream: true });

      let boundaryIndex;
      while ((boundaryIndex = buffer.indexOf('\n\n')) >= 0) {
        const message = buffer.substring(0, boundaryIndex);
        buffer = buffer.substring(boundaryIndex + 2);

        if (message.startsWith('data: ')) {
          const dataStr = message.substring(6);

          if (dataStr.trim() === '[DONE]') {
            return; // Stream finalizado correctamente
          }

          try {
            const jsonData = JSON.parse(dataStr);
            const content = jsonData.choices?.[0]?.delta?.content || "";
            
            if (content) {
              // 3. Actualizar SIEMPRE el último mensaje. El estado es ahora predecible.
              setMensajes(prev => 
                prev.map(msg => 
                  msg.id === mensajeBotPlaceholder.id 
                    ? { ...msg, contenido: msg.contenido + content } 
                    : msg
                )
              );
            }
          } catch (e) {
            console.error("Error al parsear chunk JSON del stream:", dataStr, e);
          }
        }
      }
    }
  } catch (error: any) {
    console.error("Error al obtener la respuesta del stream:", error);
    
    let mensajeError = "Lo siento, ocurrió un error al generar la respuesta. Por favor, inténtalo de nuevo.";
    if (error.name === 'AbortError' || error.message.includes('cancelada')) {
      mensajeError = "Generación detenida por el usuario.";
    }
    
    // 4. En caso de error, encontrar y actualizar el placeholder con un mensaje de error.
    setMensajes(prev =>
      prev.map(msg =>
        msg.id === mensajeBotPlaceholder.id
          ? { ...msg, contenido: mensajeError }
          : msg
      )
    );
  } finally {
    setEscribiendo(false);
    setGenerando(false);
    abortControllerRef.current = null;
  }
};

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setArchivosAdjuntos((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setArchivosAdjuntos((prev) => prev.filter((_, i) => i !== index));
  };

  // Función para transcribir audio usando Whisper Turbo
  const transcribirAudio = async (audioBlob: Blob): Promise<string> => {
    try {
      setTranscribiendo(true);
      
      // Convertir blob a base64
      const base64Audio = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Extraer solo la parte base64
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });

      // Llamar a la API de Whisper Turbo
      const response = await fetch("https://a4kyk2wtbfpq3al9.us-east-1.aws.endpoints.huggingface.cloud", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: base64Audio,
          parameters: {}
        })
      });

      if (!response.ok) {
        throw new Error(`Error en la API de Whisper: ${response.status}`);
      }

      const result = await response.json();
      
      // Extraer el texto de la respuesta
      let textoTranscrito = "";
      if (result && typeof result === 'object') {
        if (result.text) {
          textoTranscrito = result.text;
        } else if (Array.isArray(result) && result.length > 0 && result[0].text) {
          textoTranscrito = result[0].text;
        } else if (typeof result === 'string') {
          textoTranscrito = result;
        }
      }

      return textoTranscrito || "No se pudo transcribir el audio";
      
    } catch (error) {
      console.error("Error en transcripción:", error);
      return "Error al transcribir el audio";
    } finally {
      setTranscribiendo(false);
    }
  };

  const startRecording = async () => {
    try {
      // Solicitar permisos de micrófono
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      setIsRecording(true);
      setTranscripcion("");
      audioChunksRef.current = [];

      // Configurar MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm' // Formato compatible
      });
      
      mediaRecorderRef.current = mediaRecorder;

      // Recopilar chunks de audio
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Cuando termine la grabación
      mediaRecorder.onstop = async () => {
        // Combinar chunks en un blob
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Transcribir el audio
        const textoTranscrito = await transcribirAudio(audioBlob);
        
        // Añadir al input
        setMensajeActual(prev => {
          const nuevoTexto = prev + (prev ? " " : "") + textoTranscrito;
          return nuevoTexto;
        });
        
        setTranscripcion(textoTranscrito);
        
        // Limpiar el stream
        stream.getTracks().forEach(track => track.stop());
      };

      // Iniciar grabación
      mediaRecorder.start();
      
    } catch (error) {
      console.error("Error al acceder al micrófono:", error);
      setIsRecording(false);
      alert("No se pudo acceder al micrófono. Asegúrate de dar permisos.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <SidebarInset>
      <div className="flex min-h-screen flex-col ios-fix">
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
                <div className={`space-y-4 max-w-4xl mx-auto pb-4 ${isMobile ? 'pb-32' : ''}`}>
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
                        className={`max-w-[85%] sm:max-w-[70%] rounded-lg p-3 ${
                          mensaje.tipo === "usuario" ? "bg-teal-600 text-white" : "bg-muted text-foreground"
                        }`}
                      >
                        <div className="text-sm sm:text-base break-words">
                          <div className={`prose prose-sm max-w-none ${
                              mensaje.tipo === "usuario" 
                                ? "prose-invert [&_*]:text-white [&_strong]:text-white [&_em]:text-white [&_code]:text-white [&_pre]:bg-black/20 [&_blockquote]:text-white/90"
                                : "dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-em:text-foreground prose-code:text-foreground prose-code:bg-muted/50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-muted prose-pre:text-foreground prose-blockquote:text-muted-foreground prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground"
                            }`}>
                            <ReactMarkdown 
                              remarkPlugins={[remarkGfm]}
                            components={{
                              // Personalizar componentes para mejor integración
                              h1: ({children}) => <h1 className="text-lg font-bold mb-2 mt-4 first:mt-0">{children}</h1>,
                              h2: ({children}) => <h2 className="text-base font-bold mb-2 mt-3 first:mt-0">{children}</h2>,
                              h3: ({children}) => <h3 className="text-sm font-bold mb-1 mt-2 first:mt-0">{children}</h3>,
                              p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                              ul: ({children}) => <ul className="mb-2 pl-4 space-y-1">{children}</ul>,
                              ol: ({children}) => <ol className="mb-2 pl-4 space-y-1">{children}</ol>,
                              li: ({children}) => <li className="text-sm">{children}</li>,
                              code: ({children, className}) => {
                                const isInline = !className;
                                return isInline ? (
                                  <code className={`${mensaje.tipo === "usuario" ? "bg-black/20 text-white" : "bg-muted/70 text-foreground"} px-1 py-0.5 rounded text-xs font-mono`}>
                                    {children}
                                  </code>
                                ) : (
                                  <code className={className}>{children}</code>
                                );
                              },
                              pre: ({children}) => (
                                <pre className={`${mensaje.tipo === "usuario" ? "bg-black/20" : "bg-muted"} p-3 rounded-md overflow-x-auto text-xs mb-2`}>
                                  {children}
                                </pre>
                              ),
                              blockquote: ({children}) => (
                                <blockquote className={`border-l-4 ${mensaje.tipo === "usuario" ? "border-white/30 text-white/90" : "border-muted-foreground/30 text-muted-foreground"} pl-4 italic my-2`}>
                                  {children}
                                </blockquote>
                              ),
                            }}
                            >
                              {mensaje.contenido}
                            </ReactMarkdown>
                          </div>
                        </div>
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
                  {(escribiendo || generando) && (
                    <div className="flex gap-3 justify-start">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300">
                          <Bot className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex items-center gap-2">
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
                            <span className="text-sm text-muted-foreground ml-2">
                              {escribiendo ? "IA está analizando..." : "IA está generando respuesta..."}
                            </span>
                          </div>

                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* BARRA DE ENTRADA FIJA */}
            <div className="flex-shrink-0 md:relative ios-input-container">
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

              <div 
                className={`border-t p-2 sm:p-4 bg-background ${isMobile ? 'fixed bottom-0 left-0 right-0 z-50' : ''}`}
                style={{ 
                  paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))'
                }}
              >
                <div className="max-w-4xl mx-auto">
                  {/* Input responsive - Stack en móvil */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    {/* Toolbar de adjuntos - Scroll horizontal en móvil */}
                    <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0 mobile-scroll order-2 sm:order-1">
                      <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="px-2 tap-target flex-shrink-0">
                        <Paperclip className="w-4 h-4" />
                        <span className="ml-1 hidden sm:inline text-xs">Archivo</span>
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => imageInputRef.current?.click()} className="px-2 tap-target flex-shrink-0">
                        <ImageIcon className="w-4 h-4" />
                        <span className="ml-1 hidden sm:inline text-xs">Imagen</span>
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => videoInputRef.current?.click()} className="px-2 tap-target flex-shrink-0">
                        <VideoIcon className="w-4 h-4" />
                        <span className="ml-1 hidden sm:inline text-xs">Video</span>
                      </Button>
                      <Button
                        variant={isRecording ? "destructive" : "outline"}
                        size="sm"
                        onClick={isRecording ? stopRecording : startRecording}
                        className="px-2 tap-target flex-shrink-0"
                        disabled={transcribiendo}
                      >
                        {transcribiendo ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : isRecording ? (
                          <MicOffIcon className="w-4 h-4" />
                        ) : (
                          <MicIcon className="w-4 h-4" />
                        )}
                        <span className="ml-1 hidden sm:inline text-xs">
                          {transcribiendo ? "Procesando" : isRecording ? "Detener" : "Voz"}
                        </span>
                      </Button>
                      {generando && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={pararGeneracion}
                          className="px-2 tap-target flex-shrink-0"
                        >
                          <Square className="w-4 h-4" />
                          <span className="ml-1 hidden sm:inline text-xs">Parar</span>
                        </Button>
                      )}
                    </div>
                    
                    {/* Input principal */}
                    <div className="flex gap-2 flex-1 order-1 sm:order-2">
                      <Input
                        value={mensajeActual}
                        onChange={(e) => setMensajeActual(e.target.value)}
                        placeholder={
                          isRecording 
                            ? "🎤 Grabando audio..." 
                            : transcribiendo 
                            ? "🤖 Transcribiendo con Whisper..." 
                            : "Escribe tu consulta médica..."
                        }
                        onKeyPress={(e) => e.key === "Enter" && enviarMensaje()}
                        className="flex-1 bg-background text-foreground text-base min-h-[44px]"
                        disabled={isRecording || transcribiendo}
                        style={{ fontSize: '16px' }} // Evita zoom en iOS
                      />
                      <Button
                        onClick={enviarMensaje}
                        disabled={(!mensajeActual.trim() && archivosAdjuntos.length === 0) || escribiendo || generando || isRecording || transcribiendo}
                        className="bg-teal-600 hover:bg-teal-700 tap-target px-3"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {(isRecording || transcribiendo) && (
                    <div className="mt-2 text-center">
                      <span className={`text-sm ${
                        isRecording 
                          ? "text-red-600 dark:text-red-400" 
                          : "text-blue-600 dark:text-blue-400"
                      }`}>
                        {isRecording && "🔴 Grabando... Habla claramente para transcribir tu consulta"}
                        {transcribiendo && "🤖 Transcribiendo audio con Whisper Turbo..."}
                      </span>
                    </div>
                  )}
                  {transcripcion && !isRecording && !transcribiendo && (
                    <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                      <div className="text-xs text-green-800 dark:text-green-200 font-medium mb-1">
                        ✅ Transcripción completada:
                      </div>
                      <div className="text-sm text-green-900 dark:text-green-100 italic">
                        "{transcripcion}"
                      </div>
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