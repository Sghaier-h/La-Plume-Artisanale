# 🔧 Corriger utilisateurs.controller.js

## Erreurs Trouvées

3 annotations TypeScript dans `utilisateurs.controller.js` :
- Ligne 88 : `const dashboardsMap: any = {};`
- Ligne 89 : `dashboardsResult.rows.forEach((row: any) => {`
- Ligne 96 : `const utilisateurs = result.rows.map((row: any) => ({`
- Ligne ~153 : `dashboardsResult.rows.map((r: any) =>`

## Correction sur le Serveur

```bash
cd /opt/fouta-erp/backend/src/controllers

# Corriger toutes les annotations
sed -i 's/const dashboardsMap: any = {}/const dashboardsMap = {}/' utilisateurs.controller.js
sed -i 's/(row: any)/(row)/g' utilisateurs.controller.js
sed -i 's/(r: any)/(r)/g' utilisateurs.controller.js

# Vérifier
sed -n '88p;89p;96p;153p' utilisateurs.controller.js
```
