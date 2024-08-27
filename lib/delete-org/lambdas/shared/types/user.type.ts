export type UserType = "professional" | "participant";
/**
 * User type
 * @type {Object} User
 * @property id {string} - Pokket user id
 * @property username {string} - User name
 * @property firstName {string} - User first
 * @property lastName {string} - User last name
 * @property onboardedBy {string} - User onboarded by
 * @example
 * const user: User = {
 *  pokketUserId: "123",
 *  uesrName: "user1",
 *  firstName: "John",
 *  lastName: "Doe",
 *  onboardedBy: "456",
 * };
 */
export type User = {
  id: string;
  username: string;
  onboardedBy?: string;
  agencyId?: string;
  type: UserType;
};
