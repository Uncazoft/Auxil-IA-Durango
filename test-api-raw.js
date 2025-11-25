import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

async function testRawAPI() {
  console.log('🔌 TESTEO DIRECTO API REST GEMINI\n');
  
  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: "Responde con 'CONEXION_EXITOSA' si este mensaje llega correctamente."
          }
        ]
      }
    ]
  };

  console.log('📤 Enviando solicitud a:', API_URL.substring(0, 80) + '...');
  console.log('📦 Cuerpo de solicitud:', JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('\n📥 Respuesta recibida:');
    console.log('   - Status:', response.status);
    console.log('   - Status Text:', response.statusText);
    
    const responseText = await response.text();
    console.log('   - Body:', responseText.substring(0, 500) + '...');

    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('\n✅ ✅ ✅ CONEXIÓN EXITOSA CON GEMINI API ✅ ✅ ✅');
      console.log('📝 Respuesta:', data.candidates[0].content.parts[0].text);
    } else {
      console.log('\n❌ ❌ ❌ ERROR EN LA CONEXIÓN ❌ ❌ ❌');
      console.log('🔧 Posibles soluciones:');
      console.log('   1. Verificar que la API Key sea correcta');
      console.log('   2. Verificar que "Generative Language API" esté habilitada');
      console.log('   3. Verificar restricciones geográficas/facturación');
    }

  } catch (error) {
    console.error('\n💥 ERROR DE CONEXIÓN:');
    console.error('   - Mensaje:', error.message);
    console.error('   - Stack:', error.stack);
  }
}

testRawAPI();