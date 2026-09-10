const express = require('express');
const cors = require('cors');

function createApp() {
  const app = express();
  const origins = new Set((process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173').split(',').map(value => value.trim()).filter(Boolean));
  if (process.env.CODESPACE_NAME) {
    const domain = process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN || 'app.github.dev';
    origins.add(`https://${process.env.CODESPACE_NAME}-5173.${domain}`);
  }
  app.disable('x-powered-by');
  app.use(cors({
    origin(origin, callback) {
      // Ferramentas de API e chamadas internas podem não enviar Origin.
      if (!origin || origins.has(origin)) return callback(null, true);
      const error = new Error('Origem não permitida.');
      error.status = 403;
      callback(error);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
  app.use(express.json({ limit: '16kb' }));
  app.get('/', (req, res) => res.send('API online!'));
  app.use('/api/auth', require('./routes/authRoutes'));
  app.use('/api/tasks', require('./routes/taskRoutes'));
  app.use((req, res) => res.status(404).json({ error: 'Rota não encontrada.' }));
  // Express 5 encaminha rejeições dos controllers async para este middleware.
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error.code === 11000) return res.status(409).json({ error: 'E-mail já cadastrado.' });
    if (error.name === 'ValidationError' || error.name === 'CastError') return res.status(400).json({ error: 'Dados inválidos.' });
    if (error.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON inválido.' });
    if (error.type === 'entity.too.large') return res.status(413).json({ error: 'Requisição muito grande.' });
    if ([400, 403].includes(error.status)) return res.status(error.status).json({ error: error.message });
    // Não registrar body, URI do banco ou mensagem que possa conter credenciais.
    console.error('Falha na API:', error.name || 'Error', error.code || 'INTERNAL');
    return res.status(500).json({ error: 'Erro interno. Tente novamente.' });
  });
  return app;
}
module.exports = createApp;
