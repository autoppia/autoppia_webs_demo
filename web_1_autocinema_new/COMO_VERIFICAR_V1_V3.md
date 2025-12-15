# 🔍 Cómo Verificar que V1 y V3 Funcionan

## 📋 Resumen

**V1 (Layout/Structure)**: Añade wrappers y decoys (DIVs adicionales) para romper XPath selectors.

**V3 (Text/Style Variants)**: Cambia IDs, clases CSS y textos para evitar memorización.

## 🧪 Cómo Verificar

### 1. **Abrir la Consola del Navegador**

Abre las DevTools (F12) y ve a la pestaña "Console".

### 2. **Verificar el Seed**

En la consola deberías ver:
```
=== 🔍 DEBUG DINÁMICO ===
Seed: 2
V1 enabled: true
V3 enabled: true
```

**Si el seed es diferente, cambia la URL:**
- `http://localhost:8001/?seed=5` → Seed será 5
- `http://localhost:8001/?seed=10` → Seed será 10

### 3. **Verificar V1 (Wrappers/Decoys)**

En la consola busca:
```
Elementos V1 encontrados: X
```

**Si V1 está funcionando:**
- Deberías ver elementos con `data-decoy="..."` en el HTML
- Los wrappers añaden DIVs adicionales alrededor de los componentes
- **Nota**: Los decoys están temporalmente deshabilitados para evitar errores de hidratación

**Para verificar manualmente:**
1. Inspecciona cualquier elemento de la página
2. Busca DIVs con atributos `data-v1-wrapper="..."` o `data-decoy="..."`
3. Estos DIVs no deberían estar en el código original

### 4. **Verificar V3 (IDs, Clases, Textos)**

#### **IDs Dinámicos:**

En la consola deberías ver:
```
IDs dinámicos encontrados (primeros 10): [...]
```

**Para verificar manualmente:**
1. Inspecciona cualquier elemento (botones, cards, etc.)
2. Los IDs deberían cambiar según el seed:
   - Con `seed=1`: `id="film-count-card"` o `id="movie-card-0"`
   - Con `seed=5`: `id="cinema-tile"` o `id="film-tile-2"`
   - Con `seed=10`: `id="movie-stat"` o `id="cinema-stat-9"`

**Ejemplo práctico:**
- Abre `?seed=1` → Inspecciona el botón "Search" → Anota su ID
- Abre `?seed=5` → Inspecciona el mismo botón → El ID debería ser diferente

#### **Clases CSS Dinámicas:**

**Para verificar:**
1. Inspecciona cualquier elemento
2. Las clases deberían incluir variantes según el seed:
   - Con `seed=1`: `class="stat-tile ..."`
   - Con `seed=5`: `class="metric-block ..."`
   - Con `seed=10`: `class="data-card ..."`

#### **Textos Dinámicos:**

En la consola deberías ver:
```
Botón Search texto: Find
```

**Para verificar manualmente:**
1. Busca el botón "Search" en la página
2. El texto debería cambiar según el seed:
   - Con `seed=1`: "Search" o "Find"
   - Con `seed=5`: "Lookup" o "Browse"
   - Con `seed=10`: "Discover" o "Explore"

**Otros textos que cambian:**
- Títulos de secciones
- Labels de botones
- Textos de descripción

## 🎯 Elementos Específicos que Deberían Cambiar

### **Stats Cards (4 cards en la parte superior):**

1. **ID**: `stats-movies-card`, `stats-genres-card`, etc.
   - Debería cambiar a variantes como `film-count-card`, `cinema-tile`, etc.

2. **Clases**: `stat-tile`, `metric-block`, `data-card`, etc.

3. **Labels**: "Movies", "Genres", "Avg Rating", "Avg Duration"
   - Deberían cambiar a variantes como "Films", "Categories", "Rating", "Duration"

### **Featured Movies Cards:**

1. **ID**: `featured-movie-card-0`, `featured-movie-card-1`, etc.
   - Debería cambiar según el seed

2. **Clases**: `featured-movie-card` con variantes

3. **Botón "View Details"**:
   - Texto: "View Details", "See More", "Explore", etc.

### **Search Bar:**

1. **ID del input**: `search-input`, `search-field`, etc.

2. **ID del botón**: `search-submit-button`, `search-btn`, etc.

3. **Texto del botón**: "Search", "Find", "Lookup", etc.

### **Genre Cards:**

1. **IDs**: `genre-card-0`, `genre-card-1`, etc.
   - Deberían cambiar según el seed

2. **Clases**: `genre-card` con variantes

## ⚠️ Sobre el Error de Hidratación

**¿Es grave?** 

No es crítico para el funcionamiento, pero puede causar:
- Re-renderizado innecesario en el cliente
- Pequeño delay en la primera renderización
- Advertencias en la consola

**¿Por qué ocurre?**

Durante SSR (Server-Side Rendering), el seed se inicializa con un valor por defecto (1). En el cliente, se lee de la URL (ej: seed=2). Esto causa que los IDs dinámicos se generen diferentes.

**Solución aplicada:**

- `suppressHydrationWarning` en elementos con IDs dinámicos
- Script en el `<head>` que lee el seed antes de que React se monte
- El seed se sincroniza correctamente después del primer render

**El error debería desaparecer** una vez que el seed se sincroniza correctamente.

## 🧪 Test Rápido

1. Abre `http://localhost:8001/?seed=1`
2. Inspecciona el botón "Search" y anota su ID
3. Abre `http://localhost:8001/?seed=5`
4. Inspecciona el mismo botón
5. **El ID debería ser diferente** ✅

Si los IDs son iguales, V3 no está funcionando correctamente.

## 📝 Notas

- Los cambios son **determinísticos**: el mismo seed siempre produce los mismos cambios
- Los cambios son **por componente**: cada componente usa su propia clave única
- Los cambios son **independientes**: V1 y V3 funcionan de forma independiente
