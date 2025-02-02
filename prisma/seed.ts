import { MuscleGroupName } from "@prisma/client";
import { createId } from "@paralleldrive/cuid2";
import { prisma } from "../src/http/server";

async function main() {
  await prisma.$transaction([
    prisma.set.deleteMany(), // Depends on WorkoutExercise
    prisma.workoutExercise.deleteMany(), // Depends on Workout and Exercise
    prisma.exerciseMuscleGroup.deleteMany(), // Depends on Exercise and MuscleGroup
    prisma.workout.deleteMany(), // Depends on User
    prisma.exercise.deleteMany(), // Depends on User
    prisma.muscleGroup.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  console.log("Deleted existing data");

  const admin = await prisma.user.create({
    data: {
      id: createId(),
      username: "admin",
      email: "admin@fitnessapp.com",
      role: "ADMIN",
    },
  });

  console.log("Created admin");
  const user = await prisma.user.create({
    data: {
      id: createId(),
      username: "monkey",
      email: "monkey@google.com",
      role: "USER",
    },
  });

  console.log("Created user");

  const muscleGroups = await Promise.all(
    Object.values(MuscleGroupName).map((name) =>
      prisma.muscleGroup.create({
        data: {
          id: createId(),
          name,
        },
      })
    )
  );

  console.log("Created muscle groups");

  const exercises = await Promise.all([
    createExercise("Bench Press", "Barbell chest exercise", admin.id, [
      MuscleGroupName.PECTORALIS_MAJOR,
      MuscleGroupName.TRICEPS_BRACHII,
      MuscleGroupName.DELTOID,
    ]),
    createExercise("Pull-ups", "Bodyweight back exercise", admin.id, [
      MuscleGroupName.LATISSIMUS_DORSI,
      MuscleGroupName.BICEPS_BRACHII,
      MuscleGroupName.TRAPEZIUS,
    ]),
    createExercise("Shoulder Press", "Overhead dumbbell press", admin.id, [
      MuscleGroupName.DELTOID,
      MuscleGroupName.TRICEPS_BRACHII,
    ]),
    createExercise("Push-ups", "Bodyweight chest exercise", admin.id, [
      MuscleGroupName.PECTORALIS_MAJOR,
      MuscleGroupName.TRICEPS_BRACHII,
    ]),
    createExercise("Bicep Curls", "Dumbbell arm exercise", admin.id, [
      MuscleGroupName.BICEPS_BRACHII,
    ]),
    createExercise("Squats", "Barbell leg exercise", admin.id, [
      MuscleGroupName.QUADRICEPS,
      MuscleGroupName.GLUTEUS_MAXIMUS,
      MuscleGroupName.HAMSTRINGS,
    ]),
    createExercise("Deadlifts", "Full-body lifting exercise", admin.id, [
      MuscleGroupName.ERECTOR_SPINAE,
      MuscleGroupName.GLUTEUS_MAXIMUS,
      MuscleGroupName.HAMSTRINGS,
    ]),
    createExercise("Lunges", "Unilateral leg exercise", admin.id, [
      MuscleGroupName.QUADRICEPS,
      MuscleGroupName.GLUTEUS_MAXIMUS,
    ]),
    createExercise("Plank", "Core stability exercise", admin.id, [
      MuscleGroupName.RECTUS_ABDOMINIS,
      MuscleGroupName.OBLIQUES,
    ]),
    createExercise("Russian Twists", "Rotational core exercise", admin.id, [
      MuscleGroupName.OBLIQUES,
      MuscleGroupName.RECTUS_ABDOMINIS,
    ]),
  ]);

  console.log("Created exercises");

  const workout = await prisma.workout.create({
    data: {
      id: createId(),
      name: "Full Body Workout",
      date: new Date(),
      userId: admin.id,
      exercises: {
        create: [
          {
            id: createId(),
            exerciseId: exercises[0].id,
            order: 1,
            sets: {
              create: [
                { id: createId(), weight: 60, reps: 8, rpe: 7 },
                { id: createId(), weight: 60, reps: 8, rpe: 7.5 },
                { id: createId(), weight: 60, reps: 7, rpe: 8 },
              ],
            },
          },
          {
            id: createId(),
            exerciseId: exercises[5].id,
            order: 2,
            sets: {
              create: [
                { id: createId(), weight: 80, reps: 6, rpe: 8 },
                { id: createId(), weight: 80, reps: 6, rpe: 8.5 },
                { id: createId(), weight: 80, reps: 5, rpe: 9 },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("Created workout");
  console.log("Seed completed successfully!");
}

async function createExercise(
  name: string,
  description: string,
  userId: string,
  muscleGroupNames: MuscleGroupName[]
) {
  const exercise = await prisma.exercise.create({
    data: {
      id: createId(),
      name,
      description,
      userId,
    },
  });

  // Connect muscle groups
  await Promise.all(
    muscleGroupNames.map(async (name) => {
      const muscleGroup = await prisma.muscleGroup.findFirst({
        where: { name },
      });

      if (muscleGroup) {
        await prisma.exerciseMuscleGroup.create({
          data: {
            exerciseId: exercise.id,
            muscleGroupId: muscleGroup.id,
            isPrimary: muscleGroupNames.indexOf(name) === 0,
          },
        });
      }
    })
  );

  return exercise;
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
