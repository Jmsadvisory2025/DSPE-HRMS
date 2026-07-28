export interface ApprovalSubmission {
  id: string;
  candidateName: string;
  status: 'Pending Approval' | 'Returned' | 'Approved' | 'Rejected';
  designation: string;
  client: string;
  submittedBy: string;
  submittedAt: string; // e.g., 'about 4 hours ago'
}

export const APPROVALS_DATA: ApprovalSubmission[] = [
  {
    id: 'a1',
    candidateName: 'Vivaan Shah',
    status: 'Pending Approval',
    designation: 'Senior Wealth Manager',
    client: 'HDFC Securities',
    submittedBy: 'Hardik Patel',
    submittedAt: 'about 4 hours ago',
  },
  {
    id: 'a2',
    candidateName: 'Arjun Nair',
    status: 'Pending Approval',
    designation: 'Equity Research Analyst',
    client: 'HDFC Securities',
    submittedBy: 'Japan Vyas',
    submittedAt: 'about 11 hours ago',
  },
  {
    id: 'a3',
    candidateName: 'Ayaan Bhat',
    status: 'Pending Approval',
    designation: 'Branch Manager',
    client: 'HDFC Securities',
    submittedBy: 'Supal Shah',
    submittedAt: 'about 18 hours ago',
  },
  {
    id: 'a4',
    candidateName: 'Navya Reddy',
    status: 'Pending Approval',
    designation: 'Credit Analyst',
    client: 'Bajaj Finserv',
    submittedBy: 'Shreya Desai',
    submittedAt: 'about 15 hours ago',
  },
  {
    id: 'a5',
    candidateName: 'Sneha Sharma',
    status: 'Pending Approval',
    designation: 'Business Head - NBFC',
    client: 'Bajaj Finserv',
    submittedBy: 'Harshada Joshi',
    submittedAt: 'about 22 hours ago',
  }
];
