import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks';
import { clientActions } from '@/redux/actions';
import { addClient } from '@/redux/slices/clientSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle2, Building2, MapPin, FileText, Users, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { theme } from '@/config/theme';
import type { AddClientPayload, AddPOCPayload, Client } from '@/types/client.types';

const STEPS = ['Details', 'Review'];

const initialFormData: AddClientPayload = {
  company_name: '',
  street: '',
  city: '',
  state: '',
  country: '',
  postal_code: '',
  client_location: '',
  gst_number: '',
  payment_period_days: 30,
  replacement_period_days: 90,
  agreement_date: '',
  commercial_decided: '',
  website: '',
  linkedin: '',
  notes: '',
  team_members: [
    { name: '', email: '', role: '', phone_number: '' }
  ]
};

const NewClientPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<AddClientPayload>(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let finalValue: any = value;
    if (type === 'number') finalValue = Number(value);
    
    setFormData(prev => ({ ...prev, [name]: finalValue }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: [] }));
    }
  };

  const handleTeamMemberChange = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const newTeam = [...(prev.team_members || [])];
      newTeam[index] = { ...newTeam[index], [field]: value };
      return { ...prev, team_members: newTeam };
    });
  };

  const addTeamMember = () => {
    setFormData(prev => ({
      ...prev,
      team_members: [...(prev.team_members || []), { name: '', email: '', role: '', phone_number: '' }]
    }));
  };

  const removeTeamMember = (index: number) => {
    setFormData(prev => {
      const newTeam = [...(prev.team_members || [])];
      if (newTeam.length <= 1) return prev; // Keep at least 1 member
      newTeam.splice(index, 1);
      return { ...prev, team_members: newTeam };
    });
  };

  const handleSubmit = () => {
    setFormErrors({});

    // Validate at least 1 team member with a name
    const validMembers = (formData.team_members || []).filter(m => m.name?.trim());
    if (validMembers.length === 0) {
      toast.error('At least one team member / POC is required.');
      return;
    }

    setIsSubmitting(true);

    const fd = new FormData();
    Object.keys(formData).forEach(key => {
      const k = key as keyof AddClientPayload;
      if (k === 'team_members') {
        if (formData.team_members) {
          fd.append('team_members', JSON.stringify(formData.team_members));
        }
      } else if (k === 'agreement_document') {
        if (formData.agreement_document) {
          fd.append('agreement_document', formData.agreement_document);
          fd.append('agreement_document_name', formData.agreement_document.name);
        }
      } else if (k === 'agreement_document_name') {
        // Ignored here, handled above
      } else {
        if (formData[k] !== undefined && formData[k] !== null && formData[k] !== '') {
          fd.append(k, String(formData[k]));
        }
      }
    });

    dispatch({
      type: clientActions.ADD_CLIENT,
      method: 'POST',
      endPoint: '/api/v1/clients/',
      body: fd,
      auth: true,
      getResponse: (data: Client) => {
        setIsSubmitting(false);
        dispatch(addClient(data));
        toast.success("Client added successfully");
        navigate('/clients');
      },
      getError: (err: any) => {
        setIsSubmitting(false);
        if (err.response?.data?.field_errors) {
          const errors = err.response.data.field_errors;
          setFormErrors(errors);
          toast.error("Validation failed. Please check the required fields.");
          setCurrentStep(0);
        } else {
          toast.error(err.message || "Failed to add client");
        }
      }
    });
  };

  const FieldError = ({ name }: { name: string }) => {
    if (!formErrors[name] || formErrors[name].length === 0) return null;
    return <p className="text-xs text-red-500 mt-1">{formErrors[name][0]}</p>;
  };

  const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle: string }) => (
    <div className="flex items-center gap-3 mb-5">
      <div className="p-2 rounded-lg" style={{ background: theme.accent + '15' }}>
        <Icon className="size-4" style={{ color: theme.accent }} />
      </div>
      <div>
        <h3 className="text-sm font-semibold" style={{ color: theme.textPrimary }}>{title}</h3>
        <p className="text-xs" style={{ color: theme.textMuted }}>{subtitle}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 w-full pb-10 px-4 md:px-8 pt-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: theme.textPrimary }}>
          New Client
        </h1>
        <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
          Client onboarding — capture details, address, commercials and POCs.
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((step, index) => {
          const isActive = index === currentStep;
          const isPast = index < currentStep;
          return (
            <React.Fragment key={step}>
              <button
                type="button"
                className="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-80"
                onClick={() => setCurrentStep(index)}
              >
                <div
                  className="flex items-center justify-center size-7 rounded-full text-xs font-semibold"
                  style={{
                    background: isActive || isPast ? theme.accent : theme.surfaceMuted,
                    color: isActive || isPast ? theme.accentForeground : theme.textMuted,
                  }}
                >
                  {isPast ? '✓' : index + 1}
                </div>
                <span
                  className="text-sm font-medium"
                  style={{ color: isActive ? theme.textPrimary : theme.textMuted }}
                >
                  {step}
                </span>
              </button>
              {index < STEPS.length - 1 && (
                <div
                  className="h-[2px] flex-1 mx-2 min-w-[40px] rounded-full"
                  style={{ background: isPast ? theme.accent : theme.border }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* ═══════════ STEP 0 — ALL DETAILS ═══════════ */}
      {currentStep === 0 && (
        <div className="space-y-6">
          {/* Company Info */}
          <div className="rounded-xl p-6" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
            <SectionHeader icon={Building2} title="Company Information" subtitle="Basic details about the client organization" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Company Name *</label>
                <Input name="company_name" value={formData.company_name} onChange={handleChange} placeholder="e.g. Acme Corporation" style={{ background: theme.background, borderColor: formErrors.company_name ? theme.destructive : theme.border, color: theme.textPrimary }} />
                <FieldError name="company_name" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>GST No.</label>
                <Input name="gst_number" value={formData.gst_number} onChange={handleChange} placeholder="e.g. 22AAAAA0000A1Z5" style={{ background: theme.background, borderColor: theme.border, color: theme.textPrimary }} />
                <FieldError name="gst_number" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Website</label>
                <Input name="website" value={formData.website} onChange={handleChange} placeholder="e.g. https://acme.com" style={{ background: theme.background, borderColor: theme.border, color: theme.textPrimary }} />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="rounded-xl p-6" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
            <SectionHeader icon={MapPin} title="Address" subtitle="Client office location and address details" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="space-y-1.5 md:col-span-2 lg:col-span-3">
                <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Street Address</label>
                <Input name="street" value={formData.street} onChange={handleChange} placeholder="e.g. 123 Business Park, Suite 400" style={{ background: theme.background, borderColor: theme.border, color: theme.textPrimary }} />
                <FieldError name="street" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>City *</label>
                <Input name="city" value={formData.city} onChange={handleChange} placeholder="e.g. Mumbai" style={{ background: theme.background, borderColor: formErrors.city ? theme.destructive : theme.border, color: theme.textPrimary }} />
                <FieldError name="city" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>State *</label>
                <Input name="state" value={formData.state} onChange={handleChange} placeholder="e.g. Maharashtra" style={{ background: theme.background, borderColor: formErrors.state ? theme.destructive : theme.border, color: theme.textPrimary }} />
                <FieldError name="state" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Country *</label>
                <Input name="country" value={formData.country} onChange={handleChange} placeholder="e.g. India" style={{ background: theme.background, borderColor: formErrors.country ? theme.destructive : theme.border, color: theme.textPrimary }} />
                <FieldError name="country" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Postal Code</label>
                <Input name="postal_code" value={formData.postal_code} onChange={handleChange} placeholder="e.g. 400001" style={{ background: theme.background, borderColor: theme.border, color: theme.textPrimary }} />
                <FieldError name="postal_code" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Client Location / Region</label>
                <Input name="client_location" value={formData.client_location} onChange={handleChange} placeholder="e.g. Western India" style={{ background: theme.background, borderColor: theme.border, color: theme.textPrimary }} />
                <FieldError name="client_location" />
              </div>
            </div>
          </div>

          {/* Commercials */}
          <div className="rounded-xl p-6" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
            <SectionHeader icon={FileText} title="Commercials & Agreement" subtitle="Payment terms, agreements, and additional notes" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Commercials Decided?</label>
                <Input type="text" name="commercial_decided" value={formData.commercial_decided} onChange={handleChange} placeholder="e.g. Yes, No, Pending" style={{ background: theme.background, borderColor: theme.border, color: theme.textPrimary }} />
                <FieldError name="commercial_decided" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Agreement Date</label>
                <Input type="date" name="agreement_date" value={formData.agreement_date} onChange={handleChange} style={{ background: theme.background, borderColor: theme.border, color: theme.textPrimary }} />
                <FieldError name="agreement_date" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Payment Period (days)</label>
                <Input type="number" name="payment_period_days" value={formData.payment_period_days} onChange={handleChange} placeholder="30" style={{ background: theme.background, borderColor: theme.border, color: theme.textPrimary }} />
                <FieldError name="payment_period_days" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Replacement Period (days)</label>
                <Input type="number" name="replacement_period_days" value={formData.replacement_period_days} onChange={handleChange} placeholder="90" style={{ background: theme.background, borderColor: theme.border, color: theme.textPrimary }} />
                <FieldError name="replacement_period_days" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Notes</label>
                <Input name="notes" value={formData.notes} onChange={handleChange} placeholder="Any additional notes..." style={{ background: theme.background, borderColor: theme.border, color: theme.textPrimary }} />
                <FieldError name="notes" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Agreement Document (Optional)</label>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFormData(prev => ({ ...prev, agreement_document: e.target.files![0] }));
                    }
                  }}
                  className="cursor-pointer file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold"
                  style={{ background: theme.background, borderColor: theme.border, color: theme.textPrimary }}
                />
                {formData.agreement_document && (
                  <p className="text-xs mt-1" style={{ color: theme.accent }}>
                    Selected: {(formData.agreement_document as File).name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div className="rounded-xl p-6" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ background: theme.accent + '15' }}>
                  <Users className="size-4" style={{ color: theme.accent }} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: theme.textPrimary }}>Client Team Members / POCs</h3>
                  <p className="text-xs" style={{ color: theme.textMuted }}>Point-of-contact details for this client</p>
                </div>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addTeamMember} className="gap-1.5">
                <Plus className="size-3.5" /> Add Member
              </Button>
            </div>
            <div className="space-y-4">
              {(formData.team_members || []).map((member, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-4 items-end p-4 rounded-lg" style={{ background: theme.background, border: `1px solid ${theme.border}` }}>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium" style={{ color: theme.textMuted }}>Name</label>
                    <Input placeholder="e.g. Jane Smith" value={member.name} onChange={(e) => handleTeamMemberChange(index, 'name', e.target.value)} style={{ background: theme.surface, borderColor: theme.border, color: theme.textPrimary }} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium" style={{ color: theme.textMuted }}>Email</label>
                    <Input placeholder="e.g. jane@company.com" type="email" value={member.email} onChange={(e) => handleTeamMemberChange(index, 'email', e.target.value)} style={{ background: theme.surface, borderColor: theme.border, color: theme.textPrimary }} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium" style={{ color: theme.textMuted }}>Phone</label>
                    <Input placeholder="e.g. +91 98765 43210" value={member.phone_number || ''} onChange={(e) => handleTeamMemberChange(index, 'phone_number', e.target.value)} style={{ background: theme.surface, borderColor: theme.border, color: theme.textPrimary }} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium" style={{ color: theme.textMuted }}>Role</label>
                    <Input placeholder="e.g. HR Head" value={member.role} onChange={(e) => handleTeamMemberChange(index, 'role', e.target.value)} style={{ background: theme.surface, borderColor: theme.border, color: theme.textPrimary }} />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 h-9 w-9 p-0"
                    onClick={() => removeTeamMember(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
              {(!formData.team_members || formData.team_members.length === 0) && (
                <div className="text-center py-8 rounded-lg" style={{ background: theme.background, border: `1px dashed ${theme.border}` }}>
                  <Users className="size-8 mx-auto mb-2 opacity-30" style={{ color: theme.textMuted }} />
                  <p className="text-sm" style={{ color: theme.textMuted }}>No team members added yet</p>
                  <Button type="button" variant="outline" size="sm" onClick={addTeamMember} className="mt-3 gap-1.5">
                    <Plus className="size-3.5" /> Add First Member
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Continue Button */}
          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            <Button onClick={() => setCurrentStep(1)}>Continue to Review</Button>
          </div>
        </div>
      )}

      {/* ═══════════ STEP 1 — REVIEW ═══════════ */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="rounded-xl p-6" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
            <div className="text-center py-4 mb-6">
              <div className="mx-auto flex items-center justify-center size-12 rounded-full mb-4" style={{ background: theme.successSoft, color: theme.success }}>
                <CheckCircle2 className="size-6" />
              </div>
              <h2 className="text-lg font-semibold" style={{ color: theme.textPrimary }}>Review & Submit</h2>
              <p className="text-sm" style={{ color: theme.textMuted }}>Please verify all details below before saving.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm" style={{ color: theme.textSecondary }}>
              {/* Company */}
              <div className="p-4 rounded-lg space-y-2" style={{ background: theme.background, border: `1px solid ${theme.border}` }}>
                <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: theme.textPrimary }}>
                  <Building2 className="size-3.5" style={{ color: theme.accent }} /> Company
                </h4>
                <p><span className="font-medium" style={{ color: theme.textMuted }}>Name:</span> {formData.company_name || '—'}</p>
                <p><span className="font-medium" style={{ color: theme.textMuted }}>GST:</span> {formData.gst_number || '—'}</p>
                <p><span className="font-medium" style={{ color: theme.textMuted }}>Website:</span> {formData.website || '—'}</p>
              </div>

              {/* Address */}
              <div className="p-4 rounded-lg space-y-2" style={{ background: theme.background, border: `1px solid ${theme.border}` }}>
                <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: theme.textPrimary }}>
                  <MapPin className="size-3.5" style={{ color: theme.accent }} /> Address
                </h4>
                <p><span className="font-medium" style={{ color: theme.textMuted }}>Street:</span> {formData.street || '—'}</p>
                <p><span className="font-medium" style={{ color: theme.textMuted }}>City:</span> {formData.city || '—'}</p>
                <p><span className="font-medium" style={{ color: theme.textMuted }}>State:</span> {formData.state || '—'}</p>
                <p><span className="font-medium" style={{ color: theme.textMuted }}>Country:</span> {formData.country || '—'}</p>
                <p><span className="font-medium" style={{ color: theme.textMuted }}>Postal:</span> {formData.postal_code || '—'}</p>
              </div>

              {/* Commercials */}
              <div className="p-4 rounded-lg space-y-2" style={{ background: theme.background, border: `1px solid ${theme.border}` }}>
                <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: theme.textPrimary }}>
                  <FileText className="size-3.5" style={{ color: theme.accent }} /> Commercials
                </h4>
                <p><span className="font-medium" style={{ color: theme.textMuted }}>Decided:</span> {formData.commercial_decided || '—'}</p>
                <p><span className="font-medium" style={{ color: theme.textMuted }}>Agreement:</span> {formData.agreement_date || '—'}</p>
                <p><span className="font-medium" style={{ color: theme.textMuted }}>Payment:</span> {formData.payment_period_days} days</p>
                <p><span className="font-medium" style={{ color: theme.textMuted }}>Replacement:</span> {formData.replacement_period_days} days</p>
                <p><span className="font-medium" style={{ color: theme.textMuted }}>Notes:</span> {formData.notes || '—'}</p>
              </div>

              {/* Team Members */}
              {formData.team_members && formData.team_members.length > 0 && (
                <div className="p-4 rounded-lg space-y-3 md:col-span-2 lg:col-span-3" style={{ background: theme.background, border: `1px solid ${theme.border}` }}>
                  <h4 className="font-semibold flex items-center gap-2" style={{ color: theme.textPrimary }}>
                    <Users className="size-3.5" style={{ color: theme.accent }} /> Team Members ({formData.team_members.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {formData.team_members.map((member, i) => (
                      <div key={i} className="p-3 rounded-lg space-y-1" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
                        <p className="font-medium" style={{ color: theme.textPrimary }}>{member.name || '—'}</p>
                        <p className="text-xs" style={{ color: theme.textMuted }}>{member.email || '—'}</p>
                        <p className="text-xs" style={{ color: theme.textMuted }}>{member.phone_number || '—'}</p>
                        <span className="text-xs px-2 py-0.5 rounded inline-block mt-1" style={{ background: theme.accent + '15', color: theme.accent }}>{member.role || '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" disabled={isSubmitting} onClick={() => setCurrentStep(0)}>
              Back to Details
            </Button>
            <Button disabled={isSubmitting} onClick={handleSubmit}>
              {isSubmitting ? (
                <><Loader2 className="size-4 mr-2 animate-spin" /> Saving...</>
              ) : 'Save Client'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewClientPage;
