export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: 'ADMIN' | 'MANAGER' | 'RECRUITER' | 'SYSTEM';
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'EXPORT' | 'APPROVE' | 'REJECT';
  resource: string;
  details: string;
  ipAddress: string;
}

export const AUDIT_LOGS_DATA: AuditLog[] = [
  {
    id: 'log_001',
    timestamp: 'Today, 13:45',
    user: 'Hardik Patel',
    role: 'RECRUITER',
    action: 'CREATE',
    resource: 'Candidate Profile',
    details: 'Created candidate profile for Vivaan Shah',
    ipAddress: '192.168.1.104',
  },
  {
    id: 'log_002',
    timestamp: 'Today, 11:30',
    user: 'Zeel Shah',
    role: 'ADMIN',
    action: 'APPROVE',
    resource: 'Approval Queue',
    details: 'Approved candidate submission for Senior Wealth Manager (HDFC)',
    ipAddress: '192.168.1.101',
  },
  {
    id: 'log_003',
    timestamp: 'Today, 09:15',
    user: 'Priyanka Shah',
    role: 'ADMIN',
    action: 'UPDATE',
    resource: 'Client Profile',
    details: 'Updated commercial terms for Kotak Securities',
    ipAddress: '192.168.1.102',
  },
  {
    id: 'log_004',
    timestamp: 'Yesterday, 18:20',
    user: 'Japan Vyas',
    role: 'RECRUITER',
    action: 'CREATE',
    resource: 'Candidate Profile',
    details: 'Created candidate profile for Arjun Nair',
    ipAddress: '192.168.1.105',
  },
  {
    id: 'log_005',
    timestamp: 'Yesterday, 16:00',
    user: 'System',
    role: 'SYSTEM',
    action: 'EXPORT',
    resource: 'Weekly Report',
    details: 'Automated weekly pipeline report generated and emailed.',
    ipAddress: '127.0.0.1',
  },
  {
    id: 'log_006',
    timestamp: 'Yesterday, 14:10',
    user: 'Rakshita Mehta',
    role: 'MANAGER',
    action: 'DELETE',
    resource: 'Job Position',
    details: 'Deleted duplicate job mandate JOB-0000X',
    ipAddress: '192.168.1.110',
  },
  {
    id: 'log_007',
    timestamp: 'Yesterday, 09:00',
    user: 'Hardik Patel',
    role: 'RECRUITER',
    action: 'LOGIN',
    resource: 'Authentication',
    details: 'Successful login via SSO',
    ipAddress: '192.168.1.104',
  },
  {
    id: 'log_008',
    timestamp: 'Jul 21, 2026, 17:45',
    user: 'Zeel Shah',
    role: 'ADMIN',
    action: 'UPDATE',
    resource: 'System Settings',
    details: 'Updated global theme configuration to dark mode',
    ipAddress: '192.168.1.101',
  },
];
