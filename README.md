# Gerenciador de Tarefas MERN

Projeto acadêmico com MongoDB, Express, React e Node.js. Cada pessoa pode cadastrar uma conta, entrar e criar, listar, editar, concluir/reabrir e excluir suas próprias tarefas.

## Pré-requisitos

- Git e Node.js 22.12 ou superior (com npm).
- Cluster do MongoDB Atlas e usuário do banco, ou MongoDB local para desenvolvimento/testes.
- Dois terminais: um para a API e outro para o Vite.

## Instalação do zero

```bash
git clone https://github.com/IgorMoraesTech/gerenciador-de-tarefas-mern.git
cd gerenciador-de-tarefas-mern
cd backend
npm ci
cp .env.example .env
```

No Windows PowerShell, use `Copy-Item .env.example .env` em vez de `cp`.

Abra `backend/.env` e configure:

| Variável | Finalidade |
| --- | --- |
| `MONGO_URI` | String de conexão do Atlas, incluindo o nome do banco |
| `JWT_SECRET` | Segredo aleatório com pelo menos 32 caracteres, somente no backend |
| `PORT` | Porta do Express; use `3000` com o proxy padrão |
| `CORS_ORIGINS` | Origens exatas permitidas, separadas por vírgula |

Gere seu próprio segredo no terminal e copie o resultado para `JWT_SECRET`:

```bash
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Não publique o resultado. O `.env.example` contém apenas exemplos e não deve ser usado como segredo real.

### MongoDB Atlas

1. Crie um cluster gratuito, quando disponível na sua conta.
2. Em **Database Access**, crie um usuário com leitura/escrita apenas no banco da aplicação.
3. Em **Network Access**, autorize o IP de saída do ambiente que executa o backend. O IP do Codespace pode mudar após reinícios.
4. Em **Connect > Drivers**, copie a URI e substitua usuário, senha e nome do banco. Caracteres especiais das credenciais precisam de codificação de URL.
5. Salve a URI em `MONGO_URI`, apenas no `.env` local. Não a coloque no frontend, README, prints ou commits.

Exemplo fictício de formato: `mongodb+srv://USUARIO:SENHA@SEU_CLUSTER/gerenciador_tarefas`.

## Executar

Terminal 1, na pasta `backend`:

```bash
npm start
```

A API só abre a porta após conectar ao banco e inicializar o índice de usuários. Para reinício automático ao editar o backend, use `npm run dev` em vez de `npm start`.

Terminal 2, na raiz do repositório:

```bash
cd frontend
npm ci
npm run dev
```

Localmente, abra `http://localhost:5173`. Cadastre uma conta e entre. Novas senhas exigem pelo menos 8 caracteres e no máximo 72 bytes UTF-8 (limite do bcrypt).

### GitHub Codespaces

Abra pelo endereço encaminhado da porta **5173**, na aba **Portas**. O Vite encaminha `/api` internamente para `127.0.0.1:3000`. Não é necessário tornar a porta 3000 pública; mantenha as portas privadas quando possível.

O backend permite automaticamente a origem exata da porta 5173 do próprio Codespace, usando `CODESPACE_NAME` e `GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN`. Se executar fora desse ambiente com outro endereço, acrescente a origem exata em `CORS_ORIGINS` e reinicie o backend.

A porta do Vite é fixa: se a 5173 estiver ocupada, ele avisa e encerra. Pare a instância anterior com `Ctrl+C` antes de iniciar outra. Mantenha apenas um backend e um frontend.

## Uso

- **Cadastrar/entrar:** use e-mail e senha; o token JWT fica no `localStorage` e expira em um dia.
- **Criar:** preencha título, descrição opcional e status.
- **Editar/concluir:** clique em **Editar**, altere os campos ou o status e salve. **Cancelar edição** descarta as alterações do formulário.
- **Excluir:** confirme a remoção; não há recuperação pela interface.
- **Sair:** remove o token deste navegador. Tokens já emitidos expiram no prazo definido; este projeto não mantém uma lista de revogação.

## API

Rotas de tarefas exigem `Authorization: Bearer TOKEN`.

| Método | Caminho | Ação |
| --- | --- | --- |
| POST | `/api/auth/register` | Cadastro: `name`, `email`, `password` |
| POST | `/api/auth/login` | Login: `email`, `password` |
| GET | `/api/tasks` | Listar tarefas do usuário |
| POST | `/api/tasks` | Criar: `title`, `description` opcional, `status` opcional |
| PUT | `/api/tasks/:id` | Atualizar um ou mais campos: `title`, `description`, `status` |
| DELETE | `/api/tasks/:id` | Excluir tarefa própria |

Status permitidos: `pendente` e `concluída`. Respostas: 400 para dados inválidos, 401 para autenticação inválida, 403 para origem bloqueada, 404 para recurso não encontrado/não pertencente ao usuário, 409 para e-mail duplicado e 500 para falha interna.

### Testar a API antes da interface

No Postman/Thunder Client, faça POST para `http://localhost:3000/api/auth/register`, selecionando JSON:

```json
{"name":"Pessoa Teste","email":"pessoa@example.com","password":"senha-teste-123"}
```

Faça login com e-mail/senha, copie `token` da resposta e configure **Bearer Token** nas chamadas de tarefas. Crie com `{"title":"Estudar MERN"}`, liste, atualize pelo ID retornado com `{"status":"concluída"}` e exclua. No Codespaces, você também pode executar chamadas internas pelo terminal; o encaminhamento externo da API não é necessário ao Vite.

## Segurança e organização

- Senhas armazenadas como hash bcrypt; JWT assinado com HS256 e segredo do ambiente.
- Tipos, tamanhos, campos permitidos, IDs, status e e-mail validados antes das consultas. Objetos com operadores de consulta não são aceitos como campos de texto.
- Campos são texto simples: marcação HTML é rejeitada e o React apresenta os valores com seu escape padrão, sem `dangerouslySetInnerHTML`.
- GET/PUT/DELETE filtram pelo usuário autenticado; POST obtém o dono do token, nunca do body.
- CORS com lista explícita de origens. CORS não substitui autenticação: clientes sem Origin ainda precisam do JWT.
- JSON limitado a 16 KB; falhas internas não devolvem stack, credenciais nem detalhes do banco.
- `.env` e `node_modules` não devem ser versionados. `.env.example` documenta as variáveis.

**Credenciais antigas:** o histórico anterior do projeto continha `backend/.env`. Remover o arquivo do estado atual não elimina esse histórico. Se havia credenciais reais, o proprietário deve trocar a senha do usuário no Atlas e gerar novo `JWT_SECRET`, atualizando o `.env` local. Isso invalida os tokens anteriores. Não foi feita reescrita destrutiva do histórico compartilhado.

## Estrutura

- `backend/src/app.js`: middleware, CORS, rotas e erros.
- `backend/src/server.js`: configuração, banco e inicialização.
- `backend/src/controllers`, `models`, `routes`, `middlewares`: responsabilidades da API.
- `backend/test`: testes de validação e integração.
- `frontend/src/pages`: autenticação e dashboard.
- `frontend/src/components/TaskForm.jsx`: criação/edição.
- `frontend/src/services/api.js`: Axios e envio automático do token.

## Verificações automatizadas

```bash
cd backend
npm test
```

Sem `TEST_MONGO_URI`, os testes de validação rodam e o teste de integração fica explicitamente **ignorado**. Para executá-lo, forneça um MongoDB de testes:

```bash
TEST_MONGO_URI=mongodb://127.0.0.1:27017 npm test
```

PowerShell: `$env:TEST_MONGO_URI="mongodb://127.0.0.1:27017"` e depois `npm test`.

O teste cria e remove apenas um banco temporário chamado `mern_test_...`. Use instância/usuário de testes com permissão para criar/remover esse banco; não use as credenciais do banco da aplicação.

```bash
cd ../frontend
npm run lint
npm run build
```

O workflow de GitHub Actions usa MongoDB isolado e executa testes da API, lint e build. Confira o resultado da execução no PR.

### Roteiro de aceitação manual

1. Cadastre dois usuários e teste senha incorreta/e-mail repetido.
2. Com o primeiro, crie, edite, conclua, reabra e exclua tarefas; recarregue a página para confirmar persistência.
3. Entre com o segundo e confirme lista independente; tente acessar IDs do primeiro diretamente pela API (404 esperado).
4. Sem token ou com token expirado, chamadas de tarefas devem retornar 401; a interface deve voltar ao login.
5. Teste título em branco, status inválido e texto excessivo (400 esperado).
6. Confirme cancelar edição/exclusão e verifique a interface no celular.

## Limites da entrega

O proxy do Vite atende ao desenvolvimento. Publicar o build exige um servidor que entregue os arquivos, encaminhe `/api` ao Express e trate as rotas do React; `npm run build` sozinho não hospeda a API. Deploy público, recuperação de senha, rate limiting e revogação individual de tokens não fazem parte do enunciado implementado.

Referências: [Vite](https://vite.dev/config/server-options.html#server-proxy), [Express/CORS](https://expressjs.com/en/resources/middleware/cors/), [validação do Mongoose](https://mongoosejs.com/docs/validation.html).
