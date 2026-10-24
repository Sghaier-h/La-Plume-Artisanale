import React, { useEffect, useState } from 'react';
import PortailLayout from './PortailLayout';
import { portailAuth } from '../../services/portailApi';
import portailApi from '../../services/portailApi';

const PortailProfil: React.FC = () => {
  const [me, setMe] = useState<any>(null);
  const [pw, setPw] = useState({ current: '', new1: '', new2: '' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      const r = await portailApi.get('/me');
      setMe(r.data.data || r.data);
    })().catch(() => {});
  }, []);

  const changer = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(''); setErr('');
    if (pw.new1.length < 8) return setErr('Mot de passe trop court (min 8)');
    if (pw.new1 !== pw.new2) return setErr('Les mots de passe ne correspondent pas');
    try {
      await portailAuth.changePassword(pw.current, pw.new1);
      setMsg('Mot de passe changé');
      setPw({ current: '', new1: '', new2: '' });
    } catch (e: any) { setErr(e?.response?.data?.error?.message || 'Erreur'); }
  };

  return (
    <PortailLayout>
      <div className="max-w-2xl space-y-6">
        <h1 className="font-serif text-2xl text-stone-800">Mon profil</h1>
        <div className="bg-white rounded-xl border border-amber-200 shadow-sm p-6 space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div><span className="text-stone-500">Raison sociale : </span><span className="font-medium">{me?.raison_sociale}</span></div>
            <div><span className="text-stone-500">Code client : </span>{me?.code_client}</div>
            <div><span className="text-stone-500">Email : </span>{me?.email}</div>
            <div><span className="text-stone-500">Téléphone : </span>{me?.telephone || '—'}</div>
            <div className="col-span-2"><span className="text-stone-500">Adresse : </span>
              {[me?.adresse, me?.code_postal, me?.ville, me?.pays].filter(Boolean).join(', ') || '—'}</div>
            <div><span className="text-stone-500">Matricule fiscal : </span>{me?.matricule_fiscal || '—'}</div>
          </div>
        </div>

        <form onSubmit={changer} className="bg-white rounded-xl border border-amber-200 shadow-sm p-6 space-y-3">
          <h2 className="font-semibold text-stone-800">Changer mon mot de passe</h2>
          <input type="password" placeholder="Mot de passe actuel" value={pw.current}
            onChange={e => setPw({ ...pw, current: e.target.value })}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg" required />
          <input type="password" placeholder="Nouveau mot de passe" value={pw.new1}
            onChange={e => setPw({ ...pw, new1: e.target.value })}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg" required />
          <input type="password" placeholder="Confirmation" value={pw.new2}
            onChange={e => setPw({ ...pw, new2: e.target.value })}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg" required />
          {msg && <div className="text-sm text-emerald-700">{msg}</div>}
          {err && <div className="text-sm text-red-700">{err}</div>}
          <button type="submit" className="px-4 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white">Mettre à jour</button>
        </form>
      </div>
    </PortailLayout>
  );
};

export default PortailProfil;
