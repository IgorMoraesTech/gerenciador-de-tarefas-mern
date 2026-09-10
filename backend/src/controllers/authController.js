const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  if (await User.findOne({ email })) return res.status(409).json({ error: 'E-mail já cadastrado.' });
  const hash = await bcrypt.hash(password, 10);
  await User.create({ name, email, password: hash });
  res.status(201).json({ message: 'Usuário criado com sucesso!' });
};
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
  }
  const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '1d' });
  res.json({ message: 'Login bem-sucedido!', token, userId: user._id });
};
