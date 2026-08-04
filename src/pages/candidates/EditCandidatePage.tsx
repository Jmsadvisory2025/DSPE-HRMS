import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, X, Loader2, Save } from 'lucide-react';
import { theme } from '@/config/theme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { candidateActions } from '@/redux/actions';
import { setCandidateDetail, setCandidateDetailLoading, setError } from '@/redux/slices/candidateSlice';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

// Helper component for Array Inputs (Skills, Education, etc.)
const ArrayInput = ({ 
  label, 
  values, 
  onChange, 
  placeholder 
}: { 
  label: string, 
  values: string[], 
  onChange: (newVals: string[]) => void,
  placeholder?: string
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;
    onChange([...values, inputValue.trim()]);
    setInputValue('');
  };

  const handleRemove = (index: number) => {
    const newVals = [...values];
    newVals.splice(index, 1);
    onChange(newVals);
  };

  return (
    <div className="space-y-2">
      <Label style={{ color: theme.textPrimary }}>{label}</Label>
      <div className="flex items-center gap-2">
        <Input 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd(e);
          }}
          placeholder={placeholder || `Add ${label.toLowerCase()}...`}
          style={{ background: theme.surface, borderColor: theme.border, color: theme.textPrimary }}
        />
        <Button type="button" onClick={handleAdd} variant="outline" size="icon" className="shrink-0">
          <Plus className="size-4" />
        </Button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-col gap-2 mt-3 p-3 rounded-md border" style={{ background: theme.surfaceMuted, borderColor: theme.border }}>
          {values.map((val, idx) => (
            <div key={idx} className="flex items-start justify-between gap-2 p-2 rounded bg-black/20 text-sm">
              <span style={{ color: theme.textPrimary }} className="break-words">{val}</span>
              <Button type="button" variant="ghost" size="icon" className="size-6 shrink-0 text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => handleRemove(idx)}>
                <X className="size-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const EditCandidatePage = () => {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { candidateDetail, candidateDetailLoading } = useAppSelector(
    (state) => state.candidates
  );

  const [formData, setFormData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch candidate details if not already in state
  useEffect(() => {
    if (candidateId) {
      dispatch({
        type: candidateActions.FETCH_CANDIDATE_DETAIL,
        method: "GET",
        endPoint: `/api/v1/candidates/${candidateId}/`,
        auth: true,
        setLoading: (val: boolean) => dispatch(setCandidateDetailLoading(val)),
        getResponse: (data: any) => dispatch(setCandidateDetail(data)),
        getError: (err: any) => dispatch(setError(err.message)),
      });
    }
  }, [candidateId, dispatch]);

  // Sync state with detail
  useEffect(() => {
    if (candidateDetail) {
      setFormData({
        candidate_name: candidateDetail.candidate_name || '',
        profile_name: candidateDetail.profile_name || '',
        email: candidateDetail.email || '',
        contact: candidateDetail.contact || '',
        current_profile: candidateDetail.current_profile || '',
        current_company: candidateDetail.current_company || '',
        experience: candidateDetail.experience || '',
        current_location: candidateDetail.current_location || '',
        linkedin_url: candidateDetail.linkedin_url || '',
        portfolio_url: candidateDetail.portfolio_url || '',
        current_ctc: candidateDetail.current_ctc || '',
        expected_ctc: candidateDetail.expected_ctc || '',
        notice_period: candidateDetail.notice_period || '',
        hike: candidateDetail.hike || '',
        preferred_location: candidateDetail.preferred_location || '',
        offer_in_hand: candidateDetail.offer_in_hand || '',
        reason_for_change: candidateDetail.reason_for_change || '',
        dob: candidateDetail.dob || '',
        education: candidateDetail.education || [],
        skills: candidateDetail.skills || [],
        certifications: candidateDetail.certifications || [],
        experience_details: candidateDetail.experience_details || [],
        tags: candidateDetail.tags || [],
        is_duplicate: !!candidateDetail.is_duplicate,
      });
    }
  }, [candidateDetail]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    dispatch({
      type: candidateActions.UPDATE_CANDIDATE,
      method: "PATCH",
      endPoint: `/api/v1/candidates/${candidateId}/`,
      body: formData,
      auth: true,
      showSuccessMessage: true,
      setLoading: (val: boolean) => setIsSubmitting(val),
      getResponse: () => {
        toast.success("Candidate updated successfully.");
        navigate(`/candidates/${candidateId}`);
      }
    });
  };

  if (candidateDetailLoading || !formData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="size-10 animate-spin" style={{ color: theme.accent }} />
        <p className="text-sm font-medium" style={{ color: theme.textMuted }}>Loading form...</p>
      </div>
    );
  }

  const containerVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <motion.div 
      className="space-y-6 pb-12 max-w-4xl mx-auto"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate(`/candidates/${candidateId}`)}
            className="shrink-0"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: theme.textPrimary }}>
              Edit Candidate
            </h1>
            <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
              Update profile details for {candidateDetail.candidate_name || "Unknown"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="p-6 rounded-2xl border shadow-sm space-y-6" style={{ background: theme.surface, borderColor: theme.border }}>
          <h3 className="text-lg font-bold border-b pb-3" style={{ color: theme.textPrimary, borderColor: theme.border }}>Basic Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label style={{ color: theme.textPrimary }}>Candidate Name</Label>
              <Input 
                value={formData.candidate_name} 
                onChange={e => handleInputChange('candidate_name', e.target.value)}
                style={{ background: theme.surface, borderColor: theme.border, color: theme.textPrimary }}
              />
            </div>
            <div className="space-y-2">
              <Label style={{ color: theme.textPrimary }}>Profile Name</Label>
              <Input 
                value={formData.profile_name} 
                onChange={e => handleInputChange('profile_name', e.target.value)}
                style={{ background: theme.surface, borderColor: theme.border, color: theme.textPrimary }}
              />
            </div>
            <div className="space-y-2">
              <Label style={{ color: theme.textPrimary }}>Email</Label>
              <Input 
                type="email"
                value={formData.email} 
                onChange={e => handleInputChange('email', e.target.value)}
                style={{ background: theme.surface, borderColor: theme.border, color: theme.textPrimary }}
              />
            </div>
            <div className="space-y-2">
              <Label style={{ color: theme.textPrimary }}>Contact</Label>
              <Input 
                value={formData.contact} 
                onChange={e => handleInputChange('contact', e.target.value)}
                style={{ background: theme.surface, borderColor: theme.border, color: theme.textPrimary }}
              />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl border shadow-sm space-y-6" style={{ background: theme.surface, borderColor: theme.border }}>
          <h3 className="text-lg font-bold border-b pb-3" style={{ color: theme.textPrimary, borderColor: theme.border }}>Professional Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label style={{ color: theme.textPrimary }}>Current Profile / Role</Label>
              <Input 
                value={formData.current_profile} 
                onChange={e => handleInputChange('current_profile', e.target.value)}
                style={{ background: theme.surface, borderColor: theme.border, color: theme.textPrimary }}
              />
            </div>
            <div className="space-y-2">
              <Label style={{ color: theme.textPrimary }}>Current Company</Label>
              <Input 
                value={formData.current_company} 
                onChange={e => handleInputChange('current_company', e.target.value)}
                style={{ background: theme.surface, borderColor: theme.border, color: theme.textPrimary }}
              />
            </div>
            <div className="space-y-2">
              <Label style={{ color: theme.textPrimary }}>Experience (e.g. 6.5 years)</Label>
              <Input 
                value={formData.experience} 
                onChange={e => handleInputChange('experience', e.target.value)}
                style={{ background: theme.surface, borderColor: theme.border, color: theme.textPrimary }}
              />
            </div>
            <div className="space-y-2">
              <Label style={{ color: theme.textPrimary }}>Current Location</Label>
              <Input 
                value={formData.current_location} 
                onChange={e => handleInputChange('current_location', e.target.value)}
                style={{ background: theme.surface, borderColor: theme.border, color: theme.textPrimary }}
              />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl border shadow-sm space-y-6" style={{ background: theme.surface, borderColor: theme.border }}>
          <h3 className="text-lg font-bold border-b pb-3" style={{ color: theme.textPrimary, borderColor: theme.border }}>Links & Socials</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label style={{ color: theme.textPrimary }}>LinkedIn URL</Label>
              <Input 
                value={formData.linkedin_url} 
                onChange={e => handleInputChange('linkedin_url', e.target.value)}
                style={{ background: theme.surface, borderColor: theme.border, color: theme.textPrimary }}
              />
            </div>
            <div className="space-y-2">
              <Label style={{ color: theme.textPrimary }}>Portfolio URL</Label>
              <Input 
                value={formData.portfolio_url} 
                onChange={e => handleInputChange('portfolio_url', e.target.value)}
                style={{ background: theme.surface, borderColor: theme.border, color: theme.textPrimary }}
              />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl border shadow-sm space-y-6" style={{ background: theme.surface, borderColor: theme.border }}>
          <h3 className="text-lg font-bold border-b pb-3" style={{ color: theme.textPrimary, borderColor: theme.border }}>Compensation & Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label style={{ color: theme.textPrimary }}>Current CTC</Label>
              <Input 
                value={formData.current_ctc} 
                onChange={e => handleInputChange('current_ctc', e.target.value)}
                style={{ background: theme.surface, borderColor: theme.border, color: theme.textPrimary }}
              />
            </div>
            <div className="space-y-2">
              <Label style={{ color: theme.textPrimary }}>Expected CTC</Label>
              <Input 
                value={formData.expected_ctc} 
                onChange={e => handleInputChange('expected_ctc', e.target.value)}
                style={{ background: theme.surface, borderColor: theme.border, color: theme.textPrimary }}
              />
            </div>
            <div className="space-y-2">
              <Label style={{ color: theme.textPrimary }}>Hike</Label>
              <Input 
                value={formData.hike} 
                onChange={e => handleInputChange('hike', e.target.value)}
                style={{ background: theme.surface, borderColor: theme.border, color: theme.textPrimary }}
              />
            </div>
            <div className="space-y-2">
              <Label style={{ color: theme.textPrimary }}>Notice Period</Label>
              <Input 
                value={formData.notice_period} 
                onChange={e => handleInputChange('notice_period', e.target.value)}
                style={{ background: theme.surface, borderColor: theme.border, color: theme.textPrimary }}
              />
            </div>
            <div className="space-y-2">
              <Label style={{ color: theme.textPrimary }}>Offer in Hand</Label>
              <Input 
                value={formData.offer_in_hand} 
                onChange={e => handleInputChange('offer_in_hand', e.target.value)}
                style={{ background: theme.surface, borderColor: theme.border, color: theme.textPrimary }}
              />
            </div>
            <div className="space-y-2">
              <Label style={{ color: theme.textPrimary }}>Preferred Location</Label>
              <Input 
                value={formData.preferred_location} 
                onChange={e => handleInputChange('preferred_location', e.target.value)}
                style={{ background: theme.surface, borderColor: theme.border, color: theme.textPrimary }}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label style={{ color: theme.textPrimary }}>Reason for Change</Label>
              <Input 
                value={formData.reason_for_change} 
                onChange={e => handleInputChange('reason_for_change', e.target.value)}
                style={{ background: theme.surface, borderColor: theme.border, color: theme.textPrimary }}
              />
            </div>
            <div className="space-y-2">
              <Label style={{ color: theme.textPrimary }}>Date of Birth</Label>
              <Input 
                type="date"
                value={formData.dob} 
                onChange={e => handleInputChange('dob', e.target.value)}
                style={{ background: theme.surface, borderColor: theme.border, color: theme.textPrimary }}
              />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl border shadow-sm space-y-6" style={{ background: theme.surface, borderColor: theme.border }}>
          <h3 className="text-lg font-bold border-b pb-3" style={{ color: theme.textPrimary, borderColor: theme.border }}>Detailed Background (Arrays)</h3>
          <div className="grid grid-cols-1 gap-8">
            <ArrayInput 
              label="Skills" 
              values={formData.skills} 
              onChange={vals => handleInputChange('skills', vals)} 
              placeholder="e.g. Python, Django, AWS..."
            />
            <ArrayInput 
              label="Education" 
              values={formData.education} 
              onChange={vals => handleInputChange('education', vals)} 
            />
            <ArrayInput 
              label="Certifications" 
              values={formData.certifications} 
              onChange={vals => handleInputChange('certifications', vals)} 
            />
            <ArrayInput 
              label="Experience Details" 
              values={formData.experience_details} 
              onChange={vals => handleInputChange('experience_details', vals)} 
            />
            <ArrayInput 
              label="Tags" 
              values={formData.tags} 
              onChange={vals => handleInputChange('tags', vals)} 
              placeholder="e.g. backend, senior..."
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input 
            type="checkbox" 
            id="is_duplicate"
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
            checked={formData.is_duplicate}
            onChange={(e) => handleInputChange('is_duplicate', e.target.checked)}
          />
          <Label htmlFor="is_duplicate" className="cursor-pointer" style={{ color: theme.textPrimary }}>
            Flag as Duplicate Profile
          </Label>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate(`/candidates/${candidateId}`)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="gap-2"
            style={{ background: theme.accent, color: theme.accentForeground }}
          >
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save Changes
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default EditCandidatePage;
