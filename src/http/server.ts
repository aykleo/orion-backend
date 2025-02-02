import { Elysia } from "elysia";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export const app = new Elysia();

app.get("/", () => {
  return "Hello World";
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
