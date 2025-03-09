FROM node:20.9-slim

WORKDIR /app

# Crear la estructura de directorios
RUN mkdir -p public/templates

# Copiar package.json y server.js
COPY ./app/package.json ./
COPY ./app/server.js ./

# Copiar la carpeta templates
COPY ./templates ./public/templates/

# Instalar dependencias
RUN npm install express cors

# Exponer el puerto
EXPOSE 4000

# Iniciar el servidor
CMD ["node", "server.js"] 