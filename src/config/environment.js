import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Sistema robusto de configuración de entorno
 */
class EnvironmentConfig {
  constructor() {
    this.loadEnvironment();
    this.validateRequiredVariables();
  }

  loadEnvironment() {
    // Cargar desde múltiples ubicaciones posibles
    const envPaths = [
      path.resolve(process.cwd(), '.env'),
      path.resolve(__dirname, '../../.env'),
      path.resolve(process.cwd(), '..', '.env')
    ];

    let envLoaded = false;

    for (const envPath of envPaths) {
      try {
        const result = dotenv.config({ path: envPath });
        if (!result.error) {
          console.log(`✅ Variables de entorno cargadas desde: ${envPath}`);
          envLoaded = true;
          break;
        }
      } catch (error) {
        console.warn(`⚠️ No se pudo cargar .env desde: ${envPath}`);
      }
    }

    if (!envLoaded) {
      console.warn('⚠️ No se encontró archivo .env, usando variables del sistema');
    }
  }

  validateRequiredVariables() {
    const required = ['GEMINI_API_KEY'];
    const missing = required.filter(key => !this.get(key));

    if (missing.length > 0) {
      console.error(`❌ Variables de entorno requeridas faltantes: ${missing.join(', ')}`);
      console.log('💡 Crea un archivo .env con: GEMINI_API_KEY=tu_clave_aqui');
    }
  }

  get(key, defaultValue = null) {
    return process.env[key] || defaultValue;
  }

  getGeminiApiKey() {
    const apiKey = this.get('GEMINI_API_KEY');
    
    if (!apiKey) {
      throw new Error(
        'GEMINI_API_KEY no configurada.\n\n' +
        'SOLUCIÓN:\n' +
        '1. Crea un archivo .env en la raíz del proyecto\n' +
        '2. Agrega: GEMINI_API_KEY=AIzaSyAgptyGayrgfYrhiHyENcrIfk5Mf6FKqPg\n' +
        '3. Reinicia el servidor'
      );
    }

    // Validar formato básico de la API Key
    if (!apiKey.startsWith('AIza')) {
      console.warn('⚠️ La GEMINI_API_KEY no tiene el formato esperado (debería empezar con "AIza")');
    }

    console.log('✅ Gemini API Key verificada - Modelo: gemini-2.0-flash');
    return apiKey;
  }

  isDevelopment() {
    return this.get('NODE_ENV', 'development') === 'development';
  }
}

// Singleton instance
export const envConfig = new EnvironmentConfig();