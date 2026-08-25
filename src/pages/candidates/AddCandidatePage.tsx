import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { UploadCloud, FileText, X, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { theme } from '@/config/theme';
import { useAppDispatch } from '@/store/hooks';
import { candidateActions } from '@/redux/actions';

const AddCandidatePage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter(
        (f) => f.type === 'application/pdf' || f.name.endsWith('.docx')
      );
      
      if (validFiles.length < newFiles.length) {
        toast.error('Only PDF and DOCX files are allowed.');
      }
      
      setSelectedFiles((prev) => [...prev, ...validFiles]);
    }
    // reset input so the same file can be selected again if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one resume to upload.');
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('resume', file);
    });

    dispatch({
      type: candidateActions.UPLOAD_RESUMES,
      method: "POST",
      endPoint: "/api/v1/candidates/upload/",
      body: formData,
      auth: true,
      showSuccessMessage: true,
      setLoading: (val: boolean) => setIsUploading(val),
      getResponse: (res: any) => {
        // Extract the candidate_id from the actual API response format provided
        let candidateId = null;
        if (res?.results && Array.isArray(res.results) && res.results.length > 0) {
          candidateId = res.results[0]?.candidate_id;
        } else if (Array.isArray(res) && res.length > 0) {
          candidateId = res[0]?.id;
        } else if (res?.candidates && Array.isArray(res.candidates) && res.candidates.length > 0) {
          candidateId = res.candidates[0]?.id;
        } else if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          candidateId = res.data[0]?.id;
        } else if (res?.data?.id) {
          candidateId = res.data.id;
        } else if (res?.id) {
          candidateId = res.id;
        }
        setTimeout(() => {
          if (candidateId) {
            navigate(`/candidates/${candidateId}/edit`);
          } else {
            navigate('/candidates');
          }
        }, 1500);
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => navigate('/candidates')}
          className="shrink-0"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: theme.textPrimary }}
          >
            Add Candidate
          </h1>
          <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
            Upload resumes to automatically parse and add candidates
          </p>
        </div>
      </div>

      <Card style={{ borderColor: theme.border, background: theme.surface }}>
        <CardHeader>
          <CardTitle style={{ color: theme.textPrimary }}>Upload Resumes</CardTitle>
          <CardDescription style={{ color: theme.textMuted }}>
            You can upload multiple resumes at once. Supported formats: PDF, DOCX.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div 
            className="border-2 border-dashed rounded-lg p-10 text-center transition-colors cursor-pointer"
            style={{ 
              borderColor: theme.border,
              background: theme.surfaceHover 
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud className="size-10 mx-auto mb-4" style={{ color: theme.accent }} />
            <h3 className="text-sm font-semibold mb-1" style={{ color: theme.textPrimary }}>
              Click or drag files to upload
            </h3>
            <p className="text-xs" style={{ color: theme.textMuted }}>
              PDF, DOCX (Max size: 10MB per file)
            </p>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              multiple
              onChange={handleFileChange}
            />
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium" style={{ color: theme.textPrimary }}>
                Selected Files ({selectedFiles.length})
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between p-3 rounded-md border"
                    style={{ borderColor: theme.border, background: theme.surfaceMuted }}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileText className="size-5 shrink-0" style={{ color: theme.textMuted }} />
                      <span className="text-sm truncate" style={{ color: theme.textPrimary }}>
                        {file.name}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-3 border-t pt-6" style={{ borderColor: theme.border }}>
          <Button 
            variant="outline" 
            onClick={() => navigate('/candidates')}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={isUploading || selectedFiles.length === 0}
            className="gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <UploadCloud className="size-4" />
                Upload Resumes
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AddCandidatePage;
