import { useState } from 'react';
export function TaskForm({ task, busy, onSave, onCancel }) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState(task?.status || 'pendente');
  return <section className="panel" aria-labelledby="form-title">
    <h2 id="form-title">{task ? 'Editar tarefa' : 'Nova tarefa'}</h2>
    <form onSubmit={event => { event.preventDefault(); onSave({ title, description, status }); }}>
      <fieldset disabled={busy}>
        <label>Título<input autoFocus={Boolean(task)} value={title} onChange={e => setTitle(e.target.value)} required maxLength={120} /></label>
        <label>Descrição (opcional)<textarea value={description} onChange={e => setDescription(e.target.value)} maxLength={2000} rows={3} /></label>
        <label>Status<select value={status} onChange={e => setStatus(e.target.value)}><option value="pendente">Pendente</option><option value="concluída">Concluída</option></select></label>
        <div className="actions"><button type="submit">{busy ? 'Salvando…' : task ? 'Salvar alterações' : 'Adicionar tarefa'}</button>
        {task && <button className="secondary" type="button" onClick={onCancel}>Cancelar edição</button>}</div>
      </fieldset>
    </form>
  </section>;
}
