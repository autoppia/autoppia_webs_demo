# Initial Data Pools

Este directorio contiene los **master data pools** que se utilizan como base para la selección determinística con seeds.

## 📋 ¿Qué es esto?

Cada proyecto de demostración necesita un **pool de datos maestro** del cual se seleccionan subconjuntos usando seeds. Por ejemplo:
- Usuario accede con `?v2-seed=1` → selecciona 100 registros del pool
- Usuario accede con `?v2-seed=42` → selecciona OTROS 100 registros del MISMO pool
- Usuario accede con `?v2-seed=99` → selecciona OTROS 100 registros del MISMO pool

**Importante:** El pool NO cambia, solo la selección basada en el seed.

## 📊 Estado actual

| Proyecto | Entidad | Registros actuales | Objetivo |
|----------|---------|-------------------|----------|
| `web_4_autodining` | Restaurants | ✅ 200 | 🎯 2000 |
| `web_5_autocrm` | Clients | ✅ 200 | 🎯 2000 |
| `web_6_automail` | Emails | ✅ 200 | 🎯 2000 |
| `web_7_autodelivery` | Restaurants | ✅ 200 | 🎯 2000 |
| `web_8_autolodge` | Hotels | ✅ 200 | 🎯 2000 |

**✅ ESTADO:** Con 200 registros, diferentes seeds ya mostrarán contenido diferente. Para demos más robustas, el objetivo sigue siendo 2000 registros (pool 10-20x más grande que el limit solicitado).

## 🎯 TODO: Ampliar a 2000 registros

### Estructura de archivos (layout plano: sin subdirectorio data/)

Cada proyecto tiene `main.json` y los archivos de entidad en el mismo directorio (flat layout). El "original" es el primer archivo (`entity_1.json`); el pool completo son todos los archivos referenciados en `main.json`.

```
web_X_proyecto/
├── main.json          # Índice de archivos (rutas relativas ./*.json)
├── entity_1.json      # Original (v2 deshabilitado o seed=1)
├── entity_2.json      # Más registros para el pool
└── ...                # hasta entity_20.json (2000 total)
```

- **v2 deshabilitado o seed=1:** se devuelve solo el contenido de `entity_1.json` (original).
- **v2 habilitado y 1 < seed ≤ 999:** se carga el pool completo y se aplica selección con seed (reproducible: mismo seed → mismos datos).

### Formato de `main.json`

```json
{
  "restaurants": [
    "./restaurants_1.json",
    "./restaurants_2.json",
    ...
    "./restaurants_20.json"
  ]
}
```

### Ejemplo para web_4_autodining (Restaurants)

Cada archivo `restaurants_X.json` debe contener 100 restaurantes:

```json
[
  {
    "id": "restaurant-1",
    "name": "Bella Bistro",
    "image": "https://images.unsplash.com/photo-1500000000000?w=640&h=480",
    "cuisine": "International",
    "area": "Downtown",
    "reviews": 120,
    "stars": 4,
    "price": "$$",
    "bookings": 85
  },
  ...
]
```

**Total:** 20 archivos × 100 registros = 2000 registros

### Ejemplo para web_5_autocrm (Clients)

Cada archivo `clients_X.json` debe contener 100 clientes:

```json
[
  {
    "id": "client-1",
    "name": "John Smith",
    "email": "john.smith@company.com",
    "company": "Tech Corp",
    "industry": "Technology",
    "phone": "+1-555-0001",
    "status": "Active",
    "revenue": 50000,
    "since": "2023-01-15"
  },
  ...
]
```

### Ejemplo para web_6_automail (Emails)

Cada archivo `emails_X.json` debe contener 100 emails:

```json
[
  {
    "id": "email-1",
    "sender": "John Smith",
    "senderEmail": "john.s@example.com",
    "subject": "Meeting Reminder: Q4 Results",
    "preview": "Hi, I wanted to discuss Q4 results with you...",
    "date": "2025-11-17T10:30:00",
    "read": true,
    "starred": false,
    "folder": "inbox",
    "hasAttachment": false,
    "priority": "normal"
  },
  ...
]
```

## 🚀 Cómo funciona

1. Al levantar las webs con `./setup.sh`, el script verifica si existe `~/webs_data/web_X_proyecto/main.json`
2. Si NO existe:
   - Copia los archivos desde `webs_server/initial_data/web_X_proyecto/` a `~/webs_data/web_X_proyecto/`
3. Si existe:
   - NO hace nada (usa los datos existentes)

**Una vez inicializado, el pool NO cambia.** Solo se usa para selecciones con diferentes seeds.

## 📝 Guía para developers

### Para ampliar de 100 a 2000 registros:

1. **Duplicar y modificar los archivos existentes**
   ```bash
   cd webs_server/initial_data/web_4_autodining
   # Crear 19 archivos adicionales (restaurants_2.json a restaurants_20.json)
   ```

2. **Asegurar IDs únicos**
   - `restaurants_1.json`: restaurant-1 a restaurant-100
   - `restaurants_2.json`: restaurant-101 a restaurant-200
   - ...
   - `restaurants_20.json`: restaurant-1901 a restaurant-2000

3. **Variar los datos**
   - Diferentes nombres
   - Diferentes categorías (cuisines, industries, etc.)
   - Distribuir equitativamente por categoría

4. **Actualizar `main.json`**
   ```json
   {
     "restaurants": [
       "./restaurants_1.json",
       "./restaurants_2.json",
       ...
       "./restaurants_20.json"
     ]
   }
   ```

5. **Limpiar datos existentes y reiniciar**
   ```bash
   # Limpiar datos actuales
   rm -rf ~/webs_data/web_4_autodining
   rm -rf ~/webs_data/web_5_autocrm
   rm -rf ~/webs_data/web_6_automail

   # Levantar de nuevo
   cd scripts
   ./setup.sh --demo=autodining --enabled_dynamic_versions=v2
   ```

## ✅ Verificación

Para verificar que los datos están correctamente inicializados:

```bash
# Ver cuántos archivos hay
ls -la ~/webs_data/web_4_autodining/*.json | wc -l

# Ver el contenido de main.json
cat ~/webs_data/web_4_autodining/main.json | jq

# Probar endpoint con diferentes seeds
curl "http://localhost:8090/datasets/load?project_key=web_4_autodining&entity_type=restaurants&seed_value=1&limit=10" | jq
curl "http://localhost:8090/datasets/load?project_key=web_4_autodining&entity_type=restaurants&seed_value=42&limit=10" | jq
```

## 🔍 Notas importantes

- **Layout plano:** Los archivos de entidad (p. ej. `entity_1.json`) están en el mismo directorio que `main.json`; no hay subdirectorio `data/`. El directorio `original/` ya no se usa.
- Los archivos JSON deben ser válidos (usar `jq` para validar)
- Los IDs deben ser únicos en todo el pool
- Mantener consistencia en los campos entre registros
- El pool NO debe cambiar una vez en producción (para mantener determinismo)
- Si necesitas actualizar el pool, documenta el cambio (versión)

## 📚 Referencias

- Ver `seeded_selector.py` para entender cómo funciona la selección con seed
- Ver `data_handler.py` para entender cómo se cargan los archivos
- Ver `setup.sh` líneas 364-383 para la lógica de inicialización
