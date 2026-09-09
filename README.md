# Gerenciador de Tarefas MERN

Sistema full-stack de gerenciamento de tarefas com autenticação de usuários, desenvolvido utilizando a Stack MERN (MongoDB, Express, React, Node.js).

## 🚀 Tecnologias Utilizadas
- **Node.js & Express**: Construção da API REST e back-end.
- **MongoDB & Mongoose**: Banco de dados NoSQL e modelagem de dados.
- **Brypt & JWT**: Criptografia de senhas e autenticação segura baseada em tokens.
- **React & Vite**: Interface gráfica e front-end (em desenvolvimento).

## 📂 Estrutura do Repositório
```text
gerenciador-de-tarefas-mern/
├── backend/
│   ├── src/
│   │   ├── controllers/ (Lógica de negócios e requisições)
│   │   ├── models/ (Schemas do Mongoose: User e Task)
│   │   ├── routes/ (Definição de endpoints REST)
│   │   ├── middlewares/ (Validação de JWT, CORS e erros)
│   │   └── server.js (Ponto de entrada do servidor)
│   ├── .env.example (Template de variáveis de ambiente)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/ (Botões, Inputs, Cards de Tarefa)
│   │   ├── pages/ (Login, Cadastro, Dashboard de Tarefas)
│   │   ├── services/ (Configuração do axios/fetch para API)
│   │   └── App.jsx (Roteamento principal)
│   └── package.json
└── README.md