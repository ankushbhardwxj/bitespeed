import { PrismaClient, Prisma } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import Container from "typedi";

interface IIdentificationServiceParams {
  email: string;
  phoneNumber: number;
}

interface IContact {
  id: number;
  phoneNumber?: string | null;
  email?: string | null;
  linkedId?: number | null;
  linkPrecedence?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  deletedAt?: Date | null;
}

type PrismaClientType = PrismaClient<
  Prisma.PrismaClientOptions,
  never,
  DefaultArgs
>;

/**
 * If phone number exists, then connect it primary
 * If email exists, then connect it with primary
 * Email is common to one primary, and phone number is common to another primary
 * Convert primary to secondary - how ?
 * If both email and phone number exists, then oldest contact remains primary and newest
 * contact becomes secondary and gets linked to primary
 */
export default async function ({
  email,
  phoneNumber,
}: IIdentificationServiceParams) {
  try {
    const prisma: PrismaClientType = Container.get("prisma");
    // check if phone number exists
    if (phoneNumber === null) phoneNumber = -1;
    const commonPhoneNumbers: IContact[] = await prisma.contact.findMany({
      where: { phoneNumber: phoneNumber.toString() },
    });
    const commonEmails: IContact[] = await prisma.contact.findMany({
      where: { email: email },
    });
    const responseObject = await validateContacts(
      commonPhoneNumbers,
      commonEmails,
      phoneNumber,
      email
    );

    return responseObject;
  } catch (error) {
    console.error("Failed to identify user", error);
    return;
  }
}

async function validateContacts(
  commonPhoneNumbers: IContact[],
  commonEmails: IContact[],
  phoneNumber: number,
  email: string
) {
  const prisma: PrismaClientType = Container.get("prisma");
  if (commonPhoneNumbers.length === 0 && commonEmails.length === 0) {
    const addUser: IContact = await prisma.contact.create({
      data: {
        phoneNumber: phoneNumber.toString(),
        email: email,
        linkPrecedence: "primary",
      },
    });
    return ResponseBuilder(addUser);
  }

  // multiple matches found in commonPhoneNumbers and commonEmails
  const commonContacts = Array.from(
    new Set([...commonPhoneNumbers, ...commonEmails])
  );
  const primaryContact = commonContacts.filter(
    (contact) => contact.linkPrecedence === "primary"
  );
  let secondaryContacts = await prisma.contact.findMany({
    where: { linkedId: primaryContact[0]?.id },
  });
  secondaryContacts = Array.from(new Set([...secondaryContacts]));
  let isSecondaryContactPresent: boolean =
    secondaryContacts.filter(
      (contact) =>
        contact.phoneNumber === phoneNumber.toString() &&
        contact.email === email
    ).length !== 0;
  // console.log(primaryContact.length);
  // console.log(primaryContact);
  // console.log(secondaryContacts);
  // console.log(isSecondaryContactPresent);
  if (primaryContact.length === 1 && !isSecondaryContactPresent) {
    const secondaryUser: IContact = await prisma.contact.create({
      data: {
        email: email,
        phoneNumber: phoneNumber.toString(),
        linkedId: primaryContact[0]?.id,
        linkPrecedence: "secondary",
      },
    });
    return ResponseBuilder(primaryContact[0], [
      secondaryUser,
      ...secondaryContacts,
    ]);
  } else if (primaryContact.length === 1 && isSecondaryContactPresent) {
    return ResponseBuilder(primaryContact[0], [...secondaryContacts]);
  } else if (primaryContact.length > 1) {
    const timestamp1 = new Date(primaryContact[0].createdAt as Date);
    const timestamp2 = new Date(primaryContact[1].createdAt as Date);
    // oldest one is primary contact
    if (timestamp1 < timestamp2) {
      // make timestamp2 secondary contact
      const updatedUser = await prisma.contact.update({
        where: { id: primaryContact[1]?.id },
        data: {
          linkedId: primaryContact[0]?.id,
          linkPrecedence: "secondary",
          updatedAt: new Date(Date.now()).toISOString(),
        },
      });
      return ResponseBuilder(primaryContact[0], [updatedUser]);
    } else {
      // make timestamp1 primary contact
      const updatedUser = await prisma.contact.update({
        where: { id: primaryContact[0]?.id },
        data: {
          linkedId: primaryContact[1]?.id,
          linkPrecedence: "secondary",
          updatedAt: new Date(Date.now()).toISOString(),
        },
      });
      return ResponseBuilder(primaryContact[1], [updatedUser]);
    }
  }
}

function ResponseBuilder(
  primaryContactUser: IContact,
  secondaryContactUsers?: Array<IContact>
) {
  secondaryContactUsers = secondaryContactUsers || [];
  const responseObject = {
    contact: {
      primaryContactId: primaryContactUser?.id,
      emails: Array.from(
        new Set([
          primaryContactUser.email,
          ...secondaryContactUsers.map((contact) => contact.email),
        ])
      ),
      phoneNumbers: Array.from(
        new Set([
          primaryContactUser.phoneNumber,
          ...secondaryContactUsers.map((contact) => contact.phoneNumber),
        ])
      ),
      secondaryContactIds: Array.from(
        new Set([...secondaryContactUsers.map((contact) => contact?.id)])
      ).filter((id) => id !== primaryContactUser?.id),
    },
  };
  return responseObject;
}
