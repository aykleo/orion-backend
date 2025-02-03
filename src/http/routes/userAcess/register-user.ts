import { Elysia, t } from "elysia";
import { createId } from "@paralleldrive/cuid2";
import { prisma } from "../../server";

export const registerUser = new Elysia().post(
  "/user/register",
  async ({ body, set }) => {
    const { email, username } = body;

    const existingUser = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (existingUser) {
      set.status = 400;
      return { message: "User already exists" };
    }

    await prisma.user.create({
      data: { id: createId(), email, username },
    });

    set.status = 204;
  },
  {
    body: t.Object({
      email: t.String({ format: "email" }),
      username: t.String(),
    }),
  }
);
