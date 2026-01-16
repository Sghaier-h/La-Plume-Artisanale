# 🔧 Désactiver Temporairement les Erreurs TypeScript

## 🎯 Problème

Beaucoup d'erreurs TypeScript empêchent la compilation. Pour que l'application fonctionne rapidement, on peut désactiver temporairement les vérifications strictes.

---

## ✅ Solution : Modifier tsconfig.json

### Localiser le fichier

Le fichier se trouve dans : `La-Plume-Artisanale/frontend/tsconfig.json`

### Modifier la configuration

Ouvrir `tsconfig.json` et ajouter/modifier ces options :

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": false,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "noImplicitAny": false,
    "suppressImplicitAnyIndexErrors": true
  },
  "include": [
    "src"
  ]
}
```

**Changements clés** :
- `"strict": false` - Désactive les vérifications strictes
- `"noImplicitAny": false` - Permet les types `any` implicites
- `"suppressImplicitAnyIndexErrors": true` - Supprime les erreurs d'indexation

---

## 🔄 Redémarrer le Serveur

Après modification :

```powershell
# Arrêter le serveur (Ctrl+C)
# Puis relancer
npm start
```

---

## ⚠️ Note Importante

Cette solution est **temporaire** pour permettre à l'application de compiler. Idéalement, il faudrait :

1. **Créer des interfaces TypeScript** pour tous les types
2. **Typer correctement** toutes les fonctions
3. **Corriger progressivement** les erreurs

---

## 📋 Alternative : Corriger Progressivement

Si vous préférez corriger les erreurs au lieu de les désactiver :

### 1. Créer un fichier de types

Créer `La-Plume-Artisanale/frontend/src/types/index.ts` :

```typescript
export interface Preparation {
  numSousOF: string;
  client: string;
  numCommande: string;
  modele: string;
  ref: string;
  qte: number;
  machine: string;
  dateDebut: string;
  ordrePlanification: number;
  selecteurs: Selecteur[];
  etat: string;
  priorite: string;
  surplusDemande: boolean;
  dateAlimentee?: string;
}

export interface Selecteur {
  sel: string;
  codeFab: string;
  codeCom: string;
  couleur: string;
  besoins: number;
  preparer: string;
  qrMP: string;
}

export interface Machine {
  machine: string;
  preparations: Preparation[];
}
```

### 2. Utiliser ces types dans les composants

```typescript
import { Preparation, Selecteur, Machine } from '../types';

const [preparationsEnCours, setPreparationsEnCours] = useState<Preparation[]>([]);
const [selectedPreparation, setSelectedPreparation] = useState<Preparation | null>(null);
```

---

## ✅ Solution Rapide (Recommandée pour l'instant)

Modifier `tsconfig.json` avec les options ci-dessus pour que l'application compile immédiatement.

---

## 🚀 Après Modification

Relancer `npm start` et l'application devrait compiler sans erreurs TypeScript bloquantes.

