import { IContact } from "../services/identify.service";
/**
 *
 * @param primaryContactUser
 * @param secondaryContactUsers
 * @returns
 * Returns a predetermined object containing data of primary & secondary contacts
 */
export default function ResponseBuilder(
  primaryContactUser?: IContact,
  secondaryContactUsers?: Array<IContact>
) {
  secondaryContactUsers = secondaryContactUsers || [];
  const responseObject = {
    contact: {
      primaryContactId: primaryContactUser?.id || 0,
      emails: Array.from(
        new Set([
          primaryContactUser?.email,
          ...secondaryContactUsers.map((contact) => contact.email),
        ])
      ).filter((item) => item !== null && item !== undefined),
      phoneNumbers: Array.from(
        new Set([
          primaryContactUser?.phoneNumber,
          ...secondaryContactUsers.map((contact) => contact.phoneNumber),
        ])
      ).filter((item) => item !== null && item !== undefined),
      secondaryContactIds: Array.from(
        new Set([...secondaryContactUsers.map((contact) => contact?.id)])
      ).filter((id) => id !== primaryContactUser?.id),
    },
  };
  return responseObject;
}
