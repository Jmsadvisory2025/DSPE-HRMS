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

const ClientPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const dispatch = useAppDispatch();
  const { clients, loading } = useAppSelector((state) => state.clients);

  useEffect(() => {
    dispatch({
      type: clientActions.FETCH_CLIENTS,
      method: "GET",
      endPoint: "/api/v1/clients/",
      auth: true,
      setLoading: (val: boolean) => dispatch(setLoading(val)),
      getResponse: (data: ClientResponse) => dispatch(setClients(data.results || [])),
      getError: (err: any) => dispatch(setError(err.message)),
    });
  }, [dispatch]);

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
      <ClientHeader totalClients={filtered.length} />
      <ClientSearchBar value={searchQuery} onChange={setSearchQuery} />
      
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="size-8 animate-spin" style={{ color: theme.accent }} />
        </div>
      ) : (
        <ClientGrid clients={filtered} />
      )}
    </div>
  );
};

export default ClientPage;