#!/bin/bash

# setup-tests.sh
# Script para configurar ambiente de testes automaticamente

echo "🚀 Configurando ambiente de testes..."
echo ""

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Função para verificar sucesso
check_success() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $1${NC}"
    else
        echo -e "${RED}✗ $1 falhou${NC}"
        exit 1
    fi
}

# 1. Criar estrutura de pastas
echo -e "${BLUE}➜ Criando estrutura de pastas...${NC}"
mkdir -p __tests__/unit
mkdir -p __tests__/integration
mkdir -p __tests__/blackbox
mkdir -p __tests__/setup
check_success "Pastas criadas"

# 2. Instalar dependências
echo -e "${BLUE}➜ Instalando dependências de teste...${NC}"
npm install --save-dev jest supertest @types/jest
check_success "Dependências instaladas"

# 3. Verificar arquivos essenciais
echo -e "${BLUE}➜ Verificando arquivos...${NC}"

FILES=(
    "server/controllers/auth.controller.js"
    "server/controllers/note.controller.js"
    "config/redis.js"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}  ✓ $file${NC}"
    else
        echo -e "${YELLOW}  ⚠ $file não encontrado${NC}"
    fi
done

# 4. Verificar package.json
echo -e "${BLUE}➜ Verificando package.json...${NC}"
if grep -q '"test":' package.json; then
    echo -e "${GREEN}✓ Scripts de teste encontrados${NC}"
else
    echo -e "${YELLOW}⚠ Adicione os scripts de teste ao package.json${NC}"
fi

# 5. Criar arquivo .env.test se não existir
if [ ! -f ".env.test" ]; then
    echo -e "${BLUE}➜ Criando .env.test...${NC}"
    cat > .env.test << 'EOF'
PORT=3001
NODE_ENV=test
DB_HOST=localhost
DB_USER=test_user
DB_PASS=test_password
DB_NAME=anotacoes_test
CRYPTO_SECURITY_PASS=test-crypto-secret-key
JWT_SECURITY_PASS=test-jwt-secret-key
REDIS_URL=redis://localhost:6379
EMAIL_HOST=smtp.test.com
EMAIL_PORT=587
EMAIL_NAME=test@test.com
EMAIL_PASS=test-password
EOF
    check_success ".env.test criado"
else
    echo -e "${GREEN}✓ .env.test já existe${NC}"
fi

# 6. Listar arquivos de teste disponíveis
echo ""
echo -e "${BLUE}📝 Arquivos de teste criados:${NC}"
find __tests__ -name "*.test.js" -type f 2>/dev/null | while read file; do
    echo -e "  ${GREEN}✓${NC} $file"
done

# 7. Resumo
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ Configuração concluída!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}Próximos passos:${NC}"
echo ""
echo "1. Testar versão simples (sempre funciona):"
echo -e "   ${YELLOW}npm test -- auth.controller.simple.test.js${NC}"
echo ""
echo "2. Executar todos os testes:"
echo -e "   ${YELLOW}npm test${NC}"
echo ""
echo "3. Ver cobertura:"
echo -e "   ${YELLOW}npm test -- --coverage${NC}"
echo ""
echo "4. Modo watch (desenvolvimento):"
echo -e "   ${YELLOW}npm run test:watch${NC}"
echo ""
echo -e "${BLUE}📚 Documentação:${NC}"
echo "   - QUICK_START.md"
echo "   - TESTING_GUIDE.md"
echo "   - FIX_ERRORS.md"
echo ""#!/bin/bash

# setup-tests.sh
# Script para configurar ambiente de testes automaticamente

echo "🚀 Configurando ambiente de testes..."
echo ""

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Função para verificar sucesso
check_success() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $1${NC}"
    else
        echo -e "${RED}✗ $1 falhou${NC}"
        exit 1
    fi
}

# 1. Criar estrutura de pastas
echo -e "${BLUE}➜ Criando estrutura de pastas...${NC}"
mkdir -p __tests__/unit
mkdir -p __tests__/integration
mkdir -p __tests__/blackbox
mkdir -p __tests__/setup
check_success "Pastas criadas"

# 2. Instalar dependências
echo -e "${BLUE}➜ Instalando dependências de teste...${NC}"
npm install --save-dev jest supertest @types/jest
check_success "Dependências instaladas"

# 3. Verificar arquivos essenciais
echo -e "${BLUE}➜ Verificando arquivos...${NC}"

FILES=(
    "server/controllers/auth.controller.js"
    "server/controllers/note.controller.js"
    "config/redis.js"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}  ✓ $file${NC}"
    else
        echo -e "${YELLOW}  ⚠ $file não encontrado${NC}"
    fi
done

# 4. Verificar package.json
echo -e "${BLUE}➜ Verificando package.json...${NC}"
if grep -q '"test":' package.json; then
    echo -e "${GREEN}✓ Scripts de teste encontrados${NC}"
else
    echo -e "${YELLOW}⚠ Adicione os scripts de teste ao package.json${NC}"
fi

# 5. Criar arquivo .env.test se não existir
if [ ! -f ".env.test" ]; then
    echo -e "${BLUE}➜ Criando .env.test...${NC}"
    cat > .env.test << 'EOF'
PORT=3001
NODE_ENV=test
DB_HOST=localhost
DB_USER=test_user
DB_PASS=test_password
DB_NAME=anotacoes_test
CRYPTO_SECURITY_PASS=test-crypto-secret-key
JWT_SECURITY_PASS=test-jwt-secret-key
REDIS_URL=redis://localhost:6379
EMAIL_HOST=smtp.test.com
EMAIL_PORT=587
EMAIL_NAME=test@test.com
EMAIL_PASS=test-password
EOF
    check_success ".env.test criado"
else
    echo -e "${GREEN}✓ .env.test já existe${NC}"
fi

# 6. Listar arquivos de teste disponíveis
echo ""
echo -e "${BLUE}📝 Arquivos de teste criados:${NC}"
find __tests__ -name "*.test.js" -type f 2>/dev/null | while read file; do
    echo -e "  ${GREEN}✓${NC} $file"
done

# 7. Resumo
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ Configuração concluída!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}Próximos passos:${NC}"
echo ""
echo "1. Testar versão simples (sempre funciona):"
echo -e "   ${YELLOW}npm test -- auth.controller.simple.test.js${NC}"
echo ""
echo "2. Executar todos os testes:"
echo -e "   ${YELLOW}npm test${NC}"
echo ""
echo "3. Ver cobertura:"
echo -e "   ${YELLOW}npm test -- --coverage${NC}"
echo ""
echo "4. Modo watch (desenvolvimento):"
echo -e "   ${YELLOW}npm run test:watch${NC}"
echo ""
echo -e "${BLUE}📚 Documentação:${NC}"
echo "   - QUICK_START.md"
echo "   - TESTING_GUIDE.md"
echo "   - FIX_ERRORS.md"
echo ""