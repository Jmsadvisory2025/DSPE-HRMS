import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clientActions } from '@/redux/actions';
import { setSelectedClient, setDetailLoading, setError } from '@/redux/slices/clientSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { theme } from '@/config/theme';
import type { AddClientPayload, AddPOCPayload, ClientDetail } from '@/types/client.types';

const STEPS = ['Company', 'Address', 'Commercials', 'POCs', 'Review'];

const ClientEditPage = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedClient, detailLoading } = useAppSelector((state) => state.clients);

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<AddClientPayload | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch client detail on mount
  useEffect(() => {
    if (clientId) {
      dispatch({
        type: clientActions.FETCH_CLIENT_DETAIL,
        method: 'GET',
        endPoint: `/api/v1/clients/${clientId}/`,
        auth: true,
        setLoading: (val: boolean) => dispatch(setDetailLoading(val)),
        getResponse: (data: ClientDetail) => dispatch(setSelectedClient(data)),
        getError: (err: any) => dispatch(setError(err.message)),
      });
    }

    return () => {
      dispatch(setSelectedClient(null));
    };
  }, [dispatch, clientId]);

  // Pre-fill form when selectedClient data arrives
  useEffect(() => {
    if (selectedClient) {
      setFormData({
        company_name: selectedClient.company_name || '',
        client_name: selectedClient.client_name || '',
        email: selectedClient.email || '',
        alternative_email: selectedClient.alternative_email || '',
        contact: selectedClient.contact || '',
        alternative_contact: selectedClient.alternative_contact || '',
        street: selectedClient.street || '',
        city: selectedClient.city || '',
        state: selectedClient.state || '',
        country: selectedClient.country || '',
        postal_code: selectedClient.postal_code || '',
        client_location: selectedClient.client_location || '',
        industry: selectedClient.industry || '',
        gst_number: selectedClient.gst_number || '',
        status: selectedClient.status || 'active',
        payment_period_days: selectedClient.payment_period_days || 0,
        replacement_period_days: selectedClient.replacement_period_days || 0,
        agreement_date: selectedClient.agreement_date || '',
        commercial_decided: selectedClient.commercial_decided || '',
        website: selectedClient.website || '',
        linkedin: selectedClient.linkedin || '',
        notes: selectedClient.notes || '',
        pocs: [
          ...(selectedClient.pocs?.hiring || []).map(p => ({
            poc_type: 'hiring' as string,
            name: p.name,
            email: p.email,
            designation: p.designation,
            contact: p.contact,
          })),
          ...(selectedClient.pocs?.payment || []).map(p => ({
            poc_type: 'payment' as string,
            name: p.name,
            email: p.email,
            designation: p.designation,
            contact: p.contact,
          })),
        ],
      });
    }
  }, [selectedClient]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let finalValue: any = value;
    if (type === 'number') finalValue = Number(value);

    setFormData(prev => prev ? { ...prev, [name]: finalValue } : prev);
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: [] }));
    }
  };

  const handlePOCChange = (index: number, field: keyof AddPOCPayload, value: string) => {
    setFormData(prev => {
      if (!prev) return prev;
      const newPocs = [...prev.pocs];
      newPocs[index] = { ...newPocs[index], [field]: value };
      return { ...prev, pocs: newPocs };
    });
  };

  const handleSubmit = () => {
    if (!formData || !clientId) return;
    setIsSubmitting(true);
    setFormErrors({});

    dispatch({
      type: clientActions.UPDATE_CLIENT,
      method: 'PATCH',
      endPoint: `/api/v1/clients/${clientId}/`,
      body: formData,
      auth: true,
      getResponse: () => {
        setIsSubmitting(false);
        toast.success('Client updated successfully');
        navigate(`/clients/${clientId}`);
      },
      getError: (err: any) => {
        setIsSubmitting(false);
        if (err.response?.data?.field_errors) {
          const errors = err.response.data.field_errors;
          setFormErrors(errors);
          toast.error('Validation failed. Please check the required fields.');

          const step0 = ['company_name', 'client_name', 'industry', 'status', 'email', 'alternative_email', 'contact', 'alternative_contact', 'website', 'linkedin', 'gst_number'];
          const step1 = ['street', 'city', 'state', 'country', 'postal_code', 'client_location'];
          const step2 = ['commercial_decided', 'agreement_date', 'payment_period_days', 'replacement_period_days', 'notes'];

          let targetStep = 0;
          if (Object.keys(errors).some(k => step0.includes(k))) targetStep = 0;
          else if (Object.keys(errors).some(k => step1.includes(k))) targetStep = 1;
          else if (Object.keys(errors).some(k => step2.includes(k))) targetStep = 2;
          else targetStep = 3;

          setCurrentStep(targetStep);
        } else {
          toast.error(err.message || 'Failed to update client');
        }
      },
    });
  };

  const FieldError = ({ name }: { name: string }) => {
    if (!formErrors[name] || formErrors[name].length === 0) return null;
    return <p className="text-xs text-red-500 mt-1">{formErrors[name][0]}</p>;
  };

  // Loading state
  if (detailLoading || !formData) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="size-8 animate-spin" style={{ color: theme.accent }} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <button
          onClick={() => navigate(`/clients/${clientId}`)}
          className="flex items-center gap-1.5 text-xs font-medium transition-colors mb-3"
          style={{ color: theme.textMuted }}
          onMouseEnter={(e) => (e.currentTarget.style.color = theme.textPrimary)}
          onMouseLeave={(e) => (e.currentTarget.style.color = theme.textMuted)}
        >
          <ArrowLeft className="size-3.5" />
          Back to client
        </button>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: theme.textPrimary }}
        >
          Edit {formData.company_name || 'Client'}
        </h1>
        <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
          Update client details, address, commercials and POCs.
        </p>
      </div>

      {/* Stepper */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
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
                  className="flex items-center justify-center size-6 rounded-full text-xs font-medium"
                  style={{
                    background: isActive || isPast ? theme.accent : theme.surfaceMuted,
                    color: isActive || isPast ? theme.accentForeground : theme.textMuted,
                  }}
                >
                  {index + 1}
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
                  className="hidden sm:block h-[1px] flex-1 mx-2 min-w-[20px]"
                  style={{ background: isPast ? theme.accent : theme.border }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Form Card */}
      <div
        className="rounded-xl p-6"
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
        }}
      >
        {currentStep === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Company Name *</label>
              <Input name="company_name" value={formData.company_name} onChange={handleChange} style={{ background: theme.background, borderColor: theme.border, color: theme.textPrimary }} />
              <FieldError name="company_name" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Client Account Name *</label>
              <Input name="client_name" value={formData.client_name} onChange={handleChange} style={{ background: theme.background, borderColor: theme.border, color: theme.textPrimary }} />
              <FieldError name="client_name" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Industry *</label>
              <Input name="industry" value={formData.industry} onChange={handleChange} style={{ background: theme.background, borderColor: theme.border, color: theme.textPrimary }} />
              <FieldError name="industry" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Status</label>
              <select
                name="status" value={formData.status} onChange={handleChange}
                className="w-full h-10 px-3 rounded-md border text-sm"
                style={{ background: theme.background, borderColor: theme.border, color: theme.textPrimary }}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <FieldError name="status" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Primary Email *</label>
              <Input type="email" name="email" value={formData.email} onChange={handleChange} style={{ background: theme.background, borderColor: theme.border, color: theme.textPrimary }} />
              <FieldError name="email" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Alternate Email</label>
              <Input type="email" name="alternative_email" value={formData.alternative_email} onChange={handleChange} style={{ background: theme.background, borderColor: theme.border, color: theme.textPrimary }} />
              <FieldError name="alternative_email" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Phone *</label>
              <Input name="contact" value={formData.contact} onChange={handleChange} style={{ background: theme.background, borderColor: theme.border, color: theme.textPrimary }} />
              <FieldError name="contact" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Alternate Phone</label>
              <Input name="alternative_contact" value={formData.alternative_contact} onChange={handleChange} style={{ background: theme.background, borderColor: theme.border, color: theme.textPrimary }} />
              <FieldError name="alternative_contact" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Website</label>
              <Input name="website" value={formData.website} onChange={handleChange} style={{ background: theme.background, borderColor: theme.border, color: theme.textPrimary }} />
              <FieldError name="website" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>LinkedIn</label>
              <Input name="linkedin" value={formData.linkedin} onChange={handleChange} style={{ background: theme.background, borderColor: theme.border, color: theme.textPrimary }} />
              <FieldError name="linkedin" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>GST No.</label>
              <Input name="gst_number" value={formData.gst_number} onChange={handleChange} style={{ background: theme.background, borderColor: theme.border, color: theme.textPrimary }} />
              <FieldError name="gst_number" />
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Street Address</label>
              <Input name="street" value={formData.street} onChange={handleChange} style={{ background: theme.background, borderColor: theme.border, color: theme.textPrimary }} />
              <FieldError name="street" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>City *</label>
              <Input name="city" value={formData.city} onChange={handleChange} style={{ background: theme.background, borderColor: theme.border, color: theme.textPrimary }} />
              <FieldError name="city" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>State *</label>
              <Input name="state" value={formData.state} onChange={handleChange} style={{ background: theme.background, borderColor: theme.border, color: theme.textPrimary }} />
              <FieldError name="state" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Country *</label>
              <Input name="country" value={formData.country} onChange={handleChange} style={{ background: theme.background, borderColor: theme.border, color: theme.textPrimary }} />
              <FieldError name="country" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Postal Code</label>
              <Input name="postal_code" value={formData.postal_code} onChange={handleChange} style={{ background: theme.background, borderColor: theme.border, color: theme.textPrimary }} />
              <FieldError name="postal_code" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Client Location / Region</label>
              <Input name="client_location" value={formData.client_location} onChange={handleChange} style={{ background: theme.background, borderColor: theme.border, color: theme.textPrimary }} />
              <FieldError name="client_location" />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Commercials Decided?</label>
                <Input
                  type="text"
                  name="commercial_decided" 
                  value={formData.commercial_decided} 
                  onChange={handleChange}
                  placeholder="e.g. Yes, No, Pending..."
                  style={{ background: theme.background, borderColor: theme.border, color: theme.textPrimary }}
                />
                <FieldError name="commercial_decided" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Agreement Date</label>
                <Input type="date" name="agreement_date" value={formData.agreement_date} onChange={handleChange} style={{ background: theme.background, borderColor: theme.border, color: theme.textPrimary }} />
                <FieldError name="agreement_date" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Payment Period (days)</label>
                <Input type="number" name="payment_period_days" value={formData.payment_period_days} onChange={handleChange} style={{ background: theme.background, borderColor: theme.border, color: theme.textPrimary }} />
                <FieldError name="payment_period_days" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Replacement Period (days)</label>
                <Input type="number" name="replacement_period_days" value={formData.replacement_period_days} onChange={handleChange} style={{ background: theme.background, borderColor: theme.border, color: theme.textPrimary }} />
                <FieldError name="replacement_period_days" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Notes</label>
                <Input name="notes" value={formData.notes} onChange={handleChange} placeholder="Any additional notes..." style={{ background: theme.background, borderColor: theme.border, color: theme.textPrimary }} />
                <FieldError name="notes" />
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-8">
            {formData.pocs.map((poc, index) => (
              <div key={index} className="space-y-4 pb-6" style={index < formData.pocs.length - 1 ? { borderBottom: `1px solid ${theme.border}` } : {}}>
                <h3 className="font-semibold capitalize" style={{ color: theme.textPrimary }}>
                  {poc.poc_type} POC
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Name</label>
                    <Input value={poc.name} onChange={(e) => handlePOCChange(index, 'name', e.target.value)} style={{ background: theme.background, borderColor: theme.border, color: theme.textPrimary }} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Designation</label>
                    <Input value={poc.designation} onChange={(e) => handlePOCChange(index, 'designation', e.target.value)} style={{ background: theme.background, borderColor: theme.border, color: theme.textPrimary }} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Email</label>
                    <Input type="email" value={poc.email} onChange={(e) => handlePOCChange(index, 'email', e.target.value)} style={{ background: theme.background, borderColor: theme.border, color: theme.textPrimary }} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Phone</label>
                    <Input value={poc.contact} onChange={(e) => handlePOCChange(index, 'contact', e.target.value)} style={{ background: theme.background, borderColor: theme.border, color: theme.textPrimary }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="text-center py-4">
              <div className="mx-auto flex items-center justify-center size-12 rounded-full mb-4" style={{ background: theme.successSoft, color: theme.success }}>
                <CheckCircle2 className="size-6" />
              </div>
              <h2 className="text-lg font-semibold" style={{ color: theme.textPrimary }}>Review & Update</h2>
              <p className="text-sm" style={{ color: theme.textMuted }}>Please verify all updated details below before saving.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm" style={{ color: theme.textSecondary }}>
              {/* Company */}
              <div className="p-4 rounded-lg space-y-1" style={{ background: theme.background, border: `1px solid ${theme.border}` }}>
                <h4 className="font-semibold mb-2" style={{ color: theme.textPrimary }}>Company</h4>
                <p><strong>Company Name:</strong> {formData.company_name || '—'}</p>
                <p><strong>Client Name:</strong> {formData.client_name || '—'}</p>
                <p><strong>Industry:</strong> {formData.industry || '—'}</p>
                <p><strong>Status:</strong> <span className="capitalize">{formData.status}</span></p>
                <p><strong>Email:</strong> {formData.email || '—'}</p>
                <p><strong>Alt. Email:</strong> {formData.alternative_email || '—'}</p>
                <p><strong>Phone:</strong> {formData.contact || '—'}</p>
                <p><strong>Alt. Phone:</strong> {formData.alternative_contact || '—'}</p>
                <p><strong>Website:</strong> {formData.website || '—'}</p>
                <p><strong>LinkedIn:</strong> {formData.linkedin || '—'}</p>
                <p><strong>GST:</strong> {formData.gst_number || '—'}</p>
              </div>

              {/* Address */}
              <div className="p-4 rounded-lg space-y-1" style={{ background: theme.background, border: `1px solid ${theme.border}` }}>
                <h4 className="font-semibold mb-2" style={{ color: theme.textPrimary }}>Address</h4>
                <p><strong>Street:</strong> {formData.street || '—'}</p>
                <p><strong>City:</strong> {formData.city || '—'}</p>
                <p><strong>State:</strong> {formData.state || '—'}</p>
                <p><strong>Country:</strong> {formData.country || '—'}</p>
                <p><strong>Postal Code:</strong> {formData.postal_code || '—'}</p>
                <p><strong>Client Location:</strong> {formData.client_location || '—'}</p>
              </div>

              {/* Commercials */}
              <div className="p-4 rounded-lg space-y-1" style={{ background: theme.background, border: `1px solid ${theme.border}` }}>
                <h4 className="font-semibold mb-2" style={{ color: theme.textPrimary }}>Commercials</h4>
                <p><strong>Commercials:</strong> {formData.commercial_decided || 'N/A'}</p>
                <p><strong>Agreement Date:</strong> {formData.agreement_date || '—'}</p>
                <p><strong>Payment Period:</strong> {formData.payment_period_days} days</p>
                <p><strong>Replacement:</strong> {formData.replacement_period_days} days</p>
                <p><strong>Notes:</strong> {formData.notes || '—'}</p>
              </div>

              {/* POCs */}
              <div className="p-4 rounded-lg space-y-1" style={{ background: theme.background, border: `1px solid ${theme.border}` }}>
                <h4 className="font-semibold mb-2" style={{ color: theme.textPrimary }}>POCs</h4>
                {formData.pocs.map((poc, i) => (
                  <div key={i} className="mb-2">
                    <p className="font-medium capitalize" style={{ color: theme.accent }}>{poc.poc_type} POC</p>
                    <p><strong>Name:</strong> {poc.name || '—'}</p>
                    <p><strong>Designation:</strong> {poc.designation || '—'}</p>
                    <p><strong>Email:</strong> {poc.email || '—'}</p>
                    <p><strong>Phone:</strong> {poc.contact || '—'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between mt-8 pt-6" style={{ borderTop: `1px solid ${theme.border}` }}>
          <Button
            variant="outline"
            disabled={isSubmitting}
            onClick={() => {
              if (currentStep > 0) setCurrentStep((prev) => prev - 1);
              else navigate(`/clients/${clientId}`);
            }}
          >
            Back
          </Button>
          <Button
            disabled={isSubmitting}
            onClick={() => {
              if (currentStep === 4) handleSubmit();
              else setCurrentStep((prev) => Math.min(prev + 1, 4));
            }}
          >
            {isSubmitting ? (
              <><Loader2 className="size-4 mr-2 animate-spin" /> Saving...</>
            ) : currentStep === 4 ? 'Update Client' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClientEditPage;
