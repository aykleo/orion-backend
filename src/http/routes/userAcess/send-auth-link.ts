import nodemailer from "nodemailer";
import { Elysia, t } from "elysia";
import { prisma } from "../../server";
import { createId } from "@paralleldrive/cuid2";
import { mail } from "../../../lib/mail";

const baseURL = process.env.API_BASE_URL;
const authRedirectUrl = process.env.AUTH_REDIRECT_URL;

export const sendAuthLink = new Elysia().post(
  "/authenticate",
  async ({ body }) => {
    const { email } = body;

    const userFromEmail = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    if (!userFromEmail) {
      throw new Error("User not found");
    }

    if (userFromEmail.deletedAt) {
      throw new Error("This user account was deleted");
    }

    const existingAuthLink = await prisma.authLinks.findFirst({
      where: {
        userId: userFromEmail.id,
      },
    });

    if (existingAuthLink) {
      await prisma.authLinks.delete({
        where: {
          id: existingAuthLink.id,
        },
      });
    }

    const authLinkCode = createId();

    await prisma.authLinks.create({
      data: {
        id: createId(),
        userId: userFromEmail.id,
        code: authLinkCode,
      },
    });

    const authLink = new URL("/auth-links/authenticate", baseURL);

    authLink.searchParams.set("code", authLinkCode);
    authLink.searchParams.set("redirect", authRedirectUrl!);

    const info = await mail.sendMail({
      from: {
        name: "Orion",
        address: "hi@orion.com",
      },
      to: email,
      subject: "Authenticate your account",
      text: `Use the following link to authenticate your account: ${authLink.toString()}`,
    });

    console.log(nodemailer.getTestMessageUrl(info));
  },
  {
    body: t.Object({
      email: t.String({ format: "email" }),
    }),
  }
);
