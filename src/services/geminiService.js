import { GoogleGenerativeAI } from '@google/generative-ai';
import { envConfig } from '../config/environment.js';
import { SYSTEM_INSTRUCTION, MODEL_CONFIG, ERROR_MESSAGES } from '../config/constants.js';

/**
 * Servicio profesional para interactuar con Gemini 2.0 Flash
 * Optimizado para la versión funcional del modelo
 */
export class GeminiService {
  constructor() {
    console.log('🔄 Inicializando GeminiService con modelo 2.0 Flash...');
    
    try {
      // 1. Obtener API Key
      this.apiKey = envConfig.getGeminiApiKey();
      console.log('🔑 API Key obtenida correctamente');

      // 2. Crear instancia de Google AI
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      console.log('✅ Instancia GoogleGenerativeAI creada');

      // 3. Configurar modelo Gemini 2.0 Flash
      console.log('🎯 Configurando modelo: gemini-2.0-flash');
      
      this.model = this.genAI.getGenerativeModel({ 
        model: MODEL_CONFIG.model,
        generationConfig: {
          temperature: MODEL_CONFIG.temperature,
          topK: MODEL_CONFIG.topK,
          topP: MODEL_CONFIG.topP,
          maxOutputTokens: MODEL_CONFIG.maxOutputTokens,
        },
        // System instruction para Gemini 2.0
        systemInstruction: {
          role: "system",
          parts: [{ text: SYSTEM_INSTRUCTION }]
        }
      });

      console.log('✅ Modelo gemini-2.0-flash configurado exitosamente');

      // 4. Inicializar sistema de sesiones
      this.chatSessions = new Map();
      console.log('✅ Sistema de sesiones inicializado');

      console.log('🎉 GeminiService 2.0 inicializado correctamente');

    } catch (error) {
      console.error('❌ Error crítico en inicialización de Gemini:', error.message);
      throw error;
    }
  }

  /**
   * Inicia una nueva sesión de chat médico con Gemini 2.0
   */
  async startMedicalChat(sessionId) {
    try {
      console.log(`🩺 Iniciando sesión médica [${sessionId}] con Gemini 2.0...`);
      
      // Crear chat con configuración optimizada para Gemini 2.0
      const chat = this.model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: "Inicia como asistente médico de emergencias. Pregunta primero por la situación." }]
          },
          {
            role: "model",
            parts: [{ text: "Entendido. Soy tu asistente médico virtual de emergencias. ¿Qué ha ocurrido? Por favor, describe la situación médica o emergencia." }]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 1024,
        }
      });

      this.chatSessions.set(sessionId, chat);
      
      console.log(`✅ Sesión médica [${sessionId}] iniciada correctamente`);
      
      return {
        success: true,
        sessionId,
        message: 'Sesión de emergencia médica iniciada',
        model: 'gemini-2.0-flash'
      };

    } catch (error) {
      console.error('💥 Error iniciando chat médico:', error);
      throw this.handleGeminiError(error);
    }
  }

  /**
   * Envía un mensaje a la sesión médica existente
   */
  async sendMedicalMessage(sessionId, userMessage) {
    console.log(`💬 [${sessionId}] Enviando mensaje: ${userMessage.substring(0, 50)}...`);
    
    try {
      const chat = this.chatSessions.get(sessionId);
      
      if (!chat) {
        console.log('🆕 Sesión no encontrada, creando nueva...');
        await this.startMedicalChat(sessionId);
        const newChat = this.chatSessions.get(sessionId);
        return await this.sendMessageToChat(newChat, userMessage, sessionId);
      }

      return await this.sendMessageToChat(chat, userMessage, sessionId);

    } catch (error) {
      console.error(`💥 Error en comunicación médica [${sessionId}]:`, error.message);
      throw this.handleGeminiError(error);
    }
  }

  /**
   * Método auxiliar para enviar mensajes al chat
   */
  async sendMessageToChat(chat, userMessage, sessionId) {
    try {
      console.log('🚀 Enviando mensaje a Gemini 2.0...');
      const result = await chat.sendMessage(userMessage);
      console.log('✅ Mensaje enviado, procesando respuesta...');
      
      const response = await result.response;
      const text = response.text();
      
      console.log(`📝 Gemini 2.0 respondió [${text.length} chars]: ${text.substring(0, 100)}...`);
      
      return {
        success: true,
        response: text,
        shouldEndSession: this.shouldEndSession(userMessage, text),
        timestamp: new Date().toISOString(),
        model: 'gemini-2.0-flash'
      };

    } catch (error) {
      console.error('💥 Error enviando mensaje al chat:', error);
      throw this.handleGeminiError(error);
    }
  }

  /**
   * Obtiene el historial completo de una sesión
   */
  async getChatHistory(sessionId) {
    try {
      const chat = this.chatSessions.get(sessionId);
      
      if (!chat) {
        throw new Error('Sesión no encontrada');
      }

      const history = await chat.getHistory();
      
      return {
        success: true,
        history: history.map(entry => ({
          role: entry.role,
          parts: entry.parts.map(part => part.text),
          timestamp: new Date().toISOString()
        })),
        model: 'gemini-2.0-flash'
      };
    } catch (error) {
      console.error('Error obteniendo historial:', error);
      throw this.handleGeminiError(error);
    }
  }

  /**
   * Finaliza una sesión médica
   */
  endMedicalSession(sessionId) {
    try {
      const existed = this.chatSessions.delete(sessionId);
      
      console.log(`🔚 Sesión [${sessionId}] ${existed ? 'finalizada' : 'no encontrada'}`);
      
      return {
        success: true,
        sessionEnded: existed,
        message: existed ? 'Sesión finalizada correctamente' : 'Sesión no encontrada'
      };
    } catch (error) {
      console.error('Error finalizando sesión:', error);
      throw this.handleGeminiError(error);
    }
  }

  /**
   * Manejo profesional de errores de Gemini
   */
  handleGeminiError(error) {
    console.error('🔴 Error Gemini 2.0:', error.message);

    // Análisis detallado de errores específicos
    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('401')) {
      return new Error(ERROR_MESSAGES.INVALID_API_KEY);
    } else if (error.message?.includes('404') || error.message?.includes('NOT_FOUND')) {
      return new Error('Modelo gemini-2.0-flash no encontrado. Verifica la disponibilidad.');
    } else if (error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED')) {
      return new Error(ERROR_MESSAGES.RATE_LIMIT);
    } else if (error.message?.includes('503') || error.message?.includes('UNAVAILABLE')) {
      return new Error('Servicio de Gemini no disponible temporalmente');
    } else if (error.message?.includes('500')) {
      return new Error('Error interno del servidor de Google AI');
    }

    return new Error(ERROR_MESSAGES.API_ERROR);
  }

  /**
   * Detecta si la sesión debe terminar basado en palabras clave
   */
  shouldEndSession(userMessage, aiResponse) {
    const endKeywords = ['gracias', 'thank you', 'terminar', 'end', 'listo', 'done', 'adiós', 'bye', 'finalizar'];
    const userMessageLower = userMessage.toLowerCase();
    
    return endKeywords.some(keyword => userMessageLower.includes(keyword)) ||
           aiResponse.toLowerCase().includes('resumen') ||
           aiResponse.toLowerCase().includes('emergency services') ||
           aiResponse.toLowerCase().includes('servicios de emergencia');
  }

  /**
   * Limpieza de sesiones antiguas
   */
  cleanupOldSessions(maxAgeHours = 24) {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [sessionId] of this.chatSessions.entries()) {
      // En producción, aquí iría la lógica de verificación de tiempo
      this.chatSessions.delete(sessionId);
      cleanedCount++;
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Limpiadas ${cleanedCount} sesiones antiguas`);
    }
  }

  /**
   * Verificación de salud del servicio
   */
  async healthCheck() {
    try {
      const testAI = new GoogleGenerativeAI(this.apiKey);
      const testModel = testAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      const result = await testModel.generateContent('Test de conexión - responde con OK');
      const response = await result.response;
      
      return {
        success: true,
        status: 'healthy',
        model: 'gemini-2.0-flash',
        response: response.text()
      };
    } catch (error) {
      return {
        success: false,
        status: 'unhealthy',
        error: error.message
      };
    }
  }
}

// Instancia singleton del servicio
export const geminiService = new GeminiService();