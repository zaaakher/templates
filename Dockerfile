FROM node:20.9-slim

WORKDIR /app

# Instalar serve globalmente
RUN npm install -g serve

# Copiar la carpeta templates
COPY ./templates ./public/templates
COPY ./templates/index.html ./public/

# Exponer el puerto
EXPOSE 3000

# Servir los archivos estáticos
CMD ["serve", "-s", "public", "-l", "3000"]