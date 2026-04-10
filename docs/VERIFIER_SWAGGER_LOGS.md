# 🔍 Vérifier les Logs Swagger

## Vérifier les Logs Complets

```bash
# Voir les dernières lignes des logs
pm2 logs fouta-api --lines 50

# Ou filtrer pour Swagger
pm2 logs fouta-api --lines 50 | grep -i swagger

# Ou voir les erreurs
pm2 logs fouta-api --lines 50 | grep -i error
```

## Ce qu'il faut chercher

### ✅ Succès
- `✅ Documentation Swagger disponible sur /api-docs`

### ⚠️ Avertissements (non bloquants)
- `⚠️ Swagger non configuré :` (si dépendances non installées)

### ❌ Erreurs (bloquantes)
- `SyntaxError: Missing initializer in const declaration`
- `ERROR` (autres erreurs critiques)

---

## Tester Swagger dans le Navigateur

Ouvrir :
```
https://fabrication.laplume-artisanale.tn/api-docs
```

Si Swagger s'affiche → ✅ Succès !
Si erreur 404 ou page vide → ⚠️ Vérifier les logs
