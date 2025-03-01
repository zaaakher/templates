FROM node:20.9-slim

WORKDIR /app

# Instalar serve globalmente
RUN npm install -g serve

# Copiar la carpeta templates
COPY ./templates ./public/templates

# Exponer el puerto
EXPOSE 3000

# Servir los archivos estáticos con listado de directorios
CMD ["serve", "--no-clipboard", "--cors", "-l", "3000", "public/templates"] 