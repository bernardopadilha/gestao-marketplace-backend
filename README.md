# 🟠 Gestão Marketplace - Back-end

Este é o back-end da aplicação **Gestão Marketplace**, desenvolvido em **Nest.js + Prisma + PostgreSQL**.
---

## 📂 Estrutura do Projeto

- **Nest.js**
- **Prisma ORM** → Modelagem e manipulação do banco de dados.
- **PostgreSQL** → Banco de dados utilizado.
- **Render** → Hospedagem da API em produção.

Principais módulos:
- `auth` → autenticação e geração de tokens JWT.
- `users` → gerenciamento de usuários.
- `products` → gerenciamento de produtos.

## ⚙️ Decisões Técnicas

- Nest.js → escolha por ser modular e por possuir boas práticas de arquitetura.
- Prisma ORM → escolha pela facilidade de modelar e migrar o banco de dados.
- Banco PostgreSQL → escolha por maior familiaridade.

## 🚀 Deploy
- Front-end Vercel: **https://gestao-marketplace-frontend.vercel.app/**
- Back-end Render: **https://gestao-marketplace-backend.onrender.com/**

---

## ▶️ Como executar localmente

```bash
# 1. Clonar o repositório
git clone <url-do-repositorio-front>

# 2. Acessar a pasta
cd gestao-marketplace-backend
```

## ▶️ Variáveis de Ambiente
- 🚨 Lembre de completar o env vom variáveis enviadas no whatsApp
```bash
# Crie um .env
# Lembre de completar o env com variáveis enviadas no whatsApp
DATABASE_URL=""

JWT_SECRET=
NODE_ENV=development
PORT=3000

AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=AKIA5MSUBVW7VMBEBWBO
AWS_SECRET_ACCESS_KEY=
AWS_BUCKET_NAME=gestao-marketplace
```

## ▶️ Docker compose

```bash
docker-compose up -d && docker-compose logs -f
```

## 🚨 Usuário pronto para teste (opcional)
```bash
# Siga o passo a passo do backend para o login
Login: desafio@zeine.com.br
Senha: Boramoer1.
```
