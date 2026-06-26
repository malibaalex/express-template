# Express Template

A production-ready Express.js backend template with a complete JWT authentication system, built on a class-based, layered architecture. Designed as a reusable scaffolding for new backend projects.

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM) |
| Framework | Express 5 |
| Language | TypeScript (strict mode, NodeNext resolution) |
| ORM | Prisma with `@prisma/adapter-pg` |
| Database | PostgreSQL (Neon serverless) |
| Auth | JWT access/refresh tokens + PBKDF2 password hashing |
| Validation | Zod |
| Package Manager | pnpm |
| Dev Tooling | Nodemon, TSX, ESLint, Prettier |

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+
- A PostgreSQL database (Neon, Supabase, or local)

### Installation

```bash
# Clone the repository
git clone https://github.com/parfaitBashombe/express-template.git
cd express-template

# Install dependencies
pnpm install
```

### Environment Variables

Create a `.env` file at the project root:

```env
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
JWT_SECRET_KEY="your-access-token-secret"
JWT_REFRESH_SECRET_KEY="your-refresh-token-secret"
```

Replace the values with your own database connection string and strong secret keys.

### Database Setup

```bash
# Generate the Prisma client
pnpm prisma:generate

# Run migrations against your database
pnpm prisma:migrate
```

### Running the Server

```bash
# Development (hot-reload via Nodemon + TSX)
pnpm dev

# Production
pnpm build
pnpm start
```

The server starts on port `4001` by default. Override it with a `PORT` environment variable.

---

## Project Structure

```
src/
  index.ts                          Entry point - bootstraps the App with all routes

  app/
    app.ts                          Main App class (Express setup, middleware, routing)
    controllers/                    Request handlers
      index.ts                      Barrel export for all controller groups
      user/                         User-related controllers
    middlewares/                     Auth guards and pre-processing
      index.ts                      Barrel export for all middleware groups
      user/                         User-related middlewares
    routes/                         Route definitions
      index.ts                      Aggregates all route groups into a single array
      user/                         User-related routes
    validators/                     Zod schema validators
      index.ts                      Barrel export for all validator groups
      validator-id.ts               Reusable UUID param validator
      user/                         User-specific validators

  core/
    base/
      base.ts                      Root base class (HTTP codes, messages, Utils, Services)
      base-controller.ts           Abstract controller with error-handling execute() wrapper
      base-middleware.ts            Abstract middleware with Zod body/param/query handlers
    utils/
      index.ts                     Aggregated utility object
      constants.ts                 App-wide constants (default port)
      coockie-util.ts              Cookie helpers (set/clear auth cookies)
      omit-property.ts             Generic object key omitter
      password-utils.ts            PBKDF2 password hashing and comparison
      port.ts                      Port normalization
      token.ts                     JWT generation, verification, and extraction

  database/
    system/
      db.ts                        Prisma client singleton (Neon adapter)
      base-service.ts              Abstract service with call() error wrapper
    services/                      One class per database operation
      index.ts                     Barrel export for all service groups
      user/                        User CRUD services
      refresh-token/               Refresh token CRUD services

  generated/prisma/                Auto-generated Prisma client (gitignored)

  types/
    app.d.ts                       IRoute interface, Express Request augmentation
    db.d.ts                        Pagination types
    user.d.ts                      Signup, LogIn, JwtPayload types
```

---

## Architecture

The project uses a layered, class-based architecture where each layer has a single responsibility.

### Layer Diagram

```
Request
  |
  v
Route  -->  Validator (Zod)  -->  Middleware (auth/guards)  -->  Controller  -->  Service (Prisma)
  |                                                                                    |
  v                                                                                    v
Response  <--------------------------------------------------------------------  Database
```

### Base Classes

Every concrete class inherits from one of three abstract base classes, all of which extend a shared `Base` class:

**Base** (`core/base/base.ts`)
- Provides `this.Utils` (password hashing, JWT, port, omitProperty)
- Provides `this.Service` (all database services)
- Defines HTTP status codes and standard response messages
- Contains `responseHandler()` for consistent JSON responses

**BaseController** (`core/base/base-controller.ts`)
- Extends Base
- Requires subclasses to implement `module(req, res)`
- Wraps execution in try/catch via `execute()`

**BaseMiddleware** (`core/base/base-middleware.ts`)
- Extends Base
- Requires subclasses to implement `middleware(req, res, next)`
- Provides `bodyHandler()`, `paramHandler()`, `queryHandler()` for Zod validation
- Wraps execution in try/catch via `run()`

**BaseService** (`database/system/base-service.ts`)
- Provides `this.database` (Prisma client) and `this.Password`
- Requires subclasses to implement `transaction(data)`
- Wraps execution in try/catch via `call()`
- Includes a `cursor()` helper for pagination

### Barrel Exports

Each layer uses barrel `index.ts` files that instantiate all classes and export them as a single object. This means you access everything through a structured namespace:

```typescript
// Inside any controller or middleware:
this.Service.UserServices.CreateUser.call(data);
this.Service.RefreshTokenServices.SaveRefreshToken.call(data);
this.Utils.Token.generateAccess(payload);
this.Utils.Password.hash(password, salt);
```

---

## API Endpoints

All routes are mounted under `/api/`. Each route group defines its own sub-path (e.g. the auth routes use `/api/auth/`, while a posts resource would use `/api/posts/`).

### Authentication Routes

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/` | No | Welcome message |
| `POST` | `/api/auth/signup` | No | Register a new user |
| `POST` | `/api/auth/signin` | No | Log in with email and password |
| `GET` | `/api/auth/profile` | Yes | Get the authenticated user profile |
| `PUT` | `/api/auth/update/:id` | Yes | Update the authenticated user |
| `POST` | `/api/auth/logout` | No | Log out (revoke refresh token, clear cookies) |
| `POST` | `/api/auth/refresh` | No | Rotate access and refresh tokens |

### Request/Response Format

All responses follow this structure:

```json
{
  "status": 200,
  "message": "success",
  "data": { }
}
```

### Authentication

The auth system uses a dual-token strategy:

- **Access Token**: Short-lived (15 minutes), stored as an `httpOnly` cookie named `access_token`. Can also be sent via `Authorization: Bearer <token>` header.
- **Refresh Token**: Long-lived (7 days), stored as an `httpOnly` cookie named `refresh_token` and persisted in the database.

**Password Hashing**: PBKDF2 with 100,000 iterations, SHA-512 digest, 64-byte key length, and a random 32-byte salt per user.

---

## How to Add New Endpoints

Follow this step-by-step process to add a new feature. The example below creates a `Post` resource.

### Step 1: Define the Prisma Model

Add your model to `prisma/schema.prisma`:

```prisma
model Post {
  post_id   String   @id @default(uuid())
  title     String
  content   String
  user_id   String
  User      User     @relation(fields: [user_id], references: [user_id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("posts")
}
```

Then run:

```bash
pnpm prisma:migrate
pnpm prisma:generate
```

### Step 2: Create Types (if needed)

Add a type file at `src/types/post.d.ts`:

```typescript
export type CreatePost = {
  title: string;
  content: string;
};
```

### Step 3: Create the Database Service

Create a file at `src/database/services/post/create-post-service.ts`:

```typescript
import BaseService from "@/database/system/base-service.js";
import { Post } from "@/generated/prisma/client.js";
import { CreatePost } from "@/types/post.js";

class CreatePostService extends BaseService<CreatePost & { user_id: string }, Post> {
  protected async transaction(
    data: CreatePost & { user_id: string },
  ): Promise<Post | null> {
    const result = await this.database.post.create({
      data: {
        title: data.title,
        content: data.content,
        user_id: data.user_id,
      },
    });

    if (!result) return null;
    return result;
  }
}

export default CreatePostService;
```

Create the barrel at `src/database/services/post/index.ts`:

```typescript
import CreatePostService from "@/database/services/post/create-post-service.js";

const CreatePost = new CreatePostService();

const PostServices = {
  CreatePost,
};

export default PostServices;
```

Register it in `src/database/services/index.ts`:

```typescript
import UserServices from "@/database/services/user/index.js";
import RefreshTokenServices from "@/database/services/refresh-token/index.js";
import PostServices from "@/database/services/post/index.js";

const Services = {
  UserServices,
  RefreshTokenServices,
  PostServices,
};

export default Services;
```

### Step 4: Create the Validator

Create a file at `src/app/validators/post/create-post-validator.ts`:

```typescript
import BaseMiddleWare from "@/core/base/base-middleware.js";
import { Request, Response, NextFunction } from "express";

class CreatePostValidator extends BaseMiddleWare {
  protected async middleware(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const schema = this.z.object({
      title: this.z.string().min(1),
      content: this.z.string().min(1),
    });

    this.bodyHandler(req, res, next, schema);
  }
}

export default CreatePostValidator;
```

Create the barrel at `src/app/validators/post/index.ts`:

```typescript
import CreatePostValidator from "@/app/validators/post/create-post-validator.js";

const Create = new CreatePostValidator();

const PostValidators = { Create };

export default PostValidators;
```

Register it in `src/app/validators/index.ts`:

```typescript
import UserValidators from "@/app/validators/user/index.js";
import PostValidators from "@/app/validators/post/index.js";
import IdValidator from "@/app/validators/validator-id.js";

const Id = new IdValidator();

const Validators = { UserValidators, PostValidators, Id };

export default Validators;
```

### Step 5: Create Custom Middlewares (if needed)

Middlewares sit between validators and controllers in the request chain. They handle concerns like authentication, authorization, ownership checks, rate limiting, or any pre-processing logic.

Both validators and middlewares extend the same `BaseMiddleWare` class. The distinction is organizational: validators live in `app/validators/` and focus on schema validation, while middlewares live in `app/middlewares/` and focus on business logic guards.

**Using the built-in auth middleware**

The template ships with a `UserAuthentication` middleware that extracts the JWT, decodes it, fetches the user from the database, and attaches it to `req.currentUser`. You can reuse it on any protected route:

```typescript
// In your route file:
(req: Request, res: Response, next: NextFunction) =>
  MiddleWares.UserMiddleWares.UserAuth.run(req, res, next),
```

**Creating a new middleware**

For example, an ownership guard that ensures a user can only modify their own posts.

Create a file at `src/app/middlewares/post/check-post-owner.ts`:

```typescript
import BaseMiddleWare from "@/core/base/base-middleware.js";
import { Request, Response, NextFunction } from "express";

class CheckPostOwner extends BaseMiddleWare {
  protected async middleware(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const user = req.currentUser;
    const postId = req.params.id;

    if (!user) {
      this.responseHandler(res, this.UNAUTHORIZED_CODE, this.UNAUTHORIZED_MSG);
      return;
    }

    // Use this.Service to access any database service
    const post = await this.Service.PostServices.GetPostById.call(postId);

    if (!post) {
      this.responseHandler(res, this.NOT_FOUND_CODE, this.NOT_FOUND_MSG);
      return;
    }

    if (post.user_id !== user.user_id) {
      this.responseHandler(res, this.UNAUTHORIZED_CODE, "not the post owner");
      return;
    }

    return next();
  }
}

export default CheckPostOwner;
```

Key points:
- Extend `BaseMiddleWare` and implement the abstract `middleware(req, res, next)` method.
- Use `this.responseHandler()` to send error responses and return early (do not call `next()`).
- Call `next()` only when the check passes to continue to the next handler in the chain.
- Access all utilities via `this.Utils` and all database services via `this.Service`.

Create the barrel at `src/app/middlewares/post/index.ts`:

```typescript
import CheckPostOwner from "@/app/middlewares/post/check-post-owner.js";

const PostOwner = new CheckPostOwner();

const PostMiddleWares = { PostOwner };

export default PostMiddleWares;
```

Register it in `src/app/middlewares/index.ts`:

```typescript
import UserMiddleWares from "@/app/middlewares/user/index.js";
import PostMiddleWares from "@/app/middlewares/post/index.js";

const MiddleWares = { UserMiddleWares, PostMiddleWares };

export default MiddleWares;
```

Then use it in a route by chaining it after the auth middleware:

```typescript
private initRoute(): void {
  this.router.route(`${this.path}delete/:id`).delete(
    (req: Request, res: Response, next: NextFunction) =>
      Validators.Id.run(req, res, next),

    (req: Request, res: Response, next: NextFunction) =>
      MiddleWares.UserMiddleWares.UserAuth.run(req, res, next),

    (req: Request, res: Response, next: NextFunction) =>
      MiddleWares.PostMiddleWares.PostOwner.run(req, res, next),

    (req: Request, res: Response) =>
      Controllers.PostControllers.DeletePost.execute(req, res),
  );
}
```

The middleware chain executes left to right: validate the ID param, authenticate the user, verify ownership, then run the controller.

### Step 6: Create the Controller

Create a file at `src/app/controllers/post/create-post-controller.ts`:

```typescript
import { Request, Response } from "express";
import BaseControlller from "@/core/base/base-controller.js";

class CreatePostController extends BaseControlller {
  protected async module(
    req: Request,
    res: Response,
  ): Promise<void | Response> {
    const user = req.currentUser;

    if (!user) {
      return this.responseHandler(
        res,
        this.UNAUTHORIZED_CODE,
        this.UNAUTHORIZED_MSG,
      );
    }

    const result = await this.Service.PostServices.CreatePost.call({
      ...req.body,
      user_id: user.user_id,
    });

    if (!result) {
      return this.responseHandler(
        res,
        this.BAD_REQUEST_CODE,
        this.BAD_REQUEST_MSG,
      );
    }

    return this.responseHandler(
      res,
      this.CREATED_CODE,
      this.CREATED_MSG,
      result,
    );
  }
}

export default CreatePostController;
```

Create the barrel at `src/app/controllers/post/index.ts`:

```typescript
import CreatePostController from "@/app/controllers/post/create-post-controller.js";

const CreatePost = new CreatePostController();

const PostControllers = { CreatePost };

export default PostControllers;
```

Register it in `src/app/controllers/index.ts`:

```typescript
import UserControllers from "@/app/controllers/user/index.js";
import PostControllers from "@/app/controllers/post/index.js";

const Controllers = {
  UserControllers,
  PostControllers,
};

export default Controllers;
```

### Step 7: Create the Route

Create a file at `src/app/routes/post/create-post-route.ts`:

```typescript
import { Request, Response, NextFunction, Router } from "express";
import { IRoute } from "@/types/app.js";
import Controllers from "@/app/controllers/index.js";
import Validators from "@/app/validators/index.js";
import MiddleWares from "@/app/middlewares/index.js";

class CreatePostRoute implements IRoute {
  path: string;
  router;

  constructor(path: string) {
    this.path = path;
    this.router = Router();
    this.initRoute();
  }

  private initRoute(): void {
    this.router.route(`${this.path}create`).post(
      (req: Request, res: Response, next: NextFunction) =>
        Validators.PostValidators.Create.run(req, res, next),

      (req: Request, res: Response, next: NextFunction) =>
        MiddleWares.UserMiddleWares.UserAuth.run(req, res, next),

      (req: Request, res: Response) =>
        Controllers.PostControllers.CreatePost.execute(req, res),
    );
  }
}

export default CreatePostRoute;
```

Create the barrel at `src/app/routes/post/index.ts`:

```typescript
import CreatePostRoute from "@/app/routes/post/create-post-route.js";

const PATH = "/posts/";

const CreatePost = new CreatePostRoute(PATH);

const PostRoutes = {
  CreatePost,
};

export default PostRoutes;
```

Register it in `src/app/routes/index.ts`:

```typescript
import { IRoute } from "@/types/app.js";
import UserRoutes from "@/app/routes/user/index.js";
import PostRoutes from "@/app/routes/post/index.js";

const routes: IRoute[] = [
  ...Object.values({ ...UserRoutes, ...PostRoutes }),
];

export default routes;
```

Your new endpoint is now live at `POST /api/posts/create`.

### Summary of Steps

1. **Schema** - Add the Prisma model, migrate, generate
2. **Types** - Define input/output types
3. **Service** - Create the database operation class, register in barrel
4. **Validator** - Create the Zod validation class, register in barrel
5. **Middleware** - Create guard/pre-processing classes if needed, register in barrel
6. **Controller** - Create the request handler class, register in barrel
7. **Route** - Create the route class, wire validators, middlewares, and controller, register in barrel

Each new class follows the same pattern: extend the appropriate base class, implement the abstract method, instantiate it in the barrel `index.ts`, and register the barrel one level up.

---

## Available Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Start development server with hot-reload |
| `pnpm build` | Compile TypeScript to JavaScript |
| `pnpm start` | Run the compiled production build |
| `pnpm lint` | Run ESLint across the project |
| `pnpm format` | Format all files with Prettier |
| `pnpm prisma:generate` | Generate the Prisma client |
| `pnpm prisma:migrate` | Run Prisma migrations |

---

## Configuration

### Path Aliases

The project uses `@/*` as a path alias for `./src/*`. All imports use this alias with explicit `.js` extensions, which is required by TypeScript's `NodeNext` module resolution.

```typescript
import Base from "@/core/base/base.js";
```

### Prettier

Configured in `.prettierrc`:

- Semicolons enabled
- Double quotes
- 2-space indentation
- Trailing commas everywhere
- 80-character print width

### ESLint

Configured in `eslint.config.mjs` with TypeScript support and Prettier integration. Unused variables produce warnings, and `console` statements are allowed.

---

## License

ISC
