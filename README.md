# App de Sermões

Um aplicativo web para gravação e gerenciamento de sermões com autenticação de usuário.

## Funcionalidades

- **Login de usuário**: Sistema de autenticação com JWT
- **CRUD de Sermões**: Criar, ler, atualizar e excluir sermões
- **Campos do Sermão**:
  - Título
  - Conteúdo
  - Data
  - Local da ministração

## Como executar

1. Instale as dependências:
   ```
   npm install
   ```

2. Crie um usuário inicial (opcional, já criado admin/123456):
   ```
   node createUser.js
   ```

3. Inicie o servidor:
   ```
   npm start
   ```

4. Acesse `http://localhost:3000` no navegador.

## Estrutura do Projeto

- `server.js`: Servidor Express com rotas API
- `database.js`: Configuração do banco SQLite
- `public/index.html`: Frontend com login e CRUD
- `createUser.js`: Script para criar usuário inicial

## API Endpoints

- `POST /login`: Login de usuário
- `POST /register`: Registrar novo usuário
- `GET /sermoes`: Listar sermões do usuário
- `POST /sermoes`: Criar novo sermão
- `GET /sermoes/:id`: Obter sermão específico
- `PUT /sermoes/:id`: Atualizar sermão
- `DELETE /sermoes/:id`: Excluir sermão

## Tecnologias

- Backend: Node.js, Express, SQLite3, bcryptjs, jsonwebtoken
- Frontend: HTML, CSS, JavaScript (vanilla)</content>
<parameter name="filePath">c:\Users\tiqs\Desktop\sermao-app\README.md