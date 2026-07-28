export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'RECRUITER';
  status: 'active' | 'invited' | 'inactive';
  lastLogin: string;
}

export const USERS_DATA: User[] = [
  { id: 'u1', name: 'Devansh Thakkar', email: 'devansh@dspe.co', role: 'ADMIN', status: 'active', lastLogin: '18/07/2026' },
  { id: 'u2', name: 'Priyanka Shah', email: 'priyanka@jmsadvisory.in', role: 'ADMIN', status: 'active', lastLogin: '17/07/2026' },
  { id: 'u3', name: 'Rakshita Mehta', email: 'rakshita@jmsadvisory.in', role: 'MANAGER', status: 'active', lastLogin: '19/07/2026' },
  { id: 'u4', name: 'Aakash Bhatt', email: 'aakash@jmsadvisory.in', role: 'MANAGER', status: 'active', lastLogin: '18/07/2026' },
  { id: 'u5', name: 'Neha Kulkarni', email: 'neha@jmsadvisory.in', role: 'MANAGER', status: 'active', lastLogin: '19/07/2026' },
  { id: 'u6', name: 'Hardik Patel', email: 'hardik@jmsadvisory.in', role: 'RECRUITER', status: 'active', lastLogin: '19/07/2026' },
  { id: 'u7', name: 'Japan Vyas', email: 'japan@jmsadvisory.in', role: 'RECRUITER', status: 'active', lastLogin: '19/07/2026' },
  { id: 'u8', name: 'Supal Shah', email: 'supal.shah@jmsadvisory.in', role: 'RECRUITER', status: 'active', lastLogin: '19/07/2026' },
  { id: 'u9', name: 'Shreya Desai', email: 'shreya@jmsadvisory.in', role: 'RECRUITER', status: 'active', lastLogin: '19/07/2026' },
  { id: 'u10', name: 'Harshada Joshi', email: 'harshada@jmsadvisory.in', role: 'RECRUITER', status: 'active', lastLogin: '18/07/2026' },
  { id: 'u11', name: 'Kunal Trivedi', email: 'kunal@jmsadvisory.in', role: 'RECRUITER', status: 'invited', lastLogin: '—' },
  { id: 'u12', name: 'Meera Iyer', email: 'meera@jmsadvisory.in', role: 'RECRUITER', status: 'inactive', lastLogin: '20/05/2026' },
];
