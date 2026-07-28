import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clientActions } from '@/redux/actions';
import { setSelectedClient, setDetailLoading, setError } from '@/redux/slices/clientSlice';
import type { ClientDetail } from '@/types/client.types';
import ClientDetailHeader from './components/ClientDetailHeader';
import ClientTabs, { type ClientTabKey } from './components/ClientTabs';
import ClientOverview from './components/ClientOverview';
import { Loader2 } from 'lucide-react';
import { theme } from '@/config/theme';

const ClientDetailPage = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const [activeTab, setActiveTab] = useState<ClientTabKey>('Overview');
  const dispatch = useAppDispatch();
  const { selectedClient, detailLoading } = useAppSelector((state) => state.clients);

  useEffect(() => {
    if (clientId) {
      dispatch({
        type: clientActions.FETCH_CLIENT_DETAIL,
        method: "GET",
        endPoint: `/api/v1/clients/${clientId}/`,
        auth: true,
        setLoading: (val: boolean) => dispatch(setDetailLoading(val)),
        getResponse: (data: ClientDetail) => dispatch(setSelectedClient(data)),
        getError: (err: any) => dispatch(setError(err.message)),
      });
    }
    
    // Cleanup on unmount
    return () => {
      dispatch(setSelectedClient(null));
    };
  }, [dispatch, clientId]);

  if (detailLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="size-8 animate-spin" style={{ color: theme.accent }} />
      </div>
    );
  }

  if (!selectedClient && !detailLoading) {
    return null;
  }

  return (
    <div className="space-y-6">
      <ClientDetailHeader client={selectedClient!} />
      <ClientTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === 'Overview' && <ClientOverview client={selectedClient!} />}

        {activeTab !== 'Overview' && (
          <div
            className="rounded-xl p-12 text-center"
            style={{
              background: theme.surface,
              border: `1px solid ${theme.border}`,
            }}
          >
            <p className="text-sm" style={{ color: theme.textMuted }}>
              {activeTab} — Coming soon
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDetailPage;
