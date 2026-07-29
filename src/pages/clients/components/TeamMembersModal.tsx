import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Loader2 } from 'lucide-react';
import { theme } from '@/config/theme';
import type { TeamMember } from '@/types/client.types';
import { useAppDispatch } from '@/store/hooks';
import { clientActions } from '@/redux/actions';
import { toast } from 'sonner';

interface TeamMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  initialTeamMembers: TeamMember[];
  onSuccess: () => void;
}

const TeamMembersModal = ({ isOpen, onClose, clientId, initialTeamMembers, onSuccess }: TeamMembersModalProps) => {
  const dispatch = useAppDispatch();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state if modal is reopened
  React.useEffect(() => {
    if (isOpen) {
      setTeamMembers(initialTeamMembers || []);
    }
  }, [isOpen, initialTeamMembers]);

  const handleAdd = () => {
    setTeamMembers(prev => [...prev, { name: '', email: '', role: '' }]);
  };

  const handleRemove = (index: number) => {
    setTeamMembers(prev => prev.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: keyof TeamMember, value: string) => {
    setTeamMembers(prev => {
      const newArr = [...prev];
      newArr[index] = { ...newArr[index], [field]: value };
      return newArr;
    });
  };

  const handleSave = () => {
    setIsSubmitting(true);
    dispatch({
      type: clientActions.UPDATE_CLIENT,
      method: 'PATCH',
      endPoint: `/api/v1/clients/${clientId}/`,
      body: { team_members: teamMembers },
      auth: true,
      getResponse: () => {
        setIsSubmitting(false);
        toast.success("Team members updated successfully");
        onSuccess();
        onClose();
      },
      getError: (err: any) => {
        setIsSubmitting(false);
        toast.error(err.response?.data?.detail || "Failed to update team members");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto" style={{ background: theme.surface, borderColor: theme.border, color: theme.textPrimary }}>
        <DialogHeader>
          <DialogTitle>Manage Team Members</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {teamMembers.map((member, index) => (
            <div key={index} className="grid grid-cols-12 gap-3 items-start p-3 rounded-lg border" style={{ borderColor: theme.border, background: theme.background }}>
              <div className="col-span-12 md:col-span-4 space-y-1">
                <label className="text-xs" style={{ color: theme.textMuted }}>Name</label>
                <Input value={member.name} onChange={e => handleChange(index, 'name', e.target.value)} placeholder="Name" style={{ background: theme.surface, borderColor: theme.border, color: theme.textPrimary }} />
              </div>
              <div className="col-span-12 md:col-span-4 space-y-1">
                <label className="text-xs" style={{ color: theme.textMuted }}>Email</label>
                <Input value={member.email} onChange={e => handleChange(index, 'email', e.target.value)} type="email" placeholder="Email" style={{ background: theme.surface, borderColor: theme.border, color: theme.textPrimary }} />
              </div>
              <div className="col-span-10 md:col-span-3 space-y-1">
                <label className="text-xs" style={{ color: theme.textMuted }}>Role</label>
                <Input value={member.role} onChange={e => handleChange(index, 'role', e.target.value)} placeholder="Role" style={{ background: theme.surface, borderColor: theme.border, color: theme.textPrimary }} />
              </div>
              <div className="col-span-2 md:col-span-1 flex items-end justify-center pb-2">
                <Button variant="ghost" size="icon" onClick={() => handleRemove(index)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
          {teamMembers.length === 0 && (
            <div className="text-center py-6 text-sm" style={{ color: theme.textMuted }}>
              No team members added yet.
            </div>
          )}
          
          <Button variant="outline" size="sm" onClick={handleAdd} className="w-full gap-2 border-dashed">
            <Plus className="size-4" />
            Add Team Member
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSubmitting} style={{ background: theme.accent, color: theme.accentForeground }}>
            {isSubmitting ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
            Save Team Members
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TeamMembersModal;
