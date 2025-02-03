import { Elysia } from "elysia";
import { auth } from "../../auth";

export const logOut = new Elysia()
  .use(auth)
  .post("/log-out", async ({ signOut }) => {
    signOut();
  });
