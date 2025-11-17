# Sistema de Generación Inteligente de Datos

## 🎯 ¿Qué es esto?

Un endpoint centralizado que genera datos para **cualquier proyecto y entidad** automáticamente, leyendo la estructura de ejemplos existentes.

## 📝 Endpoint

```
POST /datasets/generate-smart
```

## 🔧 Parámetros

```json
{
  "project_key": "web_5_autocrm",     // Proyecto (web_4, web_5, web_6, web_7, etc.)
  "entity_type": "logs",              // Tipo de entidad (logs, clients, restaurants, etc.)
  "count": 200,                       // Cantidad a generar (1-500)
  "additional_requirements": "..."    // Opcional: requirements adicionales
}
```

## 🔄 Cómo funciona

1. **Lee ejemplos** de `initial_data/{project_key}/data/{entity_type}_1.json`
2. **Infiere estructura** TypeScript de los ejemplos
3. **Obtiene metadata** predefinida (categorías, descripción, requirements)
4. **Genera prompt** inteligente para OpenAI
5. **Genera datos** con OpenAI
6. **Guarda** en `initial_data/{project_key}/data/{entity_type}_N.json`

## 💡 Ejemplos de uso

### Generar logs para web_5_autocrm

```bash
curl -X POST http://localhost:8090/datasets/generate-smart \
  -H "Content-Type: application/json" \
  -d '{
    "project_key": "web_5_autocrm",
    "entity_type": "logs",
    "count": 200
  }'
```

### Generar restaurants para web_4_autodining

```bash
curl -X POST http://localhost:8090/datasets/generate-smart \
  -H "Content-Type: application/json" \
  -d '{
    "project_key": "web_4_autodining",
    "entity_type": "restaurants",
    "count": 200
  }'
```

### Generar emails para web_6_automail

```bash
curl -X POST http://localhost:8090/datasets/generate-smart \
  -H "Content-Type: application/json" \
  -d '{
    "project_key": "web_6_automail",
    "entity_type": "emails",
    "count": 200
  }'
```

### Generar con requirements adicionales

```bash
curl -X POST http://localhost:8090/datasets/generate-smart \
  -H "Content-Type: application/json" \
  -d '{
    "project_key": "web_7_autodelivery",
    "entity_type": "restaurants",
    "count": 200,
    "additional_requirements": "Include more Asian restaurants and pizza places"
  }'
```

## 📊 Respuesta

```json
{
  "message": "Successfully generated 200 logs for web_5_autocrm",
  "generated_data": [...],
  "count": 200,
  "generation_time": 3.45,
  "saved_path": "/app/data/web_5_autocrm/data/logs_20251117_123456.json"
}
```

## 🗂️ Proyectos soportados

### web_4_autodining
- **restaurants**: Restaurantes con cuisines, areas, ratings, precios

### web_5_autocrm
- **clients**: Clientes legales con status, matters
- **logs**: Logs de tiempo facturab con matters, horas
- **matters**: Casos legales con tipos, status, prioridad
- **events**: Eventos de calendario
- **files**: Documentos legales

### web_6_automail
- **emails**: Emails con senders, subjects, folders, prioridades

### web_7_autodelivery
- **restaurants**: Restaurantes de delivery con tiempos, ratings

## 🎨 Metadata predefinida

El sistema tiene metadata predefinida para cada proyecto/entidad:

```python
# web_5_autocrm / logs
{
  "description": "Time tracking logs for legal work",
  "categories": ["Billable", "Billed", "Non-billable"],
  "requirements": "Include realistic legal matters, client names, hours (0.5-8h), dates, and descriptions."
}

# web_4_autodining / restaurants
{
  "description": "Restaurants",
  "categories": ["Italian", "Mexican", "Asian", "American", "Mediterranean"],
  "requirements": "Include realistic restaurant names, cuisines, areas, ratings, and prices."
}
```

## 📁 Estructura de archivos

```
webs_server/
├── src/
│   ├── server.py              # Endpoint /datasets/generate-smart
│   └── smart_generator.py     # Lógica de generación inteligente
└── initial_data/
    └── {project_key}/
        └── data/
            └── {entity_type}_1.json  # Ejemplos leídos por el sistema
```

## 🔑 Requirements

- `OPENAI_API_KEY` debe estar configurada
- Debe existir al menos un archivo de ejemplo en `initial_data/{project_key}/data/{entity_type}_1.json`

## ➕ Agregar nuevos proyectos

1. Crea el directorio: `initial_data/web_X_newproject/data/`
2. Agrega ejemplos: `entity_type_1.json` con al menos 3 registros
3. (Opcional) Agrega metadata en `smart_generator.py`:

```python
"web_X_newproject": {
    "entity_name": {
        "description": "Description",
        "categories": ["Cat1", "Cat2"],
        "requirements": "Requirements text"
    }
}
```

4. ¡Listo! El endpoint funcionará automáticamente

## 🎯 Ventajas

✅ **Centralizado**: Un solo endpoint para todo  
✅ **Automático**: Lee estructura de ejemplos  
✅ **Inteligente**: Metadata predefinida por proyecto  
✅ **Flexible**: Agrega requirements adicionales  
✅ **Reproducible**: Usa seeds opcionales  
✅ **Extensible**: Agrega nuevos proyectos fácilmente  

## 🔧 Troubleshooting

### Error: "No example data found"

- Verifica que existe `initial_data/{project_key}/data/{entity_type}_1.json`
- Verifica que el archivo contiene un array JSON válido

### Error: "OpenAI API key not configured"

- Configura `OPENAI_API_KEY` en el entorno del contenedor

### Error: "Generated output is not valid JSON"

- Puede ocurrir ocasionalmente con OpenAI
- Reintenta la petición
- Ajusta `additional_requirements` para ser más específico

