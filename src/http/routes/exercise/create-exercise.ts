import { Elysia, t } from "elysia";
import { createId } from "@paralleldrive/cuid2";
import { prisma } from "../../server";
import { auth } from "../../auth";
import { UnauthorizedError } from "../../errors/unauthorized-error";

export const createExercise = new Elysia().use(auth).post(
  "/exercise/create",
  async ({ getCurrentUser, set, body }) => {
    const { userId } = await getCurrentUser();

    const { name, description, primaryMuscleGroupId, muscleGroupIds } = body;

    if (!userId) {
      throw new UnauthorizedError();
    }

    if (!name || !description || !muscleGroupIds || !primaryMuscleGroupId) {
      set.status = 400;
      return { message: "Incorret values", status: 400 };
    }

    if (!muscleGroupIds.includes(primaryMuscleGroupId)) {
      set.status = 400;
      return {
        message:
          "Primary muscle group must be one of the selected muscle groups",
        status: 400,
      };
    }

    const exercise = await prisma.exercise.create({
      data: {
        id: createId(),
        name,
        description: description || undefined,
        userId,
        exerciseMuscleGroups: {
          create: muscleGroupIds.map((muscleGroupId) => ({
            muscleGroup: {
              connect: { id: muscleGroupId },
            },
            isPrimary: muscleGroupId === primaryMuscleGroupId,
          })),
        },
      },
    });

    set.status = 201;
  },
  {
    body: t.Object({
      name: t.String(),
      description: t.Optional(t.String()),
      primaryMuscleGroupId: t.String(),
      muscleGroupIds: t.Array(t.String()),
    }),
  }
);
