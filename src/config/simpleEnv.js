import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env directamente
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const getGeminiApiKey = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY no configurada en .env\n' +
      'Agrega: GEMINI_API_KEY=AIzaSyAgptyGayrgfYrhiHyENcrIfk5Mf6FKqPg'
    );
  }
  
  console.log('✅ Gemini API Key cargada correctamente');
  return apiKey;
};