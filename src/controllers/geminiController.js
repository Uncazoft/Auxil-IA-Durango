import { geminiService } from '../services/geminiService.js';

/**
 * Controlador para manejar las solicitudes del asistente médico con Gemini 2.0
 */
export class GeminiController {
  
  /**
   * Inicia una nueva sesión médica
   */
  async startSession(req, res) {
    try {
      const { sessionId = `med_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` } = req.body;

      console.log('🚀 Solicitando inicio de sesión médica...');
      const result = await geminiService.startMedicalChat(sessionId);

      res.json({
        success: true,
        ...result,
        instructions: 'Sesión de asistencia médica de emergencia iniciada. Por favor, describe la situación.',
        model: 'gemini-2.0-flash'
      });
    } catch (error) {
      console.error('Error en startSession:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        code: 'SESSION_START_FAILED',
        model: 'gemini-2.0-flash'
      });
    }
  }

  /**
   * Procesa un mensaje médico
   */
  async processMessage(req, res) {
    try {
      const { sessionId, message } = req.body;

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          error: 'sessionId es requerido',
          code: 'MISSING_SESSION_ID'
        });
      }

      if (!message || message.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'El mensaje no puede estar vacío',
          code: 'EMPTY_MESSAGE'
        });
      }

      console.log(`📨 Procesando mensaje para sesión: ${sessionId}`);
      const result = await geminiService.sendMedicalMessage(sessionId, message.trim());

      res.json({
        success: true,
        ...result,
        sessionId
      });
    } catch (error) {
      console.error('Error en processMessage:', error);
      
      const statusCode = error.message.includes('no encontrada') ? 404 : 500;
      
      res.status(statusCode).json({
        success: false,
        error: error.message,
        code: 'MESSAGE_PROCESSING_FAILED',
        model: 'gemini-2.0-flash'
      });
    }
  }

  /**
   * Obtiene el historial de una sesión
   */
  async getHistory(req, res) {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          error: 'sessionId es requerido',
          code: 'MISSING_SESSION_ID'
        });
      }

      const result = await geminiService.getChatHistory(sessionId);

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Error en getHistory:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        code: 'HISTORY_RETRIEVAL_FAILED'
      });
    }
  }

  /**
   * Finaliza una sesión médica
   */
  async endSession(req, res) {
    try {
      const { sessionId } = req.body;

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          error: 'sessionId es requerido',
          code: 'MISSING_SESSION_ID'
        });
      }

      const result = await geminiService.endMedicalSession(sessionId);

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Error en endSession:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        code: 'SESSION_END_FAILED'
      });
    }
  }

  /**
   * Health check del servicio Gemini 2.0
   */
  async healthCheck(req, res) {
    try {
      const health = await geminiService.healthCheck();

      res.json({
        success: health.success,
        status: health.status,
        gemini: health.success ? 'operational' : 'offline',
        model: 'gemini-2.0-flash',
        timestamp: new Date().toISOString(),
        activeSessions: geminiService.chatSessions.size,
        ...health
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        status: 'unhealthy',
        gemini: 'offline',
        error: error.message,
        model: 'gemini-2.0-flash',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Información del modelo
   */
  async modelInfo(req, res) {
    res.json({
      success: true,
      model: 'gemini-2.0-flash',
      version: '2.0',
      description: 'Google Gemini 2.0 Flash - Modelo optimizado para respuestas rápidas',
      capabilities: ['medical-assistance', 'emergency-guidance', 'first-aid-instructions'],
      maxTokens: 2048,
      status: 'active'
    });
  }
}

export const geminiController = new GeminiController();