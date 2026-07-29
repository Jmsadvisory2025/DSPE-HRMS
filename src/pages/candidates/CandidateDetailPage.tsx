import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, MapPin, Building2, User, FileText, 
  Mail, Phone, Globe, Link as LinkIcon, 
  Briefcase, GraduationCap, Calendar, Download, Loader2, CheckCircle2, Edit
} from 'lucide-react';
import { theme } from '@/config/theme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { candidateActions } from '@/redux/actions';
import { setCandidateDetail, setCandidateDetailLoading, setError } from '@/redux/slices/candidateSlice';
import { motion } from 'framer-motion';

const CandidateDetailPage = () => {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { candidateDetail: candidate, candidateDetailLoading: loading } = useAppSelector(
    (state) => state.candidates
  );

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
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
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
                {candidate.current_profile && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: theme.accent + '20', color: theme.accent }}>
                    <Briefcase className="size-3.5" />
                    {candidate.current_profile}
                  </span>
                )}
                {candidate.current_company && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: theme.surfaceHover, color: theme.textSecondary }}>
                    <Building2 className="size-3.5" />
                    {candidate.current_company}
                  </span>
                )}
                {candidate.current_location && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: theme.surfaceHover, color: theme.textSecondary }}>
                    <MapPin className="size-3.5" />
                    {candidate.current_location}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <Button 
              variant="outline"
              className="flex-1 md:flex-none gap-2 rounded-full border-white/10 hover:bg-white/5"
              onClick={() => navigate(`/candidates/${candidateId}/edit`)}
            >
              <Edit className="size-4" />
              Edit Profile
            </Button>
            {candidate.resume && (
              <Button 
                variant="outline"
                className="flex-1 md:flex-none gap-2 rounded-full border-white/10 hover:bg-white/5"
                onClick={() => window.open(candidate.resume, '_blank')}
              >
                <FileText className="size-4" />
                View Resume
              </Button>
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

            {candidate.skills && candidate.skills.length > 0 && (
              <div className="pt-4">
                <h4 className="text-sm font-bold mb-3" style={{ color: theme.textSecondary }}>Top Skills</h4>
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
              </div>
            )}

            {candidate.tags && candidate.tags.length > 0 && (
              <div className="pt-4">
                <h4 className="text-sm font-bold mb-3" style={{ color: theme.textSecondary }}>Tags</h4>
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
              </div>
            )}
          </motion.div>

          {/* Experience Timeline */}
          {candidate.experience_details && candidate.experience_details.length > 0 && (
            <motion.div variants={itemVariants} className="space-y-6">
              <h3 className="text-xl font-bold border-b pb-2 flex items-center gap-2" style={{ color: theme.textPrimary, borderColor: theme.border }}>
                <Briefcase className="size-5" style={{ color: theme.accent }}/> Experience
              </h3>
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
            </motion.div>
          )}

          {/* Education Timeline */}
          {candidate.education && candidate.education.length > 0 && (
            <motion.div variants={itemVariants} className="space-y-6">
              <h3 className="text-xl font-bold border-b pb-2 flex items-center gap-2" style={{ color: theme.textPrimary, borderColor: theme.border }}>
                <GraduationCap className="size-5" style={{ color: theme.accent }}/> Education
              </h3>
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
            </motion.div>
          )}
          
          {/* Certifications */}
          {candidate.certifications && candidate.certifications.length > 0 && (
             <motion.div variants={itemVariants} className="space-y-6">
               <h3 className="text-xl font-bold border-b pb-2" style={{ color: theme.textPrimary, borderColor: theme.border }}>
                 Certifications
               </h3>
               <ul className="list-disc pl-5 space-y-2">
                 {candidate.certifications.map((cert: string, index: number) => (
                   <li key={index} className="text-sm font-medium" style={{ color: theme.textSecondary }}>{cert}</li>
                 ))}
               </ul>
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
              {candidate.linkedin_url && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ background: theme.surfaceMuted }}>
                    <Globe className="size-4" style={{ color: theme.textSecondary }} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: theme.textMuted }}>LinkedIn</p>
                    <a href={candidate.linkedin_url.startsWith('http') ? candidate.linkedin_url : `https://${candidate.linkedin_url}`} target="_blank" rel="noreferrer" className="text-sm font-medium truncate hover:underline" style={{ color: theme.accent }}>
                      View Profile
                    </a>
                  </div>
                </div>
              )}
              {candidate.portfolio_url && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ background: theme.surfaceMuted }}>
                    <LinkIcon className="size-4" style={{ color: theme.textSecondary }} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: theme.textMuted }}>Portfolio</p>
                    <a href={candidate.portfolio_url.startsWith('http') ? candidate.portfolio_url : `https://${candidate.portfolio_url}`} target="_blank" rel="noreferrer" className="text-sm font-medium truncate hover:underline" style={{ color: theme.accent }}>
                      View Website
                    </a>
                  </div>
                </div>
              )}
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
            
            {candidate.uploaded_by && (
              <div className="pt-3 border-t" style={{ borderColor: theme.border }}>
                <p className="text-xs font-semibold mb-2" style={{ color: theme.textMuted }}>Sourced By</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs" style={{ background: theme.accent + '20', color: theme.accent }}>
                    {candidate.uploaded_by.name?.charAt(0) || <User className="size-4"/>}
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: theme.textPrimary }}>{candidate.uploaded_by.name}</p>
                    <p className="text-xs" style={{ color: theme.textMuted }}>{candidate.uploaded_by.email}</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default CandidateDetailPage;
