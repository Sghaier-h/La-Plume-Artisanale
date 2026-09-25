# 📋 Commandes à Copier-Coller sur le Serveur

## 🚀 Exécution Rapide - Copier-Coller Complet

**Copiez TOUT ce bloc et collez-le dans votre terminal SSH :**

```bash
mkdir -p ~/temp-schema && cd ~/temp-schema && cat > executer-schema.js << 'EOFSCRIPT'
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: 'sh131616-002.eu.clouddb.ovh.net',
  port: 35392,
  database: 'ERP_La_Plume',
  user: 'Aviateur',
  password: 'Allbyfouta007',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
});

async function executerSchema() {
  const client = await pool.connect();
  try {
    console.log('🚀 Exécution du schéma SQL...');
    const sql = `CREATE TABLE IF NOT EXISTS pointage (id SERIAL PRIMARY KEY, timemoto_id VARCHAR(255) UNIQUE, user_id INTEGER NOT NULL REFERENCES equipe(id) ON DELETE CASCADE, date DATE NOT NULL, check_in TIMESTAMP, check_out TIMESTAMP, heures_travaillees DECIMAL(5,2) DEFAULT 0, present BOOLEAN DEFAULT true, retard_minutes INTEGER DEFAULT 0, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW(), UNIQUE(user_id, date)); CREATE INDEX IF NOT EXISTS idx_pointage_user_id ON pointage(user_id); CREATE INDEX IF NOT EXISTS idx_pointage_date ON pointage(date); CREATE INDEX IF NOT EXISTS idx_pointage_timemoto_id ON pointage(timemoto_id); CREATE INDEX IF NOT EXISTS idx_pointage_user_date ON pointage(user_id, date); CREATE TABLE IF NOT EXISTS pointage_resume (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES equipe(id) ON DELETE CASCADE, mois VARCHAR(7) NOT NULL, total_heures DECIMAL(6,2) DEFAULT 0, total_jours_presents INTEGER DEFAULT 0, total_jours_absents INTEGER DEFAULT 0, total_retards INTEGER DEFAULT 0, total_minutes_retard INTEGER DEFAULT 0, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW(), UNIQUE(user_id, mois)); CREATE INDEX IF NOT EXISTS idx_pointage_resume_user_mois ON pointage_resume(user_id, mois); DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'equipe' AND column_name = 'timemoto_user_id') THEN ALTER TABLE equipe ADD COLUMN timemoto_user_id VARCHAR(255); CREATE INDEX IF NOT EXISTS idx_equipe_timemoto_user_id ON equipe(timemoto_user_id); END IF; END $$; DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'equipe' AND column_name = 'temps_travaille_mois') THEN ALTER TABLE equipe ADD COLUMN temps_travaille_mois DECIMAL(6,2) DEFAULT 0; END IF; END $$; CREATE OR REPLACE FUNCTION recalculer_resume_mois() RETURNS TRIGGER AS $$ BEGIN INSERT INTO pointage_resume (user_id, mois, total_heures, total_jours_presents, total_jours_absents, total_retards, total_minutes_retard, updated_at) SELECT NEW.user_id, TO_CHAR(NEW.date, 'YYYY-MM'), COALESCE(SUM(heures_travaillees), 0), COUNT(*) FILTER (WHERE present = true), COUNT(*) FILTER (WHERE present = false), COUNT(*) FILTER (WHERE retard_minutes > 0), COALESCE(SUM(retard_minutes), 0) FROM pointage WHERE user_id = NEW.user_id AND TO_CHAR(date, 'YYYY-MM') = TO_CHAR(NEW.date, 'YYYY-MM') ON CONFLICT (user_id, mois) DO UPDATE SET total_heures = EXCLUDED.total_heures, total_jours_presents = EXCLUDED.total_jours_presents, total_jours_absents = EXCLUDED.total_jours_absents, total_retards = EXCLUDED.total_retards, total_minutes_retard = EXCLUDED.total_minutes_retard, updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql; DROP TRIGGER IF EXISTS trigger_recalculer_resume_mois ON pointage; CREATE TRIGGER trigger_recalculer_resume_mois AFTER INSERT OR UPDATE OR DELETE ON pointage FOR EACH ROW EXECUTE FUNCTION recalculer_resume_mois(); CREATE OR REPLACE VIEW v_pointage_detail AS SELECT p.id, p.timemoto_id, p.user_id, e.nom, e.prenom, e.fonction, e.email, p.date, p.check_in, p.check_out, p.heures_travaillees, p.present, p.retard_minutes, CASE WHEN p.retard_minutes > 0 THEN true ELSE false END as a_retard, p.created_at, p.updated_at FROM pointage p JOIN equipe e ON p.user_id = e.id;`;
    await client.query(sql);
    console.log('✅ Script SQL exécuté avec succès !');
    console.log('📊 Tables créées : pointage, pointage_resume');
    console.log('📊 Colonnes ajoutées à equipe : timemoto_user_id, temps_travaille_mois');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}
executerSchema().then(() => process.exit(0)).catch((e) => { console.error('❌ Échec:', e); process.exit(1); });
EOFSCRIPT
cat > package.json << 'EOF'
{"type": "module", "dependencies": {"pg": "^8.11.3"}}
EOF
npm install pg 2>/dev/null || echo "pg déjà installé"
node executer-schema.js
```

**Appuyez sur Entrée après avoir collé le bloc complet.**

---

## ✅ Vérification après exécution

```bash
# Vérifier que les tables existent
PGPASSWORD='Allbyfouta007' psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U Aviateur -d ERP_La_Plume -c "\dt pointage*"

# Vérifier les colonnes de equipe
PGPASSWORD='Allbyfouta007' psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U Aviateur -d ERP_La_Plume -c "\d equipe" | grep timemoto
```
