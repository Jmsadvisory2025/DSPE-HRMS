/* ── Client Module — Type Definitions ─────────────────────────── */

export interface AddPOCPayload {
  poc_type: string;
  name: string;
  email: string;
  designation: string;
  contact: string;
}

export interface AddClientPayload {
  company_name: string;
  client_name: string;
  email: string;
  alternative_email?: string;
  contact: string;
  alternative_contact?: string;
  street?: string;
  city: string;
  state: string;
  country: string;
  postal_code?: string;
  client_location?: string;
  industry: string;
  gst_number?: string;
  status: string;
  payment_period_days: number;
  replacement_period_days: number;
  agreement_date?: string;
  commercial_decided: string;
  pocs: AddPOCPayload[];
  website?: string;
  linkedin?: string;
  notes?: string;
  team_members?: TeamMember[];
}

export interface Client {
  id: string;
  client_id: string;
  company_name: string;
  industry: string;
  status: string;
  email: string;
  contact: string;
  city: string;
  state: string;
  country: string;
  open_jobs_count: number;
  created_by_name: string;
  created_at: string;
}

export interface ClientResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Client[];
}

export interface POC {
  id: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  deleted_at: string | null;
  poc_type: string;
  name: string;
  email: string;
  designation: string;
  contact: string;
  linkedin: string;
  description: string;
  organization: string;
  client: string;
}

export interface Organization {
  id: string;
  name: string;
  created_at: string;
}

export interface ClientStats {
  open_jobs: number;
  candidates_submitted: number;
  hired_count: number;
}

export interface CreatedBy {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  role: string;
  organization: Organization;
}

export interface ClientDetail {
  id: string;
  pocs: {
    hiring: POC[];
    payment: POC[];
  };
  documents: any[];
  created_by: CreatedBy;
  stats: ClientStats;
  agreement_date: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  is_deleted: boolean;
  client_id: string;
  company_name: string;
  client_name: string;
  email: string;
  alternative_email: string;
  contact: string;
  alternative_contact: string;
  website: string;
  linkedin: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  client_location: string;
  industry: string;
  gst_number: string;
  status: string;
  payment_period_days: number;
  replacement_period_days: number;
  commercial_decided: string;
  agreement_document: string | null;
  agreement_document_name: string;
  notes: string;
  organization: string;
  team_members: TeamMember[];
}

export interface TeamMember {
  id?: string;
  name: string;
  email: string;
  role: string;
}

export interface ClientState {
  clients: Client[];
  selectedClient: ClientDetail | null;
  loading: boolean;
  detailLoading: boolean;
  error: string | null;
}
