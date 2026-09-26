# 🔧 Résoudre le Timeout de Connexion PostgreSQL (OVH)

## Le Problème

```
Connection timed out
Is the server running on that host and accepting TCP/IP connections?
```

La connexion à la base de données PostgreSQL sur OVH Cloud DB timeout.

---

## 🔍 CAUSES POSSIBLES

### 1. IP du Serveur Non Autorisée
L'IP de votre serveur VPS n'est pas autorisée dans OVH Cloud DB.

### 2. Firewall Bloqué
Le firewall bloque la connexion au port 5432.

### 3. Problème Réseau
Problème réseau entre le VPS et OVH Cloud DB.

---

## ✅ SOLUTIONS

### Solution 1 : Autoriser l'IP du Serveur dans OVH

1. **Se connecter à OVH Manager**
   - Aller sur https://www.ovh.com/manager/
   - Cloud > Databases > PostgreSQL

2. **Vérifier l'IP du serveur**
   ```bash
   # Sur le serveur VPS, récupérer l'IP publique
   curl ifconfig.me
   ```

3. **Ajouter l'IP dans OVH**
   - Ouvrir votre instance PostgreSQL
   - Onglet "Utilisateurs et IP autorisées"
   - Ajouter l'IP publique du VPS

### Solution 2 : Vérifier la Connexion depuis le Backend

Le backend utilise probablement les mêmes identifiants. Testons :

```bash
cd /opt/fouta-erp/backend

# Charger les variables
export $(cat .env | grep -v '^#' | xargs)

# Tester la connexion avec psql
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;"
```

Si ça fonctionne depuis le backend mais pas en standalone, c'est un problème de configuration.

### Solution 3 : Vérifier le Port et l'Hôte

```bash
# Vérifier les variables d'environnement
echo "DB_HOST=$DB_HOST"
echo "DB_PORT=$DB_PORT"  # Doit être 5432 par défaut

# Tester avec le port explicite
psql -h "$DB_HOST" -p 5432 -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;"
```

### Solution 4 : Utiliser pgAdmin ou OVH SQL Explorer

Si `psql` ne fonctionne pas, vous pouvez :
- Utiliser **pgAdmin** (interface graphique)
- Utiliser **OVH SQL Explorer** dans l'interface OVH
- Copier/coller le contenu du script SQL

---

## 📋 CHECKLIST

- [ ] IP du VPS autorisée dans OVH Cloud DB ?
- [ ] Port 5432 ouvert dans le firewall ?
- [ ] Variables DB_HOST, DB_USER, DB_NAME correctes ?
- [ ] La connexion fonctionne depuis le backend Node.js ?

---

## 💡 NOTE IMPORTANTE

**Le script SQL d'index n'est pas urgent.** Il améliore les performances mais le système fonctionne sans.

Vous pouvez :
1. **Continuer sans** : Le système fonctionne, les index peuvent être ajoutés plus tard
2. **Utiliser pgAdmin** : Exécuter le script via une interface graphique
3. **Résoudre la connexion** : Autoriser l'IP dans OVH

---

## 🎯 ACTION RECOMMANDÉE

**Pour l'instant, continuons sans le script SQL d'index.** Le système fonctionne et vous pouvez :
1. Résoudre l'erreur 502 du backend (plus important)
2. Ajouter les index plus tard via pgAdmin ou en résolvant la connexion
