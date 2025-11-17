#!/bin/bash

# Script para crear el archivo .env desde .env.example
# Este script copia .env.example a .env si no existe

if [ -f .env ]; then
    echo "⚠️  El archivo .env ya existe."
    echo "¿Deseas sobrescribirlo? (s/N)"
    read -r response
    if [[ ! "$response" =~ ^[Ss]$ ]]; then
        echo "Operación cancelada."
        exit 0
    fi
fi

if [ ! -f .env.example ]; then
    echo "❌ Error: No se encontró el archivo .env.example"
    exit 1
fi

cp .env.example .env
echo "✅ Archivo .env creado desde .env.example"
echo ""
echo "⚠️  IMPORTANTE: Ahora debes editar el archivo .env y agregar tus credenciales reales de Firebase."
echo "   Consulta SETUP.md para más información."

