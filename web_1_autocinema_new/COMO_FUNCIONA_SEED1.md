# 🎯 Cómo Funciona Seed=1 (Versión Base/Original)

## 📋 Resumen

**Seed=1 es la versión BASE/ORIGINAL** - la que tú diseñaste y que funciona perfectamente. Todos los demás seeds (2-999) son variantes dinámicas.

## ✅ Comportamiento de Seed=1

### 1. **Textos**
- ✅ Siempre usa la variante "1" de `text-variants.json`
- ✅ Placeholder: "Search directors, titles, or moods" (original)
- ✅ Botón: "Search" (original)
- ✅ Labels: "Movies", "Genres", "Avg Rating", "Avg Duration" (originales)

### 2. **IDs**
- ✅ Siempre usa la primera variante (índice 0) de cada elemento
- ✅ `search-submit-button` → `"search-submit-button"` (original)
- ✅ `stats-movies-card` → `"stats-movies-card"` (original)

### 3. **Clases CSS**
- ✅ Siempre usa la primera variante (índice 0) de cada clase
- ✅ Clases originales sin cambios

### 4. **V1 Wrappers**
- ✅ **NO aplica wrappers ni decoys** (versión original sin DIVs adicionales)
- ✅ Estructura DOM limpia y original

### 5. **Orden de Stats Cards**
- ✅ Orden original: **Movies → Genres → Rating → Duration**
- ✅ Sin cambios de orden

## 🔄 Comportamiento de Otros Seeds (2-999)

### 1. **Textos**
- ✅ Usa variantes dinámicas según el seed
- ✅ Placeholder puede ser: "Find films, directors...", "Share films, discover...", etc.
- ✅ Botón puede ser: "Find", "Lookup", "Discover", etc.

### 2. **IDs**
- ✅ Usa variantes dinámicas según el seed
- ✅ `search-submit-button` puede ser: `"search-btn"`, `"submit-search"`, `"query-button"`, etc.

### 3. **Clases CSS**
- ✅ Usa variantes dinámicas según el seed
- ✅ Clases pueden cambiar: `"stat-tile"`, `"metric-block"`, `"data-card"`, etc.

### 4. **V1 Wrappers**
- ✅ Aplica wrappers y decoys dinámicamente
- ✅ Añade DIVs adicionales para romper XPath

### 5. **Orden de Stats Cards**
- ✅ Orden dinámico según el seed
- ✅ 10 variantes de orden diferentes

## 🔀 Redirección Automática

- ✅ Si no hay `?seed=X` en la URL → **redirige automáticamente a `?seed=1`**
- ✅ Esto asegura que siempre haya un seed y que por defecto sea la versión original

## 📝 Cómo Añadir Nuevas Variantes

Cuando quieras cambiar algo para otros seeds (no seed=1), puedes decirme:

1. **"Cambia el placeholder a 'Share films' para seed 5"**
   - Modifico `text-variants.json` variante "5"

2. **"Cambia el orden de stats a Rating, Duration, Movies, Genres para seed 10"**
   - Añado una nueva variante de orden

3. **"Añade un nuevo ID 'share-button' para el botón de búsqueda"**
   - Añado a `id-variants.json` en `search-submit-button`

**Seed=1 siempre permanece intacto** - es tu versión base/original.

## 🧪 Cómo Verificar

1. Abre `http://localhost:8001` (sin seed) → Debería redirigir a `?seed=1`
2. Abre `http://localhost:8001/?seed=1` → Versión original (sin cambios)
3. Abre `http://localhost:8001/?seed=5` → Versión dinámica (con cambios)
