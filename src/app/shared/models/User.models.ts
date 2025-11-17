export interface User {
  id?: number;
  name: string;
  email: string;
  password?: string;
  access_token?: string;
  avatar?: string;
  dateCreated?: string | Date;
  lastUpdated?: string | Date;
}
