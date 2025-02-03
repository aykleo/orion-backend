import { Elysia, t } from "elysia";
import { prisma } from "../../server";
import dayjs from "dayjs";
import { auth } from "../../auth";

export const authenticateFromLink = new Elysia().use(auth).get(
  "/auth-links/authenticate",
  async ({ query, signUser, redirect }) => {
    const { code, redirect: redirectUrl } = query;

    const authLink = await prisma.authLinks.findFirst({
      where: {
        code: code as string,
      },
    });
    if (!authLink) {
      throw new Error("Auth link not found");
    }

    const daySinceAuthLinkCreation = dayjs().diff(authLink.createdAt, "days");

    if (daySinceAuthLinkCreation > 7) {
      throw new Error("Auth link expired");
    }

    await signUser({
      sub: authLink.userId,
    });

    await prisma.authLinks.delete({
      where: {
        code: authLink.code,
      },
    });

    return redirect(redirectUrl || "/default-url", 302);
  },
  {
    query: t.Object({
      code: t.String(),
      redirect: t.String(),
    }),
  }
);
