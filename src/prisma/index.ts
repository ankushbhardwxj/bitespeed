import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.contact.deleteMany();
  // add a contact
  await prisma.contact.create({
    data: {
      phoneNumber: "9435608936",
      email: "ankush.bhardwaj0@gmail.com",
    },
  });
  await prisma.contact.create({
    data: {
      phoneNumber: "9101121200",
      email: "ankush.bhardwaj@custiv.com",
    },
  });
  const allContacts = await prisma.contact.findMany();
  console.log(allContacts);
  // const deleteContacts = await prisma.contact.deleteMany();
  // console.log(deleteContacts);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
