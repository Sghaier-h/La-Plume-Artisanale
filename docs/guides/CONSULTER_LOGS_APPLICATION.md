# 📋 Consulter les Logs de l'Application

## 🔍 Où Trouver les Logs

### 1. Logs OVH dans le Panneau

#### Logs d'Accès
1. Panneau OVH → **Hébergements**
2. Cliquez sur votre hébergement
3. **Statistiques et logs** → **Logs d'accès**
4. Filtrez par domaine : `fabrication.laplume-artisanale.tn`

#### Logs d'Erreur
1. Panneau OVH → **Statistiques et logs** → **Logs d'erreur**
2. Filtrez par domaine : `fabrication.laplume-artisanale.tn`
3. Cherchez les erreurs récentes

#### Logs Séparés (si activés)
1. Panneau OVH → **Multisite**
2. Cliquez sur `fabrication.laplume-artisanale.tn`
3. Cherchez l'onglet **"Logs"** ou **"Logs séparés"**

### 2. Logs depuis SSH

#### Vérifier les Processus Node.js

```bash
# Vérifier que l'application tourne
ps aux | grep node

# Voir les détails du processus
ps aux | grep node | grep -v grep
```

#### Chercher les Logs Node.js (si accessibles)

```bash
# Chercher les fichiers de logs
find ~/logs -name "*node*" -o -name "*error*" 2>/dev/null

# Vérifier les logs système (si accessibles)
tail -f ~/logs/error.log 2>/dev/null
tail -f ~/logs/nodejs.log 2>/dev/null
```

#### Vérifier les Logs Apache/Nginx (si accessibles)

```bash
# Logs d'erreur Apache (si accessibles)
tail -f ~/logs/error.log 2>/dev/null

# Logs d'accès (si accessibles)
tail -f ~/logs/access.log 2>/dev/null
```

---

## 🔍 Ce qu'il Faut Chercher dans les Logs

### Dans les Logs d'Erreur OVH

Cherchez :
- `502 Bad Gateway` → Application Node.js non démarrée
- `503 Service Unavailable` → Application en erreur
- `501 Not Implemented` → Problème de routage
- `Connection refused` → Problème de port
- Erreurs Node.js spécifiques

### Dans les Logs d'Accès OVH

Vérifiez :
- Si vos requêtes apparaissent
- Les codes de statut HTTP (200, 404, 501, etc.)
- Les timestamps des requêtes

---

## 🧪 Générer des Logs en Testant

Pour générer des entrées de log :

```bash
# Faire plusieurs requêtes
for i in {1..5}; do
  curl http://fabrication.laplume-artisanale.tn/health
  curl http://fabrication.laplume-artisanale.tn/
  sleep 2
done
```

**Puis** : Retournez dans le panneau OVH et rafraîchissez les logs. Vous devriez voir de nouvelles entrées.

---

## 📊 Interprétation des Logs

### Si les Logs Montrent "501 Not Implemented"

**Cause probable** :
- Fichier `.htaccess` qui intercepte les requêtes
- PHP activé qui intercepte avant Node.js
- Configuration Multisite incorrecte

**Solution** :
1. Vérifier et supprimer `.htaccess`
2. Désactiver PHP dans Multisite (si possible)
3. Vérifier la configuration Multisite

### Si les Logs Montrent "502 Bad Gateway"

**Cause probable** :
- Application Node.js non démarrée
- Application en erreur

**Solution** :
1. Vérifier que l'application tourne : `ps aux | grep node`
2. Vérifier les logs d'erreur Node.js
3. Redémarrer l'application

### Si Aucun Log N'Apparaît

**Cause probable** :
- Les requêtes n'arrivent pas au serveur
- Logs non activés

**Solution** :
1. Activer les logs séparés dans Multisite
2. Tester depuis votre machine locale
3. Vérifier la configuration DNS

---

## 📋 Checklist

- [ ] Logs d'accès consultés dans le panneau OVH
- [ ] Logs d'erreur consultés dans le panneau OVH
- [ ] Logs séparés activés et consultés (si disponible)
- [ ] Processus Node.js vérifié depuis SSH
- [ ] Requêtes générées pour créer des logs
- [ ] Logs rafraîchis après les tests
- [ ] Erreurs identifiées dans les logs

---

## 🆘 Si Vous Ne Trouvez Pas les Logs

### Vérifier dans le Panneau OVH

1. **Statistiques et logs** → **Logs d'erreur**
   - Cherchez les erreurs pour `fabrication.laplume-artisanale.tn`

2. **Multisite** → `fabrication.laplume-artisanale.tn` → **Logs**
   - Si les logs séparés sont activés

3. **Informations générales** → **Logs**
   - Logs généraux de l'hébergement

### Contacter le Support OVH

Si vous ne trouvez pas les logs :

1. Panneau OVH → **Support** → **Créer un ticket**
2. Demandez où consulter les logs pour votre domaine

---

## ✅ Résumé

1. **Consultez les logs d'erreur** dans le panneau OVH
2. **Générez des requêtes** pour créer des logs
3. **Cherchez l'erreur 501** dans les logs
4. **Identifiez la cause** selon les erreurs trouvées

**Les logs vous diront exactement ce qui ne va pas !**

