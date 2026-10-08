import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import { portailAuth } from '../../services/portailApi';

const PortailLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [forgotDone, setForgotDone] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      if (forgot) {
        await portailAuth.forgotPassword(email);
        setForgotDone(true);
      } else {
        const r = await portailAuth.login(email, password);
        const { token, client } = r.data.data || r.data;
        localStorage.setItem('portail_token', token);
        localStorage.setItem('portail_client', JSON.stringify(client));
        navigate('/portail');
      }
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Erreur de connexion');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-100 via-stone-50 to-amber-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-amber-200 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-600 to-amber-800 text-white p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur mx-auto flex items-center justify-center font-bold text-xl mb-3">LP</div>
          <h1 className="font-serif text-2xl">La Plume Artisanale</h1>
          <p className="text-amber-100 text-sm">Espace client</p>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          {forgotDone ? (
            <div className="text-center space-y-3">
              <p className="text-emerald-700 font-medium">Si un compte existe, un email vient de partir.</p>
              <button type="button" onClick={() => { setForgot(false); setForgotDone(false); }}
                className="text-amber-700 hover:underline">Retour à la connexion</button>
            </div>
          ) : (
            <>
              <div>
                <label className="text-sm text-stone-600 mb-1 block">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    placeholder="vous@entreprise.tn" />
                </div>
              </div>
              {!forgot && (
                <div>
                  <label className="text-sm text-stone-600 mb-1 block">Mot de passe</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                    <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" />
                  </div>
                </div>
              )}
              {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white font-medium py-2.5 rounded-lg shadow disabled:opacity-60">
                <LogIn className="w-4 h-4" />
                {loading ? 'Patientez…' : forgot ? 'Envoyer le lien' : 'Se connecter'}
              </button>
              <div className="text-center text-sm">
                <button type="button" onClick={() => setForgot(!forgot)} className="text-amber-700 hover:underline">
                  {forgot ? 'Retour à la connexion' : 'Mot de passe oublié ?'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default PortailLogin;
