import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { approvalActions } from '@/redux/actions';
import { setApplicationDetail, setDetailLoading, setError } from '@/redux/slices/approvalSlice';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { theme } from '@/config/theme';
import { 
  ArrowLeft, ExternalLink, Calendar, Mail, Phone, Briefcase, 
  FileText, MapPin, IndianRupee, MessageSquare, AlertTriangle, User 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ReviewActionModal } from './components/ReviewActionModal';

const ApprovalDetailPage = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isRecruiter } = useAuth();
  const { applicationDetail, detailLoading } = useAppSelector((state) => state.approvals);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'accepted' | 'rejected' | 'resubmit' | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchDetail = () => {
    if (applicationId) {
      dispatch({
        type: approvalActions.FETCH_APPLICATION_DETAIL,
        method: 'GET',
        endPoint: `/api/v1/candidates/applications/${applicationId}/`,
        auth: true,
        setLoading: (val: boolean) => dispatch(setDetailLoading(val)),
        getResponse: (data: any) => dispatch(setApplicationDetail(data)),
        getError: (err: any) => dispatch(setError(err.message)),
      });
    }
  };

  useEffect(() => {
    fetchDetail();
    
    return () => {
      dispatch(setApplicationDetail(null));
    };
  }, [dispatch, applicationId]);

  const handleActionClick = (type: 'accepted' | 'rejected' | 'resubmit') => {
    setActionType(type);
    setModalOpen(true);
  };

  const submitAction = (notes: string) => {
    if (!applicationId || !actionType) return;
    setSubmitting(true);
    
    dispatch({
      type: approvalActions.REVIEW_APPLICATION,
      method: 'POST',
      endPoint: `/api/v1/candidates/applications/${applicationId}/review/`,
      auth: true,
      body: {
        status: actionType,
        notes: notes
      },
      setLoading: (val: boolean) => {
         if(!val) setSubmitting(false); // Stop loading when done
      },
      getResponse: (data: any) => {
        setModalOpen(false);
        fetchDetail(); // Refresh detail
      },
      getError: (err: any) => {
        console.error("Action failed:", err);
      },
    });
  };

  if (detailLoading || !applicationDetail) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="size-8 border-2 border-t-transparent rounded-full animate-spin mb-4" style={{ borderColor: `${theme.border} transparent ${theme.border} ${theme.border}`, borderTopColor: theme.accent }}></div>
        <div className="text-sm font-medium" style={{ color: theme.textMuted }}>Loading details...</div>
      </div>
    );
  }

  const {
    job,
    candidate,
    submitted_by,
    manager_review_status,
    manager_review_notes,
    share_date,
    status,
    current_stage,
    created_at,
    updated_at,
    candidate_cv,
    dob,
    preferred_location,
    current_ctc,
    expected_ctc,
    offer_in_hand,
    notice_period,
    reason_for_change,
    feedback,
  } = applicationDetail;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/approvals')} style={{ borderColor: theme.border, color: theme.textSecondary }}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: theme.textPrimary }}>
            Application Details
          </h1>
          <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
            {candidate?.candidate_name} • {job?.title} {job?.client_name ? `(${job.client_name})` : ""}
          </p>
        </div>
        <div className="sm:ml-auto flex items-center gap-3">
           {!isRecruiter && manager_review_status?.toLowerCase() === 'pending' && (
              <>
                <Button variant="outline" onClick={() => handleActionClick('rejected')} style={{ borderColor: theme.destructive + '50', color: theme.destructive }}>
                  Reject
                </Button>
                <Button variant="outline" onClick={() => handleActionClick('resubmit')} style={{ borderColor: theme.warning + '50', color: theme.warning }}>
                  Re-Submission
                </Button>
                <Button onClick={() => handleActionClick('accepted')} style={{ background: theme.success, color: '#fff' }}>
                  Approve
                </Button>
              </>
           )}
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Candidate & Application */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Candidate Profile */}
          <Card style={{ background: theme.surface, borderColor: theme.border }}>
            <CardHeader className="pb-3 border-b" style={{ borderColor: theme.border }}>
              <CardTitle className="text-lg flex items-center justify-between" style={{ color: theme.textPrimary }}>
                Candidate Profile
                {candidate?.is_duplicate && (
                  <Badge variant="outline" className="text-[10px] gap-1" style={{ borderColor: theme.warning, color: theme.warning }}>
                    <AlertTriangle className="size-3" /> Duplicate Entry
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-5">
              <div className="flex items-center gap-4">
                 <div className="size-14 rounded-full flex items-center justify-center font-bold text-xl" style={{ background: theme.accentSoft, color: theme.accent }}>
                   {candidate?.candidate_name?.charAt(0)}
                 </div>
                 <div>
                   <p className="font-semibold text-xl" style={{ color: theme.textPrimary }}>{candidate?.candidate_name}</p>
                   <Badge variant="outline" className="text-[10px] uppercase mt-1.5" style={{ borderColor: theme.accent, color: theme.accent }}>
                      {candidate?.experience || "0 years"} Exp
                   </Badge>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="size-4 shrink-0" style={{ color: theme.textMuted }} />
                  <span style={{ color: theme.textSecondary }} className="truncate" title={candidate?.email}>{candidate?.email || "N/A"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="size-4 shrink-0" style={{ color: theme.textMuted }} />
                  <span style={{ color: theme.textSecondary }}>{candidate?.contact || "N/A"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Briefcase className="size-4 shrink-0" style={{ color: theme.textMuted }} />
                  <span style={{ color: theme.textSecondary }} className="truncate">
                     {candidate?.current_company || "N/A"} 
                     {candidate?.current_profile ? ` (${candidate.current_profile})` : ""}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <User className="size-4 shrink-0" style={{ color: theme.textMuted }} />
                  <span style={{ color: theme.textSecondary }}>
                     DOB: {dob ? new Date(dob).toLocaleDateString() : "N/A"}
                  </span>
                </div>
              </div>

              {candidate_cv && (
                 <div className="pt-2">
                   <Button variant="outline" className="w-full gap-2 justify-between" style={{ borderColor: theme.border, color: theme.textPrimary }} onClick={() => window.open(candidate_cv, '_blank')}>
                     <div className="flex items-center gap-2 truncate">
                       <FileText className="size-4 shrink-0" />
                       <span className="truncate">{candidate?.resume_file_name || "View Resume Document"}</span>
                     </div>
                     <ExternalLink className="size-3.5 opacity-50 shrink-0" />
                   </Button>
                 </div>
              )}
            </CardContent>
          </Card>

          {/* Salary & Expectations */}
          <Card style={{ background: theme.surface, borderColor: theme.border }}>
            <CardHeader className="pb-3 border-b" style={{ borderColor: theme.border }}>
              <CardTitle className="text-lg" style={{ color: theme.textPrimary }}>Expectations & Professional Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-5 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
               <div>
                  <p className="text-xs uppercase font-semibold mb-1" style={{ color: theme.textMuted }}>Current CTC</p>
                  <div className="flex items-center gap-2 text-sm font-medium" style={{ color: theme.textSecondary }}>
                    <IndianRupee className="size-4" style={{ color: theme.textMuted }} />
                    {current_ctc || "0.00"}
                  </div>
               </div>
               <div>
                  <p className="text-xs uppercase font-semibold mb-1" style={{ color: theme.textMuted }}>Expected CTC</p>
                  <div className="flex items-center gap-2 text-sm font-medium" style={{ color: theme.textSecondary }}>
                    <IndianRupee className="size-4" style={{ color: theme.textMuted }} />
                    {expected_ctc || "0.00"}
                  </div>
               </div>
               <div>
                  <p className="text-xs uppercase font-semibold mb-1" style={{ color: theme.textMuted }}>Notice Period</p>
                  <div className="flex items-center gap-2 text-sm font-medium" style={{ color: theme.textSecondary }}>
                    <Calendar className="size-4" style={{ color: theme.textMuted }} />
                    {notice_period || "N/A"}
                  </div>
               </div>
               <div>
                  <p className="text-xs uppercase font-semibold mb-1" style={{ color: theme.textMuted }}>Offer in Hand</p>
                  <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>{offer_in_hand || "N/A"}</p>
               </div>
               <div className="md:col-span-2">
                  <p className="text-xs uppercase font-semibold mb-1" style={{ color: theme.textMuted }}>Preferred Location</p>
                  <div className="flex items-center gap-2 text-sm font-medium" style={{ color: theme.textSecondary }}>
                    <MapPin className="size-4" style={{ color: theme.textMuted }} />
                    {preferred_location || "N/A"}
                  </div>
               </div>
               {reason_for_change && (
                 <div className="md:col-span-2">
                    <p className="text-xs uppercase font-semibold mb-1" style={{ color: theme.textMuted }}>Reason for Change</p>
                    <p className="text-sm p-3 rounded-md" style={{ background: theme.background, color: theme.textSecondary, border: `1px solid ${theme.border}` }}>
                      {reason_for_change}
                    </p>
                 </div>
               )}
            </CardContent>
          </Card>

        </div>

        {/* Right Column: Application Status & Meta */}
        <div className="space-y-6">
          <Card style={{ background: theme.surface, borderColor: theme.border }}>
            <CardHeader className="pb-3 border-b" style={{ borderColor: theme.border }}>
              <CardTitle className="text-lg" style={{ color: theme.textPrimary }}>Application Status</CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-6">
               <div>
                  <p className="text-xs uppercase font-semibold mb-1.5" style={{ color: theme.textMuted }}>Review Status</p>
                  <Badge className="capitalize text-xs px-3 py-1" style={{
                     background: manager_review_status === 'pending' ? theme.warningSoft : manager_review_status === 'approved' || manager_review_status === 'accepted' ? theme.successSoft : theme.destructive + '20',
                     color: manager_review_status === 'pending' ? theme.warning : manager_review_status === 'approved' || manager_review_status === 'accepted' ? theme.success : theme.destructive,
                     border: 0
                  }}>
                     {manager_review_status === 'accepted' ? 'approved' : manager_review_status || 'Pending'}
                  </Badge>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs uppercase font-semibold mb-1" style={{ color: theme.textMuted }}>Status / Stage</p>
                    <p className="text-sm font-medium capitalize" style={{ color: theme.textSecondary }}>{current_stage || status || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase font-semibold mb-1" style={{ color: theme.textMuted }}>Share Date</p>
                    <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                      {share_date ? new Date(share_date).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
               </div>

               <div>
                  <p className="text-xs uppercase font-semibold mb-1" style={{ color: theme.textMuted }}>Submitted By</p>
                  <div className="flex items-center gap-2">
                     <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>{submitted_by?.name || "N/A"}</p>
                     <Badge variant="outline" className="text-[9px] px-1 py-0 uppercase" style={{ borderColor: theme.borderStrong, color: theme.textMuted }}>
                       {submitted_by?.role}
                     </Badge>
                  </div>
               </div>

               {manager_review_notes && (
                 <div>
                    <p className="text-xs uppercase font-semibold mb-1" style={{ color: theme.textMuted }}>Manager Notes</p>
                    <div className="text-sm p-3 rounded-md flex items-start gap-2" style={{ background: theme.background, color: theme.textSecondary, border: `1px solid ${theme.border}` }}>
                      <MessageSquare className="size-4 shrink-0 mt-0.5" style={{ color: theme.textMuted }} />
                      <p>{manager_review_notes}</p>
                    </div>
                 </div>
               )}
               {feedback && (
                 <div>
                    <p className="text-xs uppercase font-semibold mb-1" style={{ color: theme.textMuted }}>Recruiter Feedback</p>
                    <div className="text-sm p-3 rounded-md flex items-start gap-2" style={{ background: theme.background, color: theme.textSecondary, border: `1px solid ${theme.border}` }}>
                      <MessageSquare className="size-4 shrink-0 mt-0.5" style={{ color: theme.textMuted }} />
                      <p>{feedback}</p>
                    </div>
                 </div>
               )}

               <div className="pt-4 border-t space-y-2" style={{ borderColor: theme.border }}>
                  <div className="flex justify-between text-xs">
                     <span style={{ color: theme.textMuted }}>Created At</span>
                     <span style={{ color: theme.textSecondary }}>{created_at ? new Date(created_at).toLocaleDateString() : "N/A"}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                     <span style={{ color: theme.textMuted }}>Last Updated</span>
                     <span style={{ color: theme.textSecondary }}>{updated_at ? new Date(updated_at).toLocaleDateString() : "N/A"}</span>
                  </div>
               </div>

            </CardContent>
          </Card>
        </div>

      </div>

      <ReviewActionModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onConfirm={submitAction} 
        actionType={actionType}
        loading={submitting}
      />
    </div>
  );
};

export default ApprovalDetailPage;
