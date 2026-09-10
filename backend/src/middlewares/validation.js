const fail = (message) => { const error = new Error(message); error.status = 400; throw error; };
const text = (value, label, max, required = true) => {
  if (typeof value !== 'string') fail(`${label} deve ser texto.`);
  const result = value.trim();
  if ((required && !result) || result.length > max) fail(`${label}: preencha até ${max} caracteres.`);
  // Campos de texto simples; a interface também usa o escape padrão do React.
  if (/[<>\u0000-\u0008\u000b\u000c\u000e-\u001f]/u.test(result)) fail(`${label} contém caracteres não permitidos.`);
  return result;
};
const bodyObject = (body, allowed) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) fail('Envie um objeto JSON.');
  if (Object.keys(body).some(key => !allowed.includes(key))) fail('Há campos não permitidos.');
};
exports.auth = (register) => (req, res, next) => {
  try {
    bodyObject(req.body, register ? ['name', 'email', 'password'] : ['email', 'password']);
    const email = text(req.body.email, 'E-mail', 254).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail('Informe um e-mail válido.');
    const password = req.body.password;
    if (typeof password !== 'string' || !password || Buffer.byteLength(password, 'utf8') > 72) fail('Senha obrigatória, com no máximo 72 bytes.');
    if (register && password.length < 8) fail('A senha deve ter pelo menos 8 caracteres.');
    req.body = { email, password, ...(register ? { name: text(req.body.name, 'Nome', 100) } : {}) };
    next();
  } catch (error) { next(error); }
};
exports.task = (update = false) => (req, res, next) => {
  try {
    bodyObject(req.body, ['title', 'description', 'status']);
    const data = {};
    if (!update || Object.hasOwn(req.body, 'title')) data.title = text(req.body.title, 'Título', 120);
    if (Object.hasOwn(req.body, 'description')) data.description = text(req.body.description, 'Descrição', 2000, false);
    if (Object.hasOwn(req.body, 'status')) {
      if (!['pendente', 'concluída'].includes(req.body.status)) fail('Status inválido.');
      data.status = req.body.status;
    }
    if (update && !Object.keys(data).length) fail('Informe ao menos um campo para atualizar.');
    req.body = data;
    next();
  } catch (error) { next(error); }
};
exports.id = (req, res, next) => {
  if (!/^[a-f\d]{24}$/i.test(req.params.id)) return res.status(400).json({ error: 'ID de tarefa inválido.' });
  next();
};
