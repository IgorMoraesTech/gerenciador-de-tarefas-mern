const Task = require('../models/Task');
exports.createTask = async (req, res) => {
  const task = await Task.create({ ...req.body, user: req.user.id });
  res.status(201).json(task);
};
exports.getTasks = async (req, res) => {
  res.json(await Task.find({ user: req.user.id }).sort({ _id: -1 }));
};
exports.updateTask = async (req, res) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!task) return res.status(404).json({ error: 'Tarefa não encontrada.' });
  res.json(task);
};
exports.deleteTask = async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!task) return res.status(404).json({ error: 'Tarefa não encontrada.' });
  res.json({ message: 'Tarefa excluída com sucesso.' });
};
