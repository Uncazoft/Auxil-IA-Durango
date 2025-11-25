import { envConfig } from '../src/config/environment.js';

function checkConfiguration() {
  console.log('🔍 Verificando configuración del sistema Gemini 2.0...\n');

  try {
    // Verificar variables críticas
    const geminiKey = envConfig.getGeminiApiKey();
    
    console.log('✅ Configuración correcta:');
    console.log(`   - GEMINI_API_KEY: ${geminiKey.substring(0, 10)}...${geminiKey.substring(geminiKey.length - 4)}`);
    console.log(`   - Longitud: ${geminiKey.length} caracteres`);
    console.log(`   - Modelo: gemini-2.0-flash`);
    console.log(`   - NODE_ENV: ${envConfig.get('NODE_ENV', 'development')}`);
    console.log(`   - PORT: ${envConfig.get('PORT', 3000)}`);

    console.log('\n🎉 ¡La configuración es correcta! Puedes iniciar el servidor.');

  } catch (error) {
    console.error('\n❌ Problemas de configuración encontrados:');
    console.error(`   ${error.message}`);
    
    console.log('\n💡 Solución:');
    console.log('   1. Crea un archivo .env en la raíz del proyecto');
    console.log('   2. Agrega esta línea:');
    console.log('      GEMINI_API_KEY=AIzaSyAgptyGayrgfYrhiHyENcrIfk5Mf6FKqPg');
    console.log('   3. Ejecuta: npm run check-config\n');
    
    process.exit(1);
  }
}

checkConfiguration();