import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Shield, Loader2, Pencil, Building2 } from 'lucide-react';
import { theme } from '@/config/theme';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { userActions } from '@/redux/actions';
import { setUsers, setLoading, setError, addUser, updateUser } from '@/redux/slices/userSlice';
import type { UserResponse, AddUserPayload, User } from '@/types/user.types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const UsersPage = () => {
  const { isRecruiter } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { users, loading } = useAppSelector((state) => state.users);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<AddUserPayload>({
    name: '',
    email: '',
    phone: '',
    role: 'recruiter',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState({ name: '', email: '', phone: '', role: '' });
  const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null);
  const [editFormErrors, setEditFormErrors] = useState<Record<string, string[]>>({});

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setEditFormData({ name: user.name, email: user.email, phone: user.phone || '', role: user.role });
    setEditAvatarFile(null);
    setEditFormErrors({});
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditFormErrors({});
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("name", editFormData.name);
    formData.append("email", editFormData.email);
    formData.append("phone", editFormData.phone);
    formData.append("role", editFormData.role);
    if (editAvatarFile) {
      formData.append("avatar", editAvatarFile);
    }

    dispatch({
      type: userActions.UPDATE_USER,
      method: "PATCH",
      endPoint: `/api/v1/users/${editingUser.id}/`,
      body: formData,
      auth: true,
      getResponse: (data: User) => {
        setIsSubmitting(false);
        dispatch(updateUser(data));
        toast.success("User updated successfully");
        setIsEditDialogOpen(false);
        setEditingUser(null);
      },
      getError: (err: any) => {
        setIsSubmitting(false);
        const errorData = err?.response?.data;
        if (errorData?.field_errors) {
          setEditFormErrors(errorData.field_errors);
        } else {
          toast.error(errorData?.detail || errorData?.error || err?.message || "Something went wrong");
        }
      }
    });
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setIsSubmitting(true);

    dispatch({
      type: userActions.ADD_USER,
      method: "POST",
      endPoint: "/api/v1/users/",
      body: formData,
      auth: true,
      getResponse: (data: User) => {
        setIsSubmitting(false);
        dispatch(addUser(data));
        toast.success("User added successfully");
        setIsDialogOpen(false);
        setFormData({ name: '', email: '', phone: '', role: 'recruiter' });
      },
      getError: (err: any) => {
        setIsSubmitting(false);
        const errorData = err?.response?.data;
        if (errorData?.field_errors) {
          setFormErrors(errorData.field_errors);
        } else {
          toast.error(errorData?.detail || errorData?.error || err?.message || "Something went wrong");
        }
      }
    });
  };

  useEffect(() => {
    dispatch({
      type: userActions.FETCH_USERS,
      method: "GET",
      endPoint: "/api/v1/users/",
      auth: true,
      setLoading: (val: boolean) => dispatch(setLoading(val)),
      getResponse: (data: UserResponse) => dispatch(setUsers(data.results || [])),
      getError: (err: any) => dispatch(setError(err.message)),
    });
  }, [dispatch]);
  if (isRecruiter) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <Shield className="size-16" style={{ color: theme.destructive }} />
        <h2 className="text-2xl font-bold" style={{ color: theme.textPrimary }}>Access Denied</h2>
        <p className="text-sm" style={{ color: theme.textMuted }}>
          You do not have permission to view the Users page.
        </p>
        <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: theme.textPrimary }}
          >
            Users
          </h1>
          <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
            {users.length} internal users
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger>
            <Button size="sm" className="gap-1.5 shrink-0" type="button" onClick={() => setIsDialogOpen(true)}>
              <Plus className="size-3.5" />
              <span>Invite User</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Fill out the form below to create a new user.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                {formErrors.name && <p className="text-xs text-red-500">{formErrors.name[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                {formErrors.email && <p className="text-xs text-red-500">{formErrors.email[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                {formErrors.phone && <p className="text-xs text-red-500">{formErrors.phone[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={formData.role} onValueChange={val => setFormData({...formData, role: val || ''})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="recruiter">Recruiter</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.role && <p className="text-xs text-red-500">{formErrors.role[0]}</p>}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save User
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table Container */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
        }}
      >
        <div className="w-full overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="size-8 animate-spin" style={{ color: theme.accent }} />
            </div>
          ) : (
            <Table>
              <TableHeader
                className="text-xs uppercase"
                style={{
                  background: theme.surfaceMuted,
                  color: theme.textMuted,
                }}
              >
                <TableRow className="border-b-0 hover:bg-transparent">
                  <TableHead className="font-semibold text-current">User</TableHead>
                  <TableHead className="font-semibold text-current">Phone</TableHead>
                  <TableHead className="font-semibold text-current">Role</TableHead>
                  <TableHead className="font-semibold text-current">Organization</TableHead>
                  <TableHead className="font-semibold text-current">Created By</TableHead>
                  <TableHead className="font-semibold text-current text-center">Jobs</TableHead>
                  <TableHead className="font-semibold text-current text-center">Recruiters</TableHead>
                  <TableHead className="font-semibold text-current">Joined</TableHead>
                  <TableHead className="font-semibold text-current text-center">Status</TableHead>
                  <TableHead className="font-semibold text-current text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user, index) => {
                  // Role Badge Styling
                  const getRoleStyle = (role: string) => {
                    switch (role?.toLowerCase()) {
                      case 'admin': return { color: theme.chart2, bg: theme.chart2 + '20' };
                      case 'manager': return { color: theme.info, bg: theme.infoSoft };
                      case 'recruiter': return { color: theme.success, bg: theme.successSoft };
                      default: return { color: theme.textMuted, bg: theme.surfaceMuted };
                    }
                  };
                  
                  const roleStyle = getRoleStyle(user.role);

                  return (
                    <TableRow
                      key={user.id}
                      style={{
                        borderTop: index !== 0 ? `1px solid ${theme.border}` : 'none',
                      }}
                      className="hover:bg-white/5 transition-colors border-0"
                    >
                      {/* User — Avatar + Name + Email */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="size-9 rounded-full object-cover shrink-0 ring-2 ring-white"
                              style={{ boxShadow: `0 0 0 1px ${theme.border}` }}
                            />
                          ) : (
                            <div
                              className="size-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                              style={{
                                background: roleStyle.bg,
                                color: roleStyle.color,
                              }}
                            >
                              {user.name?.charAt(0)?.toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate" style={{ color: theme.textPrimary }}>
                              {user.name}
                            </p>
                            <p className="text-xs truncate" style={{ color: theme.textMuted }}>
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Phone */}
                      <TableCell>
                        <span className="text-sm" style={{ color: user.phone ? theme.textSecondary : theme.textMuted }}>
                          {user.phone || '—'}
                        </span>
                      </TableCell>

                      {/* Role */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-0 font-medium px-2.5 py-0.5 text-[10px] capitalize"
                          style={{ color: roleStyle.color, background: roleStyle.bg }}
                        >
                          {user.role}
                        </Badge>
                      </TableCell>

                      {/* Organization */}
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Building2 className="size-3.5 shrink-0" style={{ color: theme.textMuted }} />
                          <span className="text-sm" style={{ color: theme.textSecondary }}>
                            {user.organization_name || '—'}
                          </span>
                        </div>
                      </TableCell>

                      {/* Created By */}
                      <TableCell>
                        <span className="text-sm" style={{ color: user.created_by_name ? theme.textSecondary : theme.textMuted }}>
                          {user.created_by_name || '—'}
                        </span>
                      </TableCell>

                      {/* Jobs Count */}
                      <TableCell className="text-center">
                        <span
                          className="inline-flex items-center justify-center min-w-[28px] h-6 rounded-full text-xs font-semibold px-2"
                          style={{
                            background: user.jobs_count > 0 ? theme.accentSoft : theme.surfaceMuted,
                            color: user.jobs_count > 0 ? theme.accent : theme.textMuted,
                          }}
                        >
                          {user.jobs_count}
                        </span>
                      </TableCell>

                      {/* Recruiters Count */}
                      <TableCell className="text-center">
                        <span
                          className="inline-flex items-center justify-center min-w-[28px] h-6 rounded-full text-xs font-semibold px-2"
                          style={{
                            background: user.recruiters_count > 0 ? theme.chart2 + '15' : theme.surfaceMuted,
                            color: user.recruiters_count > 0 ? theme.chart2 : theme.textMuted,
                          }}
                        >
                          {user.recruiters_count}
                        </span>
                      </TableCell>

                      {/* Date Joined */}
                      <TableCell>
                        <span className="text-sm" style={{ color: theme.textSecondary }}>
                          {new Date(user.date_joined).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <span
                            className="size-2 rounded-full shrink-0"
                            style={{
                              background: user.is_active ? theme.success : theme.destructive,
                            }}
                          />
                          <span
                            className="text-xs font-medium"
                            style={{
                              color: user.is_active ? theme.success : theme.destructive,
                            }}
                          >
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(user)} className="size-8">
                          <Pencil className="size-4" style={{ color: theme.textSecondary }} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update the details for {editingUser?.name}.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input id="edit-name" value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} required />
                {editFormErrors.name && <p className="text-xs text-red-500">{editFormErrors.name[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input id="edit-email" type="email" value={editFormData.email} onChange={e => setEditFormData({...editFormData, email: e.target.value})} required />
                {editFormErrors.email && <p className="text-xs text-red-500">{editFormErrors.email[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input id="edit-phone" type="tel" value={editFormData.phone} onChange={e => setEditFormData({...editFormData, phone: e.target.value})} />
                {editFormErrors.phone && <p className="text-xs text-red-500">{editFormErrors.phone[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={editFormData.role} onValueChange={val => setEditFormData({...editFormData, role: val || ''})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="recruiter">Recruiter</SelectItem>
                  </SelectContent>
                </Select>
                {editFormErrors.role && <p className="text-xs text-red-500">{editFormErrors.role[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-avatar">Avatar</Label>
                <Input id="edit-avatar" type="file" accept="image/*" onChange={e => setEditAvatarFile(e.target.files ? e.target.files[0] : null)} />
                {editFormErrors.avatar && <p className="text-xs text-red-500">{editFormErrors.avatar[0]}</p>}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default UsersPage;
