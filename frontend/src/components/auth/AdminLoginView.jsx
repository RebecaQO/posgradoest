import React, { useState } from 'react';
import { ArrowLeft, KeyRound, LockKeyhole, UserRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logoPosgrado from '../../assets/images/logo/logo_posgrado.jpg';

export const AdminLoginView = ({ onLoginSuccess, onBack }) => {
  const { loginAs, authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    const result = await loginAs({ email, password });
    setSubmitting(false);
    if (result) onLoginSuccess?.();
  };

  return (
    <main className="admin-login-page">
      <button className="admin-login-back" type="button" onClick={onBack}>
        <ArrowLeft size={18} /> Volver al sitio
      </button>
      <section className="admin-login-card" aria-labelledby="admin-login-title">
        <img className="admin-login-logo" src={logoPosgrado} alt="Posgrado Estadística UMSA" />
        <p className="admin-login-eyebrow">Posgrado Estadística · UMSA</p>
        <h1 id="admin-login-title">Acceso administrativo</h1>
        <p className="admin-login-position"><KeyRound size={16} /> Puesto: Administrador del Sistema</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="admin-email">Usuario o correo</label>
          <div className="admin-login-input-wrap"><UserRound size={18} /><input id="admin-email" type="text" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
          <label htmlFor="admin-password">Contraseña</label>
          <div className="admin-login-input-wrap"><LockKeyhole size={18} /><input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></div>
          {authError && <p className="admin-login-error" role="alert">{authError}</p>}
          <button className="admin-login-submit" type="submit" disabled={submitting}>
            {submitting ? 'Ingresando…' : 'Ingresar al panel'}
          </button>
        </form>
      </section>
      <style>{`
        .admin-login-page{min-height:100vh;background:linear-gradient(145deg,#f1f7f4,#f7f8fb 55%,#eaf2ee);display:flex;align-items:center;justify-content:center;padding:2rem;position:relative;font-family:inherit;color:#172033}
        .admin-login-back{position:absolute;left:2rem;top:2rem;display:flex;align-items:center;gap:.5rem;border:0;background:transparent;color:#466078;font-size:.95rem;font-weight:600;font-family:inherit;cursor:pointer}
        .admin-login-card{width:min(100%,440px);background:#fff;border:1px solid #dfe7e1;border-radius:20px;box-shadow:0 20px 60px #12352518;padding:2.5rem}
        .admin-login-logo{display:block;width:68px;height:68px;object-fit:cover;border-radius:50%;margin:0 auto 1rem;border:3px solid #176b45}
        .admin-login-eyebrow{text-align:center;color:#176b45;font-size:.85rem;font-weight:700;letter-spacing:.04em;margin:0 0 .5rem}
        .admin-login-card h1{text-align:center;font-size:1.7rem;margin:.2rem 0 .6rem}
        .admin-login-position{display:flex;align-items:center;justify-content:center;gap:.4rem;color:#667085;margin:0 0 2rem;font-size:.95rem}
        .admin-login-card form{display:flex;flex-direction:column;gap:.55rem}
        .admin-login-card label{font-size:.9rem;font-weight:700;margin-top:.45rem}
        .admin-login-input-wrap{height:48px;border:1px solid #cfd8d3;border-radius:9px;display:flex;align-items:center;gap:.65rem;padding:0 .85rem;color:#78867e}
        .admin-login-input-wrap:focus-within{border-color:#176b45;box-shadow:0 0 0 3px #176b451c}
        .admin-login-input-wrap input{border:0;outline:0;min-width:0;width:100%;font:inherit;color:#172033;background:transparent}
        .admin-login-error{margin:.35rem 0;color:#b42318;font-size:.88rem}
        .admin-login-submit{height:48px;margin-top:.8rem;border:0;border-radius:9px;background:#176b45;color:#fff;font-size:1rem;font-weight:700;font-family:inherit;cursor:pointer}
        .admin-login-submit:disabled{opacity:.65;cursor:wait}
        @media(max-width:540px){.admin-login-page{padding:1.25rem}.admin-login-back{left:1.25rem;top:1.25rem}.admin-login-card{padding:2rem 1.35rem;margin-top:3rem}}
      `}</style>
    </main>
  );
};
