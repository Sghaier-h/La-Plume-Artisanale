# 🎨 Système de Thèmes - La Plume Artisanale

## ✅ Implémentation Complétée

### 1. **ThemeContext** (`frontend/src/contexts/ThemeContext.tsx`)
- Gestion centralisée des thèmes
- Support de 3 modes : `light`, `dark`, `auto`
- Support de 5 palettes de couleurs : `default`, `blue`, `purple`, `green`, `orange`
- Sauvegarde automatique dans localStorage
- Détection automatique des préférences système (mode auto)

### 2. **Thèmes Disponibles**

#### Modes d'affichage :
- **Clair** : Interface en mode clair
- **Sombre** : Interface en mode sombre
- **Automatique** : Suit les préférences système (dark/light)

#### Palettes de couleurs :
1. **Par défaut** : Indigo/Violet/Rose (`#6366f1`, `#8b5cf6`, `#ec4899`)
2. **Bleu** : Palette bleue (`#3b82f6`, `#2563eb`, `#60a5fa`)
3. **Violet** : Palette violette (`#8b5cf6`, `#7c3aed`, `#a78bfa`)
4. **Vert** : Palette verte (`#10b981`, `#059669`, `#34d399`)
5. **Orange** : Palette orange (`#f59e0b`, `#d97706`, `#fbbf24`)

### 3. **Intégration dans Settings**
- Section "Thème et Apparence" dans la catégorie "Général"
- Sélecteur de mode (Clair/Sombre/Automatique)
- Sélecteur de palette de couleurs avec aperçu
- Aperçu en temps réel du thème sélectionné

### 4. **Application du Thème**
- Variables CSS personnalisées (`--theme-primary`, `--theme-secondary`, etc.)
- Application automatique à tous les composants
- Page d'accueil (Home.tsx) utilise le thème
- Transitions fluides lors du changement de thème

## 📝 Utilisation

### Dans un composant React :
```typescript
import { useTheme } from '../../contexts/ThemeContext';

const MyComponent = () => {
  const { theme, themeColors, isDark, setMode, setColor } = useTheme();
  
  return (
    <div style={{ 
      background: themeColors.background,
      color: themeColors.text 
    }}>
      {/* Contenu */}
    </div>
  );
};
```

### Variables CSS disponibles :
- `--theme-primary` : Couleur primaire
- `--theme-secondary` : Couleur secondaire
- `--theme-accent` : Couleur d'accentuation
- `--theme-background` : Fond de page
- `--theme-surface` : Fond des cartes/surfaces
- `--theme-text` : Texte principal
- `--theme-text-secondary` : Texte secondaire
- `--theme-border` : Bordures
- `--theme-shadow` : Ombres
- `--theme-gradient-from` : Début du gradient
- `--theme-gradient-to` : Fin du gradient
- `--theme-gradient-via` : Milieu du gradient (si disponible)

## 🎯 Fonctionnalités

1. **Sauvegarde automatique** : Le thème est sauvegardé dans localStorage
2. **Mode automatique** : Détecte les préférences système (dark/light)
3. **Transitions fluides** : Changement de thème avec animations
4. **Aperçu en temps réel** : Visualisation immédiate des changements
5. **Persistance** : Le thème est conservé entre les sessions

## 🔧 Configuration

Pour ajouter un nouveau thème, modifier `ThemeContext.tsx` :

1. Ajouter la palette dans `themes` et `darkThemes`
2. Ajouter l'option dans `availableThemes`
3. Ajouter l'option dans le sélecteur de Settings

## 📱 Responsive

Le système de thèmes est entièrement responsive et s'adapte à tous les écrans (PC, tablette, téléphone).
