/* ── Client Module — Type Definitions ─────────────────────────── */

export type ClientStatus = 'active' | 'inactive';
export type ClientTier = 'Key Account' | 'Standard';
export type IndustrySegment =
  | 'Broking'
  | 'Wealth Management'
  | 'AMC'
  | 'NBFC'
  | 'Banking'
  | 'Insurance'
  | 'Investment Banking';

export interface ClientPOC {
  name: string;
  email: string;
  phone: string;
}

export interface Client {
  id: string;
  name: string;
  industry: IndustrySegment;
  status: ClientStatus;
  tier: ClientTier;
  openPositions: number;
  pocName: string;
  location: string;
  email: string;
  phone: string;
  website: string;
  gst: string;
  linkedin: string;
  agreementDate: string;
  commercials: string;
  paymentPeriod: string;
  replacementPeriod: string;
  hiringPOC: ClientPOC;
  paymentPOC: ClientPOC;
}
