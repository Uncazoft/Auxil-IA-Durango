import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Configuración de ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar configuración PRIMERO
import './src/config/environment.js';

// Importaciones del controlador
import { geminiController } from './src/controllers/geminiController.js';
import { Logger } from './src/utils/helpers.js';

// Configuración
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "https://generativelanguage.googleapis.com"]
    }
  }
}));

// Rate limiting para prevenir abuso
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 solicitudes por ventana
  message: {
    success: false,
    error: 'Demasiadas solicitudes desde esta IP',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

// Middleware general
app.use(cors());
app.use(limiter);
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Routes - Gemini 2.0 Flash
app.post('/api/medical/start', geminiController.startSession.bind(geminiController));
app.post('/api/medical/message', geminiController.processMessage.bind(geminiController));
app.get('/api/medical/history/:sessionId', geminiController.getHistory.bind(geminiController));
app.post('/api/medical/end', geminiController.endSession.bind(geminiController));
app.get('/api/health', geminiController.healthCheck.bind(geminiController));
app.get('/api/model', geminiController.modelInfo.bind(geminiController));

// Middleware de manejo de errores
app.use((error, req, res, next) => {
  Logger.error('Error no manejado:', error, { url: req.url });
  
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor',
    code: 'INTERNAL_SERVER_ERROR',
    model: 'gemini-2.0-flash'
  });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
    code: 'ROUTE_NOT_FOUND'
  });
});

// Inicialización del servidor
app.listen(PORT, () => {
  console.log(`\n🎉 SERVICIO MÉDICO CON GEMINI 2.0 FLASH INICIADO`);
  console.log(`📍 Servidor: http://localhost:${PORT}`);
  console.log(`🤖 Modelo: gemini-2.0-flash`);
  console.log(`🔑 API Key: ${process.env.GEMINI_API_KEY ? '✅ Configurada' : '❌ Faltante'}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🚀 ¡Sistema listo para emergencias médicas!\n`);
});

// Manejo graceful de shutdown
process.on('SIGTERM', () => {
  console.log('Recibido SIGTERM, cerrando servidor gracefulmente');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Recibido SIGINT, cerrando servidor gracefulmente');
  process.exit(0);
});

export default app;