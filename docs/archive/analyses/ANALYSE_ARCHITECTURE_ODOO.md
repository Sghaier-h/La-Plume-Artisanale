# 🏗️ Analyse Détaillée de l'Architecture Odoo

**Date :** 20 janvier 2026  
**Version analysée :** Odoo 19.0  
**Source :** https://github.com/odoo/odoo

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture générale](#architecture-générale)
3. [Système de modules](#système-de-modules)
4. [ORM (Object-Relational Mapping)](#orm)
5. [Système de vues](#système-de-vues)
6. [API et décorateurs](#api-et-décorateurs)
7. [Environnement et registre](#environnement-et-registre)
8. [Sécurité et permissions](#sécurité-et-permissions)
9. [Workflow et états](#workflow-et-états)
10. [Principes clés à copier](#principes-clés-à-copier)

---

## 🎯 VUE D'ENSEMBLE

### Statistiques du projet
- **Commits :** 197,241
- **Contributeurs :** 2,349
- **Stars :** 48.6k
- **Forks :** 31.2k
- **Langages :** Python (51%), JavaScript (44.8%), SCSS (2%), etc.
- **Fichiers :** 45,720+ fichiers
- **Modules :** 400+ modules officiels

### Stack technique
- **Backend :** Python 3.10+
- **Frontend :** JavaScript (OWL Framework)
- **Base de données :** PostgreSQL
- **ORM :** Custom ORM (très puissant)
- **Architecture :** MVC (Model-View-Controller)

---

## 🏗️ ARCHITECTURE GÉNÉRALE

### Structure des dossiers

```
odoo-19.0/
├── odoo/                    # Noyau du système
│   ├── api/                 # Décorateurs API (@api.model, @api.depends, etc.)
│   ├── models/              # Classes de base des modèles
│   ├── orm/                 # ORM (Object-Relational Mapping)
│   │   ├── models.py        # BaseModel, Model, TransientModel
│   │   ├── fields.py        # Types de champs
│   │   ├── registry.py      # Registre des modèles
│   │   ├── environments.py # Environnement (env)
│   │   ├── decorators.py   # Décorateurs (@api.constrains, @api.depends)
│   │   └── ...
│   ├── modules/             # Système de gestion des modules
│   │   ├── module.py        # Manifest et découverte
│   │   ├── loading.py       # Chargement des modules
│   │   ├── module_graph.py  # Graphe de dépendances
│   │   └── registry/        # Registre des modules
│   ├── http.py              # Framework HTTP
│   ├── tools/               # Outils utilitaires
│   └── ...
├── addons/                  # Modules métier
│   ├── base/                # Module de base (obligatoire)
│   ├── sale/                # Module Ventes
│   ├── purchase/            # Module Achats
│   ├── stock/               # Module Stock
│   ├── mrp/                 # Module Production
│   ├── account/             # Module Comptabilité
│   └── ... (400+ modules)
└── odoo-bin                 # Exécutable principal
```

### Principes architecturaux

1. **Modularité** : Chaque fonctionnalité est un module indépendant
2. **Héritage** : Système d'héritage puissant (models, views, controllers)
3. **Déclaratif** : Définition déclarative des modèles et vues
4. **ORM avancé** : Abstraction complète de la base de données
5. **Environnement** : Contexte isolé par transaction/utilisateur
6. **Registre** : Registre centralisé des modèles et modules

---

## 📦 SYSTÈME DE MODULES

### Structure d'un module

Chaque module Odoo suit une structure standardisée :

```
module_name/
├── __manifest__.py          # Manifest du module (métadonnées)
├── __init__.py              # Imports Python
├── models/                  # Modèles de données
│   ├── __init__.py
│   └── model_name.py
├── views/                   # Vues XML
│   └── model_name_views.xml
├── security/                # Permissions
│   ├── ir.model.access.csv
│   └── ir_rules.xml
├── data/                    # Données initiales
│   └── data.xml
├── demo/                    # Données de démo
│   └── demo.xml
├── controllers/             # Contrôleurs HTTP
│   ├── __init__.py
│   └── controller.py
├── static/                  # Assets statiques
│   ├── src/
│   │   ├── js/
│   │   ├── css/
│   │   └── xml/
│   └── description/
│       └── icon.png
└── i18n/                    # Traductions
    └── fr.po
```

### Manifest (`__manifest__.py`)

Le manifest définit les métadonnées du module :

```python
{
    'name': 'Sales',
    'version': '1.2',
    'category': 'Sales/Sales',
    'summary': 'Sales internal machinery',
    'description': """
    This module contains all the common features of Sales Management.
    """,
    'depends': [
        'sales_team',
        'account_payment',
        'utm',
    ],
    'data': [
        'security/ir.model.access.csv',
        'views/sale_order_views.xml',
        'data/ir_sequence_data.xml',
    ],
    'demo': [
        'data/sale_demo.xml',
    ],
    'installable': True,
    'auto_install': False,
    'application': True,
    'assets': {
        'web.assets_backend': [
            'sale/static/src/js/**/*',
        ],
    },
    'post_init_hook': '_post_init_hook',
    'author': 'Odoo S.A.',
    'license': 'LGPL-3',
}
```

**Champs clés :**
- `name` : Nom du module
- `version` : Version
- `depends` : Modules requis
- `data` : Fichiers de données à charger
- `demo` : Données de démo
- `installable` : Si le module peut être installé
- `auto_install` : Installation automatique si dépendances installées
- `application` : Si c'est une application principale

### Chargement des modules

**Processus de chargement :**

1. **Découverte** : Scan des dossiers `addons/`
2. **Graphe de dépendances** : Construction du graphe (ModuleGraph)
3. **Ordre de chargement** : Tri topologique selon dépendances
4. **Chargement Python** : Import des fichiers Python
5. **Chargement données** : Chargement des fichiers XML/CSV
6. **Post-installation** : Exécution des hooks

**Code clé :** `odoo/modules/loading.py`

```python
def load_modules(env, force=False):
    """Charge tous les modules installés"""
    graph = ModuleGraph(env.cr, mode='load')
    graph.extend(installed_modules)
    
    for module in graph:
        load_openerp_module(module.name)
        load_data(env, module)
```

---

## 🗄️ ORM (OBJECT-RELATIONAL MAPPING)

### Architecture de l'ORM

L'ORM d'Odoo est l'un des plus puissants au monde. Il abstrait complètement la base de données.

#### Hiérarchie des classes

```
AbstractModel (classe abstraite)
    └── BaseModel (classe de base)
        ├── Model (modèles persistants)
        └── TransientModel (modèles temporaires)
```

#### Classe Model

**Fichier :** `odoo/orm/models.py`

```python
class Model(BaseModel):
    """Modèle persistant (sauvegardé en base)"""
    _name = 'model.name'        # Nom du modèle (obligatoire)
    _description = "Description" # Description
    _order = 'name, id desc'    # Ordre par défaut
    _table = 'table_name'       # Nom de la table (optionnel)
    _inherit = ['model1', 'model2']  # Héritage
    _check_company_auto = True  # Vérification multi-société
```

#### Exemple de modèle

**Fichier :** `addons/sale/models/sale_order.py`

```python
class SaleOrder(models.Model):
    _name = 'sale.order'
    _inherit = ['portal.mixin', 'mail.thread', 'mail.activity.mixin']
    _description = "Sales Order"
    _order = 'date_order desc, id desc'
    _check_company_auto = True

    # Champs
    name = fields.Char(
        string="Order Reference",
        required=True, 
        copy=False, 
        readonly=False,
        index='trigram',
        default=lambda self: _('New'))

    partner_id = fields.Many2one(
        comodel_name='res.partner',
        string="Customer",
        required=True, 
        change_default=True, 
        index=True,
        tracking=1,
        check_company=True)

    state = fields.Selection(
        selection=[
            ('draft', "Quotation"),
            ('sent', "Quotation Sent"),
            ('sale', "Sales Order"),
            ('cancel', "Cancelled"),
        ],
        string="Status",
        readonly=True, 
        copy=False, 
        index=True,
        tracking=3,
        default='draft')

    order_line = fields.One2many(
        comodel_name='sale.order.line',
        inverse_name='order_id',
        string="Order Lines")

    amount_total = fields.Monetary(
        string="Total",
        compute='_compute_amount',
        store=True)

    # Méthodes
    @api.depends('order_line.price_total')
    def _compute_amount(self):
        for order in self:
            order.amount_total = sum(order.order_line.mapped('price_total'))

    @api.model_create_multi
    def create(self, vals_list):
        # Création multiple optimisée
        return super().create(vals_list)

    def action_confirm(self):
        """Confirmer la commande"""
        self.write({'state': 'sale'})
        return True
```

### Types de champs

**Fichier :** `odoo/orm/fields.py`

#### Champs de base
- `Char` : Texte
- `Text` : Texte long
- `Integer` : Entier
- `Float` : Décimal
- `Boolean` : Booléen
- `Date` : Date
- `Datetime` : Date et heure
- `Binary` : Fichier binaire
- `Image` : Image
- `Html` : HTML
- `Selection` : Liste de sélection

#### Champs relationnels
- `Many2one` : Relation plusieurs-à-un
- `One2many` : Relation un-à-plusieurs
- `Many2many` : Relation plusieurs-à-plusieurs

#### Champs calculés
- `compute` : Fonction de calcul
- `store` : Stocker en base (ou calculer à la volée)
- `depends` : Champs dont dépend le calcul

### Méthodes ORM principales

#### search(domain, ...)
```python
# Rechercher des enregistrements
orders = self.env['sale.order'].search([
    ('state', '=', 'draft'),
    ('partner_id', '=', partner_id)
], limit=10, order='date_order desc')
```

#### read(ids, fields)
```python
# Lire des enregistrements
orders = self.env['sale.order'].read([order_id], {
    'fields': ['name', 'partner_id', 'amount_total']
})
```

#### create(vals)
```python
# Créer un enregistrement
order = self.env['sale.order'].create({
    'partner_id': partner_id,
    'order_line': [(0, 0, {
        'product_id': product_id,
        'quantity': 10
    })]
})
```

#### write(vals)
```python
# Modifier des enregistrements
orders.write({
    'state': 'sale',
    'date_order': fields.Datetime.now()
})
```

#### unlink()
```python
# Supprimer des enregistrements
orders.unlink()
```

#### browse(ids)
```python
# Accéder aux enregistrements (lazy loading)
order = self.env['sale.order'].browse([order_id])
print(order.name)  # Charge depuis la base si nécessaire
```

### Domain (filtres)

Les domaines permettent de filtrer les données :

```python
# Syntaxe de domaine
domain = [
    ('field1', '=', value),           # Égalité
    ('field2', '!=', value),          # Différent
    ('field3', '>', value),            # Supérieur
    ('field4', 'in', [val1, val2]),   # Dans une liste
    ('field5', 'like', '%text%'),     # Contient
    '|',                              # OU
    '&',                              # ET
    '!',                              # NOT
    ('field6', 'child_of', parent_id), # Enfant de
]
```

---

## 🎨 SYSTÈME DE VUES

### Types de vues

Odoo supporte plusieurs types de vues :

1. **Form** : Formulaire (édition)
2. **Tree** : Liste (tableau)
3. **Kanban** : Vue kanban (cartes)
4. **Graph** : Graphiques
5. **Pivot** : Tableau croisé dynamique
6. **Calendar** : Calendrier
7. **Gantt** : Diagramme de Gantt
8. **Activity** : Activités

### Exemple de vue Form

**Fichier :** `addons/sale/views/sale_order_views.xml`

```xml
<record id="view_order_form" model="ir.ui.view">
    <field name="name">sale.order.form</field>
    <field name="model">sale.order</field>
    <field name="arch" type="xml">
        <form string="Sales Order">
            <header>
                <button name="action_confirm" 
                        string="Confirm" 
                        type="object"
                        class="oe_highlight"
                        attrs="{'invisible': [('state', '!=', 'draft')]}"/>
                <button name="action_cancel" 
                        string="Cancel" 
                        type="object"
                        attrs="{'invisible': [('state', 'in', ['cancel', 'done'])]}"/>
                <field name="state" widget="statusbar" 
                       statusbar_visible="draft,sent,sale"/>
            </header>
            <sheet>
                <div class="oe_button_box" name="button_box">
                    <button class="oe_stat_button" type="object" name="action_view_invoice">
                        <field name="invoice_count" widget="statinfo" string="Invoices"/>
                    </button>
                </div>
                <group>
                    <group>
                        <field name="name"/>
                        <field name="partner_id"/>
                        <field name="date_order"/>
                    </group>
                    <group>
                        <field name="state"/>
                        <field name="amount_total"/>
                    </group>
                </group>
                <notebook>
                    <page string="Order Lines">
                        <field name="order_line">
                            <tree>
                                <field name="product_id"/>
                                <field name="quantity"/>
                                <field name="price_unit"/>
                                <field name="price_subtotal"/>
                            </tree>
                        </field>
                    </page>
                </notebook>
            </sheet>
        </form>
    </field>
</record>
```

### Exemple de vue Tree

```xml
<record id="view_order_tree" model="ir.ui.view">
    <field name="name">sale.order.tree</field>
    <field name="model">sale.order</field>
    <field name="arch" type="xml">
        <tree string="Sales Orders" decoration-info="state=='draft'">
            <field name="name"/>
            <field name="partner_id"/>
            <field name="date_order"/>
            <field name="amount_total"/>
            <field name="state"/>
        </tree>
    </field>
</record>
```

### Exemple de vue Kanban

```xml
<record id="view_order_kanban" model="ir.ui.view">
    <field name="name">sale.order.kanban</field>
    <field name="model">sale.order</field>
    <field name="arch" type="xml">
        <kanban default_group_by="state">
            <field name="name"/>
            <field name="partner_id"/>
            <field name="amount_total"/>
            <templates>
                <t t-name="kanban-box">
                    <div class="oe_kanban_card">
                        <div class="oe_kanban_content">
                            <strong><field name="name"/></strong>
                            <div><field name="partner_id"/></div>
                            <div><field name="amount_total"/></div>
                        </div>
                    </div>
                </t>
            </templates>
        </kanban>
    </field>
</record>
```

### Héritage de vues

Les vues peuvent être héritées :

```xml
<!-- Vue de base -->
<record id="view_order_form" model="ir.ui.view">
    <field name="arch" type="xml">
        <form>
            <field name="name"/>
        </form>
    </field>
</record>

<!-- Vue héritée -->
<record id="view_order_form_inherit" model="ir.ui.view">
    <field name="name">sale.order.form.inherit</field>
    <field name="model">sale.order</field>
    <field name="inherit_id" ref="sale.view_order_form"/>
    <field name="arch" type="xml">
        <xpath expr="//field[@name='name']" position="after">
            <field name="custom_field"/>
        </xpath>
    </field>
</record>
```

---

## 🎯 API ET DÉCORATEURS

### Décorateurs principaux

**Fichier :** `odoo/orm/decorators.py`

#### @api.model
Décorateur pour les méthodes de classe (pas d'instance) :

```python
@api.model
def create(self, vals):
    """Créer un enregistrement"""
    return super().create(vals)
```

#### @api.depends
Définit les dépendances d'un champ calculé :

```python
@api.depends('order_line.price_total')
def _compute_amount_total(self):
    for order in self:
        order.amount_total = sum(order.order_line.mapped('price_total'))
```

#### @api.constrains
Valide des contraintes :

```python
@api.constrains('quantity')
def _check_quantity(self):
    for record in self:
        if record.quantity <= 0:
            raise ValidationError("Quantity must be positive")
```

#### @api.onchange
Déclenche une action quand un champ change :

```python
@api.onchange('partner_id')
def _onchange_partner_id(self):
    if self.partner_id:
        self.payment_term_id = self.partner_id.property_payment_term_id
```

#### @api.model_create_multi
Optimise la création multiple :

```python
@api.model_create_multi
def create(self, vals_list):
    # Traite plusieurs créations en une fois
    return super().create(vals_list)
```

#### @api.depends_context
Dépend du contexte :

```python
@api.depends_context('lang')
def _compute_translated_name(self):
    # Recalculé si la langue change
    pass
```

---

## 🌍 ENVIRONNEMENT ET REGISTRE

### Environment (env)

**Fichier :** `odoo/orm/environments.py`

L'environnement (`env`) est le contexte d'exécution :

```python
# Accès à l'environnement
env = self.env

# Propriétés de l'environnement
env.cr          # Curseur de base de données
env.uid         # ID utilisateur
env.context     # Contexte (dict)
env.su          # Superuser mode

# Accès aux modèles
env['sale.order']        # Modèle sale.order
env['res.partner']      # Modèle res.partner

# Créer un nouvel environnement
new_env = env(user_id=2, context={'lang': 'fr_FR'})
new_env = env(su=True)  # Mode superuser
```

### Registry

**Fichier :** `odoo/orm/registry.py`

Le registre stocke tous les modèles :

```python
# Un registre par base de données
registry = Registry(database_name)

# Accès aux modèles
SaleOrder = registry['sale.order']

# Le registre est partagé entre toutes les instances
```

### Transaction

Chaque transaction a son propre environnement :

```python
with env.cr.savepoint():
    # Transaction avec point de sauvegarde
    order = env['sale.order'].create({...})
    # En cas d'erreur, rollback automatique
```

---

## 🔒 SÉCURITÉ ET PERMISSIONS

### Permissions par modèle

**Fichier :** `security/ir.model.access.csv`

```csv
id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink
access_sale_order_user,sale.order.user,model_sale_order,base.group_user,1,1,1,0
access_sale_order_manager,sale.order.manager,model_sale_order,base.group_system,1,1,1,1
```

### Règles d'accès (Record Rules)

**Fichier :** `security/ir_rules.xml`

```xml
<record id="sale_order_rule_user" model="ir.rule">
    <field name="name">Sale Order: user access</field>
    <field name="model_id" ref="model_sale_order"/>
    <field name="domain_force">[('user_id', '=', user.id)]</field>
    <field name="groups" eval="[(4, ref('base.group_user'))]"/>
</record>
```

### Vérification des permissions

```python
# Vérification automatique dans l'ORM
order = env['sale.order'].browse([order_id])
order.write({'state': 'sale'})  # Vérifie automatiquement les permissions

# Mode superuser (bypass permissions)
order.sudo().write({'state': 'sale'})
```

---

## 🔄 WORKFLOW ET ÉTATS

### États (States)

Les états sont gérés via des champs `Selection` :

```python
state = fields.Selection(
    selection=[
        ('draft', "Draft"),
        ('confirmed', "Confirmed"),
        ('done', "Done"),
        ('cancel', "Cancelled"),
    ],
    string="Status",
    default='draft')
```

### Transitions

Les transitions sont gérées via des méthodes :

```python
def action_confirm(self):
    """Passer de draft à confirmed"""
    self.write({'state': 'confirmed'})
    return True

def action_done(self):
    """Passer de confirmed à done"""
    self.write({'state': 'done'})
    return True
```

### Contraintes d'état

```python
@api.constrains('state')
def _check_state(self):
    for record in self:
        if record.state == 'done' and not record.order_line:
            raise ValidationError("Cannot confirm order without lines")
```

---

## 🎯 PRINCIPES CLÉS À COPIER

### 1. Système de modules modulaire

**Principe :**
- Chaque fonctionnalité = module indépendant
- Manifest standardisé
- Dépendances explicites
- Chargement automatique

**À copier dans La Plume :**
```javascript
// modules/sale/manifest.js
export default {
  name: 'sale',
  version: '1.0.0',
  depends: ['base', 'product', 'partner'],
  installable: true,
  auto_install: false
};
```

### 2. ORM puissant

**Principe :**
- Abstraction complète de la base de données
- Relations automatiques
- Champs calculés
- Domain filters

**À copier dans La Plume :**
```javascript
// core/orm/base.model.js
export class BaseModel {
  async search(domain, options) { }
  async read(ids, fields) { }
  async create(vals) { }
  async write(ids, vals) { }
  async unlink(ids) { }
}
```

### 3. Système de vues déclaratif

**Principe :**
- Vues définies en XML/JSON
- Types de vues multiples
- Héritage de vues

**À copier dans La Plume :**
```javascript
// modules/sale/views/sale_order_views.json
{
  "form": {
    "fields": {
      "name": { "string": "Order Reference", "required": true },
      "partner_id": { "type": "many2one", "required": true }
    }
  }
}
```

### 4. Décorateurs API

**Principe :**
- `@api.depends` pour champs calculés
- `@api.constrains` pour validations
- `@api.onchange` pour réactions

**À copier dans La Plume :**
```javascript
// core/hooks/hooks.decorator.js
export class HooksDecorator {
  static depends(fields) { }
  static constrains(fields, condition) { }
  static onchange(fieldName) { }
}
```

### 5. Environnement isolé

**Principe :**
- Contexte par transaction/utilisateur
- Isolation des données
- Mode superuser

**À copier dans La Plume :**
```javascript
// core/environment/environment.js
export class Environment {
  constructor(userId, context) {
    this.userId = userId;
    this.context = context;
    this.models = new Map();
  }
  
  model(modelName) {
    return this.models.get(modelName);
  }
}
```

### 6. Registre centralisé

**Principe :**
- Un registre par base de données
- Stockage de tous les modèles
- Partage entre instances

**À copier dans La Plume :**
```javascript
// core/registry/registry.js
export class Registry {
  constructor() {
    this.models = new Map();
  }
  
  register(modelName, modelClass) {
    this.models.set(modelName, modelClass);
  }
}
```

### 7. Système de permissions granulaires

**Principe :**
- Permissions par modèle
- Permissions par champ
- Règles d'accès (record rules)

**À copier dans La Plume :**
```javascript
// core/security/access.rights.js
export class AccessRights {
  defineAccess(modelName, groupName, permissions) { }
  async checkAccess(user, modelName, operation, record) { }
}
```

### 8. Workflow et états

**Principe :**
- États via champs Selection
- Transitions via méthodes
- Contraintes d'état

**À copier dans La Plume :**
```javascript
// core/workflow/workflow.engine.js
export class WorkflowEngine {
  registerWorkflow(modelName, workflow) { }
  async transition(record, fromState, toState) { }
}
```

---

## 📊 COMPARAISON AVEC LA PLUME ARTISANALE

| Aspect | Odoo | La Plume Artisanale | À copier ? |
|--------|------|---------------------|------------|
| **Modules** | ✅ Système complet | ⚠️ Basique | ✅ OUI |
| **ORM** | ✅✅✅ Très avancé | ⚠️ Prisma/TypeORM | ✅ OUI |
| **Vues** | ✅ XML déclaratif | ⚠️ React manuel | ✅ OUI |
| **Décorateurs** | ✅ @api.* | ❌ Non | ✅ OUI |
| **Environnement** | ✅ env isolé | ⚠️ Partiel | ✅ OUI |
| **Registre** | ✅ Centralisé | ❌ Non | ✅ OUI |
| **Permissions** | ✅✅ Très avancé | ⚠️ Basique | ✅ OUI |
| **Workflow** | ✅ Intégré | ⚠️ Manuel | ✅ OUI |

---

## 🎯 PLAN D'IMPLÉMENTATION POUR LA PLUME

### Phase 1 : Infrastructure (2-3 mois)

1. **Système de modules**
   - Module Manager
   - Manifest loader
   - Dépendances

2. **ORM de base**
   - BaseModel
   - Relations (One2many, Many2one, Many2many)
   - Search/Read/Write/Create/Unlink

3. **Environnement**
   - Environment class
   - Registry
   - Transaction management

### Phase 2 : Fonctionnalités avancées (2-3 mois)

1. **Décorateurs**
   - @depends
   - @constrains
   - @onchange

2. **Système de vues**
   - Vues JSON
   - Génération React
   - Héritage de vues

3. **Permissions**
   - Access rights
   - Record rules
   - Groupes

### Phase 3 : Modules métier (2-3 mois)

1. **Modules de base**
   - Base
   - Product
   - Partner

2. **Modules ERP**
   - Sale
   - Purchase
   - Stock
   - Account

3. **Module textile**
   - GPAO textile
   - Qualité
   - Maintenance

---

## 💡 CONCLUSION

L'architecture d'Odoo est **exceptionnellement bien conçue** :

✅ **Points forts :**
- Modularité parfaite
- ORM très puissant
- Système de vues flexible
- Sécurité robuste
- Extensibilité maximale

✅ **À copier dans La Plume :**
- Tous les principes architecturaux
- Système de modules
- ORM avancé
- Décorateurs API
- Environnement isolé
- Registre centralisé

⚠️ **Adaptations nécessaires :**
- Python → Node.js/JavaScript
- XML → JSON (pour vues)
- PostgreSQL → PostgreSQL (identique)
- OWL Framework → React

**Recommandation :** Copier tous les principes d'Odoo dans La Plume pour avoir une architecture de niveau professionnel.

---

**Document créé le :** 20 janvier 2026  
**Version :** 1.0  
**Prochaine étape :** Implémentation dans La Plume Artisanale
