import Container from "typedi";
import { IContact, PrismaClientType } from "../services/identify.service";
import {
  getPrimarySecondayContacts,
  createUser,
  updateUser,
} from "./contact-operations";
import ResponseBuilder from "./response-builder";

/**
 *
 * @param commonPhoneNumbers
 * @param commonEmails
 * @param phoneNumber
 * @param email
 * @returns
 * If contact is not present, adds the contact to DB
 * If contact is not primary, adds it as secondary by linking to primary
 * If contact has matches to two primary contacts, converts on of the primary
 * contacts to secondary.
 */
export async function validateContacts(
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

  const commonContacts = Array.from(
    new Set([...commonPhoneNumbers, ...commonEmails])
  );

  const {
    primaryContacts,
    secondaryContacts,
  }: {
    primaryContacts: IContact[];
    secondaryContacts: IContact[];
  } = await getPrimarySecondayContacts(commonContacts);
  let isContactPresent: boolean =
    [...primaryContacts, ...secondaryContacts].filter(
      (contact) =>
        contact.phoneNumber === phoneNumber?.toString() &&
        contact.email === email
    ).length !== 0;

  if (primaryContacts.length === 1) {
    if (!isContactPresent) {
      const secondaryUser: IContact = await createUser(
        email,
        phoneNumber?.toString(),
        primaryContacts[0]?.id,
        "secondary"
      );
      return ResponseBuilder(primaryContacts[0], [
        secondaryUser,
        ...secondaryContacts,
      ]);
    } else return ResponseBuilder(primaryContacts[0], [...secondaryContacts]);
  } else if (primaryContacts.length > 1) {
    const timestamp1 = new Date(primaryContacts[0].createdAt as Date);
    const timestamp2 = new Date(primaryContacts[1].createdAt as Date);
    if (timestamp1 < timestamp2) {
      const updatedUser: IContact = await updateUser(
        { id: primaryContacts[1]?.id },
        {
          linkedId: primaryContacts[0]?.id,
          linkPrecedence: "secondary",
          updatedAt: new Date(Date.now()).toISOString(),
        }
      );

      return ResponseBuilder(primaryContacts[0], [
        updatedUser,
        ...secondaryContacts,
      ]);
    } else {
      const updatedUser: IContact = await updateUser(
        { id: primaryContacts[0]?.id },
        {
          linkedId: primaryContacts[1]?.id,
          linkPrecedence: "secondary",
          updatedAt: new Date(Date.now()).toISOString(),
        }
      );
      return ResponseBuilder(primaryContacts[1], [
        updatedUser,
        ...secondaryContacts,
      ]);
    }
  }
}
