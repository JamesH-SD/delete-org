/**
 * OrganizationId type
 * @property {string} OrganizationId - Organization id
 * @example
 * const organizationId: OrganizationId = "1234";
 */
export type OrganizationId = string;

/**
 * Organization type
 * @type {Object} Organization
 * @property id {OrganizationId} - Organization id
 * @property name {string} - Organization name
 * @property left {number} - Organization left boundary
 * @property right {number} - Organization right boundary
 * @property contractId {number} - Organization contract id
 * @example
 * const organization: Organization = {
 *  id: "1234",
 *  name: "org1",
 *  left: 1,
 *  right: 2,
 *  contractId: 123,
 * };
 */
export type Organization = {
  id: OrganizationId;
  name: string;
  left: number;
  right: number;
  contractId?: number;
};
