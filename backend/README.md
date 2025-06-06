## Getting started

Assuming you have docker

on the root of the project run:

```bash
docker compose up
```

this will start and expose postgres on port 5432

Make migrations:

```bash
npx prisma db push
```

Seed the database:

```bash
npx prisma db seed
```

Generate prisma types:

```bash
npx prisma generate
```

Run the server:

```bash
yarn dev
```
