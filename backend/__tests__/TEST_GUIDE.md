# Guia Completo de Testes - Aplicativo de Anotações

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Configuração](#configuração)
3. [Estrutura de Testes](#estrutura-de-testes)
4. [Tipos de Testes](#tipos-de-testes)
5. [Como Executar](#como-executar)
6. [Cobertura de Código](#cobertura-de-código)

## 🎯 Visão Geral

Este projeto implementa uma suíte completa de testes para garantir a qualidade e confiabilidade da API de anotações. A estratégia de testes abrange:

- **Testes Unitários**: Testam funções isoladas dos controllers
- **Testes de Integração**: Validam fluxos completos da API
- **Testes Caixa Branca**: Focam na estrutura interna e caminhos do código
- **Testes Caixa Preta**: Validam comportamento baseado em especificações

## ⚙️ Configuração

### Instalação de Dependências

```bash
npm install --save-dev jest supertest @types/jest
```

### Arquivo .env.test

Crie um arquivo `.env.test` com as variáveis de ambiente para testes:

```env
PORT=3001
DB_HOST=localhost
DB_USER=test_user
DB_PASS=test_pass
DB_NAME=test_db
CRYPTO_SECURITY_PASS=test-crypto-secret
JWT_SECURITY_PASS=test-jwt-secret
REDIS_URL=redis://localhost:6379
EMAIL_HOST=smtp.test.com
EMAIL_PORT=587
EMAIL_NAME=test@test.com
EMAIL_PASS=test-pass
```

## 📁 Estrutura de Testes

```
__tests__/
├── setup/
│   └── testSetup.js          # Configuração global e mocks
├── unit/
│   ├── auth.controller.test.js
│   └── note.controller.test.js
├── integration/
│   └── api.integration.test.js
└── blackbox/
    └── api.blackbox.test.js
```

## 🧪 Tipos de Testes

### 1. Testes Unitários (Caixa Branca)

**Objetivo**: Testar cada função de forma isolada, verificando todos os caminhos possíveis do código.

**Características**:
- Uso extensivo de mocks (Redis, Sequelize, Nodemailer)
- Testa condições de erro e sucesso
- Valida lógica de negócio interna
- Cobertura de todos os branches

**Exemplo de Cenários**:

```javascript
// Auth Controller
✅ Login com credenciais válidas
✅ Login com email inexistente
✅ Login com senha incorreta
✅ Login sem email/senha
✅ Registro com dados válidos
✅ Registro com email duplicado
✅ Geração e validação de código de recuperação
✅ Alteração de senha com código válido/inválido

// Note Controller
✅ Criação de nota com token válido
✅ Criação sem token ou token inválido
✅ Listagem de notas do usuário autenticado
✅ Atualização de nota própria
✅ Tentativa de atualizar nota de outro usuário (403)
✅ Soft delete e restore
✅ Reordenação de notas
✅ Toggle de checkbox em lista
```

### 2. Testes de Integração

**Objetivo**: Validar o funcionamento da API como um todo, testando fluxos completos de usuário.

**Características**:
- Testa múltiplos endpoints em sequência
- Valida autenticação e autorização
- Simula casos de uso reais
- Verifica isolamento entre usuários

**Cenários End-to-End**:

```javascript
✅ Fluxo completo: Registro → Login → Criar Nota → Listar → Atualizar → Deletar
✅ Recuperação de senha: Solicitar código → Validar → Alterar senha → Login
✅ Segurança: Usuário A não acessa dados do Usuário B
✅ Autorização: Operações requerem autenticação
```

### 3. Testes Caixa Preta

**Objetivo**: Testar a API baseado apenas nas especificações, sem conhecimento da implementação.

**Técnicas Aplicadas**:

#### a) Particionamento de Equivalência
Divide entradas em classes válidas e inválidas:

```
Registro de Usuário:
- Classe Válida: email válido + senha válida
- Classe Inválida: email ausente
- Classe Inválida: senha ausente
- Classe Inválida: corpo vazio
```

#### b) Análise de Valor Limite
Testa valores nos limites:

```
Tamanho de Strings:
- Vazio: ""
- Mínimo: "a"
- Normal: "usuario@teste.com"
- Máximo: string de 255 caracteres
- Acima do máximo: 256+ caracteres

Valores Numéricos:
- Negativo: -1
- Zero: 0
- Positivo pequeno: 1
- Positivo grande: 999999
```

#### c) Testes de Segurança

```javascript
✅ SQL Injection: "'; DROP TABLE users; --"
✅ XSS: "<script>alert('xss')</script>"
✅ NoSQL Injection: { $ne: null }
✅ Header Injection
✅ Mass Assignment (modificar campos protegidos)
✅ Token JWT malformado
```

#### d) Casos Limite e Edge Cases

```javascript
✅ Concorrência: 10+ requisições simultâneas
✅ Rate Limiting: 50 tentativas de login
✅ JSON malformado
✅ Content-Type não suportado
```

## 🚀 Como Executar

### Executar Todos os Testes

```bash
npm test
```

### Executar Apenas Testes Unitários

```bash
npm run test:unit
```

### Executar Apenas Testes de Integração

```bash
npm run test:integration
```

### Modo Watch (desenvolvimento)

```bash
npm run test:watch
```

### Com Cobertura Detalhada

```bash
npm test -- --coverage --verbose
```

## 📊 Cobertura de Código

A configuração do Jest está configurada para gerar relatórios de cobertura automaticamente.

### Métricas de Cobertura

- **Statements**: % de linhas executadas
- **Branches**: % de condições if/else testadas
- **Functions**: % de funções chamadas
- **Lines**: % de linhas de código cobertas

### Visualizar Relatório

Após executar os testes com `--coverage`, abra:

```bash
open coverage/lcov-report/index.html
```

### Metas de Cobertura

| Métrica | Meta | Descrição |
|---------|------|-----------|
| Statements | ≥ 80% | Todas as instruções |
| Branches | ≥ 75% | Todas as condicionais |
| Functions | ≥ 85% | Todas as funções |
| Lines | ≥ 80% | Todas as linhas |

## 🔍 Análise de Cobertura por Módulo

### Auth Controller

```
Funções Testadas:
✅ login (5 caminhos)
✅ register (4 cenários)
✅ changePassword (4 validações)
✅ passwordCode (3 casos)

Cobertura Esperada: ~90%
```

### Note Controller

```
Funções Testadas:
✅ create (5 validações)
✅ getAll (2 cenários)
✅ update (4 casos)
✅ delete (3 casos)
✅ restore (2 casos)
✅ deletePermanent (2 casos)
✅ reorder (2 validações)
✅ toggleCheck (3 casos)

Cobertura Esperada: ~85%
```

## 🎓 Conceitos de Teste Aplicados

### Caixa Branca (White Box)

**Foco**: Estrutura interna do código

**Técnicas**:
- Cobertura de instruções
- Cobertura de decisões (branches)
- Cobertura de caminhos
- Teste de loops
- Teste de condições

**Exemplo**:
```javascript
// Testar todos os IFs do código
if (!email) { ... }           // ✅ Testado
if (!user) { ... }            // ✅ Testado
if (password !== ...) { ... } // ✅ Testado
```

### Caixa Preta (Black Box)

**Foco**: Comportamento observável

**Técnicas**:
- Particionamento de equivalência
- Análise de valor limite
- Tabela de decisão
- Teste de casos de uso

**Exemplo**:
```
Input: Email válido + Senha válida
Expected: Status 200 + Token JWT

Input: Email inválido
Expected: Status 204 ou 400

Input: Nenhum campo
Expected: Status 400
```

## 🐛 Debugging de Testes

### Ver logs detalhados

```bash
npm test -- --verbose
```

### Executar teste específico

```bash
npm test -- -t "nome do teste"
```

### Debug com VSCode

Adicione em `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal"
}
```

## 📝 Boas Práticas Implementadas

1. **AAA Pattern** (Arrange-Act-Assert)
   - Arrange: Preparar dados e mocks
   - Act: Executar função/endpoint
   - Assert: Verificar resultado

2. **Isolamento de Testes**
   - Cada teste é independente
   - beforeEach limpa mocks
   - Sem dependências entre testes

3. **Nomenclatura Clara**
   - `[Cenário] Deve fazer X quando Y`
   - Fácil identificar falhas

4. **Mocks Apropriados**
   - Redis mockado (não precisa instância real)
   - Email mockado (não envia emails reais)
   - Database mockado para unitários

5. **Testes Determinísticos**
   - Sempre mesmo resultado
   - Não dependem de timing
   - Não dependem de dados externos

## 🚨 Troubleshooting

### Erro: "Cannot find module"

```bash
npm install
```

### Erro: Redis connection

Verifique se o mock está ativo em `testSetup.js`

### Testes lentos

Use `--maxWorkers=4` para paralelizar:

```bash
npm test -- --maxWorkers=4
```

### Timeout em testes

Aumente timeout no teste:

```javascript
test('long test', async () => {
  // ...
}, 10000); // 10 segundos
```

## 📚 Recursos Adicionais

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

**Desenvolvido para**: Trabalho de Graduação - PDS2  
**Última atualização**: Dezembro 2024