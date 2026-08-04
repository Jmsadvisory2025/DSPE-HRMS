import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { theme } from '@/config/theme';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notes: string) => void;
  actionType: 'accepted' | 'rejected' | 'resubmit' | null;
  loading: boolean;
}

export const ReviewActionModal = ({ isOpen, onClose, onConfirm, actionType, loading }: Props) => {
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) setNotes('');
  }, [isOpen]);

  const actionTitle = actionType === 'accepted' ? 'Approve' : actionType === 'rejected' ? 'Reject' : 'Request Re-Submission';
  const actionColor = actionType === 'accepted' ? theme.success : actionType === 'rejected' ? theme.destructive : theme.warning;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton={!loading}>
        <DialogHeader>
          <DialogTitle>{actionTitle} Application</DialogTitle>
          <DialogDescription>
             Please provide notes for this action.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
           <textarea
             className="w-full min-h-[100px] p-3 rounded-md text-sm outline-none"
             style={{ background: theme.background, color: theme.textPrimary, border: `1px solid ${theme.border}` }}
             placeholder="Enter notes here..."
             value={notes}
             onChange={(e) => setNotes(e.target.value)}
             disabled={loading}
           />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button 
             style={{ background: actionColor, color: theme.textInverse }} 
             onClick={() => onConfirm(notes)}
             disabled={loading}
          >
             {loading ? 'Submitting...' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
