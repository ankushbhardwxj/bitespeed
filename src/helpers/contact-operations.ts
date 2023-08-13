import Container from "typedi";
import { IContact, PrismaClientType } from "../services/identify.service";

/**
 *
 * @param email
 * @param phoneNumber
 * @param linkedId
 * @param linkPrecedence
 * @returns Promise<IContact>
 * Create an User in the Contact DB
 */
export async function createUser(
  email: string,
  phoneNumber: string,
  linkedId: number,
  linkPrecedence: string
): Promise<IContact> {
  const prisma: PrismaClientType = Container.get("prisma");
  return await prisma.contact.create({
    data: {
      email: email,
      phoneNumber: phoneNumber,
      linkedId: linkedId,
      linkPrecedence: linkPrecedence,
    },
  });
}

/**
 *
 * @param filter
 * @param update
 * @returns
 * Update the linkedId, linkPrecedence of an user in Contact DB
 */
export async function updateUser(
  filter: { id: number },
  update: { linkedId: number; linkPrecedence: string; updatedAt: string }
) {
  const prisma: PrismaClientType = Container.get("prisma");
  return await prisma.contact.update({ where: filter, data: update });
}

/**
 *
 * @param commonContacts
 * @returns
 * Get array containing primary contacts and all secondary contacts linked to it
 */
export async function getPrimarySecondayContacts(commonContacts: IContact[]) {
  const prisma: PrismaClientType = Container.get("prisma");
  let primaryContacts: IContact[] = [];
  let secondaryContacts: IContact[] = [];
  await Promise.all(
    commonContacts.map(async (contact) => {
      if (contact.linkPrecedence === "primary") {
        primaryContacts.push(contact);
        const childContacts: IContact[] = await prisma.contact.findMany({
          where: { linkedId: contact?.id },
        });
        childContacts.forEach((contact) => secondaryContacts.push(contact));
      }
      if (contact.linkPrecedence === "secondary") {
        const parentContact: IContact | null = await prisma.contact.findFirst({
          where: {
            id: contact.linkedId as number,
          },
        });
        const otherContacts: IContact[] = await prisma.contact.findMany({
          where: {
            linkedId: parentContact?.id,
          },
        });
        if (parentContact) primaryContacts.push(parentContact);
        secondaryContacts.push(contact);
        otherContacts.forEach((contact) => secondaryContacts.push(contact));
      }
    })
  );
  primaryContacts = primaryContacts.filter(
    (val, idx, self) => idx === self.findIndex((t) => t.id === val.id)
  );
  secondaryContacts = secondaryContacts.filter(
    (val, idx, self) => idx === self.findIndex((t) => t.id === val.id)
  );
  return {
    primaryContacts,
    secondaryContacts,
  };
}
