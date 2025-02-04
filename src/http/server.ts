import { Elysia } from "elysia";
import { PrismaClient } from "@prisma/client";
import { logOut } from "./routes/userAcess/log-out";
import { sendAuthLink } from "./routes/userAcess/send-auth-link";
import { authenticateFromLink } from "./routes/userAcess/authenticate-from-link";
import { registerUser } from "./routes/userAcess/register-user";
import { deleteUser } from "./routes/userAcess/delete-user";
import { getProfile } from "./routes/userAcess/get-profile";
import { createExercise } from "./routes/exercise/create-exercise";
import { updateExercise } from "./routes/exercise/update-exercise";
import { getUserExercises } from "./routes/exercise/get-user-exercises";
import { deleteExercise } from "./routes/exercise/delete-exercise";

export const prisma = new PrismaClient();

export const jwtSecret = process.env.JWT_SECRET;

export const app = new Elysia()
  .use(logOut)
  .use(sendAuthLink)
  .use(authenticateFromLink)
  .use(registerUser)
  .use(deleteUser)
  .use(getProfile)
  .use(createExercise)
  .use(updateExercise)
  .use(getUserExercises)
  .use(deleteExercise)
  .onError(({ code, error, set }) => {
    switch (code) {
      case "VALIDATION": {
        set.status = error.status;
        return error.toResponse();
      }
      case "NOT_FOUND": {
        set.status = error.status;
        return new Response(null, { status: 404 });
      }

      default: {
        console.log(error);

        return new Response(null, { status: 500 });
      }
    }
  });

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
