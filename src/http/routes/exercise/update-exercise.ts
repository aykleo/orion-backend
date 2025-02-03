import { Elysia, t } from "elysia";
import { createId } from "@paralleldrive/cuid2";
import { prisma } from "../../server";
import { auth } from "../../auth";
import { UnauthorizedError } from "../../errors/unauthorized-error";

export const updateExercise = new Elysia().use(auth).post(
  "/exercise/update",
  async ({ getCurrentUser, set, body }) => {
    const { userId } = await getCurrentUser();

    const {
      exerciseId,
      name,
      description,
      primaryMuscleGroupId,
      muscleGroupIds,
    } = body;

    if (!userId) {
      throw new UnauthorizedError();
    }

    if (!muscleGroupIds.includes(primaryMuscleGroupId)) {
      set.status = 400;
      return {
        message:
          "Primary muscle group must be one of the selected muscle groups",
        status: 400,
      };
    }

    const existingExercise = await prisma.exercise.findFirst({
      where: { id: exerciseId },
    });

    if (!existingExercise) {
      throw new Error("Exercise not found");
    }

    await prisma.exercise.update({
      where: {
        id: exerciseId,
      },
      data: {
        ...(name !== existingExercise.name && { name }),
        ...(description !== existingExercise.description && { description }),
        exerciseMuscleGroups: {
          deleteMany: {},
          create: muscleGroupIds.map((muscleGroupId) => ({
            muscleGroup: {
              connect: { id: muscleGroupId },
            },
            isPrimary: muscleGroupId === primaryMuscleGroupId,
          })),
        },
        updatedAt: new Date(),
      },
    });

    set.status = 200;
  },
  {
    body: t.Object({
      name: t.Optional(t.String()),
      description: t.Optional(t.String()),
      primaryMuscleGroupId: t.String(),
      muscleGroupIds: t.Array(t.String()),
      exerciseId: t.String(),
    }),
  }
);
