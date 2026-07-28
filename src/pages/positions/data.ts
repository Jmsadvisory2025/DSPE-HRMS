import type { JobPosition } from './types';

export const POSITIONS: JobPosition[] = [
  {
    id: 'p1',
    jobCode: 'JOB-00001',
    designation: 'Senior Wealth Manager',
    client: 'HDFC Securities',
    status: 'Open',
    priority: 'High',
    location: 'Mumbai',
    mode: 'Office',
    type: 'Permanent',
    minExperience: 5,
    maxExperience: 10,
    minBudget: 15,
    maxBudget: 25,
    openings: 1,
    targetDate: '2026-01-14',
    skillsMatch: 60,
    skills: ['Equity Research', 'Wealth Advisory', 'Client Onboarding', 'Mutual Funds'],
    recruiters: [
      { name: 'Hardik Patel', email: 'hardik@jmsadvisory.in' },
      { name: 'Japan Vyas', email: 'japan@jmsadvisory.in' }
    ],
    description: 'Own the end-to-end mandate for this BFSI role, working with the client stakeholders and internal team.',
    noticePeriod: '≤ 60 days',
    education: 'MBA Finance',
    pipeline: [
      { id: 'c1', name: 'Vivaan Shah', submittedBy: 'Hardik Patel', status: 'Pending Approval' },
      { id: 'c2', name: 'Sai Shah', submittedBy: 'Shreya Desai', status: 'Approved' }
    ]
  },
  {
    id: 'p2',
    jobCode: 'JOB-00002',
    designation: 'Equity Research Analyst',
    client: 'HDFC Securities',
    status: 'Open',
    priority: 'Medium',
    location: 'Bengaluru',
    mode: 'Hybrid',
    type: 'Permanent',
    minExperience: 3,
    maxExperience: 6,
    minBudget: 10,
    maxBudget: 18,
    openings: 2,
    targetDate: '2026-03-14',
    skillsMatch: 65,
    skills: ['Wealth Advisory', 'Client Onboarding', 'Mutual Funds', 'PMS'],
    recruiters: [
      { name: 'Supal Shah', email: 'supal.shah@jmsadvisory.in' }
    ],
    description: 'Provide actionable equity research reports and recommendations.',
    noticePeriod: '≤ 30 days',
    education: 'CA / CFA',
    pipeline: []
  },
  {
    id: 'p3',
    jobCode: 'JOB-00003',
    designation: 'Branch Manager',
    client: 'HDFC Securities',
    status: 'On Hold',
    priority: 'High',
    location: 'Ahmedabad',
    mode: 'Remote',
    type: 'Permanent',
    minExperience: 8,
    maxExperience: 14,
    minBudget: 20,
    maxBudget: 32,
    openings: 3,
    targetDate: '2026-05-14',
    skillsMatch: 70,
    skills: ['Client Onboarding', 'Mutual Funds', 'PMS', 'Team Management'],
    recruiters: [
      { name: 'Shreya Desai', email: 'shreya@jmsadvisory.in' },
      { name: 'Harshada Joshi', email: 'harshada@jmsadvisory.in' }
    ],
    description: 'Manage branch operations and drive sales targets.',
    noticePeriod: '≤ 90 days',
    education: 'Any Graduate',
    pipeline: []
  },
  {
    id: 'p4',
    jobCode: 'JOB-00004',
    designation: 'Relationship Manager - HNI',
    client: 'HDFC Securities',
    status: 'Filled',
    priority: 'Medium',
    location: 'Delhi NCR',
    mode: 'Office',
    type: 'Contractual',
    minExperience: 4,
    maxExperience: 8,
    minBudget: 12,
    maxBudget: 20,
    openings: 1,
    targetDate: '2026-07-14',
    skillsMatch: 75,
    skills: ['Mutual Funds', 'PMS', 'Credit Risk', 'HNI Acquisition'],
    recruiters: [
      { name: 'Hardik Patel', email: 'hardik@jmsadvisory.in' },
      { name: 'Shreya Desai', email: 'shreya@jmsadvisory.in' }
    ],
    description: 'Acquire and manage HNI clients for the firm.',
    noticePeriod: 'Immediate',
    education: 'MBA',
    pipeline: []
  }
];
