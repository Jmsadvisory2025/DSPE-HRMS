import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { addJob } from '@/redux/slices/positionSlice';
import type { AddJobPayload } from '@/types/position.types';

const INITIAL_FORM: AddJobPayload = {
  title: '',
  description: '',
  skills: [],
  education: '',
  min_experience: 0,
  max_experience: 0,
  location: '',
  openings: 1,
  priority: 'medium',
  budget: 0,
  job_type: 'permanent',
  job_mode: 'office',
  hiring_for: 'client',
  client: null,
  status: 'open',
  assigned_recruiter_ids: [],
  target_closing_date: '',
  notice_period_preference: '',
  skill_criteria: 70,
};

const NewPositionPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { clients } = useAppSelector((state) => state.clients);
  const { users } = useAppSelector((state) => state.users);

  const [formData, setFormData] = useState<AddJobPayload>(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skillInput, setSkillInput] = useState('');

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
    
    if (formData.hiring_for === 'client' && !formData.client) {
      errors.client = ['Client must be selected if hiring for a client.'];
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error('Please correct the validation errors.');
      return;
    }

    setIsSubmitting(true);
    
    const payload = { ...formData };
    if (payload.hiring_for === 'self') {
      payload.client = null;
    }

    dispatch({
      type: positionActions.ADD_JOB,
      method: 'POST',
      endPoint: '/api/v1/jobs/',
      auth: true,
      body: payload,
      setLoading: (val: boolean) => setIsSubmitting(val),
      getResponse: (data: any) => {
        dispatch(addJob(data));
        toast.success('Position created successfully!');
        navigate('/positions');
      },
      getError: (err: any) => {
        if (err.response?.data?.field_errors) {
          setFormErrors(err.response.data.field_errors);
          toast.error('Validation failed. Check the fields.');
        } else {
          toast.error(err.message || 'Failed to create position.');
        }
        setIsSubmitting(false);
      }
    });
  };

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: theme.textPrimary }}>
          New Position
        </h1>
        <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
          Open a new job mandate and assign recruiters.
        </p>
      </div>

      <div className="rounded-xl p-6" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
        <div className="space-y-6">
          {/* Hiring for */}
          <div className="space-y-3">
            <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Hiring for</label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="rounded-md transition-all"
                onClick={() => setFormData({ ...formData, hiring_for: 'client' })}
                style={{
                  borderColor: formData.hiring_for === 'client' ? theme.accent : theme.border,
                  color: formData.hiring_for === 'client' ? theme.accent : theme.textSecondary,
                  background: formData.hiring_for === 'client' ? theme.accentSoft : 'transparent',
                }}
              >
                Client Position
              </Button>
              <Button
                variant="outline"
                className="rounded-md transition-all"
                onClick={() => setFormData({ ...formData, hiring_for: 'self', client: null })}
                style={{
                  borderColor: formData.hiring_for === 'self' ? theme.accent : theme.border,
                  color: formData.hiring_for === 'self' ? theme.accent : theme.textSecondary,
                  background: formData.hiring_for === 'self' ? theme.accentSoft : 'transparent',
                }}
              >
                Internal Position
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Client {formData.hiring_for === 'client' && '*'}</label>
              <div className="relative">
                <select
                  value={formData.client || ''}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  disabled={formData.hiring_for === 'self'}
                  className="w-full appearance-none rounded-md px-3 py-2 text-sm outline-none disabled:opacity-50"
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
              <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Job Type</label>
              <div className="relative">
                <select
                  value={formData.job_type}
                  onChange={(e) => setFormData({ ...formData, job_type: e.target.value as any })}
                  className="w-full appearance-none rounded-md px-3 py-2 text-sm outline-none"
                  style={{ background: theme.background, borderColor: theme.border, color: theme.textPrimary, border: `1px solid ${theme.border}` }}
                >
                  <option value="permanent">Permanent</option>
                  <option value="contractual">Contractual</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 pointer-events-none" style={{ color: theme.textMuted }} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Mode</label>
              <div className="relative">
                <select
                  value={formData.job_mode}
                  onChange={(e) => setFormData({ ...formData, job_mode: e.target.value as any })}
                  className="w-full appearance-none rounded-md px-3 py-2 text-sm outline-none"
                  style={{ background: theme.background, borderColor: theme.border, color: theme.textPrimary, border: `1px solid ${theme.border}` }}
                >
                  <option value="office">Office</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="remote">Remote</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 pointer-events-none" style={{ color: theme.textMuted }} />
              </div>
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

            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Target Closing Date</label>
              <Input
                type="date"
                value={formData.target_closing_date}
                onChange={(e) => setFormData({ ...formData, target_closing_date: e.target.value })}
                style={{ background: theme.background, borderColor: formErrors.target_closing_date ? theme.destructive : theme.border, color: theme.textPrimary }}
              />
              {formErrors.target_closing_date && <p className="text-xs" style={{ color: theme.destructive }}>{formErrors.target_closing_date[0]}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Notice Period Preference</label>
              <Input
                value={formData.notice_period_preference}
                onChange={(e) => setFormData({ ...formData, notice_period_preference: e.target.value })}
                placeholder="e.g., Immediate, 30 Days"
                style={{ background: theme.background, borderColor: theme.border, color: theme.textPrimary }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Priority</label>
              <div className="relative">
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full appearance-none rounded-md px-3 py-2 text-sm outline-none"
                  style={{ background: theme.background, borderColor: theme.border, color: theme.textPrimary, border: `1px solid ${theme.border}` }}
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 pointer-events-none" style={{ color: theme.textMuted }} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Skills-match criteria %</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.skill_criteria}
                onChange={(e) => setFormData({ ...formData, skill_criteria: Number(e.target.value) })}
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

          <div className="space-y-3">
            <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Assign Recruiters</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {users.map((recruiter) => {
                const isAssigned = formData.assigned_recruiter_ids?.includes(recruiter.id);
                return (
                  <div
                    key={recruiter.id}
                    onClick={() => toggleRecruiter(recruiter.id)}
                    className="rounded-lg p-3 cursor-pointer transition-all"
                    style={{
                      background: isAssigned ? theme.accentSoft : theme.background,
                      border: `1px solid ${isAssigned ? theme.accent : theme.border}`,
                    }}
                  >
                    <p className="text-sm font-medium" style={{ color: isAssigned ? theme.accent : theme.textPrimary }}>
                      {recruiter.first_name} {recruiter.last_name}
                    </p>
                    <p className="text-xs" style={{ color: isAssigned ? theme.accent + '90' : theme.textMuted }}>
                      {recruiter.email}
                    </p>
                  </div>
                );
              })}
              {users.length === 0 && (
                <p className="text-sm col-span-3 py-2" style={{ color: theme.textMuted }}>Loading users...</p>
              )}
            </div>
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
              ) : 'Save Position'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewPositionPage;
