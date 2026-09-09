const Task = require('../models/Task');

// Criar Tarefa (POST)
exports.createTask = async (req, res) => {
  try {
    const { title, description, status } = req.body;
    
    // O ID do usuário vem do middleware de autenticação (req.user.id)
    const newTask = new Task({ title, description, status, user: req.user.id });
    await newTask.save();
    
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar tarefa.' });
  }
};

// Ler Todas as Tarefas do Usuário (GET)
exports.getTasks = async (req, res) => {
  try {
    // Busca apenas as tarefas que pertencem ao usuário logado
    const tasks = await Task.find({ user: req.user.id });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar tarefas.' });
  }
};

// Atualizar Tarefa (PUT)
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;
    
    // Atualiza a tarefa apenas se ela pertencer ao usuário logado
    const updatedTask = await Task.findOneAndUpdate(
      { _id: id, user: req.user.id },
      { title, description, status },
      { new: true } // Retorna o documento atualizado
    );
    
    if (!updatedTask) return res.status(404).json({ error: 'Tarefa não encontrada.' });
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar tarefa.' });
  }
};

// Deletar Tarefa (DELETE)
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Deleta a tarefa apenas se ela pertencer ao usuário logado
    const deletedTask = await Task.findOneAndDelete({ _id: id, user: req.user.id });
    
    if (!deletedTask) return res.status(404).json({ error: 'Tarefa não encontrada.' });
    res.json({ message: 'Tarefa deletada com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar tarefa.' });
  }
};