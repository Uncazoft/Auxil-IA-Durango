import { GoogleGenerativeAI } from '@google/generative-ai';
import { envConfig } from '../config/environment.js';
import { SYSTEM_INSTRUCTION, MODEL_CONFIG, ERROR_MESSAGES } from '../config/constants.js';

export class GeminiService {
  constructor() {
    try {
      this.apiKey = envConfig.getGeminiApiKey();
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = this.genAI.getGenerativeModel({ 
        model: MODEL_CONFIG.model,
        generationConfig: {
          temperature: MODEL_CONFIG.temperature,
          topK: MODEL_CONFIG.topK,
          topP: MODEL_CONFIG.topP,
          maxOutputTokens: MODEL_CONFIG.maxOutputTokens,
        },
      });
      this.chatSessions = new Map();
    } catch (error) {
      console.error('Error en inicialización de Gemini:', error.message);
      throw error;
    }
  }

  async startMedicalChat(sessionId) {
    try {
      const chat = this.model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: SYSTEM_INSTRUCTION }]
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
      
      return {
        success: true,
        sessionId,
        message: 'Sesión de emergencia médica iniciada',
        model: MODEL_CONFIG.model
      };

    } catch (error) {
      throw this.handleGeminiError(error);
    }
  }

  async sendMedicalMessage(sessionId, userMessage) {
    try {
      const chat = this.chatSessions.get(sessionId);
      
      if (!chat) {
        await this.startMedicalChat(sessionId);
        const newChat = this.chatSessions.get(sessionId);
        return await this.sendMessageToChat(newChat, userMessage, sessionId);
      }

      return await this.sendMessageToChat(chat, userMessage, sessionId);

    } catch (error) {
      throw this.handleGeminiError(error);
    }
  }

  async sendMessageToChat(chat, userMessage, sessionId) {
    try {
      const result = await chat.sendMessage(userMessage);
      const response = await result.response;
      const text = response.text();
      
      return {
        success: true,
        response: text,
        shouldEndSession: this.shouldEndSession(userMessage, text),
        timestamp: new Date().toISOString(),
        model: MODEL_CONFIG.model
      };

    } catch (error) {
      throw this.handleGeminiError(error);
    }
  }

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
        model: MODEL_CONFIG.model
      };
    } catch (error) {
      throw this.handleGeminiError(error);
    }
  }

  endMedicalSession(sessionId) {
    try {
      const existed = this.chatSessions.delete(sessionId);
      
      return {
        success: true,
        sessionEnded: existed,
        message: existed ? 'Sesión finalizada correctamente' : 'Sesión no encontrada'
      };
    } catch (error) {
      throw this.handleGeminiError(error);
    }
  }

  handleGeminiError(error) {
    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('401')) {
      return new Error(ERROR_MESSAGES.INVALID_API_KEY);
    } else if (error.message?.includes('404') || error.message?.includes('NOT_FOUND')) {
      return new Error('Modelo de Gemini no encontrado. Verifica la disponibilidad.');
    } else if (error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED')) {
      return new Error(ERROR_MESSAGES.RATE_LIMIT);
    } else if (error.message?.includes('503') || error.message?.includes('UNAVAILABLE')) {
      return new Error('Servicio de Gemini no disponible temporalmente');
    } else if (error.message?.includes('500')) {
      return new Error('Error interno del servidor de Google AI');
    }

    return new Error(ERROR_MESSAGES.API_ERROR);
  }

  shouldEndSession(userMessage, aiResponse) {
    const endKeywords = ['gracias', 'thank you', 'terminar', 'end', 'listo', 'done', 'adiós', 'bye', 'finalizar'];
    const userMessageLower = userMessage.toLowerCase();
    
    return endKeywords.some(keyword => userMessageLower.includes(keyword)) ||
           aiResponse.toLowerCase().includes('resumen') ||
           aiResponse.toLowerCase().includes('emergency services') ||
           aiResponse.toLowerCase().includes('servicios de emergencia');
  }

  cleanupOldSessions(maxAgeHours = 24) {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [sessionId] of this.chatSessions.entries()) {
      this.chatSessions.delete(sessionId);
      cleanedCount++;
    }

    if (cleanedCount > 0) {
      console.log(`Limpiadas ${cleanedCount} sesiones antiguas`);
    }
  }

  async healthCheck() {
    try {
      const testAI = new GoogleGenerativeAI(this.apiKey);
      const testModel = testAI.getGenerativeModel({ model: MODEL_CONFIG.model });
      
      const result = await testModel.generateContent('Test de conexión - responde con OK');
      const response = await result.response;
      
      return {
        success: true,
        status: 'healthy',
        model: MODEL_CONFIG.model,
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

export const geminiService = new GeminiService();
