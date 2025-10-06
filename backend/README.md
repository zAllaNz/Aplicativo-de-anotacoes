# Backend - Instruções de Execução

Este guia descreve os passos para rodar o backend do projeto.

## Pré-requisitos

- Node.js instalado
- Docker e Docker Compose instalados
- PostgreSQL não pode estar rodando em background na porta padrão

## Passos para rodar o backend

1. **Verificar processos do PostgreSQL**  
   Certifique-se que nenhum processo do PostgreSQL está rodando. No Windows, por exemplo, você pode checar pelo Gerenciador de Tarefas e finalizar processos com `postgres.exe`.  

2. **Configurar variáveis de ambiente**  
    Crie um arquivo `.env` baseado no `.env.example`.  
   ```bash
   cp .env.example .env
   ```
   
3. **Subir containers do Docker**   
    Suba os containers do projeto usando Docker Compose:
  ```bash
   docker-compose up
   ```

4. **Instalar dependências do Node.js**
Instale as dependências do projeto:
```bash
   npm install
   npm install -g nodemon
   ```
### 5. Rodar o backend em modo de desenvolvimento

Execute o backend usando:

```bash
npm run dev
   ```