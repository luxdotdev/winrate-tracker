import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { magicLink } from "better-auth/plugins";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [
    magicLink({
      sendMagicLink: ({ email, token, url }, ctx) => {
        // eslint-disable-next-line no-console
        console.log(email, token, url, ctx);
      },
    }),
  ],
});
