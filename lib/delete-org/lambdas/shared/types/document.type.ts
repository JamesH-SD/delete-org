import { User } from "./user.type";

export type Document = {
  id: string;
  name: string;
  url: string;
  user: User;
};

export type DocumentWithoutUser = Omit<Document, "user">;

export type DocumentGroup = {
  user: User;
  documents: DocumentWithoutUser[];
};

export interface FlattenedDocumentUser {
  user: User;
  document: DocumentWithoutUser;
}

export type GroupedDocuments = {
  [key: string]: DocumentGroup;
};
