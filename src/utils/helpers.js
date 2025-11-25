/**
 * Utilidades auxiliares para la aplicación
 */

/**
 * Genera un ID de sesión único
 */
export function generateSessionId() {
  return `med_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Valida y sanitiza mensajes de usuario
 */
export function sanitizeUserMessage(message, maxLength = 2000) {
  if (typeof message !== 'string') {
    throw new Error('El mensaje debe ser una cadena de texto');
  }

  const trimmed = message.trim();
  
  if (trimmed.length === 0) {
    throw new Error('El mensaje no puede estar vacío');
  }

  if (trimmed.length > maxLength) {
    throw new Error(`El mensaje no puede exceder ${maxLength} caracteres`);
  }

  // Sanitización básica
  return trimmed.replace(/[<>]/g, '');
}

/**
 * Formatea respuestas para el cliente
 */
export function formatApiResponse(success, data = null, error = null) {
  return {
    success,
    data: success ? data : null,
    error: !success ? error : null,
    timestamp: new Date().toISOString(),
    model: 'gemini-2.0-flash'
  };
}

/**
 * Logger consistente para la aplicación
 */
export class Logger {
  static info(message, meta = {}) {
    console.log(JSON.stringify({
      level: 'INFO',
      timestamp: new Date().toISOString(),
      message,
      model: 'gemini-2.0-flash',
      ...meta
    }));
  }

  static error(message, error = null, meta = {}) {
    console.error(JSON.stringify({
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      message,
      error: error?.message || error,
      stack: error?.stack,
      model: 'gemini-2.0-flash',
      ...meta
    }));
  }

  static warn(message, meta = {}) {
    console.warn(JSON.stringify({
      level: 'WARN',
      timestamp: new Date().toISOString(),
      message,
      model: 'gemini-2.0-flash',
      ...meta
    }));
  }
}