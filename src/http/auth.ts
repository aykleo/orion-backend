import jwt from "@elysiajs/jwt";
import Elysia, { t, type Static } from "elysia";
import { UnauthorizedError } from "./errors/unauthorized-error";

export const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error("JWT_SECRET is not set");
}

const jwtPayload = t.Object({
  sub: t.String(),
});

export const auth = new Elysia()
  .error({
    UNAUTHORIZED: UnauthorizedError,
  })
  .onError(({ error, code, set }) => {
    switch (code) {
      case "UNAUTHORIZED": {
        set.status = 401;
        return { code, message: error.message };
      }
    }
  })
  .use(
    jwt({
      secret: jwtSecret,
      schema: t.Object({
        sub: t.String(),
      }),
    })
  )

  .derive({ as: "scoped" }, ({ jwt, cookie: { auth } }) => {
    return {
      signUser: async (payload: Static<typeof jwtPayload>) => {
        const token = await jwt.sign(payload);

        auth.value = token;
        auth.httpOnly = true;
        auth.maxAge = 60 * 60 * 24 * 7; // 7 days
        auth.path = "/";
      },

      signOut: async () => {
        auth.remove();
      },

      getCurrentUser: async () => {
        const authCookie = auth.value;

        const payload = await jwt.verify(authCookie);

        if (!payload) {
          throw new UnauthorizedError();
        }

        return {
          userId: payload.sub,
        };
      },
    };
  });
