export type UserRole = 'admin' | 'owner' | 'cashier' | 'developer';

export interface User {
  id: string;
  name: string;
  pin: string;
  role: UserRole;
  avatar: string;
  active: boolean;
}

export const initialUsers: User[] = [
  {
    id: 'owner-001',
    name: 'James Kamau',
    pin: '1234',
    role: 'owner',
    avatar: '👨‍💼',
    active: true,
  },
  {
    id: 'admin-001',
    name: 'Mary Wanjiku',
    pin: '5678',
    role: 'admin',
    avatar: '👩‍💻',
    active: true,
  },
  {
    id: 'cashier-001',
    name: 'Peter Ochieng',
    pin: '1111',
    role: 'cashier',
    avatar: '👨‍🦱',
    active: true,
  },
  {
    id: 'cashier-002',
    name: 'Grace Nyambura',
    pin: '2222',
    role: 'cashier',
    avatar: '👩',
    active: true,
  },
  {
    id: 'cashier-003',
    name: 'David Mutua',
    pin: '3333',
    role: 'cashier',
    avatar: '👨',
    active: true,
  },
  {
    id: 'dev-001',
    name: 'Developer Mode',
    pin: '9999',
    role: 'developer',
    avatar: '🛠️',
    active: true,
  },
];
