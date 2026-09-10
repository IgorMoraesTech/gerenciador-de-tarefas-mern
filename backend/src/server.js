require('dotenv').config({ path: require('node:path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const createApp = require('./app');

async function start() {
  if (!process.env.MONGO_URI || !process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('Configure MONGO_URI e JWT_SECRET (mínimo de 32 caracteres) no backend/.env.');
  }
  const port = Number(process.env.PORT || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT inválida.');
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  await require('./models/User').init();
  const server = createApp().listen(port, '0.0.0.0', () => {
    console.log(`Banco conectado. Servidor na porta ${port}.`);
  });
  server.on('error', async (error) => {
    console.error('Falha ao abrir a porta:', error.code);
    await mongoose.disconnect();
    process.exitCode = 1;
  });
  const stop = () => server.close(async () => { await mongoose.disconnect(); process.exit(0); });
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}
start().catch(async (error) => {
  console.error('Falha ao iniciar:', error.name, 'Verifique .env, acesso ao MongoDB e disponibilidade da porta.');
  await mongoose.disconnect();
  process.exitCode = 1;
});
