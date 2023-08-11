import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // add a contact
  const addUser = await prisma.contact.create({
    data: {
      phoneNumber: "1234567890",
      email: "ankush.bhardwaj@custiv.com",
    },
  });
  console.log(addUser);
  const allContacts = await prisma.contact.findMany();
  console.log(allContacts);
  const deleteContacts = await prisma.contact.deleteMany();
  console.log(deleteContacts);
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
