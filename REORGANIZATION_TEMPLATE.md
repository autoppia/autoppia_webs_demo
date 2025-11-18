# Template de Reorganización: Estructura Dinámica Homogénea

## Objetivo

Separar claramente el **código core de la web** vs **código dinámico (v1, v2, v3)** en TODAS las webs 3-13.

---

## Estructura Final (TODAS las webs)

```
web_X/src/
  │
  ├── app/                          ← Core: páginas y rutas
  │   ├── page.tsx
  │   ├── layout.tsx
  │   └── ...
  │
  ├── components/                   ← Core: componentes de negocio
  │   ├── ProductCard.tsx
  │   ├── Header.tsx
  │   └── ...
  │
  ├── dynamic/                      ← 🆕 TODO lo dinámico
  │   │
  │   ├── v1-layouts/               ← V1: Layouts (común entre webs)
  │   │   ├── layouts.ts            → Define 10 layouts
  │   │   ├── layout-variants.ts    → Variantes de layout
  │   │   └── utils.ts              → Helpers de layout
  │   │
  │   ├── v2-data/                  ← V2: Data loaders (específico)
  │   │   ├── [entity]-loader.ts   → Carga datos con seed
  │   │   └── README.md             → "V2 Data Loading"
  │   │
  │   └── v3-attributes/            ← V3: Anti-scraping (específico)
  │       ├── data/
  │       │   ├── semantic-ids.json      → 10 IDs / elemento
  │       │   ├── text-variants.json     → 10 textos / key
  │       │   └── class-variants.json    → 10 clases / tipo
  │       ├── hooks/
  │       │   └── useV3Attributes.ts     → Hook principal
  │       ├── components/
  │       │   ├── V3Button.tsx           → Botón con attrs dinámicos
  │       │   ├── V3Input.tsx            → Input con attrs dinámicos
  │       │   └── V3Container.tsx        → Container con attrs dinámicos
  │       ├── utils/
  │       │   ├── id-generator.ts        → Genera IDs
  │       │   ├── text-selector.ts       → Selecciona textos
  │       │   └── class-generator.ts     → Genera clases
  │       ├── config.ts                  → Elementos críticos
  │       ├── index.ts                   → Exports
  │       └── README.md                  → Docs
  │
  ├── seed-system/                  ← Infraestructura seed (común)
  │   ├── context/
  │   │   └── SeedContext.tsx       → Gestiona seeds
  │   ├── resolver/
  │   │   └── seed-resolver.ts      → Llama /seeds/resolve
  │   ├── navigation/
  │   │   ├── SeedLink.tsx          → Link wrapper
  │   │   └── useSeedRouter.ts      → Router wrapper
  │   └── index.ts                  → Exports
  │
  ├── library/                      ← Core: utilidades de negocio
  │   ├── events.ts
  │   ├── utils.ts
  │   └── dataset.ts
  │
  └── shared/                       ← Core: compartidos
      ├── storage.ts
      └── data-generator.ts
```

---

## Mapeo de Archivos

### V1 - Layouts (común)

**Archivos actuales → nuevos:**
```
utils/seedLayout.ts            → dynamic/v1-layouts/layouts.ts
library/layoutVariants.ts      → dynamic/v1-layouts/layout-variants.ts
contexts/LayoutContext.tsx     → dynamic/v1-layouts/LayoutContext.tsx (si existe)
```

---

### V2 - Data (específico por web)

**Archivos actuales → nuevos:**
```
data/products-enhanced.ts      → dynamic/v2-data/products-loader.ts
data/clients-enhanced.ts       → dynamic/v2-data/clients-loader.ts
data/emails-enhanced.ts        → dynamic/v2-data/emails-loader.ts
utils/dynamicDataProvider.ts   → dynamic/v2-data/data-provider.ts
```

---

### V3 - Attributes (específico por web)

**Archivos actuales → nuevos:**
```
library/useSeedLayout.ts            → dynamic/v3-attributes/hooks/useV3Attributes.ts
library/textVariants.json           → dynamic/v3-attributes/data/text-variants.json
library/textVariants.ts             → dynamic/v3-attributes/utils/text-selector.ts
data/structureVariations.json       → dynamic/v3-attributes/data/ (split)
context/DynamicStructureContext.tsx → dynamic/v3-attributes/hooks/useV3Attributes.ts
components/DynamicButton.tsx        → dynamic/v3-attributes/components/V3Button.tsx
components/DynamicContainer.tsx     → dynamic/v3-attributes/components/V3Container.tsx
utils/dynamicStructureProvider.ts   → dynamic/v3-attributes/utils/ (split)
```

**Nuevo a crear:**
```
dynamic/v3-attributes/data/semantic-ids.json     (extraer SEMANTIC_ID_MAP)
dynamic/v3-attributes/data/class-variants.json   (crear)
dynamic/v3-attributes/config.ts                  (crear)
dynamic/v3-attributes/README.md                  (crear)
```

---

### Seed System (infraestructura común)

**Archivos actuales → nuevos:**
```
context/SeedContext.tsx        → seed-system/context/SeedContext.tsx
shared/seed-resolver.ts        → seed-system/resolver/seed-resolver.ts
hooks/useSeedRouter.ts         → seed-system/navigation/useSeedRouter.ts
components/ui/SeedLink.tsx     → seed-system/navigation/SeedLink.tsx
utils/seedRouting.ts           → seed-system/navigation/routing-utils.ts
```

---

## Nombres Estandarizados

### Componentes v3:
```
❌ DynamicButton     → ✅ V3Button
❌ DynamicContainer  → ✅ V3Container
❌ DynamicElement    → ✅ V3Element
❌ DynamicInput      → ✅ V3Input
```

### Hooks v3:
```
❌ useSeedLayout              → ✅ useV3Attributes
❌ useDynamicStructure        → ✅ useV3Attributes
```

### Archivos v2:
```
❌ products-enhanced.ts       → ✅ products-loader.ts
❌ clients-enhanced.ts        → ✅ clients-loader.ts
❌ emails-enhanced.ts         → ✅ emails-loader.ts
❌ dynamicDataProvider.ts     → ✅ data-provider.ts
```

### Archivos v1:
```
❌ seedLayout.ts              → ✅ layouts.ts
❌ layoutVariants.ts          → ✅ layout-variants.ts
```

---

## Patrón de Imports

### Antes (confuso):
```typescript
import { useSeedLayout } from '@/library/useSeedLayout';
import { DynamicButton } from '@/components/DynamicButton';
import { initializeProducts } from '@/data/products-enhanced';
```

### Después (claro):
```typescript
import { useV3Attributes } from '@/dynamic/v3-attributes';
import { V3Button } from '@/dynamic/v3-attributes';
import { loadProducts } from '@/dynamic/v2-data';
```

---

## Verificación por Web

Después de reorganizar cada web, verificar:
- [ ] Compila sin errores
- [ ] Estructura de carpetas correcta
- [ ] Nombres descriptivos
- [ ] Imports actualizados
- [ ] No hay archivos huérfanos en ubicaciones antiguas

