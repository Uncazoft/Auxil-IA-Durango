import { envConfig } from '../src/config/environment.js';

function checkConfiguration() {
  console.log('🔍 Verificando configuración del sistema Gemini 2.0...\n');

  try {
    // Verificar variables críticas
    const geminiKey = envConfig.getGeminiApiKey();
    
    console.log('✅ Configuración correcta:');
    console.log(`   - GEMINI_API_KEY: ${geminiKey.substring(0, 4)}...${geminiKey.substring(geminiKey.length - 4)} (Oculta por seguridad)`);
    console.log(`   - Longitud: ${geminiKey.length} caracteres`);
    console.log(`   - Modelo: gemini-2.0-flash`);
    console.log(`   - NODE_ENV: ${envConfig.get('NODE_ENV', 'development')}`);
    console.log(`   - PORT: ${envConfig.get('PORT', 3000)}`);

    console.log('\n🎉 ¡La configuración es correcta! Puedes iniciar el servidor.');

  } catch (error) {
    console.error('\n❌ Problemas de configuración encontrados:');
    console.error(`   ${error.message}`);
    
    console.log('\n💡 Solución:');
    console.log('   1. Crea un archivo .env en la raíz del proyecto.');
    console.log('   2. Obtén tu clave de API desde Google AI Studio (https://aistudio.google.com/app/apikey). ');
    console.log('   3. Agrega la siguiente línea a tu archivo .env, reemplazando <TU_API_KEY> con tu clave real:');
    console.log('      GEMINI_API_KEY=<TU_API_KEY>');
    console.log('   4. Vuelve a ejecutar: npm run check-config\n');
    
    process.exit(1);
  }
}

checkConfiguration();