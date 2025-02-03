import Elysia from "elysia";
import { auth } from "../../auth";
import { UnauthorizedError } from "../../errors/unauthorized-error";
import { prisma } from "../../server";

export const getProfile = new Elysia()
  .use(auth)
  .get("user/me", async ({ getCurrentUser }) => {
    const { userId } = await getCurrentUser();

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new UnauthorizedError();
    }

    return user;
  });
