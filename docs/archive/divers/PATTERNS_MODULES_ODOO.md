# 📚 Patterns et Bonnes Pratiques des Modules Odoo

**Date :** 20 janvier 2026  
**Version analysée :** Odoo 19.0  
**Modules analysés :** sale, mrp, stock, account

---

## 📋 TABLE DES MATIÈRES

1. [Structure standard d'un module](#structure-standard)
2. [Patterns de modèles](#patterns-modèles)
3. [Patterns de champs](#patterns-champs)
4. [Patterns de méthodes](#patterns-méthodes)
5. [Patterns de sécurité](#patterns-sécurité)
6. [Patterns de vues](#patterns-vues)
7. [Patterns de contrôleurs](#patterns-contrôleurs)
8. [Patterns de workflow](#patterns-workflow)
9. [Patterns d'héritage](#patterns-héritage)
10. [Checklist pour créer un module](#checklist)

---

## 🏗️ STRUCTURE STANDARD D'UN MODULE

### Organisation des fichiers

```
module_name/
├── __manifest__.py          # Manifest (métadonnées)
├── __init__.py              # Imports Python
│
├── models/                  # Modèles de données
│   ├── __init__.py          # Imports des modèles
│   ├── model_name.py        # Modèle principal
│   └── related_model.py    # Modèles liés
│
├── views/                   # Vues XML
│   ├── model_name_views.xml # Vues du modèle principal
│   └── menus.xml            # Menus
│
├── security/                # Permissions
│   ├── ir.model.access.csv # Permissions par modèle
│   ├── ir_rules.xml         # Règles d'accès
│   └── res_groups.xml       # Groupes d'utilisateurs
│
├── data/                    # Données initiales
│   ├── data.xml
│   └── sequence_data.xml
│
├── demo/                    # Données de démo
│   └── demo.xml
│
├── controllers/             # Contrôleurs HTTP
│   ├── __init__.py
│   └── controller.py
│
├── wizard/                  # Assistants (TransientModel)
│   └── wizard_views.xml
│
├── report/                  # Rapports
│   └── report_templates.xml
│
└── static/                  # Assets statiques
    ├── src/
    │   ├── js/
    │   ├── css/
    │   └── xml/
    └── description/
        └── icon.png
```

---

## 📦 PATTERNS DE MODÈLES

### 1. Structure de base d'un modèle

```python
from odoo import api, fields, models
from odoo.exceptions import UserError, ValidationError

class ModelName(models.Model):
    _name = 'model.name'
    _description = "Description du modèle"
    _inherit = ['mail.thread', 'mail.activity.mixin']  # Optionnel
    _order = 'name, id desc'
    _check_company_auto = True  # Si multi-société
    
    # === FIELDS ===
    name = fields.Char(string="Name", required=True)
    # ... autres champs
    
    # === COMPUTE METHODS ===
    @api.depends('field1', 'field2')
    def _compute_field(self):
        # Calcul
        pass
    
    # === CONSTRAINT METHODS ===
    @api.constrains('field')
    def _check_field(self):
        # Validation
        pass
    
    # === ONCHANGE METHODS ===
    @api.onchange('field')
    def _onchange_field(self):
        # Réaction au changement
        pass
    
    # === CRUD METHODS ===
    @api.model_create_multi
    def create(self, vals_list):
        # Création
        return super().create(vals_list)
    
    def write(self, vals):
        # Modification
        return super().write(vals)
    
    def unlink(self):
        # Suppression
        return super().unlink()
    
    # === ACTION METHODS ===
    def action_confirm(self):
        # Action métier
        self.write({'state': 'confirmed'})
        return True
```

### 2. Pattern : Modèle avec états (State Machine)

```python
class SaleOrder(models.Model):
    _name = 'sale.order'
    
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
    
    def action_confirm(self):
        """Passer de draft à sale"""
        if self.state != 'draft':
            raise UserError("Only draft orders can be confirmed")
        self.write({'state': 'sale'})
        return True
    
    def action_cancel(self):
        """Annuler la commande"""
        if self.state == 'done':
            raise UserError("Cannot cancel a done order")
        self.write({'state': 'cancel'})
        return True
```

### 3. Pattern : Modèle avec lignes (One2many)

```python
class SaleOrder(models.Model):
    _name = 'sale.order'
    
    order_line = fields.One2many(
        comodel_name='sale.order.line',
        inverse_name='order_id',
        string="Order Lines",
        copy=True)
    
    amount_total = fields.Monetary(
        string="Total",
        compute='_compute_amount',
        store=True)
    
    @api.depends('order_line.price_total')
    def _compute_amount(self):
        for order in self:
            order.amount_total = sum(order.order_line.mapped('price_total'))


class SaleOrderLine(models.Model):
    _name = 'sale.order.line'
    
    order_id = fields.Many2one(
        comodel_name='sale.order',
        string="Order",
        required=True,
        ondelete='cascade',
        index=True)
    
    price_total = fields.Monetary(
        string="Total",
        compute='_compute_price_total',
        store=True)
    
    @api.depends('quantity', 'price_unit', 'discount')
    def _compute_price_total(self):
        for line in self:
            line.price_total = line.quantity * line.price_unit * (1 - line.discount / 100)
```

### 4. Pattern : Modèle avec héritage multiple

```python
class SaleOrder(models.Model):
    _name = 'sale.order'
    _inherit = [
        'portal.mixin',        # Accès portail
        'mail.thread',         # Historique messages
        'mail.activity.mixin', # Activités
        'utm.mixin',           # UTM tracking
        'product.catalog.mixin' # Catalogue produits
    ]
```

### 5. Pattern : Modèle avec séquence automatique

```python
class SaleOrder(models.Model):
    _name = 'sale.order'
    
    name = fields.Char(
        string="Order Reference",
        required=True,
        copy=False,
        readonly=True,
        index=True,
        default=lambda self: _('New'))
    
    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('name', _('New')) == _('New'):
                vals['name'] = self.env['ir.sequence'].next_by_code('sale.order') or _('New')
        return super().create(vals_list)
```

---

## 🎯 PATTERNS DE CHAMPS

### 1. Pattern : Champ calculé avec dépendances

```python
@api.depends('order_line.price_total', 'currency_id', 'company_id')
def _compute_amounts(self):
    for order in self:
        order.amount_total = sum(order.order_line.mapped('price_total'))
```

**Règles :**
- Toujours utiliser `@api.depends` pour les champs calculés
- Lister toutes les dépendances
- Utiliser `store=True` si le calcul est coûteux
- Utiliser `precompute=True` pour calculer à la création

### 2. Pattern : Champ related (relationnel)

```python
class SaleOrderLine(models.Model):
    _name = 'sale.order.line'
    
    order_id = fields.Many2one('sale.order')
    
    # Champ related (copie depuis order)
    company_id = fields.Many2one(
        related='order_id.company_id',
        store=True,
        index=True,
        precompute=True)
    
    currency_id = fields.Many2one(
        related='order_id.currency_id',
        depends=['order_id.currency_id'],
        store=True,
        precompute=True)
```

### 3. Pattern : Champ avec domaine dynamique

```python
product_id = fields.Many2one(
    comodel_name='product.product',
    domain=lambda self: [
        ('type', '=', 'consu'),
        ('company_id', '=', self.env.company.id)
    ])
```

### 4. Pattern : Champ avec tracking

```python
state = fields.Selection(
    selection=[...],
    tracking=3,  # Niveau de tracking (1-5)
    string="Status")

partner_id = fields.Many2one(
    comodel_name='res.partner',
    tracking=1,  # Tracking léger
    string="Customer")
```

### 5. Pattern : Champ avec contrainte SQL

```python
_date_order_conditional_required = models.Constraint(
    "CHECK((state = 'sale' AND date_order IS NOT NULL) OR state != 'sale')",
    'A confirmed sales order requires a confirmation date.',
)
```

### 6. Pattern : Champ Many2many avec relation personnalisée

```python
tag_ids = fields.Many2many(
    comodel_name='crm.tag',
    relation='sale_order_tag_rel',      # Nom de la table
    column1='order_id',                  # Colonne 1
    column2='tag_id',                    # Colonne 2
    string="Tags")
```

---

## 🔧 PATTERNS DE MÉTHODES

### 1. Pattern : Méthode compute avec cache

```python
@api.depends('partner_id', 'company_id')
def _compute_fiscal_position_id(self):
    """Calcul avec cache pour optimiser"""
    cache = {}
    for order in self:
        if not order.partner_id:
            order.fiscal_position_id = False
            continue
        key = (order.company_id.id, order.partner_id.id, order.partner_shipping_id.id)
        if key not in cache:
            cache[key] = self.env['account.fiscal.position']._get_fiscal_position(
                order.partner_id, order.partner_shipping_id).id
        order.fiscal_position_id = cache[key]
```

### 2. Pattern : Méthode avec filtrage conditionnel

```python
@api.depends('order_line.invoice_status')
def _compute_invoice_status(self):
    """Calcul conditionnel selon l'état"""
    confirmed_orders = self.filtered(lambda so: so.state == 'sale')
    (self - confirmed_orders).invoice_status = 'no'
    
    if not confirmed_orders:
        return
    
    for order in confirmed_orders:
        if all(line.invoice_status == 'invoiced' for line in order.order_line):
            order.invoice_status = 'invoiced'
        elif any(line.invoice_status == 'to invoice' for line in order.order_line):
            order.invoice_status = 'to invoice'
        else:
            order.invoice_status = 'no'
```

### 3. Pattern : Méthode avec requête SQL optimisée

```python
def _fetch_duplicate_orders(self):
    """Utilisation de SQL pour performance"""
    self.env['sale.order'].flush_model(['company_id', 'partner_id', 'client_order_ref'])
    
    result = self.env.execute_query(SQL("""
        SELECT
            sale_order.id AS order_id,
            array_agg(duplicate_order.id) AS duplicate_ids
        FROM sale_order
        JOIN sale_order AS duplicate_order
            ON sale_order.company_id = duplicate_order.company_id
            AND sale_order.partner_id = duplicate_order.partner_id
        WHERE sale_order.id IN %(orders)s
        GROUP BY sale_order.id
    """, orders=tuple(self.ids)))
    
    return {
        order_id: set(duplicate_ids)
        for order_id, duplicate_ids in result
    }
```

### 4. Pattern : Méthode avec contexte

```python
@api.depends('partner_id')
def _compute_note(self):
    for order in self:
        # Changer le contexte pour la langue du partenaire
        if order.partner_id.lang:
            order = order.with_context(lang=order.partner_id.lang)
        order.note = order.env.company.invoice_terms
```

### 5. Pattern : Méthode avec ensure_one

```python
def action_confirm(self):
    """Confirmer une commande"""
    self.ensure_one()  # S'assurer qu'il n'y a qu'un seul enregistrement
    
    if self.state != 'draft':
        raise UserError("Only draft orders can be confirmed")
    
    self.write({'state': 'sale'})
    return True
```

### 6. Pattern : Méthode avec validation

```python
@api.constrains('quantity')
def _check_quantity(self):
    for record in self:
        if record.quantity <= 0:
            raise ValidationError("Quantity must be positive")
```

### 7. Pattern : Méthode avec onchange

```python
@api.onchange('partner_id')
def _onchange_partner_id(self):
    """Mettre à jour les champs quand le partenaire change"""
    if self.partner_id:
        self.payment_term_id = self.partner_id.property_payment_term_id
        self.pricelist_id = self.partner_id.property_product_pricelist
```

---

## 🔒 PATTERNS DE SÉCURITÉ

### 1. Pattern : Permissions par modèle (CSV)

**Fichier :** `security/ir.model.access.csv`

```csv
id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink
access_sale_order,sale.order,model_sale_order,sales_team.group_sale_salesman,1,1,1,0
access_sale_order_manager,sale.order.manager,model_sale_order,sales_team.group_sale_manager,1,1,1,1
```

**Permissions :**
- `perm_read` : Lecture (1 = oui, 0 = non)
- `perm_write` : Modification
- `perm_create` : Création
- `perm_unlink` : Suppression

### 2. Pattern : Règles d'accès (Record Rules)

**Fichier :** `security/ir_rules.xml`

```xml
<record id="sale_order_rule_user" model="ir.rule">
    <field name="name">Sale Order: user access</field>
    <field name="model_id" ref="model_sale_order"/>
    <field name="domain_force">[('user_id', '=', user.id)]</field>
    <field name="groups" eval="[(4, ref('base.group_user'))]"/>
</record>
```

### 3. Pattern : Vérification d'accès dans le code

```python
def action_confirm(self):
    # Vérification automatique par l'ORM
    if not self.env.user.has_group('sales_team.group_sale_manager'):
        raise AccessError("You don't have permission to confirm orders")
    
    self.write({'state': 'sale'})
```

### 4. Pattern : Mode superuser (sudo)

```python
# Accéder aux données sans vérification de permissions
partner_credit = self.sudo().partner_id.credit

# Créer un environnement superuser
sudo_env = self.env(user=SUPERUSER_ID)
```

### 5. Pattern : Vérification multi-société

```python
class SaleOrder(models.Model):
    _name = 'sale.order'
    _check_company_auto = True  # Vérification automatique
    
    company_id = fields.Many2one(
        comodel_name='res.company',
        required=True,
        index=True)
    
    partner_id = fields.Many2one(
        comodel_name='res.partner',
        check_company=True)  # Vérifier la société
```

---

## 🎨 PATTERNS DE VUES

### 1. Pattern : Vue Form standard

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
                <field name="state" widget="statusbar" 
                       statusbar_visible="draft,sent,sale"/>
            </header>
            <sheet>
                <group>
                    <group>
                        <field name="name"/>
                        <field name="partner_id"/>
                    </group>
                    <group>
                        <field name="date_order"/>
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
                            </tree>
                        </field>
                    </page>
                </notebook>
            </sheet>
        </form>
    </field>
</record>
```

### 2. Pattern : Vue Tree avec décorations

```xml
<record id="view_order_tree" model="ir.ui.view">
    <field name="name">sale.order.tree</field>
    <field name="model">sale.order</field>
    <field name="arch" type="xml">
        <tree string="Sales Orders" 
              decoration-info="state=='draft'"
              decoration-success="state=='sale'"
              decoration-muted="state=='cancel'">
            <field name="name"/>
            <field name="partner_id"/>
            <field name="amount_total"/>
            <field name="state"/>
        </tree>
    </field>
</record>
```

### 3. Pattern : Vue Kanban

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

### 4. Pattern : Héritage de vue

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

## 🌐 PATTERNS DE CONTRÔLEURS

### 1. Pattern : Contrôleur Portal

```python
from odoo import http
from odoo.http import request

class CustomerPortal(http.Controller):
    
    @http.route(['/my/orders', '/my/orders/page/<int:page>'], 
                type='http', auth="user", website=True)
    def portal_my_orders(self, page=1, **kw):
        """Afficher les commandes du client"""
        SaleOrder = request.env['sale.order']
        partner = request.env.user.partner_id
        
        domain = [
            ('partner_id', 'child_of', [partner.commercial_partner_id.id]),
            ('state', '=', 'sale')
        ]
        
        orders = SaleOrder.search(domain, limit=20, offset=(page-1)*20)
        
        return request.render('sale.portal_my_orders', {
            'orders': orders,
            'page_name': 'order',
        })
```

### 2. Pattern : Contrôleur avec authentification

```python
@http.route('/api/sale/order', type='json', auth='user')
def api_create_order(self, **kwargs):
    """API JSON pour créer une commande"""
    order = request.env['sale.order'].create({
        'partner_id': kwargs.get('partner_id'),
        'order_line': [(0, 0, {
            'product_id': line['product_id'],
            'quantity': line['quantity']
        }) for line in kwargs.get('lines', [])]
    })
    return {'order_id': order.id}
```

---

## 🔄 PATTERNS DE WORKFLOW

### 1. Pattern : Workflow avec états

```python
class SaleOrder(models.Model):
    _name = 'sale.order'
    
    state = fields.Selection([
        ('draft', 'Draft'),
        ('sent', 'Sent'),
        ('sale', 'Sale Order'),
        ('done', 'Done'),
        ('cancel', 'Cancelled'),
    ], default='draft', tracking=True)
    
    def action_quotation_send(self):
        """Envoyer le devis"""
        if self.state != 'draft':
            raise UserError("Only draft orders can be sent")
        self.write({'state': 'sent'})
        return True
    
    def action_confirm(self):
        """Confirmer la commande"""
        if self.state not in ('draft', 'sent'):
            raise UserError("Only draft or sent orders can be confirmed")
        self.write({'state': 'sale'})
        return True
    
    def action_done(self):
        """Marquer comme terminé"""
        if self.state != 'sale':
            raise UserError("Only confirmed orders can be done")
        self.write({'state': 'done'})
        return True
    
    def action_cancel(self):
        """Annuler"""
        if self.state == 'done':
            raise UserError("Cannot cancel a done order")
        self.write({'state': 'cancel'})
        return True
```

### 2. Pattern : Workflow avec contraintes

```python
@api.constrains('state', 'order_line')
def _check_state(self):
    for order in self:
        if order.state == 'sale' and not order.order_line:
            raise ValidationError("Cannot confirm order without lines")
```

---

## 🔗 PATTERNS D'HÉRITAGE

### 1. Pattern : Héritage de modèle

```python
# Module de base
class SaleOrder(models.Model):
    _name = 'sale.order'
    name = fields.Char()

# Module d'extension
class SaleOrder(models.Model):
    _inherit = 'sale.order'
    
    custom_field = fields.Char(string="Custom Field")
    
    def action_confirm(self):
        # Appeler la méthode parente
        result = super().action_confirm()
        # Ajouter du code personnalisé
        self.custom_field = "Confirmed"
        return result
```

### 2. Pattern : Héritage de vue

```xml
<!-- Module de base -->
<record id="view_order_form" model="ir.ui.view">
    <field name="arch" type="xml">
        <form>
            <field name="name"/>
        </form>
    </field>
</record>

<!-- Module d'extension -->
<record id="view_order_form_custom" model="ir.ui.view">
    <field name="inherit_id" ref="sale.view_order_form"/>
    <field name="arch" type="xml">
        <xpath expr="//field[@name='name']" position="after">
            <field name="custom_field"/>
        </xpath>
    </field>
</record>
```

### 3. Pattern : Héritage de contrôleur

```python
# Module de base
class CustomerPortal(http.Controller):
    @http.route('/my/orders', type='http', auth='user')
    def portal_my_orders(self):
        return "Orders"

# Module d'extension
from odoo.addons.sale.controllers.portal import CustomerPortal

class CustomerPortal(CustomerPortal):
    @http.route()
    def portal_my_orders(self):
        result = super().portal_my_orders()
        # Ajouter du code personnalisé
        return result
```

---

## ✅ CHECKLIST POUR CRÉER UN MODULE

### 1. Structure de base
- [ ] Créer le dossier du module
- [ ] Créer `__manifest__.py` avec toutes les métadonnées
- [ ] Créer `__init__.py` avec les imports
- [ ] Créer le dossier `models/` avec `__init__.py`
- [ ] Créer le dossier `views/` pour les vues XML
- [ ] Créer le dossier `security/` pour les permissions

### 2. Modèles
- [ ] Définir le modèle principal avec `_name`
- [ ] Ajouter `_description`
- [ ] Définir `_order` si nécessaire
- [ ] Ajouter `_inherit` si héritage
- [ ] Définir tous les champs
- [ ] Ajouter les méthodes `@api.depends` pour les champs calculés
- [ ] Ajouter les méthodes `@api.constrains` pour les validations
- [ ] Ajouter les méthodes `@api.onchange` si nécessaire
- [ ] Surcharger `create`, `write`, `unlink` si nécessaire

### 3. Sécurité
- [ ] Créer `security/ir.model.access.csv` avec les permissions
- [ ] Créer `security/ir_rules.xml` avec les règles d'accès
- [ ] Créer `security/res_groups.xml` si nouveaux groupes

### 4. Vues
- [ ] Créer la vue Form
- [ ] Créer la vue Tree
- [ ] Créer la vue Kanban (si nécessaire)
- [ ] Créer les menus dans `views/menus.xml`
- [ ] Ajouter les actions dans le manifest

### 5. Données
- [ ] Créer `data/data.xml` pour les données initiales
- [ ] Créer `demo/demo.xml` pour les données de démo
- [ ] Ajouter les séquences si nécessaire

### 6. Tests
- [ ] Créer les tests unitaires
- [ ] Créer les tests d'intégration
- [ ] Vérifier que tous les tests passent

### 7. Documentation
- [ ] Ajouter un README.md
- [ ] Documenter les modèles
- [ ] Documenter les méthodes importantes

---

## 🎯 EXEMPLES CONCRETS

### Exemple 1 : Module Sale (Ventes)

**Structure :**
```
sale/
├── __manifest__.py
├── models/
│   ├── sale_order.py
│   └── sale_order_line.py
├── views/
│   ├── sale_order_views.xml
│   └── menus.xml
└── security/
    └── ir.model.access.csv
```

**Patterns utilisés :**
- ✅ Modèle avec états (draft, sent, sale, cancel)
- ✅ Modèle avec lignes (One2many)
- ✅ Champs calculés avec dépendances
- ✅ Méthodes d'action (action_confirm, action_cancel)
- ✅ Héritage multiple (mail.thread, mail.activity.mixin)
- ✅ Sécurité granulaires

### Exemple 2 : Module MRP (Production)

**Structure :**
```
mrp/
├── __manifest__.py
├── models/
│   ├── mrp_production.py
│   ├── mrp_bom.py
│   └── mrp_workorder.py
├── views/
│   └── mrp_production_views.xml
└── security/
    └── ir.model.access.csv
```

**Patterns utilisés :**
- ✅ Modèle avec workflow complexe (draft → confirmed → progress → done)
- ✅ Relations Many2many complexes
- ✅ Calculs de dates et durées
- ✅ Gestion des lots/séries
- ✅ Intégration avec stock

---

## 💡 BONNES PRATIQUES

### 1. Nommage
- ✅ Utiliser des noms explicites : `sale_order` plutôt que `so`
- ✅ Préfixer les méthodes compute : `_compute_field_name`
- ✅ Préfixer les méthodes onchange : `_onchange_field_name`
- ✅ Préfixer les méthodes constraint : `_check_field_name`

### 2. Performance
- ✅ Utiliser `store=True` pour les champs calculés fréquents
- ✅ Utiliser `precompute=True` pour calculer à la création
- ✅ Utiliser des caches dans les méthodes compute
- ✅ Utiliser SQL pour les requêtes complexes

### 3. Sécurité
- ✅ Toujours vérifier les permissions
- ✅ Utiliser `check_company=True` pour multi-société
- ✅ Valider les données avec `@api.constrains`
- ✅ Utiliser `sudo()` avec précaution

### 4. Maintenabilité
- ✅ Documenter les méthodes complexes
- ✅ Utiliser des constantes pour les sélections
- ✅ Séparer la logique métier des vues
- ✅ Réutiliser les mixins existants

---

## 📊 RÉSUMÉ DES PATTERNS

| Pattern | Usage | Exemple |
|---------|-------|---------|
| **Modèle avec états** | Workflow | `state = fields.Selection([...])` |
| **Modèle avec lignes** | Relations One2many | `order_line = fields.One2many(...)` |
| **Champ calculé** | Calculs automatiques | `@api.depends('field')` |
| **Champ related** | Copie depuis relation | `related='parent.field'` |
| **Méthode compute** | Calcul avec cache | `cache = {}` |
| **Méthode constraint** | Validation | `@api.constrains('field')` |
| **Méthode onchange** | Réaction au changement | `@api.onchange('field')` |
| **Héritage de modèle** | Extension | `_inherit = 'model.name'` |
| **Héritage de vue** | Extension de vue | `inherit_id` |
| **Permissions CSV** | Sécurité | `ir.model.access.csv` |
| **Record Rules** | Règles d'accès | `ir_rules.xml` |

---

## 🎯 CONCLUSION

Les modules Odoo suivent des **patterns très structurés** :

✅ **Structure standardisée** : Tous les modules suivent la même organisation  
✅ **Patterns réutilisables** : Modèles, champs, méthodes suivent des patterns clairs  
✅ **Sécurité intégrée** : Permissions et règles d'accès systématiques  
✅ **Extensibilité** : Héritage facile des modèles et vues  
✅ **Performance** : Optimisations intégrées (cache, precompute, store)  

**Pour La Plume :** Adopter ces patterns permettra d'avoir un code :
- Plus maintenable
- Plus extensible
- Plus performant
- Plus sécurisé
- Plus cohérent

---

**Document créé le :** 20 janvier 2026  
**Version :** 1.0  
**Prochaine étape :** Implémenter ces patterns dans La Plume Artisanale
