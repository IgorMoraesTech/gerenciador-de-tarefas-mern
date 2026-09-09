const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Lê o cabeçalho Authorization
  const authHeader = req.header('Authorization');
  if (!authHeader) return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });

  // O formato esperado é "Bearer [TOKEN]"
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Acesso negado. Formato de token inválido.' });

  try {
    // Valida o token e injeta o ID do usuário na requisição
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Token inválido.' });
  }
};