FROM python:3.10-slim

# Evitar archivos .pyc
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DB_NAME=web3_movies
ENV DB_USER=postgres
ENV DB_PASSWORD=autoppia_2025
ENV DB_HOST=db
ENV DB_PORT=5432

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev curl sqlite3 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements e instalar dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar archivos del proyecto
COPY . .

# Asegurar que los directorios static y media existan
# Asegurar que los directorios static y media existan
RUN mkdir -p /app/static /app/media

# Aseguramos que netcat esté instalado para el script de espera de PostgreSQL
RUN apt-get update && apt-get install -y netcat-openbsd && apt-get clean

# Copiar entrypoint y darle permisos de ejecución
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Exponer puerto
EXPOSE 8000

# Configurar entrypoint
ENTRYPOINT ["/entrypoint.sh"]