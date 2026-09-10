const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
  const match = /^Bearer ([^\s]+)$/i.exec(req.get('Authorization') || '');
  if (!match) return res.status(401).json({ error: 'Autenticação necessária.' });
  try {
    const payload = jwt.verify(match[1], process.env.JWT_SECRET, { algorithms: ['HS256'] });
    if (typeof payload !== 'object' || !/^[a-f\d]{24}$/i.test(payload.id || '')) throw new Error('Invalid subject');
    req.user = { id: payload.id };
    next();
  } catch {
    res.status(401).json({ error: 'Sessão inválida ou expirada. Faça login novamente.' });
  }
};
