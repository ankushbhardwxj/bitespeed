import { PrismaClient, Prisma } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import Container from "typedi";
import ResponseBuilder from "../helpers/response-builder";
import {
  createUser,
  getPrimarySecondayContacts,
  updateUser,
} from "../helpers/contact-operations";
import { validateContacts } from "../helpers/contact-validator";

interface IIdentificationServiceParams {
  email: string | null;
  phoneNumber: number | null;
}

export interface IContact {
  id: number;
  phoneNumber?: string | null;
  email?: string | null;
  linkedId?: number | null;
  linkPrecedence?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  deletedAt?: Date | null;
}

export type PrismaClientType = PrismaClient<
  Prisma.PrismaClientOptions,
  never,
  DefaultArgs
>;

/**
 *
 */
export default async function ({
  email,
  phoneNumber,
}: IIdentificationServiceParams) {
  try {
    const prisma: PrismaClientType = Container.get("prisma");
    if (email === null && phoneNumber === null) return ResponseBuilder();

    let commonPhoneNumbers: IContact[] = [];
    let commonEmails: IContact[] = [];
    if (phoneNumber !== null) {
      commonPhoneNumbers = await prisma.contact.findMany({
        where: { phoneNumber: phoneNumber.toString() },
      });
    }
    if (email !== null) {
      commonEmails = await prisma.contact.findMany({
        where: { email: email },
      });
    }

    if (email === null || phoneNumber === null) {
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
      return ResponseBuilder(primaryContacts[0], [...secondaryContacts]);
    }

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
