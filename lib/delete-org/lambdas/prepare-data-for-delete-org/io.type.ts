import { Organization, OrganizationId, User } from "../shared/types";

/**
 * InputEvent - The input event schema
 * @property leadAgencyId {string} - The id of the lead agency
 * @example
 * {
 *  leadAgencyId: "12345678-1234-1234-1234-123456789012"
 * }
 */
export type InputEvent = {
  leadAgencyId: OrganizationId;
};

/**
 * OutputEvent - The output event schema
 * @property leadAgency {Organization} - The lead agency
 * @property users {Users[]} - The users
 * @example
 * {
 *  leadAgency: {
 *    id: "12345678-1234-1234-1234-123456789012",
 *    name: "Lead Agency",
 *  },
 *  users: [{
 *    id: "12345678-1234-1234-1234-123456789012",
 *    firstName: "John",
 *    lastName: "Doe",
 *  }]
 * }
 */
export type OutputEvent = {
  leadAgency: Organization;
  subAgencies?: Organization[];
  totals: {
    users: {
      participants: number;
      professionals: number;
    };
    participantData: {
      documents: number;
    };
    services: number;
    subAgencies: number;
    facilities: number;
  };
  allOrgIds: Array<{ orgId: string }>;
};
