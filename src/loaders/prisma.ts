import { PrismaClient } from "@prisma/client";

export default () => {
  return new PrismaClient();
};
