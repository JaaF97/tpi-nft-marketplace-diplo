#!/bin/bash

set -e  # Para que el script pare si algún comando falla

echo "🚀 Iniciando setup completo para Marketplace NFT + ERC20"

# 1. Instalar dependencias backend
echo "📦 Instalando dependencias backend..."
cd backend
npm install

# 2. Instalar dependencias frontend
echo "📦 Instalando dependencias frontend..."
cd ../frontend
npm install

# 3. Volver a backend para deploy y mint
cd ../backend

echo "🔨 Desplegando contratos..."
npx hardhat run scripts/deployAll.js --network localhost

echo "🪙 Minteando tokens a cuentas..."
npx hardhat run scripts/mint.js --network localhost

# 4. Levantar backend express (en background)
echo "⚙️ Iniciando backend Express..."
nohup node app.js > backend.log 2>&1 &

echo "✅ Backend Express iniciado (revisar backend.log para logs)"

echo "🎉 Setup completado."

echo "⚠️ Recordá iniciar Hardhat Node (nodo blockchain local) EN OTRA TERMINAL:"
echo "   cd backend"
echo "   npx hardhat node"

echo "🖥️ Luego podés iniciar el frontend con:"
echo "   cd ../frontend"
echo "   npm run dev"

