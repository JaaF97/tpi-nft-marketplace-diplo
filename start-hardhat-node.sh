#!/bin/bash

echo "🚀 Iniciando nodo Hardhat local..."

# Ejecutar Hardhat node y guardar la salida en un archivo temporal
npx hardhat node | tee hardhat_node_output.log &

# PID del proceso
PID=$!

echo "📝 Guardando cuentas generadas..."

# Esperamos un poco para que Hardhat imprima las cuentas (ajustar si hace falta)
sleep 5

# Extraer las claves privadas de la salida y guardarlas en cuentas.txt
grep 'Private Key' hardhat_node_output.log > cuentas.txt

echo "✅ Cuentas privadas guardadas en cuentas.txt"
echo "📄 Revisa cuentas.txt para importar las claves en Metamask"

echo "🟢 Nodo Hardhat corriendo con PID $PID"

# Mantener el script vivo para que el nodo siga activo
wait $PID
