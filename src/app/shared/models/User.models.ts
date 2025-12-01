export interface User {
  id?: number;
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  currency?: string;
  isActive?: boolean;
  access_token?: string;
}
