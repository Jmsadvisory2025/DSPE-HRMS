import React from 'react';
import ClientCard from './ClientCard';
import type { Client } from '@/types/client.types';

interface ClientGridProps {
  clients: Client[];
}

const ClientGrid = ({ clients }: ClientGridProps) => {
  if (clients.length === 0) {
    return (
      <div className="text-center py-16 text-sm text-muted-foreground">
        No clients match your search.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {clients.map((client) => (
        <ClientCard key={client.id} client={client} />
      ))}
    </div>
  );
};

export default ClientGrid;
