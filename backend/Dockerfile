# Dockerfile para Radix IA Backend
FROM python:3.11-slim

# Establecer directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar archivos de dependencias
COPY requirements.txt .

# Instalar dependencias de Python
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copiar código fuente
COPY . .

# Crear usuario no root para seguridad
RUN useradd -m -u 1001 radixuser && \
    chown -R radixuser:radixuser /app
USER radixuser

# Exponer puerto
EXPOSE 8000

# Variables de entorno por defecto
ENV HOST=0.0.0.0
ENV PORT=8000
ENV DEBUG=false

# Comando de inicio
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]