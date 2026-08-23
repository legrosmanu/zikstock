export interface User {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NetworkUser {
  id: string;
  email: string;
  name?: string;
  picture?: string;
}
