import { Elysia, t } from "elysia";
import { prisma } from "../../server";
import { auth } from "../../auth";
import { UnauthorizedError } from "../../errors/unauthorized-error";

export const deleteExercise = new Elysia().use(auth).post(
  "/exercise/delete",
  async ({ getCurrentUser, set, body }) => {
    const { userId } = await getCurrentUser();
    const { exerciseId } = body;

    if (!userId) {
      throw new UnauthorizedError();
    }

    if (!exerciseId) {
      throw new Error("Exercise ID is required");
    }

    await prisma.$transaction(async (prisma) => {
      await prisma.exerciseMuscleGroup.deleteMany({
        where: { exerciseId },
      });

      await prisma.exercise.delete({
        where: { userId, id: exerciseId },
      });
    });

    set.status = 204;
  },
  {
    body: t.Object({
      exerciseId: t.String(),
    }),
  }
);
