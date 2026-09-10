import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, errorMessage } from '../services/api';
export function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError(''); setNotice('');
    try {
      if (isLogin) {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', data.token);
        navigate('/dashboard', { replace: true });
      } else {
        await api.post('/auth/register', { name, email, password });
        setPassword(''); setIsLogin(true);
        setNotice('Cadastro realizado. Entre com seu e-mail e senha.');
      }
    } catch (error) { setError(errorMessage(error)); }
    finally { setBusy(false); }
  };
  return <main className="auth panel">
    <h1>{isLogin ? 'Entrar no sistema' : 'Criar conta'}</h1>
    <p>Organize suas tarefas em um só lugar.</p>
    {error && <p role="alert" className="error">{error}</p>}
    {notice && <p role="status" className="notice">{notice}</p>}
    <form onSubmit={handleSubmit}>
      <fieldset disabled={busy}>
        {!isLogin && <label>Nome completo<input value={name} onChange={e => setName(e.target.value)} maxLength={100} required autoComplete="name" /></label>}
        <label>E-mail<input type="email" value={email} onChange={e => setEmail(e.target.value)} maxLength={254} required autoComplete="email" /></label>
        <label>Senha<input type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={isLogin ? undefined : 8} maxLength={72} required autoComplete={isLogin ? 'current-password' : 'new-password'} /></label>
        {!isLogin && <small>Use pelo menos 8 caracteres. Limite de 72 bytes (acentos podem ocupar mais de um byte).</small>}
        <button type="submit">{busy ? 'Aguarde…' : isLogin ? 'Entrar' : 'Cadastrar'}</button>
      </fieldset>
    </form>
    <button className="secondary" disabled={busy} onClick={() => { setIsLogin(!isLogin); setError(''); setNotice(''); setPassword(''); }}>
      {isLogin ? 'Criar uma conta' : 'Voltar ao login'}
    </button>
  </main>;
}
