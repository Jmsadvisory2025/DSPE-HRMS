import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clientActions } from '@/redux/actions';
import { setClients, setLoading, setError } from '@/redux/slices/clientSlice';
import type { ClientResponse } from '@/types/client.types';
import ClientHeader from './components/ClientHeader';
import ClientSearchBar from './components/ClientSearchBar';
import ClientGrid from './components/ClientGrid';
import { Loader2 } from 'lucide-react';
import { theme } from '@/config/theme';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

const ClientPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const dispatch = useAppDispatch();
  const { clients, loading } = useAppSelector((state) => state.clients);
  const { user } = useAuth();
  
  const isAdmin = user?.role === 'admin';

  const fetchClients = () => {
    dispatch({
      type: clientActions.FETCH_CLIENTS,
      method: "GET",
      endPoint: "/api/v1/clients/",
      auth: true,
      setLoading: (val: boolean) => dispatch(setLoading(val)),
      getResponse: (data: ClientResponse) => dispatch(setClients(data.results || [])),
      getError: (err: any) => dispatch(setError(err.message)),
    });
  };

  useEffect(() => {
    fetchClients();
  }, [dispatch]);

  const handleSelectChange = (id: string, selected: boolean) => {
    setSelectedIds(prev => 
      selected ? [...prev, id] : prev.filter(item => item !== id)
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0 || !isAdmin) return;
    dispatch({
      type: clientActions.DELETE_CLIENTS,
      method: 'DELETE',
      endPoint: '/api/v1/clients/bulk-delete/',
      auth: true,
      body: { client_ids: selectedIds },
      setLoading: (val: boolean) => setDeleting(val),
      getResponse: (res: any) => {
        // success message is shown in genericSaga if showSuccessMessage is true, 
        // but here we can just show our own or rely on getResponse
        toast.success(res?.message || 'Clients deleted successfully');
        setSelectedIds([]);
        fetchClients();
      },
      getError: () => {
        // generic saga already handles global error toast if not suppressed
      }
    });
  };

  const filtered = clients.filter((client) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      client.company_name.toLowerCase().includes(q) ||
      client.industry.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <ClientHeader 
        totalClients={filtered.length} 
        selectedCount={isAdmin ? selectedIds.length : 0}
        deleting={deleting}
        onDeleteSelected={isAdmin ? handleDeleteSelected : undefined}
      />
      <ClientSearchBar value={searchQuery} onChange={setSearchQuery} />
      
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="size-8 animate-spin" style={{ color: theme.accent }} />
        </div>
      ) : (
        <ClientGrid 
          clients={filtered} 
          selectedIds={isAdmin ? selectedIds : []}
          onSelectChange={isAdmin ? handleSelectChange : undefined}
        />
      )}
    </div>
  );
};

export default ClientPage;