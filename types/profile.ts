//types/profile.ts
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  password?: string;
  createdAt?: string;
  lastLogin?: string;
  isActive?: boolean;
  phone?: string;
  country?: string;
  state?: string;
  city?: string;
  postalCode?: string;
  bio?: string;
  profileImage?: string;
}
