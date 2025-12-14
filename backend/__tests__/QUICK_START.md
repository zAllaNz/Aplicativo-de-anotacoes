# 🚀 Quick Start - Testes do Aplicativo de Anotações

## Configuração Rápida (5 minutos)

### 1. Instalar Dependências

```bash
npm install --save-dev jest supertest @types/jest
```

### 2. Criar Arquivo .env.test

Copie o arquivo `.env.test` fornecido para a raiz do projeto.

### 3. Executar Todos os Testes

```bash
npm test
```

Pronto! Os testes começarão a executar.

---

## 📊 Comandos Principais

```bash
# Todos os testes com cobertura
npm test

# Apenas testes unitários
npm run test:unit

# Apenas testes de integração
npm run test:integration

# Modo watch (desenvolvimento)
npm run test:watch

# Teste específico
npm test -- auth.controller.test.js
```

---

## 📁 Estrutura de Arquivos

```
__tests__/
├── setup/testSetup.js           # ⚙️  Configuração global
├── unit/                         # 🧩 Testes unitários
│   ├── auth.controller.test.js
│   ├── note.controller.test.js
│   └── verifyToken.middleware.test.js
├── integration/                  # 🔗 Testes de integração
│   └── api.integration.test.js
└── blackbox/                     # ⬛ Testes caixa preta
    └── api.blackbox.test.js
```

---

## ✅ Checklist de Testes

### Testes Unitários (Caixa Branca)
- [x] Auth Controller (login, register, changePassword, passwordCode)
- [x] Note Controller (create, getAll, update, delete, restore)
- [x] Middleware (verifyToken, verifyTokenAndAuthorization)

### Testes de Integração
- [x] Fluxo completo: Registro → Login → CRUD de Notas
- [x] Recuperação de senha
- [x] Segurança e isolamento entre usuários

### Testes Caixa Preta
- [x] Particionamento de equivalência
- [x] Análise de valor limite
- [x] Testes de segurança (SQL Injection, XSS, etc)
- [x] Casos extremos e concorrência

---

## 🎯 Métricas Esperadas

| Tipo | Quantidade | Cobertura |
|------|------------|-----------|
| Testes Unitários | 30+ | ~90% |
| Testes Integração | 15+ | ~85% |
| Testes Caixa Preta | 30+ | Comportamental |
| **TOTAL** | **75+** | **~80-85%** |

---

## 🐛 Troubleshooting

### Erro: "Cannot find module"
```bash
npm install
```

### Testes falhando
1. Verifique se `.env.test` existe
2. Confirme que mocks estão configurados em `testSetup.js`
3. Execute com `--verbose` para mais detalhes:
   ```bash
   npm test -- --verbose
   ```

### Testes lentos
```bash
npm test -- --maxWorkers=4
```

---

## 📖 Documentação Completa

- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Guia detalhado
- [RELATORIO_TESTES.md](./RELATORIO_TESTES.md) - Relatório acadêmico

---

## 🎓 Para o Trabalho de Graduação

### Executar e Gerar Relatório Completo

```bash
# 1. Executar todos os testes
npm test

# 2. Ver relatório de cobertura
open coverage/lcov-report/index.html

# 3. Capturar screenshots para documentação
```

### Estrutura do Relatório

1. ✅ Introdução aos testes
2. ✅ Testes Unitários (30 casos)
3. ✅ Testes de Integração (15 casos)
4. ✅ Testes Caixa Preta (30+ casos)
5. ✅ Métricas de cobertura (80%+)
6. ✅ Conclusões e aprendizados

---

## 💡 Dicas

- Use `test.only()` para executar um teste específico durante desenvolvimento
- Use `test.skip()` para pular temporariamente um teste
- Sempre execute todos os testes antes de fazer commit
- Mantenha cobertura acima de 80%

---

**Boa sorte com o trabalho! 🎉**