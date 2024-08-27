import { STAGE } from "../enums";

export type EnvironmentVariable = { [key: string]: string } & {
  STAGE?: STAGE;
};
