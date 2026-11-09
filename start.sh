#!/usr/bin/env bash
set -e

echo "=========================================================="
echo " Starting TRUSTRA: AI that knows what you are allowed to know "
echo "=========================================================="

# Check if Ollama is running on host
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "✓ Ollama is running on host (localhost:11434)"
else
    echo "⚠️ Warning: Ollama does not seem to be running on localhost:11434."
    echo "  Please run 'ollama serve' if you wish to use real local LLM generation."
fi

echo "Starting Docker Compose services (db, backend, frontend)..."
docker compose up -d

echo ""
echo "Waiting for services to become ready..."
until curl -s http://localhost:8000/api/health > /dev/null 2>&1; do
    printf "."
    sleep 1
done
echo " Ready!"

echo ""
echo "=========================================================="
echo " Service Endpoints:"
echo " - Web Application: http://localhost:3000"
echo " - API Documentation: http://localhost:8000/docs"
echo " - PostgreSQL Vector DB: localhost:5432"
echo ""
echo " Demo Logins (password: password123):"
echo " [Company ABC]"
echo " - Admin:              admin@companyabc.com"
echo " - Tech Employee:      tech@companyabc.com"
echo " - Finance Employee:   finance@companyabc.com"
echo " - Business Analyst:   ba@companyabc.com"
echo " [Company XYZ]"
echo " - Admin:              admin@companyxyz.com"
echo " - Quantum Tech:       tech@companyxyz.com"
echo " - SecOps Analyst:     secops@companyxyz.com"
echo " - Compliance Lead:    compliance@companyxyz.com"
echo "=========================================================="

