# Account Ledger Assessment

Full-stack account ledger application using NestJS, Prisma, PostgreSQL, React, TypeScript, and Tailwind CSS.

## Requirements

- Node.js 20+
- PostgreSQL 14+

Install PostgreSQL locally and create a database named `account_ledger`.

## Run locally

```bash
cp backend/.env.example backend/.env
# Set DATABASE_URL in backend/.env

cd backend
npm install
npx prisma migrate dev --name init
npm run start:dev
```

The API runs at `http://localhost:3000` and Swagger is available at `http://localhost:3000/api`.

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`.

## API

- `POST /accounts` — create an account
- `GET /accounts?page=1&limit=10` — list accounts
- `GET /accounts/:id` — account details
- `GET /accounts/:id/balance` — current account balance
- `POST /accounts/:id/transactions` — credit or debit an account
- `GET /accounts/:id/transactions?page=1&limit=10&type=credit` — account transaction history; `type` is optional and accepts `credit` or `debit`
- `GET /transactions/recent?page=1&limit=20` — recent transactions across all accounts
- `POST /transfers` — atomically transfer money between accounts

Money is stored as PostgreSQL `numeric` and represented as strings at the API boundary to avoid floating-point errors. A `referenceId` is unique per account. Transactions may include an optional `description` (maximum 500 characters). Account balance changes and ledger entries are performed in the same database transaction.

## Behaviour and assumptions

- The backend is implemented with NestJS, Prisma, and PostgreSQL. NestJS was selected for modular structure, built-in validation, Swagger documentation, and maintainability.
- Amounts accept up to four decimal places and must be greater than zero. Balances cannot become negative.
- `referenceId` is idempotency-safe per account: the same reference cannot be posted twice to the same account. Transfer references are written to both ledger entries, so a duplicate on either account rolls back the complete transfer.
- A transfer creates one debit and one credit ledger entry in the same database transaction. Conditional balance updates make concurrent debits and transfers safe.
- Validation failures return HTTP 400, missing accounts return 404, insufficient funds return 400, and duplicate references return 409. Responses use NestJS's standard `{ statusCode, message, error }` shape.

Swagger at `/api` is the API documentation and can be used to exercise every endpoint.
