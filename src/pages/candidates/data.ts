export type Segment =
  | 'Wealth Management'
  | 'AMC'
  | 'NBFC'
  | 'Banking'
  | 'Insurance'
  | 'Broking'
  | 'Investment Banking';

export interface Candidate {
  id: number;
  name: string;
  role: string;
  company: string;
  segment: Segment;
  experience: string;
  location: string;
  ctcCurrent: string;
  ctcExpected: string;
  uploadedBy: string;
  isDuplicate?: boolean;
}

export const CANDIDATES: Candidate[] = [
  { id: 1, name: 'Vivaan Shah', role: 'Wealth Manager', company: 'ICICI Direct', segment: 'Wealth Management', experience: '2 yrs', location: 'Bengaluru', ctcCurrent: '8 LPA', ctcExpected: '12 LPA', uploadedBy: 'Hardik' },
  { id: 2, name: 'Arjun Nair', role: 'Equity Analyst', company: 'Axis AMC', segment: 'AMC', experience: '3 yrs', location: 'Delhi NCR', ctcCurrent: '9 LPA', ctcExpected: '14 LPA', uploadedBy: 'Japan' },
  { id: 3, name: 'Ayaan Bhat', role: 'Portfolio Manager', company: 'Nuvama Wealth', segment: 'NBFC', experience: '4 yrs', location: 'Pune', ctcCurrent: '10 LPA', ctcExpected: '16 LPA', uploadedBy: 'supal shah' },
  { id: 4, name: 'Ananya Bhatt', role: 'Credit Analyst', company: 'Angel One', segment: 'Banking', experience: '5 yrs', location: 'Hyderabad', ctcCurrent: '11 LPA', ctcExpected: '18 LPA', uploadedBy: 'Shreya' },
  { id: 5, name: 'Kavya Desai', role: 'Business Development Manager', company: 'SBI Mutual Fund', segment: 'Insurance', experience: '6 yrs', location: 'Chennai', ctcCurrent: '12 LPA', ctcExpected: '20 LPA', uploadedBy: 'Harshada' },
  { id: 6, name: 'Priya Kapoor', role: 'Branch Manager', company: 'HDFC Life', segment: 'Investment Banking', experience: '7 yrs', location: 'Ahmedabad', ctcCurrent: '13 LPA', ctcExpected: '22 LPA', uploadedBy: 'Rakshita' },
  { id: 7, name: 'Neha Kulkarni', role: 'Investment Advisor', company: 'Aditya Birla Capital', segment: 'Broking', experience: '8 yrs', location: 'Mumbai', ctcCurrent: '14 LPA', ctcExpected: '24 LPA', uploadedBy: 'Aakash' },
  { id: 8, name: 'Nikhil Patel', role: 'Product Manager', company: 'HDFC Securities', segment: 'Wealth Management', experience: '9 yrs', location: 'Bengaluru', ctcCurrent: '15 LPA', ctcExpected: '26 LPA', uploadedBy: 'Hardik', isDuplicate: true },
  { id: 9, name: 'Aarav Rao', role: 'Risk Analyst', company: 'Kotak Securities', segment: 'AMC', experience: '10 yrs', location: 'Delhi NCR', ctcCurrent: '16 LPA', ctcExpected: '20 LPA', uploadedBy: 'Japan' },
  { id: 10, name: 'Meera Joshi', role: 'Compliance Officer', company: 'Motilal Oswal', segment: 'Broking', experience: '5 yrs', location: 'Mumbai', ctcCurrent: '12 LPA', ctcExpected: '18 LPA', uploadedBy: 'supal shah' },
];
