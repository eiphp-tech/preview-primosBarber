# 🚀 PrimosBarber - Backend

API REST para sistema de gestão e agendamentos de barbearias.

## 🛠️ Stack

- **Runtime:** Node.js 20+
- **Framework:** Fastify
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Auth:** JWT + Bcrypt
- **Validation:** Zod
- **Language:** TypeScript

## 📋 Pré-requisitos

- Node.js 20+
- PostgreSQL 16+
- npm ou yarn

## 🚀 Como rodar

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
# Editar .env com suas credenciais
```

### 3. Criar banco de dados

```bash
# Conectar ao PostgreSQL
psql -U postgres

# Criar banco
CREATE DATABASE ws_barber;
CREATE USER barber_admin WITH PASSWORD 'sua_senha';
GRANT ALL PRIVILEGES ON DATABASE ws_barber TO barber_admin;
ALTER USER barber_admin CREATEDB;
```

### 4. Rodar migrations

```bash
npx prisma migrate dev
```

### 5. Popular banco com dados de teste

```bash
npm run seed
```

### 6. Rodar servidor

```bash
npm run dev
```

Servidor rodando em: `http://localhost:5000`

## 📚 Rotas

### Autenticação

- `POST /auth/register` - Registrar usuário
- `POST /auth/login` - Fazer login
- `GET /auth/me` - Buscar perfil (protegida)

## 🧪 Credenciais de teste

```
Email: pedro@email.com
Senha: 123456
Role: CLIENT
```

## 📝 Scripts

```bash
npm run dev          # Rodar em desenvolvimento
npm run build        # Build para produção
npm run start        # Rodar produção
npm run seed         # Popular banco
npm run prisma:studio # Abrir Prisma Studio
```

## 🏗️ Estrutura

```
backend/
├── prisma/
│   ├── migrations/       # Histórico de mudanças no banco
│   └── schema.prisma     # Schema do banco
├── src/
│   ├── config/           # Configurações (Prisma, etc)
│   ├── controllers/      # Handlers HTTP
│   ├── middlewares/      # Autenticação, validação
│   ├── routes/           # Definição de rotas
│   ├── schemas/          # Validação Zod
│   ├── services/         # Lógica de negócio
│   ├── types/            # Tipos TypeScript
│   ├── utils/            # Funções auxiliares
│   ├── seed.ts           # Popular banco
│   └── server.ts         # Servidor principal
├── .env.example
├── package.json
└── tsconfig.json
```

## 🔐 Segurança

- Senhas hasheadas com bcrypt
- Autenticação JWT stateless
- Validação de entrada com Zod
- Headers CORS configurados
