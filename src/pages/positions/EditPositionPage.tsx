import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { theme } from '@/config/theme';
import { ChevronDown, Loader2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clientActions, userActions, positionActions } from '@/redux/actions';
import { setClients } from '@/redux/slices/clientSlice';
import { setUsers } from '@/redux/slices/userSlice';
import { updateJob, setDetailLoading, setSelectedJob, setError } from '@/redux/slices/positionSlice';
import type { AddJobPayload, JobDetail } from '@/types/position.types';

const INITIAL_FORM: AddJobPayload = {
  title: '',
  description: '',
  description_file: null,
  skills: [],
  education: '',
  min_experience: 0,
  max_experience: 0,
  location: '',
  openings: 1,
  budget: 0,
  client: null,
  team_member_id: null,
  status: 'open',
  assigned_recruiter_ids: [],
};

const EditPositionPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { clients } = useAppSelector((state) => state.clients);
  const { users } = useAppSelector((state) => state.users);
  const { selectedJob, detailLoading } = useAppSelector((state) => state.positions);

  const [formData, setFormData] = useState<AddJobPayload>(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [clientTeamMembers, setClientTeamMembers] = useState<any[]>([]);
  const [isFetchingClient, setIsFetchingClient] = useState(false);
  const [selectedClientDetail, setSelectedClientDetail] = useState<any>(null);
  const [recruiterDropdownOpen, setRecruiterDropdownOpen] = useState(false);

  // Fetch job details if not already present
  useEffect(() => {
    if (jobId && (!selectedJob || selectedJob.id !== jobId)) {
      dispatch({
        type: positionActions.FETCH_JOB_DETAIL,
        method: 'GET',
        endPoint: `/api/v1/jobs/${jobId}/`,
        auth: true,
        setLoading: (val: boolean) => dispatch(setDetailLoading(val)),
        getResponse: (data: JobDetail) => dispatch(setSelectedJob(data)),
        getError: (err: any) => dispatch(setError(err.message)),
      });
    }
  }, [dispatch, jobId, selectedJob]);

  // Pre-populate form when job details are loaded
  useEffect(() => {
    if (selectedJob && selectedJob.id === jobId) {
      setFormData({
        title: selectedJob.title || '',
        description: selectedJob.description || '',
        description_file: null,
        skills: selectedJob.skills || [],
        education: selectedJob.education || '',
        min_experience: selectedJob.min_experience ?? 0,
        max_experience: selectedJob.max_experience ?? 0,
        location: selectedJob.location || '',
        openings: selectedJob.openings ?? 1,
        budget: selectedJob.budget ? parseFloat(selectedJob.budget as any) : 0,
        client: selectedJob.client?.id || null,
        team_member_id: selectedJob.client?.team_member?.id || null,
        status: selectedJob.status?.toLowerCase() as any || 'open',
        assigned_recruiter_ids: selectedJob.assigned_recruiters?.map(r => r.id) || [],
      });
    }
  }, [selectedJob, jobId]);

  useEffect(() => {
    if (formData.client) {
      setIsFetchingClient(true);
      dispatch({
        type: clientActions.FETCH_CLIENT_DETAIL,
        method: 'GET',
        endPoint: `/api/v1/clients/${formData.client}/`,
        auth: true,
        getResponse: (data: any) => {
          setSelectedClientDetail(data);
          setClientTeamMembers(data.team_members || []);
          setIsFetchingClient(false);
        },
        getError: () => setIsFetchingClient(false),
      });
    } else {
      setSelectedClientDetail(null);
      setClientTeamMembers([]);
    }
  }, [dispatch, formData.client]);

  useEffect(() => {
    if (clients.length === 0) {
      dispatch({
        type: clientActions.FETCH_CLIENTS,
        method: 'GET',
        endPoint: '/api/v1/clients/',
        auth: true,
        getResponse: (data: any) => dispatch(setClients(data.results || [])),
      });
    }
    if (users.length === 0) {
      dispatch({
        type: userActions.FETCH_USERS,
        method: 'GET',
        endPoint: '/api/v1/users/',
        auth: true,
        getResponse: (data: any) => dispatch(setUsers(data.results || [])),
      });
    }
  }, [dispatch, clients.length, users.length]);

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills?.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...(prev.skills || []), skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: (prev.skills || []).filter(s => s !== skillToRemove)
    }));
  };

  const toggleRecruiter = (userId: string) => {
    setFormData(prev => {
      const current = prev.assigned_recruiter_ids || [];
      if (current.includes(userId)) {
        return { ...prev, assigned_recruiter_ids: current.filter(id => id !== userId) };
      }
      return { ...prev, assigned_recruiter_ids: [...current, userId] };
    });
  };

  const handleSubmit = () => {
    setFormErrors({});
    let errors: Record<string, string[]> = {};

    if (!formData.title?.trim()) errors.title = ['This field is required.'];
    if (!formData.description?.trim()) errors.description = ['This field is required.'];
    if (!formData.location?.trim()) errors.location = ['This field is required.'];
    if (formData.min_experience === undefined || formData.min_experience < 0) errors.min_experience = ['Invalid experience.'];
    if (formData.max_experience === undefined || formData.max_experience < 0 || formData.max_experience < formData.min_experience) errors.max_experience = ['Invalid max experience.'];
    
    if (!formData.client) errors.client = ['Client must be selected.'];
    if (!formData.team_member_id) errors.team_member_id = ['Client POC must be selected.'];

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error('Please correct the validation errors.');
      return;
    }

    setIsSubmitting(true);
    
    const fd = new FormData();
    fd.append('title', formData.title);
    fd.append('description', formData.description);
    fd.append('location', formData.location);
    fd.append('min_experience', String(formData.min_experience));
    fd.append('max_experience', String(formData.max_experience));
    
    if (formData.education) fd.append('education', formData.education);
    if (formData.openings) fd.append('openings', String(formData.openings));
    if (formData.budget) fd.append('budget', String(formData.budget));
    if (formData.status) fd.append('status', formData.status);
    
    if (formData.client) {
      fd.append('client', formData.client);
      if (formData.team_member_id) {
        fd.append('team_member_id', formData.team_member_id);
      }
    }

    if (formData.description_file) {
      fd.append('description_file', formData.description_file);
    }

    if (formData.skills && formData.skills.length > 0) {
      fd.append('skills', JSON.stringify(formData.skills));
    }
    
    if (formData.assigned_recruiter_ids && formData.assigned_recruiter_ids.length > 0) {
      formData.assigned_recruiter_ids.forEach(id => fd.append('assigned_recruiter_ids', id));
    }

    dispatch({
      type: positionActions.UPDATE_JOB,
      method: 'PATCH',
      endPoint: `/api/v1/jobs/${jobId}/`,
      auth: true,
      body: fd,
      setLoading: (val: boolean) => setIsSubmitting(val),
      getResponse: (data: any) => {
        dispatch(updateJob(data));
        toast.success('Position updated successfully!');
        navigate(`/positions/${jobId}`);
      },
      getError: (err: any) => {
        if (err.response?.data?.field_errors) {
          setFormErrors(err.response.data.field_errors);
          toast.error('Validation failed. Check the fields.');
        } else {
          toast.error(err.message || 'Failed to update position.');
        }
        setIsSubmitting(false);
      }
    });
  };

  if (detailLoading) {
    return (
      <div className="flex items-center justify-center p-24">
        <Loader2 className="size-8 animate-spin" style={{ color: theme.accent }} />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full pb-10 px-4 md:px-8 pt-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: theme.textPrimary }}>
          Edit Position
        </h1>
        <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
          Update job mandate and recruiter assignments.
        </p>
      </div>

      <div className="rounded-xl p-6" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
        <div className="space-y-6">
          {/* Status (Edit only) */}
          <div className="space-y-3">
            <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Status</label>
            <div className="relative w-64">
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full appearance-none rounded-md px-3 py-2 text-sm outline-none"
                style={{ background: theme.background, borderColor: theme.border, color: theme.textPrimary, border: `1px solid ${theme.border}` }}
              >
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="on-hold">On Hold</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 pointer-events-none" style={{ color: theme.textMuted }} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Designation / Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Senior Wealth Manager"
                style={{ background: theme.background, borderColor: formErrors.title ? theme.destructive : theme.border, color: theme.textPrimary }}
              />
              {formErrors.title && <p className="text-xs" style={{ color: theme.destructive }}>{formErrors.title[0]}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Client *</label>
              <div className="relative">
                <select
                  value={formData.client || ''}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value, team_member_id: null })}
                  className="w-full appearance-none rounded-md px-3 py-2 text-sm outline-none"
                  style={{ background: theme.background, borderColor: formErrors.client ? theme.destructive : theme.border, color: theme.textPrimary, border: `1px solid ${formErrors.client ? theme.destructive : theme.border}` }}
                >
                  <option value="" disabled>Select client</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.company_name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 pointer-events-none" style={{ color: theme.textMuted }} />
              </div>
              {formErrors.client && <p className="text-xs" style={{ color: theme.destructive }}>{formErrors.client[0]}</p>}
              
              {selectedClientDetail && (
                <div className="mt-2 p-3 rounded-md text-sm border" style={{ background: theme.surface, borderColor: theme.border }}>
                  <p className="font-medium" style={{ color: theme.textPrimary }}>{selectedClientDetail.company_name}</p>
                  <p className="text-xs mt-1 flex gap-2" style={{ color: theme.textSecondary }}>
                    <span>{selectedClientDetail.industry || 'No Industry'}</span> &bull; 
                    <span>{selectedClientDetail.city || 'No City'}, {selectedClientDetail.country || ''}</span>
                  </p>
                  <p className="text-xs mt-1" style={{ color: theme.textMuted }}>Contact: {selectedClientDetail.contact}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Client POC *</label>
                <div className="relative">
                  <select
                    value={formData.team_member_id || ''}
                    onChange={(e) => setFormData({ ...formData, team_member_id: e.target.value })}
                    disabled={!formData.client || isFetchingClient}
                    className="w-full appearance-none rounded-md px-3 py-2 text-sm outline-none disabled:opacity-50"
                    style={{ background: theme.background, borderColor: formErrors.team_member_id ? theme.destructive : theme.border, color: theme.textPrimary, border: `1px solid ${formErrors.team_member_id ? theme.destructive : theme.border}` }}
                  >
                    {!formData.client ? (
                      <option value="" disabled>Select client first</option>
                    ) : isFetchingClient ? (
                      <option value="" disabled>Loading POCs...</option>
                    ) : (
                      <option value="" disabled>Select POC</option>
                    )}
                    {clientTeamMembers.map(tm => (
                      <option key={tm.id} value={tm.id}>{tm.name}</option>
                    ))}
                  </select>
                  {isFetchingClient ? (
                     <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 animate-spin" style={{ color: theme.textMuted }} />
                  ) : (
                     <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 pointer-events-none" style={{ color: theme.textMuted }} />
                  )}
                </div>
                {formErrors.team_member_id && <p className="text-xs" style={{ color: theme.destructive }}>{formErrors.team_member_id[0]}</p>}
                
                {formData.team_member_id && (
                  <div className="mt-2 p-3 rounded-md text-sm border" style={{ background: theme.surface, borderColor: theme.border }}>
                    {(() => {
                      const poc = clientTeamMembers.find(t => t.id === formData.team_member_id);
                      if (!poc) return null;
                      return (
                        <>
                          <p className="font-medium" style={{ color: theme.textPrimary }}>{poc.name}</p>
                          <p className="text-xs mt-1" style={{ color: theme.textSecondary }}>{poc.role || poc.designation || 'POC'}</p>
                          <p className="text-xs mt-1 truncate" style={{ color: theme.textMuted }}>{poc.email}</p>
                        </>
                      );
                    })()}
                  </div>
                )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Location *</label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Remote or Mumbai"
                style={{ background: theme.background, borderColor: formErrors.location ? theme.destructive : theme.border, color: theme.textPrimary }}
              />
              {formErrors.location && <p className="text-xs" style={{ color: theme.destructive }}>{formErrors.location[0]}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Education</label>
              <Input
                value={formData.education}
                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                placeholder="e.g., B.Tech in CS"
                style={{ background: theme.background, borderColor: theme.border, color: theme.textPrimary }}
              />
            </div>



            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Min Experience (yrs) *</label>
              <Input
                type="number"
                min="0"
                value={formData.min_experience}
                onChange={(e) => setFormData({ ...formData, min_experience: Number(e.target.value) })}
                style={{ background: theme.background, borderColor: formErrors.min_experience ? theme.destructive : theme.border, color: theme.textPrimary }}
              />
              {formErrors.min_experience && <p className="text-xs" style={{ color: theme.destructive }}>{formErrors.min_experience[0]}</p>}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Max Experience (yrs) *</label>
              <Input
                type="number"
                min="0"
                value={formData.max_experience}
                onChange={(e) => setFormData({ ...formData, max_experience: Number(e.target.value) })}
                style={{ background: theme.background, borderColor: formErrors.max_experience ? theme.destructive : theme.border, color: theme.textPrimary }}
              />
              {formErrors.max_experience && <p className="text-xs" style={{ color: theme.destructive }}>{formErrors.max_experience[0]}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Budget</label>
              <Input
                type="number"
                value={formData.budget || ''}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="e.g., 1500000"
                style={{ background: theme.background, borderColor: theme.border, color: theme.textPrimary }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Openings</label>
              <Input
                type="number"
                min="1"
                value={formData.openings}
                onChange={(e) => setFormData({ ...formData, openings: Number(e.target.value) })}
                style={{ background: theme.background, borderColor: theme.border, color: theme.textPrimary }}
              />
            </div>

          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Required Skills</label>
            <div className="flex gap-2 mb-2">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="Add a skill and press Enter"
                style={{ background: theme.background, borderColor: theme.border, color: theme.textPrimary }}
              />
              <Button type="button" variant="outline" onClick={handleAddSkill}>Add</Button>
            </div>
            {formData.skills && formData.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="text-xs px-2.5 py-1 font-medium flex items-center gap-1"
                    style={{ color: theme.accent, background: theme.accentSoft, borderColor: theme.accent + '40' }}
                  >
                    {skill}
                    <X className="size-3 cursor-pointer opacity-70 hover:opacity-100" onClick={() => handleRemoveSkill(skill)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3 relative">
            <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Assign Recruiters</label>
            <div className="relative">
              <div 
                onClick={() => setRecruiterDropdownOpen(!recruiterDropdownOpen)}
                className="w-full flex items-center justify-between appearance-none rounded-md px-3 py-2 text-sm outline-none cursor-pointer"
                style={{ background: theme.background, borderColor: theme.border, color: theme.textPrimary, border: `1px solid ${theme.border}` }}
              >
                <span className={formData.assigned_recruiter_ids!.length > 0 ? '' : 'opacity-60'}>
                  {formData.assigned_recruiter_ids!.length > 0 
                    ? `${formData.assigned_recruiter_ids!.length} recruiter(s) selected` 
                    : 'Select recruiters...'}
                </span>
                <ChevronDown className="size-4 opacity-50" />
              </div>

              {recruiterDropdownOpen && (
                <div 
                  className="absolute z-50 w-full mt-1 rounded-md shadow-lg border max-h-60 overflow-y-auto"
                  style={{ background: theme.surface, borderColor: theme.border }}
                >
                  <div className="p-1 flex flex-col gap-1">
                    {users
                      .filter((u: any) => u.role === 'recruiter')
                      .map((recruiter) => {
                        const isAssigned = formData.assigned_recruiter_ids?.includes(recruiter.id);
                        return (
                          <label
                            key={recruiter.id}
                            className="flex items-center gap-3 px-3 py-2 rounded-sm cursor-pointer hover:opacity-80 transition-opacity"
                            style={{ background: isAssigned ? theme.accentSoft : 'transparent' }}
                          >
                            <input
                              type="checkbox"
                              checked={isAssigned}
                              onChange={() => toggleRecruiter(recruiter.id)}
                              className="accent-current"
                              style={{ color: theme.accent }}
                            />
                            <div>
                              <p className="text-sm font-medium" style={{ color: isAssigned ? theme.accent : theme.textPrimary }}>
                                {recruiter.first_name} {recruiter.last_name}
                              </p>
                              <p className="text-xs" style={{ color: theme.textMuted }}>{recruiter.email}</p>
                            </div>
                          </label>
                        );
                    })}
                    {users.filter((u: any) => u.role === 'recruiter').length === 0 && (
                      <p className="text-sm p-3" style={{ color: theme.textMuted }}>No recruiters found.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* Backdrop to close dropdown */}
            {recruiterDropdownOpen && (
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setRecruiterDropdownOpen(false)}
              />
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Job Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-md p-3 text-sm min-h-[120px] outline-none"
              placeholder="Describe the mandate, must-haves, nice-to-haves..."
              style={{
                background: theme.background,
                border: `1px solid ${formErrors.description ? theme.destructive : theme.border}`,
                color: theme.textPrimary,
              }}
            />
            {formErrors.description && <p className="text-xs" style={{ color: theme.destructive }}>{formErrors.description[0]}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Job Description File (Optional)</label>
            <div className="flex items-center gap-3">
              <Input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFormData({ ...formData, description_file: e.target.files[0] });
                  }
                }}
                className="cursor-pointer file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold"
                style={{ 
                  background: theme.background, 
                  borderColor: theme.border, 
                  color: theme.textPrimary 
                }}
              />
            </div>
            {selectedJob?.description_file && !formData.description_file && (
               <p className="text-xs" style={{ color: theme.textSecondary }}>
                 Current file: <a href={selectedJob.description_file as string} target="_blank" rel="noreferrer" className="underline hover:opacity-80" style={{ color: theme.accent }}>View Document</a> (Upload a new file to replace)
               </p>
            )}
            {formData.description_file && (
               <p className="text-xs mt-1" style={{ color: theme.accent }}>
                 Selected: {(formData.description_file as File).name}
               </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Job Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-md p-3 text-sm min-h-[120px] outline-none"
              placeholder="Describe the mandate, must-haves, nice-to-haves..."
              style={{
                background: theme.background,
                border: `1px solid ${formErrors.description ? theme.destructive : theme.border}`,
                color: theme.textPrimary,
              }}
            />
            {formErrors.description && <p className="text-xs" style={{ color: theme.destructive }}>{formErrors.description[0]}</p>}
          </div>

          <div className="flex items-center justify-end gap-3 pt-6" style={{ borderTop: `1px solid ${theme.border}` }}>
            <Button variant="outline" disabled={isSubmitting} onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button disabled={isSubmitting} onClick={handleSubmit}>
              {isSubmitting ? (
                <><Loader2 className="size-4 mr-2 animate-spin" /> Saving...</>
              ) : 'Update Position'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPositionPage;
