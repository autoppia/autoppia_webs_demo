# Ejemplo Visual: Cómo Funciona en SpotlightRow

## 📊 Flujo Paso a Paso

### 1. **Inicialización del Hook**

```typescript
const dyn = useDynamic();
```

**¿Qué hace?**
- Obtiene el `seed` del contexto (ej: 42)
- Obtiene el `v3Seed` (puede ser diferente, por defecto = seed)
- Crea el objeto con `v1`, `v3`, `pickVariant`

---

### 2. **Aplicación de V1: Wrapper Principal**

```typescript
{dyn.v1.wrap("spotlight-row", (
  <section>...</section>
))}
```

**Proceso interno:**

1. **Verifica si V1 está habilitado:**
   ```typescript
   if (!isV1Enabled()) return children;  // Si OFF, devuelve sin cambios
   ```

2. **Calcula variantes para este componente:**
   ```typescript
   // Wrapper variant
   const wrapperVariant = pickVariant(42, "spotlight-row-wrapper", 2);
   // → pickVariant(42, "spotlight-row-wrapper", 2) = 1
   
   // Decoy variant
   const decoyVariant = pickVariant(42, "spotlight-row-decoy", 3);
   // → pickVariant(42, "spotlight-row-decoy", 3) = 0
   ```

3. **Aplica wrapper (si variant > 0):**
   ```typescript
   // wrapperVariant = 1 → shouldWrap = true
   const core = <span data-dyn-wrap="spotlight-row" data-v1="true">
     <section>...</section>
   </span>
   ```

4. **Aplica decoy (si variant > 0):**
   ```typescript
   // decoyVariant = 0 → no decoy
   const decoy = null;
   ```

5. **Retorna:**
   ```typescript
   return <Fragment key="wrap-spotlight-row-1234">
     {core}  // Solo el wrapper, sin decoy
   </Fragment>
   ```

**Resultado HTML:**
```html
<span data-dyn-wrap="spotlight-row" data-v1="true" data-wrapper-variant="1">
  <section>...</section>
</span>
```

---

### 3. **Aplicación de V3: ID y Clase en Section**

```typescript
<section 
  id={dyn.v3.id("spotlight-row")}
  className={cn("space-y-6", dyn.v3.class("spotlight-row", ""))}
>
```

**Proceso interno:**

1. **ID Dinámico:**
   ```typescript
   // Si V3 está OFF → devuelve "spotlight-row"
   if (!isV3Enabled()) return "spotlight-row";
   
   // Si V3 está ON:
   const variant = pickVariant(42, "spotlight-row", idVariantsCount);
   // → pickVariant(42, "spotlight-row", 10) = 3
   // Busca en id-variants.json variant 3
   // → "spotlight-section-xyz"
   ```

2. **Clase Dinámica:**
   ```typescript
   // Si V3 está OFF → devuelve ""
   if (!isV3Enabled()) return "";
   
   // Si V3 está ON:
   const variant = pickVariant(42, "spotlight-row", classVariantsCount);
   // → pickVariant(42, "spotlight-row", 5) = 2
   // Busca en class-variants.json variant 2
   // → "section-variant-b"
   ```

**Resultado HTML:**
```html
<section 
  id="spotlight-section-xyz"
  class="space-y-6 section-variant-b"
>
```

---

### 4. **Aplicación de V1: Wrapper en Header**

```typescript
{dyn.v1.wrap("spotlight-header", (
  <div>...</div>
))}
```

**Proceso interno:**

```typescript
// Wrapper variant
const wrapperVariant = pickVariant(42, "spotlight-header-wrapper", 2);
// → pickVariant(42, "spotlight-header-wrapper", 2) = 0

// Decoy variant
const decoyVariant = pickVariant(42, "spotlight-header-decoy", 3);
// → pickVariant(42, "spotlight-header-decoy", 3) = 1

// shouldWrap = false (variant 0)
const core = <div>...</div>;  // Sin wrapper

// decoyVariant = 1 → decoy antes
const decoy = <span data-decoy="..." class="hidden" aria-hidden="true"></span>;

// Retorna
return <Fragment>
  {decoy}  {/* Decoy antes */}
  {core}   {/* Contenido */}
</Fragment>
```

**Resultado HTML:**
```html
<span data-decoy="decoy-spotlight-header-5678" class="hidden" aria-hidden="true"></span>
<div>...</div>
```

---

### 5. **Aplicación en Loop: Cada Card de Película**

```typescript
{movies.map((movie, index) => (
  dyn.v1.wrap(`spotlight-movie-${index}`, (
    <div id={dyn.v3.id("spotlight-movie-card", index)}>
      <button>{dyn.v3.text("view_details", "View Details")}</button>
    </div>
  ), undefined, movie.id)
))}
```

**Proceso para cada película:**

#### **Película 0 (index = 0):**

1. **V1 Wrapper:**
   ```typescript
   const wrapperVariant = pickVariant(42, "spotlight-movie-0-wrapper", 2);
   // → pickVariant(42, "spotlight-movie-0-wrapper", 2) = 1
   // → Añade wrapper
   
   const decoyVariant = pickVariant(42, "spotlight-movie-0-decoy", 3);
   // → pickVariant(42, "spotlight-movie-0-decoy", 3) = 2
   // → Decoy después
   ```

2. **V3 ID:**
   ```typescript
   const id = generateElementId(42, "spotlight-movie-card", 0);
   // → "spotlight-movie-card-0-1234"
   ```

3. **V3 Texto:**
   ```typescript
   const text = getTextForElement(42, "view_details", "View Details");
   // → pickVariant(42, "view_details", 10) = 2
   // → Busca en text-variants.json variant 3
   // → "Ver Detalles"
   ```

**Resultado HTML:**
```html
<span data-dyn-wrap="spotlight-movie-0" data-v1="true">
  <div id="spotlight-movie-card-0-1234">
    <button>Ver Detalles</button>
  </div>
</span>
<span data-decoy="decoy-spotlight-movie-0-5678" class="hidden"></span>
```

#### **Película 1 (index = 1):**

1. **V1 Wrapper:**
   ```typescript
   const wrapperVariant = pickVariant(42, "spotlight-movie-1-wrapper", 2);
   // → pickVariant(42, "spotlight-movie-1-wrapper", 2) = 0
   // → Sin wrapper
   
   const decoyVariant = pickVariant(42, "spotlight-movie-1-decoy", 3);
   // → pickVariant(42, "spotlight-movie-1-decoy", 3) = 0
   // → Sin decoy
   ```

2. **V3 ID:**
   ```typescript
   const id = generateElementId(42, "spotlight-movie-card", 1);
   // → "spotlight-movie-card-1-5678"
   ```

3. **V3 Texto:**
   ```typescript
   const text = getTextForElement(42, "view_details", "View Details");
   // → Mismo que película 0 (mismo key)
   // → "Ver Detalles"
   ```

**Resultado HTML:**
```html
<div id="spotlight-movie-card-1-5678">
  <button>Ver Detalles</button>
</div>
```

**¡Nota importante!** Cada card tiene su propia variante de wrapper/decoy, pero el texto es el mismo porque usa el mismo key.

---

## 🎯 Comparación: Seed 42 vs Seed 100

### Con Seed = 42:

```html
<!-- Wrapper principal -->
<span data-dyn-wrap="spotlight-row" data-v1="true">
  <section id="spotlight-section-xyz" class="space-y-6 section-variant-b">
    
    <!-- Header con decoy antes -->
    <span data-decoy="..." class="hidden"></span>
    <div>...</div>
    
    <!-- Card 0: Con wrapper y decoy después -->
    <span data-dyn-wrap="spotlight-movie-0" data-v1="true">
      <div id="spotlight-movie-card-0-1234">
        <button>Ver Detalles</button>
      </div>
    </span>
    <span data-decoy="..." class="hidden"></span>
    
    <!-- Card 1: Sin wrapper ni decoy -->
    <div id="spotlight-movie-card-1-5678">
      <button>Ver Detalles</button>
    </div>
  </section>
</span>
```

### Con Seed = 100:

```html
<!-- Wrapper principal (puede ser diferente) -->
<span data-dyn-wrap="spotlight-row" data-v1="true" data-wrapper-variant="0">
  <section id="spotlight-section-abc" class="space-y-6 section-variant-a">
    
    <!-- Header: Puede tener wrapper en vez de decoy -->
    <span data-dyn-wrap="spotlight-header" data-v1="true">
      <div>...</div>
    </span>
    
    <!-- Card 0: Puede tener decoy antes en vez de después -->
    <span data-decoy="..." class="hidden"></span>
    <div id="spotlight-movie-card-0-9999">
      <button>View Details</button>  <!-- Texto diferente -->
    </div>
    
    <!-- Card 1: Puede tener wrapper -->
    <span data-dyn-wrap="spotlight-movie-1" data-v1="true">
      <div id="spotlight-movie-card-1-8888">
        <button>View Details</button>
      </div>
    </span>
  </section>
</span>
```

**Diferencias clave:**
- ✅ Misma estructura de componentes
- ✅ Diferentes variantes de wrapper/decoy
- ✅ Diferentes IDs
- ✅ Diferentes clases
- ✅ Diferentes textos

---

## 🔍 Debugging: Ver qué está pasando

### Añadir logs temporales:

```typescript
export function SpotlightRow({ title, description, movies }) {
  const dyn = useDynamic();
  
  // Debug
  console.log("Seed:", dyn.seed);
  console.log("V3 Seed:", dyn.v3Seed);
  console.log("V1 enabled:", isV1Enabled());
  console.log("V3 enabled:", isV3Enabled());
  
  // Ver variantes específicas
  console.log("spotlight-row wrapper:", dyn.pickVariant("spotlight-row-wrapper", 2));
  console.log("spotlight-row decoy:", dyn.pickVariant("spotlight-row-decoy", 3));
  
  return (
    // ...
  );
}
```

### Inspeccionar en DevTools:

1. **Abrir DevTools → Elements**
2. **Buscar elementos con `data-v1="true"`** → Ver wrappers V1
3. **Buscar elementos con `class="hidden"`** → Ver decoys
4. **Ver IDs** → Deberían ser diferentes según seed
5. **Ver textos** → Deberían cambiar según seed

---

## ✅ Checklist de Integración

Para cada componente que integres:

- [ ] Importar `useDynamic` desde `@/dynamic/shared`
- [ ] Llamar `const dyn = useDynamic()` al inicio
- [ ] Añadir `dyn.v1.wrap()` en contenedores principales
- [ ] Añadir `dyn.v3.id()` en elementos importantes
- [ ] Añadir `dyn.v3.class()` en elementos con clases
- [ ] Añadir `dyn.v3.text()` en textos visibles
- [ ] Usar keys únicos para cada componente
- [ ] En loops, usar keys únicos por item (`${key}-${index}`)
- [ ] Probar con V1 ON y V1 OFF
- [ ] Probar con V3 ON y V3 OFF
- [ ] Verificar que funciona igual en ambos casos
