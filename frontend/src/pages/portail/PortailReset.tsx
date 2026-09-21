import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { portailAuth } from '../../services/portailApi';

const PortailReset: React.FC = () => {
  const { token = '' } = useParams();
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw1.length < 8) return setError('Minimum 8 caractères');
    if (pw1 !== pw2) return setError('Les mots de passe ne correspondent pas');
    try {
      await portailAuth.resetPassword(token, pw1);
      setDone(true);
      setTimeout(() => nav('/portail/login'), 1500);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Erreur');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50 px-4">
      <form onSubmit={submit} className="bg-white rounded-2xl shadow-xl border border-amber-200 p-6 max-w-md w-full space-y-4">
        <h1 className="font-serif text-2xl text-stone-800">Nouveau mot de passe</h1>
        {done ? (
          <p className="text-emerald-700">Mot de passe réinitialisé. Redirection…</p>
        ) : (
          <>
            <input type="password" placeholder="Nouveau mot de passe" value={pw1} onChange={e=>setPw1(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg" required />
            <input type="password" placeholder="Confirmation" value={pw2} onChange={e=>setPw2(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg" required />
            {error && <div className="text-sm text-red-700">{error}</div>}
            <button type="submit" className="w-full bg-amber-700 hover:bg-amber-800 text-white py-2 rounded-lg">Valider</button>
            <Link to="/portail/login" className="block text-center text-sm text-amber-700 hover:underline">Retour</Link>
          </>
        )}
      </form>
    </div>
  );
};

export default PortailReset;
