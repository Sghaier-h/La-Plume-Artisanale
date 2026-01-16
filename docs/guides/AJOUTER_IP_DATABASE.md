# ✅ Ajouter l'IP du Serveur Web à la Base de Données

## ✅ IP Trouvée

**IP du serveur web** : `145.239.37.162`

---

## 🔧 Étape : Autoriser l'IP dans OVH Cloud Databases

### Dans le Panneau OVH

1. **Connectez-vous au panneau OVH**
2. **Allez dans** : **Web Cloud** → **Databases**
3. **Cliquez sur** : **sh131616-002** (La Plume Artisanale)
4. **Cliquez sur l'onglet** : **IPs autorisées**
5. **Cliquez sur** : **Ajouter une IP ou une plage d'IP**
6. **Entrez** :
   - **IP** : `145.239.37.162`
   - **Description** : `Serveur web cluster130` (optionnel)
7. **Cliquez sur** : **Valider**

**Attendez quelques secondes** pour que la modification soit prise en compte.

---

## 🧪 Tester la Connexion

### Depuis le Serveur Web

```bash
# Se connecter au serveur
ssh allbyfb@ssh.cluster130.hosting.ovh.net

cd ~/fouta-erp/backend

# Vérifier le .env
cat .env | grep DB_

# Doit afficher :
# DB_HOST=sh131616-002.eu.clouddb.ovh.net
# DB_PORT=35392
# DB_NAME=ERP_La_Plume
# DB_USER=Aviateur
# DB_PASSWORD=Allbyfouta007
```

### Tester avec Node.js (si pg est installé)

```bash
cd ~/fouta-erp/backend

# Charger nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Tester la connexion
node -e "
const { Client } = require('pg');
const client = new Client({
  host: 'sh131616-002.eu.clouddb.ovh.net',
  port: 35392,
  database: 'ERP_La_Plume',
  user: 'Aviateur',
  password: 'Allbyfouta007'
});
client.connect()
  .then(() => {
    console.log('✅ Connexion à la base de données réussie !');
    return client.query('SELECT version()');
  })
  .then(result => {
    console.log('📊 Version PostgreSQL:', result.rows[0].version);
    client.end();
  })
  .catch(err => {
    console.error('❌ Erreur:', err.message);
    client.end();
  });
"
```

---

## 📋 Checklist

- [x] IP trouvée : `145.239.37.162`
- [ ] IP ajoutée dans "IPs autorisées" de la base de données
- [ ] Connexion testée depuis le serveur web
- [ ] `.env` vérifié avec les bonnes informations

---

## ✅ Résumé

1. **Ajoutez l'IP** `145.239.37.162` dans les IPs autorisées de la base de données
2. **Attendez quelques secondes** pour la prise en compte
3. **Testez la connexion** depuis le serveur web

**Une fois l'IP autorisée, la base de données sera accessible depuis le serveur web !**

