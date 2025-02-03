import { Elysia, t } from "elysia";
import { prisma } from "../../server";
import { auth } from "../../auth";

export const deleteUser = new Elysia()
  .use(auth)
  .post("/user/delete", async ({ getCurrentUser, set }) => {
    const { userId } = await getCurrentUser();

    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });

    set.status = 204;
  });
