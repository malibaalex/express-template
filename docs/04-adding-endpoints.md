# Adding an Endpoint

Example: `POST /api/posts/create`. Every step is "write a class, add it to the folder's `index.ts`".

## 1. Prisma model

`prisma/schema.prisma`:

```prisma
model Post {
  postId    String   @id @default(uuid()) @map("post_id")
  title     String
  content   String
  userId    String   @map("user_id")
  user      User     @relation(fields: [userId], references: [userId], onDelete: Cascade)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@index([userId])
  @@map("posts")
}
```

Add `posts Post[]` to the `User` model, then:

```bash
pnpm prisma:migrate
pnpm prisma:generate
```

## 2. Type

`src/types/post.d.ts`:

```ts
export type CreatePost = { title: string; content: string; userId: string };
```

## 3. Service

`src/database/services/post/create-post-service.ts`:

```ts
import BaseService from "@/database/system/base-service.js";
import { Post } from "@/generated/prisma/client.js";
import { CreatePost } from "@/types/post.js";

class CreatePostService extends BaseService<CreatePost, Post> {
  protected async transaction(data: CreatePost): Promise<Post | null> {
    return await this.database.post.create({ data });
  }
}

export default CreatePostService;
```

`src/database/services/post/index.ts`:

```ts
import CreatePostService from "@/database/services/post/create-post-service.js";

const CreatePost = new CreatePostService();

const PostServices = { CreatePost };

export default PostServices;
```

Register in `src/database/services/index.ts`: add `PostServices` to the `Services` object.

## 4. Validator

`src/app/validators/post/create-post-validator.ts`:

```ts
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

`src/app/validators/post/index.ts`:

```ts
import CreatePostValidator from "@/app/validators/post/create-post-validator.js";

const Create = new CreatePostValidator();

const PostValidators = { Create };

export default PostValidators;
```

Register in `src/app/validators/index.ts`: add `PostValidators`.

## 5. Middleware (only if needed)

Same pattern as a validator, but in `src/app/middlewares/<name>/`. Rules:

- Extend `BaseMiddleWare`, implement `middleware()`.
- To reject: send with `this.responseHandler(...)` and `return`.
- To continue: `return next()`.

Register the same way (`PostMiddleWares` in `src/app/middlewares/index.ts`).

Auth is already built: `MiddleWares.UserMiddleWares.UserAuth` sets `req.currentUser`.

## 6. Controller

`src/app/controllers/post/create-post-controller.ts`:

```ts
import { Request, Response } from "express";
import BaseController from "@/core/base/base-controller.js";

class CreatePostController extends BaseController {
  protected async module(
    req: Request,
    res: Response,
  ): Promise<void | Response> {
    const user = req.currentUser;

    if (!user) {
      return this.responseHandler(
        res,
        this.HTTP_STATUS.UNAUTHORIZED,
        this.HTTP_MSG.UNAUTHORIZED,
      );
    }

    const result = await this.Service.PostServices.CreatePost.call({
      ...req.body,
      userId: user.userId,
    });

    if (!result) {
      return this.responseHandler(
        res,
        this.HTTP_STATUS.BAD_REQUEST,
        this.HTTP_MSG.BAD_REQUEST,
      );
    }

    return this.responseHandler(
      res,
      this.HTTP_STATUS.CREATED,
      this.HTTP_MSG.CREATED,
      result,
    );
  }
}

export default CreatePostController;
```

`src/app/controllers/post/index.ts`:

```ts
import CreatePostController from "@/app/controllers/post/create-post-controller.js";

const CreatePost = new CreatePostController();

const PostControllers = { CreatePost };

export default PostControllers;
```

Register in `src/app/controllers/index.ts`: add `PostControllers`.

## 7. Route

`src/app/routes/post/create-post-route.ts`:

```ts
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

`src/app/routes/post/index.ts`:

```ts
import CreatePostRoute from "@/app/routes/post/create-post-route.js";

const PATH = "/posts/";

const CreatePost = new CreatePostRoute(PATH);

const PostRoutes = { CreatePost };

export default PostRoutes;
```

Register in `src/app/routes/index.ts`:

```ts
const routes: IRoute[] = [...Object.values({ ...UserRoutes, ...PostRoutes })];
```

Done: `POST /api/posts/create` is live.

# Testing

Tests hit the real endpoints through Supertest, against a real Postgres. No mocks, no spying on internals. If a test passes, the endpoint works.

## Run

Start a throwaway database once (port 5433 so it doesn't clash with your dev DB):

```bash
docker run -d --name test-db -p 5433:5432 \
  -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=test postgres:17
```

Then:

```bash
pnpm test
```

To use another database, set `DATABASE_URL` in your shell. The default in `tests/setup.ts` is only used when it's unset.

## How it works

```
tests/
  setup.ts          Sets test env vars before any src code loads
  global-setup.ts   Runs `prisma migrate deploy` once before all tests
  helpers/app.ts    api(), browser(), ROUTES, newUser()
  auth/             One file per endpoint
```

- `api()` is a plain request with no cookies. Use it for "not logged in" cases.
- `browser()` is an agent that keeps cookies between requests, like a real browser. Use it for anything that needs a session.
- `newUser()` returns a user with a random email. Every test signs up its own user, so tests don't depend on each other and there's nothing to clean up.
- `ROUTES` holds every URL. If you change a path, change it there.

Your `.env` is never read during tests. `setup.ts` sets the variables first and `dotenv` doesn't override existing ones.

## Writing a test

Sign up through the endpoint, then use the same agent:

```ts
const agent = browser();
await agent.post(ROUTES.signup).send(newUser());

const res = await agent.get(ROUTES.profile);
expect(res.status).toBe(200);
```

Rules of thumb:

- Test through HTTP only. Don't import services or controllers.
- Assert status codes, and the parts of the body you care about.
- Never reuse an email between tests. Use `newUser()`.
- One file per endpoint, grouped in a folder per module (`tests/auth/`, `tests/posts/`).

## Notes

- `tests/` is excluded from the production build (`tsconfig.build.json`) but still type-checked by `pnpm typecheck`.
- Add `tests`, `coverage` and `vitest.config.ts` to `.dockerignore` so they stay out of the image.
- CI starts a Postgres service and runs `pnpm test:coverage`. See `.github/workflows/ci.yml`.