import { Elysia, NotFoundError } from "elysia";
import { auth } from "../../auth";
import { prisma } from "../../server";
import { UnauthorizedError } from "../../errors/unauthorized-error";

export const getUserExercises = new Elysia()
  .use(auth)
  .get("/user/exercises", async ({ getCurrentUser }) => {
    const { userId } = await getCurrentUser();

    if (!userId) {
      throw new UnauthorizedError();
    }

    const exercises = await prisma.exercise.findMany({
      where: {
        userId,
      },
      include: {
        exerciseMuscleGroups: {
          include: {
            muscleGroup: true,
          },
        },
      },
    });

    if (!exercises) {
      throw new NotFoundError();
    }

    return exercises;
  });
