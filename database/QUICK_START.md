# ⚡ Démarrage Rapide

Guide ultra-rapide pour les actions les plus courantes.

## 🎯 Actions Rapides

### ✅ Vérifier que les données sont bien importées

```sql
-- Exécutez ce script dans votre outil SQL (pgAdmin, DBeaver, etc.)
\i database/imports/10_verifier_import_donnees.sql
```

**Ou directement :**
```bash
psql -U votre_user -d votre_db -f database/imports/10_verifier_import_donnees.sql
```

---

### 📥 Importer les données (si pas encore fait)

**Ordre d'exécution :**

1. **Structure** (une seule fois)
   ```sql
   \i database/imports/04_structure_commandes.sql
   \i database/imports/05_structure_utilisateurs_groupes.sql
   \i database/imports/07_structure_utilisateurs_dashboards.sql
   \i database/imports/08_structure_clients_enrichie.sql
   ```

2. **Données**
   ```sql
   \i database/imports/00_attributs.sql
   \i database/imports/01_modeles_data.sql
   \i database/imports/03_articles_data.sql
   \i database/imports/04_commandes_data.sql
   \i database/imports/05_utilisateurs_data.sql
   \i database/imports/06_ajouter_groupe_soustraitant.sql
   ```

3. **Vérification**
   ```sql
   \i database/imports/10_verifier_import_donnees.sql
   ```

---

### 🔍 Trouver un Script

| Je cherche... | Fichier |
|--------------|---------|
| Vérifier toutes les données | `imports/10_verifier_import_donnees.sql` |
| Importer les articles | `imports/03_articles_data.sql` |
| Importer les commandes | `imports/04_commandes_data.sql` |
| Structure clients | `imports/08_structure_clients_enrichie.sql` |
| Index complet | `INDEX_SCRIPTS.md` |

---

### 📚 Documentation Complète

- **Vue d'ensemble** : `README.md`
- **Index complet** : `INDEX_SCRIPTS.md`
- **Guide détaillé** : `GUIDE_UTILISATION.md`
- **Organisation visuelle** : `ORGANISATION_VISUELLE.md`
- **Statut des imports** : `IMPORT_DONNÉES_RÉELLES.md`

---

**💡 Astuce** : Commencez toujours par `10_verifier_import_donnees.sql` pour voir l'état actuel !
