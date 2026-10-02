# Architecture

## Request flow

```
Route → Validator (Zod) → Middleware (auth/guards) → Controller → Service (Prisma) → DB
```

## Folders

```
src/
  index.ts              Entry point
  app/
    app.ts              Express setup
    routes/             URL → handler chain
    validators/         Zod schemas
    middlewares/        Auth and guards
    controllers/        Request handlers
  core/
    base/               Base classes
    utils/              Env, token, password, cookies, constants
  database/
    services/           One class per DB operation
    system/             Prisma client + BaseService
  generated/prisma/     Generated client (gitignored)
  types/                Shared types
```

Each folder has an `index.ts` "barrel" that instantiates its classes and exports them as one object, e.g. `Controllers.UserControllers.SignIn`.

## Base classes

| Class | Implement | Gives you |
|---|---|---|
| `Base` | | `this.Utils`, `this.Service`, `this.HTTP_STATUS`, `this.HTTP_MSG`, `this.responseHandler()` |
| `BaseController` | `module(req, res)` | Call via `.execute()`, errors caught → 500 |
| `BaseMiddleWare` | `middleware(req, res, next)` | `this.z`, `bodyHandler`, `paramHandler`, `queryHandler`; call via `.run()` |
| `BaseService` | `transaction(data)` | `this.database` (Prisma), `this.Password`, `this.env`; call via `.call()`, errors → `null` |

## Usage inside a class

```ts
this.Service.UserServices.CreateUser.call(data);
this.Utils.Token.signAccess({ payload });
this.responseHandler(res, this.HTTP_STATUS.SUCCESS, this.HTTP_MSG.SUCCESS, data);
```

## Conventions

- Imports use the `@/` alias with a `.js` extension: `import Base from "@/core/base/base.js"`.
- Prisma fields are camelCase (`userId`, `fullName`) and mapped to snake_case columns with `@map`.
- Prettier: double quotes, semicolons, trailing commas, 80 columns.