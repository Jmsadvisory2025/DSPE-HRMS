export type JobStatus = 'Open' | 'On Hold' | 'Filled' | 'Closed';
export type JobPriority = 'High' | 'Medium' | 'Low';
export type JobMode = 'Office' | 'Hybrid' | 'Remote';
export type JobType = 'Permanent' | 'Contractual';

export interface AssignedRecruiter {
  name: string;
  email: string;
}

export interface PipelineCandidate {
  id: string;
  name: string;
  submittedBy: string;
  status: 'Pending Approval' | 'Approved' | 'Rejected' | 'Interviewing';
}

export interface JobPosition {
  id: string;
  jobCode: string;
  designation: string;
  client: string;
  status: JobStatus;
  priority: JobPriority;
  location: string;
  mode: JobMode;
  type: JobType;
  minExperience: number;
  maxExperience: number;
  minBudget: number; // in LPA
  maxBudget: number; // in LPA
  openings: number;
  targetDate: string;
  skillsMatch: number;
  skills: string[];
  recruiters: AssignedRecruiter[];
  description: string;
  noticePeriod: string;
  education: string;
  pipeline: PipelineCandidate[];
}
