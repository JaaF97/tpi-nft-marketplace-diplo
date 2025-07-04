FROM node:18

WORKDIR /app

# Copiar package.json y package-lock.json de backend e instalar deps
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Copiar package.json y package-lock.json de frontend e instalar deps
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

# Copiar todo el código
COPY backend ./backend
COPY frontend ./frontend

# Exponer puertos
EXPOSE 8545 5000 5173

# Dejar bash abierto para que ejecutes manualmente
CMD ["bash"]
