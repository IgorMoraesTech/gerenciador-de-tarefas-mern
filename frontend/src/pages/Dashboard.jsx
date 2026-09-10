import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, errorMessage } from '../services/api';
import { TaskForm } from '../components/TaskForm';
export function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [editing, setEditing] = useState(null);
  const [formKey, setFormKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [reload, setReload] = useState(0);
  const navigate = useNavigate();
  useEffect(() => {
    const controller = new AbortController();
    api.get('/tasks', { signal: controller.signal }).then(({ data }) => {
      setTasks(data); setLoading(false);
    }).catch(error => {
      if (controller.signal.aborted) return;
      if (error.response?.status === 401) { localStorage.removeItem('token'); navigate('/', { replace: true }); return; }
      setError(errorMessage(error)); setLoading(false);
    });
    return () => controller.abort();
  }, [navigate, reload]);
  const handleError = (error) => {
    if (error.response?.status === 401) { localStorage.removeItem('token'); navigate('/', { replace: true }); }
    else setError(errorMessage(error));
  };
  const save = async (values) => {
    if (busy) return;
    setBusy(true); setError(''); setNotice('');
    try {
      if (editing) {
        const { data } = await api.put(`/tasks/${editing._id}`, values);
        setTasks(current => current.map(task => task._id === data._id ? data : task));
      } else {
        const { data } = await api.post('/tasks', values);
        setTasks(current => [data, ...current]);
      }
      setNotice(editing ? 'Tarefa atualizada.' : 'Tarefa criada.');
      setEditing(null); setFormKey(key => key + 1);
    } catch (error) { handleError(error); }
    finally { setBusy(false); }
  };
  const remove = async (task) => {
    if (busy || !window.confirm(`Excluir a tarefa “${task.title}”?`)) return;
    setBusy(true); setError(''); setNotice('');
    try {
      await api.delete(`/tasks/${task._id}`);
      setTasks(current => current.filter(item => item._id !== task._id));
      if (editing?._id === task._id) { setEditing(null); setFormKey(key => key + 1); }
      setNotice('Tarefa excluída.');
    } catch (error) { handleError(error); }
    finally { setBusy(false); }
  };
  return <main>
    <header><div><h1>Gerenciador de tarefas</h1><p>Suas tarefas, do início à conclusão.</p></div>
      <button className="secondary" onClick={() => { localStorage.removeItem('token'); navigate('/', { replace: true }); }}>Sair</button>
    </header>
    {error && <div role="alert" className="error">{error} <button className="secondary" disabled={busy} onClick={() => { setError(''); setLoading(true); setReload(value => value + 1); }}>Recarregar tarefas</button></div>}
    {notice && <p role="status" className="notice">{notice}</p>}
    <TaskForm key={`${editing?._id || 'new'}-${formKey}`} task={editing} busy={busy || loading} onSave={save} onCancel={() => setEditing(null)} />
    <h2>Suas tarefas</h2>
    {loading ? <p role="status">Carregando…</p> : !tasks.length ? <p>Nenhuma tarefa cadastrada.</p> :
      <ul className="tasks">{tasks.map(task => <li className="panel" key={task._id}>
        <div><h3>{task.title}</h3><p className="description">{task.description}</p><span className="badge">{task.status}</span></div>
        <div className="actions"><button disabled={busy} className="secondary" onClick={() => { setEditing(task); setNotice(''); }}>Editar</button>
          <button disabled={busy} className="danger" onClick={() => remove(task)}>Excluir</button></div>
      </li>)}</ul>}
  </main>;
}
