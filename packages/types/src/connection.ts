import type { User, NetworkUser } from './user';



export const ConnectionStatus = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
} as const;

export type ConnectionStatus = (typeof ConnectionStatus)[keyof typeof ConnectionStatus];

export interface Connection {
  id: string;
  requesterId: string;
  receiverId: string;
  status: ConnectionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ConnectionWithUser extends Connection {
  user: User | NetworkUser;
}

export interface NetworkResponse {
  accepted: ConnectionWithUser[];
  incoming: ConnectionWithUser[];
  outgoing: ConnectionWithUser[];
}
