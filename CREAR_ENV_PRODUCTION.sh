#!/bin/bash
# Script para crear .env.production con los valores correctos del proyecto

echo "============================================"
echo "Crear archivo .env.production"
echo "============================================"
echo

# Verificar si el archivo ya existe
if [ -f .env.production ]; then
    echo "[ADVERTENCIA] El archivo .env.production ya existe."
    read -p "¿Deseas sobrescribirlo? (S/N): " respuesta
    if [ "$respuesta" != "S" ] && [ "$respuesta" != "s" ]; then
        echo "Operación cancelada."
        exit 1
    fi
fi

# Copiar el archivo de ejemplo
cp env.production.example .env.production

echo "[OK] Archivo .env.production creado."
echo
echo "============================================"
echo "IMPORTANTE: Edita .env.production y reemplaza:"
echo
echo "VITE_FIREBASE_API_KEY=tu_api_key_aqui"
echo
echo "Con tu API Key real:"
echo "VITE_FIREBASE_API_KEY=AIzaSyB9tqLSv2ofsDZGwazn5uEJAuJ-NrZJU0g"
echo
echo "============================================"
echo "Los demás valores ya están configurados correctamente."
echo

