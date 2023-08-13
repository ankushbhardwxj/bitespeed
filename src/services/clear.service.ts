import Container from "typedi";
import { PrismaClientType } from "./identify.service";

export default async function () {
  try {
    const prisma: PrismaClientType = Container.get("prisma");
    await prisma.contact.deleteMany();
  } catch (error) {
    console.error("Failed to identify user", error);
    return;
  }
}
