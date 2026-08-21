import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, MapPin, Building2, User, FileText, 
  Mail, Phone, Globe, Link as LinkIcon, 
  Briefcase, GraduationCap, Calendar, Download, Loader2, CheckCircle2, Edit,
  Clock, Video, MapPinned, UserCheck, CalendarClock, History, Award, MonitorPlay, Building, Shield, Send
} from 'lucide-react';
import { theme } from '@/config/theme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { candidateActions } from '@/redux/actions';
import { setCandidateDetail, setCandidateDetailLoading, setError } from '@/redux/slices/candidateSlice';
import { motion } from 'framer-motion';
import { SubmitCandidateModal } from './components/SubmitCandidateModal';

const CandidateDetailPage = () => {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { candidateDetail: candidate, candidateDetailLoading: loading } = useAppSelector(
    (state) => state.candidates
  );

  const [submitModalOpen, setSubmitModalOpen] = useState(false);

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="size-10 animate-spin" style={{ color: theme.accent }} />
        <p className="text-sm font-medium" style={{ color: theme.textMuted }}>Loading Candidate Profile...</p>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h2 className="text-2xl font-bold" style={{ color: theme.textPrimary }}>Candidate Not Found</h2>
        <Button onClick={() => navigate('/candidates')} variant="outline">
          <ArrowLeft className="mr-2 size-4" /> Back to Candidates
        </Button>
      </div>
    );
  }

  // Animation variants
  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <motion.div 
      className="space-y-8 pb-12 max-w-6xl mx-auto"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* ── Header Section (Glassmorphism inspired) ─────────────────────────── */}
      <motion.div 
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl p-8 border backdrop-blur-xl"
        style={{ 
          background: `linear-gradient(135deg, ${theme.surface}E6 0%, ${theme.surfaceMuted}E6 100%)`, 
          borderColor: theme.border,
          boxShadow: `0 8px 32px 0 ${theme.border}40`
        }}
      >
        <div className="absolute top-0 right-0 p-32 opacity-10 blur-3xl pointer-events-none rounded-full" 
             style={{ background: `radial-gradient(circle, ${theme.accent} 0%, transparent 70%)` }} />
             
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 z-10">
          <div className="flex items-start gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate('/candidates')} 
              className="shrink-0 rounded-full mt-1 border-white/10 hover:bg-white/5"
              style={{ color: theme.textPrimary }}
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight mb-2" style={{ color: theme.textPrimary }}>
                {candidate.candidate_name || candidate.profile_name || "Unknown Candidate"}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: theme.accent + '20', color: theme.accent }}>
                  <Briefcase className="size-3.5" />
                  {candidate.current_profile || "Profile not specified"}
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: theme.surfaceHover, color: theme.textSecondary }}>
                  <Building2 className="size-3.5" />
                  {candidate.current_company || "Company not specified"}
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: theme.surfaceHover, color: theme.textSecondary }}>
                  <MapPin className="size-3.5" />
                  {candidate.current_location || "Location not specified"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <Button 
              className="flex-1 md:flex-none gap-2 rounded-full shadow-sm hover:shadow-md transition-all"
              style={{ background: theme.accent, color: theme.accentForeground }}
              onClick={() => setSubmitModalOpen(true)}
            >
              <Send className="size-4" />
              Submit Candidate
            </Button>
            <Button 
              variant="outline"
              className="flex-1 md:flex-none gap-2 rounded-full border-white/10 hover:bg-white/5"
              onClick={() => navigate(`/candidates/${candidateId}/edit`)}
            >
              <Edit className="size-4" />
              Edit Profile
            </Button>
            {candidate.resume && (
              <div className="flex flex-col items-start gap-1">
                <Button 
                  variant="outline"
                  className="flex-1 md:flex-none gap-2 rounded-full border-white/10 hover:bg-white/5"
                  onClick={() => window.open(candidate.resume, '_blank')}
                >
                  <FileText className="size-4" />
                  View Resume
                </Button>
                {candidate.resume_file_name && (
                  <span className="text-[11px] font-medium pl-1 max-w-[200px] truncate" style={{ color: theme.textMuted }}>
                    {candidate.resume_file_name}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left Column: Main Details ────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Professional Summary & Skills */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h3 className="text-xl font-bold border-b pb-2" style={{ color: theme.textPrimary, borderColor: theme.border }}>
              Professional Profile
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border" style={{ background: theme.surfaceMuted, borderColor: theme.border }}>
                <p className="text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: theme.textMuted }}>Experience</p>
                <p className="text-lg font-bold" style={{ color: theme.textPrimary }}>{candidate.experience || "N/A"}</p>
              </div>
              <div className="p-4 rounded-xl border" style={{ background: theme.surfaceMuted, borderColor: theme.border }}>
                <p className="text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: theme.textMuted }}>Status</p>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-4" style={{ color: theme.success }} />
                  <p className="text-sm font-bold" style={{ color: theme.success }}>Active</p>
                </div>
              </div>
              {candidate.is_duplicate && (
                 <div className="p-4 rounded-xl border col-span-2 md:col-span-2" style={{ background: theme.warningSoft, borderColor: theme.warning + '40' }}>
                   <p className="text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: theme.warning }}>Notice</p>
                   <p className="text-sm font-medium" style={{ color: theme.warning }}>Flagged as Duplicate Profile</p>
                 </div>
              )}
            </div>

            <div className="pt-4">
              <h4 className="text-sm font-bold mb-3" style={{ color: theme.textSecondary }}>Top Skills</h4>
              {candidate.skills && candidate.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill: string, index: number) => (
                    <Badge 
                      key={index} 
                      variant="secondary"
                      className="px-3 py-1.5 text-xs font-medium rounded-md hover:scale-105 transition-transform"
                      style={{ 
                        background: theme.surfaceHover, 
                        color: theme.textPrimary,
                        border: `1px solid ${theme.border}`
                      }}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm italic" style={{ color: theme.textMuted }}>No skills specified</p>
              )}
            </div>

            <div className="pt-4">
              <h4 className="text-sm font-bold mb-3" style={{ color: theme.textSecondary }}>Tags</h4>
              {candidate.tags && candidate.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {candidate.tags.map((tag: string, index: number) => (
                    <Badge 
                      key={index} 
                      className="px-3 py-1.5 text-xs font-medium rounded-md hover:scale-105 transition-transform"
                      style={{ 
                        background: theme.accent + '20', 
                        color: theme.accent,
                        border: `1px solid ${theme.accent}40`
                      }}
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm italic" style={{ color: theme.textMuted }}>No tags specified</p>
              )}
            </div>
          </motion.div>

          {/* Compensation & Preferences */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h3 className="text-xl font-bold border-b pb-2" style={{ color: theme.textPrimary, borderColor: theme.border }}>
              Compensation & Preferences
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-5 rounded-xl border shadow-sm" style={{ background: theme.surface, borderColor: theme.border }}>
              <div>
                <p className="text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: theme.textMuted }}>Current CTC</p>
                <p className="text-sm font-bold" style={{ color: theme.textPrimary }}>{candidate.current_ctc && candidate.current_ctc !== "0.00" ? candidate.current_ctc : "Not specified"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: theme.textMuted }}>Expected CTC</p>
                <p className="text-sm font-bold" style={{ color: theme.textPrimary }}>{candidate.expected_ctc && candidate.expected_ctc !== "0.00" ? candidate.expected_ctc : "Not specified"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: theme.textMuted }}>Notice Period</p>
                <p className="text-sm font-bold" style={{ color: theme.textPrimary }}>{candidate.notice_period || "Not specified"}</p>
              </div>
            </div>
          </motion.div>

          {/* Experience Timeline */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h3 className="text-xl font-bold border-b pb-2 flex items-center gap-2" style={{ color: theme.textPrimary, borderColor: theme.border }}>
              <Briefcase className="size-5" style={{ color: theme.accent }}/> Experience
            </h3>
            {candidate.experience_details && candidate.experience_details.length > 0 ? (
              <div className="space-y-4 pl-2">
                {candidate.experience_details.map((exp: string, index: number) => (
                  <div key={index} className="relative pl-6 border-l-2" style={{ borderColor: theme.border }}>
                    <div className="absolute w-3 h-3 rounded-full -left-[7px] top-1.5" style={{ background: theme.accent }} />
                    <p className="text-sm font-medium leading-relaxed" style={{ color: theme.textPrimary }}>
                      {exp}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm italic pl-2" style={{ color: theme.textMuted }}>No experience details specified</p>
            )}
          </motion.div>

          {/* Education Timeline */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h3 className="text-xl font-bold border-b pb-2 flex items-center gap-2" style={{ color: theme.textPrimary, borderColor: theme.border }}>
              <GraduationCap className="size-5" style={{ color: theme.accent }}/> Education
            </h3>
            {candidate.education && candidate.education.length > 0 ? (
              <div className="space-y-4 pl-2">
                {candidate.education.map((edu: string, index: number) => (
                  <div key={index} className="relative pl-6 border-l-2" style={{ borderColor: theme.border }}>
                    <div className="absolute w-3 h-3 rounded-full -left-[7px] top-1.5" style={{ background: theme.accent }} />
                    <p className="text-sm font-medium leading-relaxed" style={{ color: theme.textPrimary }}>
                      {edu}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm italic pl-2" style={{ color: theme.textMuted }}>No education details specified</p>
            )}
          </motion.div>
          
           {/* Certifications */}
           <motion.div variants={itemVariants} className="space-y-6">
             <h3 className="text-xl font-bold border-b pb-2" style={{ color: theme.textPrimary, borderColor: theme.border }}>
               Certifications
             </h3>
             {candidate.certifications && candidate.certifications.length > 0 ? (
               <ul className="list-disc pl-5 space-y-2">
                 {candidate.certifications.map((cert: string, index: number) => (
                   <li key={index} className="text-sm font-medium" style={{ color: theme.textSecondary }}>{cert}</li>
                 ))}
               </ul>
             ) : (
               <p className="text-sm italic" style={{ color: theme.textMuted }}>No certifications specified</p>
             )}
           </motion.div>

           {/* Applications */}
           {candidate.applications && candidate.applications.length > 0 && (
             <motion.div variants={itemVariants} className="space-y-6">
               <h3 className="text-xl font-bold border-b pb-2 flex items-center gap-2" style={{ color: theme.textPrimary, borderColor: theme.border }}>
                 <FileText className="size-5" style={{ color: theme.accent }}/> Applications ({candidate.applications.length})
               </h3>
               <div className="grid gap-4">
                 {candidate.applications.map((app: any, index: number) => (
                   <div key={app.id || index} className="p-5 rounded-xl border shadow-sm transition-all hover:shadow-md" style={{ background: theme.surface, borderColor: theme.border }}>
                     <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3">
                       <div>
                         <h4 className="font-bold text-lg" style={{ color: theme.textPrimary }}>{app.job_title}</h4>
                         <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                           <p className="text-xs font-medium" style={{ color: theme.textMuted }}>
                             Submitted by {app.submitted_by?.name || "System"} on {new Date(app.created_at).toLocaleDateString()}
                           </p>
                           {app.share_date && (
                             <p className="text-xs font-medium flex items-center gap-1" style={{ color: theme.textMuted }}>
                               <CalendarClock className="size-3" /> Shared: {new Date(app.share_date).toLocaleDateString()}
                             </p>
                           )}
                         </div>
                       </div>
                       <div className="flex items-center gap-2">
                         {app.stage_name && (
                           <Badge className="px-2.5 py-1 font-semibold text-[10px]" style={{ background: theme.accent + '15', color: theme.accent, border: `1px solid ${theme.accent}30` }}>
                             {app.stage_name}
                           </Badge>
                         )}
                         <Badge variant="outline" className="px-3 py-1 font-semibold uppercase tracking-wider text-[10px]" style={{ background: theme.surfaceMuted, borderColor: theme.border, color: theme.textSecondary }}>
                           {app.status?.replace(/-/g, ' ')}
                         </Badge>
                       </div>
                     </div>

                     {/* Interview Schedule */}
                     {app.interview_schedule && (
                       <div className="mt-4 p-4 rounded-xl border" style={{ background: theme.accentSoft, borderColor: theme.accent + '30' }}>
                         <div className="flex items-center gap-2 mb-3">
                           <CalendarClock className="size-4" style={{ color: theme.accent }} />
                           <span className="text-sm font-bold" style={{ color: theme.accent }}>Interview Scheduled</span>
                         </div>
                         <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                           <div>
                             <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: theme.textMuted }}>Date</p>
                             <p className="text-sm font-bold" style={{ color: theme.textPrimary }}>
                               {new Date(app.interview_schedule.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                             </p>
                           </div>
                           <div>
                             <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: theme.textMuted }}>Time</p>
                             <p className="text-sm font-bold flex items-center gap-1" style={{ color: theme.textPrimary }}>
                               <Clock className="size-3" />
                               {app.interview_schedule.time?.slice(0, 5)}
                             </p>
                           </div>
                           <div>
                             <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: theme.textMuted }}>Mode</p>
                             <p className="text-sm font-bold flex items-center gap-1 capitalize" style={{ color: theme.textPrimary }}>
                               {app.interview_schedule.mode === 'online' ? <Video className="size-3" /> : <Building2 className="size-3" />}
                               {app.interview_schedule.mode}
                             </p>
                           </div>
                           <div>
                             <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: theme.textMuted }}>Interviewer</p>
                             <p className="text-sm font-bold" style={{ color: theme.textPrimary }}>{app.interview_schedule.interviewer_name}</p>
                           </div>
                         </div>
                         <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t" style={{ borderColor: theme.accent + '20' }}>
                           {app.interview_schedule.manager_approval_status && (
                             <Badge className="text-[10px] font-semibold px-2.5 py-1" style={{
                               background: app.interview_schedule.manager_approval_status === 'approved' ? theme.successSoft : theme.warningSoft,
                               color: app.interview_schedule.manager_approval_status === 'approved' ? theme.success : theme.warning,
                               border: `1px solid ${app.interview_schedule.manager_approval_status === 'approved' ? theme.success : theme.warning}30`
                             }}>
                               <Shield className="size-3 mr-1" />
                               {app.interview_schedule.manager_approval_status}
                             </Badge>
                           )}
                           {app.interview_schedule.attendance_status && (
                             <Badge className="text-[10px] font-semibold px-2.5 py-1" style={{
                               background: app.interview_schedule.attendance_status === 'attended' ? theme.successSoft : app.interview_schedule.attendance_status === 'absent' ? theme.destructiveSoft : theme.surfaceMuted,
                               color: app.interview_schedule.attendance_status === 'attended' ? theme.success : app.interview_schedule.attendance_status === 'absent' ? theme.destructive : theme.textMuted,
                               border: `1px solid ${app.interview_schedule.attendance_status === 'attended' ? theme.success : app.interview_schedule.attendance_status === 'absent' ? theme.destructive : theme.border}30`
                             }}>
                               <UserCheck className="size-3 mr-1" />
                               {app.interview_schedule.attendance_status}
                             </Badge>
                           )}
                         </div>
                         {app.interview_schedule.notes && (
                           <p className="text-xs mt-2 italic" style={{ color: theme.textMuted }}>
                             Note: {app.interview_schedule.notes}
                           </p>
                         )}
                       </div>
                     )}

                     {/* Manager Review */}
                     {app.manager_review_status && app.manager_review_status !== 'pending' && (
                       <div className="mt-4 p-3 rounded-lg border" style={{ background: theme.surfaceMuted, borderColor: theme.border }}>
                         <div className="flex items-center gap-2 mb-1.5">
                           <span className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.textMuted }}>Manager Review:</span>
                           <span className="text-sm font-bold capitalize" style={{ color: app.manager_review_status === 'accepted' ? theme.success : app.manager_review_status === 'rejected' ? theme.destructive : theme.warning }}>
                             {app.manager_review_status}
                           </span>
                         </div>
                         {app.manager_review_notes && (
                           <p className="text-sm italic" style={{ color: theme.textSecondary }}>"{app.manager_review_notes}"</p>
                         )}
                       </div>
                     )}

                     {/* Application-specific CV */}
                     {app.candidate_cv && (
                       <div className="mt-3 flex items-center">
                         <a
                           href={app.candidate_cv}
                           target="_blank"
                           rel="noreferrer"
                           className="text-xs font-medium flex items-center gap-1.5 hover:underline"
                           style={{ color: theme.accent }}
                         >
                           <Download className="size-3" /> Download Application CV
                         </a>
                       </div>
                     )}
                   </div>
                 ))}
               </div>
             </motion.div>
           )}

           {/* Past Jobs */}
           {candidate.past_jobs && candidate.past_jobs.length > 0 && (
             <motion.div variants={itemVariants} className="space-y-6">
               <h3 className="text-xl font-bold border-b pb-2 flex items-center gap-2" style={{ color: theme.textPrimary, borderColor: theme.border }}>
                 <History className="size-5" style={{ color: theme.accent }}/> Past Jobs ({candidate.past_jobs.length})
               </h3>
               <div className="grid gap-4">
                 {candidate.past_jobs.map((job: any, index: number) => (
                   <div key={job.application_id || index} className="p-5 rounded-xl border shadow-sm" style={{ background: theme.surface, borderColor: theme.border }}>
                     <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3">
                       <div>
                         <h4 className="font-bold text-base" style={{ color: theme.textPrimary }}>{job.job_title}</h4>
                         <div className="flex flex-wrap items-center gap-2 mt-1">
                           <span className="text-xs font-medium flex items-center gap-1" style={{ color: theme.textSecondary }}>
                             <Building className="size-3" /> {job.company_name}
                           </span>
                           {job.job_location && (
                             <span className="text-xs font-medium flex items-center gap-1" style={{ color: theme.textMuted }}>
                               <MapPin className="size-3" /> {job.job_location}
                             </span>
                           )}
                           {job.job_mode && (
                             <Badge className="text-[10px] font-medium px-2 py-0.5 capitalize" style={{ background: theme.surfaceHover, color: theme.textSecondary, border: `1px solid ${theme.border}` }}>
                               {job.job_mode === 'online' ? <Video className="size-3 mr-1" /> : <MonitorPlay className="size-3 mr-1" />}
                               {job.job_mode}
                             </Badge>
                           )}
                         </div>
                       </div>
                       <Badge variant="outline" className="px-3 py-1 font-semibold uppercase tracking-wider text-[10px]" style={{ background: theme.surfaceMuted, borderColor: theme.border, color: theme.textSecondary }}>
                         {job.status?.replace(/-/g, ' ')}
                       </Badge>
                     </div>
                     <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t" style={{ borderColor: theme.border }}>
                       {job.recruiter_name && (
                         <div>
                           <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: theme.textMuted }}>Recruiter</p>
                           <p className="text-xs font-bold" style={{ color: theme.textPrimary }}>{job.recruiter_name}</p>
                         </div>
                       )}
                       {job.manager_name && (
                         <div>
                           <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: theme.textMuted }}>Manager</p>
                           <p className="text-xs font-bold" style={{ color: theme.textPrimary }}>{job.manager_name}</p>
                         </div>
                       )}
                       {job.stage && (
                         <div>
                           <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: theme.textMuted }}>Stage</p>
                           <p className="text-xs font-bold" style={{ color: theme.textPrimary }}>{job.stage}</p>
                         </div>
                       )}
                       {job.manager_review_status && (
                         <div>
                           <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: theme.textMuted }}>Review</p>
                           <p className="text-xs font-bold capitalize" style={{ color: job.manager_review_status === 'accepted' ? theme.success : job.manager_review_status === 'rejected' ? theme.destructive : theme.warning }}>
                             {job.manager_review_status}
                           </p>
                         </div>
                       )}
                     </div>
                     {job.manager_review_notes && (
                       <p className="text-xs italic mt-2" style={{ color: theme.textMuted }}>"{job.manager_review_notes}"</p>
                     )}
                     <p className="text-[10px] mt-3" style={{ color: theme.textMuted }}>
                       Applied: {new Date(job.created_at).toLocaleDateString()} · Updated: {new Date(job.updated_at).toLocaleDateString()}
                     </p>
                   </div>
                 ))}
               </div>
             </motion.div>
           )}
        </div>

        {/* ── Right Column: Contact & Meta ─────────────────────────────────── */}
        <div className="space-y-6">
          <motion.div 
            variants={itemVariants}
            className="rounded-2xl p-6 border shadow-sm"
            style={{ background: theme.surface, borderColor: theme.border }}
          >
            <h3 className="text-base font-bold mb-5" style={{ color: theme.textPrimary }}>Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ background: theme.surfaceMuted }}>
                  <Mail className="size-4" style={{ color: theme.textSecondary }} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: theme.textMuted }}>Email</p>
                  <p className="text-sm font-medium truncate" style={{ color: theme.textPrimary }}>{candidate.email || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ background: theme.surfaceMuted }}>
                  <Phone className="size-4" style={{ color: theme.textSecondary }} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: theme.textMuted }}>Phone</p>
                  <p className="text-sm font-medium" style={{ color: theme.textPrimary }}>{candidate.contact || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ background: theme.surfaceMuted }}>
                  <Globe className="size-4" style={{ color: theme.textSecondary }} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: theme.textMuted }}>LinkedIn</p>
                  {candidate.linkedin_url ? (
                    <a href={candidate.linkedin_url.startsWith('http') ? candidate.linkedin_url : `https://${candidate.linkedin_url}`} target="_blank" rel="noreferrer" className="text-sm font-medium truncate hover:underline" style={{ color: theme.accent }}>
                      View Profile
                    </a>
                  ) : (
                    <p className="text-sm font-medium" style={{ color: theme.textMuted }}>Not specified</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ background: theme.surfaceMuted }}>
                  <LinkIcon className="size-4" style={{ color: theme.textSecondary }} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: theme.textMuted }}>Portfolio</p>
                  {candidate.portfolio_url ? (
                    <a href={candidate.portfolio_url.startsWith('http') ? candidate.portfolio_url : `https://${candidate.portfolio_url}`} target="_blank" rel="noreferrer" className="text-sm font-medium truncate hover:underline" style={{ color: theme.accent }}>
                      View Website
                    </a>
                  ) : (
                    <p className="text-sm font-medium" style={{ color: theme.textMuted }}>Not specified</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="rounded-2xl p-6 border shadow-sm space-y-4"
            style={{ background: theme.surfaceMuted, borderColor: theme.border }}
          >
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: theme.textMuted }}>Added to System</p>
              <div className="flex items-center gap-2">
                <Calendar className="size-4" style={{ color: theme.textSecondary }} />
                <span className="text-sm font-medium" style={{ color: theme.textPrimary }}>
                  {new Date(candidate.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>

            {candidate.updated_at && (
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: theme.textMuted }}>Last Updated</p>
                <div className="flex items-center gap-2">
                  <History className="size-4" style={{ color: theme.textSecondary }} />
                  <span className="text-sm font-medium" style={{ color: theme.textPrimary }}>
                    {new Date(candidate.updated_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
              </div>
            )}
            
            {candidate.uploaded_by && (
              <div className="pt-3 border-t" style={{ borderColor: theme.border }}>
                <p className="text-xs font-semibold mb-2" style={{ color: theme.textMuted }}>Sourced By</p>
                <div className="flex items-center gap-3">
                  {candidate.uploaded_by.avatar ? (
                    <img 
                      src={candidate.uploaded_by.avatar} 
                      alt={candidate.uploaded_by.name} 
                      className="w-9 h-9 rounded-full object-cover border-2"
                      style={{ borderColor: theme.accent + '40' }}
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs" style={{ background: theme.accent + '20', color: theme.accent }}>
                      {candidate.uploaded_by.name?.charAt(0) || <User className="size-4"/>}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium" style={{ color: theme.textPrimary }}>{candidate.uploaded_by.name}</p>
                    <p className="text-xs" style={{ color: theme.textMuted }}>{candidate.uploaded_by.email}</p>
                    {candidate.uploaded_by.role && (
                      <Badge className="mt-1 text-[10px] font-semibold px-2 py-0.5 capitalize" style={{ background: theme.accent + '15', color: theme.accent, border: `1px solid ${theme.accent}30` }}>
                        {candidate.uploaded_by.role}
                      </Badge>
                    )}
                  </div>
                </div>
                {candidate.uploaded_by.organization && (
                  <div className="flex items-center gap-2 mt-3 pt-2 border-t" style={{ borderColor: theme.border }}>
                    <Building className="size-3.5" style={{ color: theme.textMuted }} />
                    <span className="text-xs font-medium" style={{ color: theme.textSecondary }}>
                      {candidate.uploaded_by.organization.name}
                    </span>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <SubmitCandidateModal 
         isOpen={submitModalOpen} 
         onClose={() => setSubmitModalOpen(false)} 
         candidateId={candidateId || null} 
      />
    </motion.div>
  );
};

export default CandidateDetailPage;
