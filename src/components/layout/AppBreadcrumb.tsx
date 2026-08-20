import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

/**
 * Route-label map for breadcrumb display names.
 * Add new routes here as the app grows.
 */
const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  candidates: 'Candidates',
  clients: 'Clients',
  jobs: 'Jobs',
  interviews: 'Interviews',
  messages: 'Messages',
  reports: 'Reports',
  documents: 'Documents',
  settings: 'Settings',
  edit: 'Edit',
  positions: 'Positions',
  new: 'New',
  approvals: 'Approval Queue',
  users: 'Users',
  'audit-logs': 'Audit Logs',
};

const AppBreadcrumb = () => {
  const location = useLocation();
  const { candidateDetail } = useAppSelector(state => state.candidates);
  const { selectedClient } = useAppSelector(state => state.clients);
  const { selectedJob } = useAppSelector(state => state.positions);
  const { applicationDetail } = useAppSelector(state => state.approvals);

  // Split path into segments, filtering out empty strings
  const segments = location.pathname.split('/').filter(Boolean);

  // Don't show breadcrumb on root or single-segment routes like /dashboard
  if (segments.length === 0) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Always show Dashboard as the root */}
        {segments.length > 1 || segments[0] !== 'dashboard' ? (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link to="/dashboard" />}>
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        ) : null}

        {/* Render each path segment */}
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;
          const path = '/' + segments.slice(0, index + 1).join('/');
          const isId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment) || /^\d+$/.test(segment);
          
          let dynamicName = null;
          if (isId) {
            if (candidateDetail?.id === segment) dynamicName = candidateDetail.candidate_name;
            else if (selectedClient?.id === segment) dynamicName = selectedClient.company_name;
            else if (selectedJob?.id === segment) dynamicName = selectedJob.title;
            else if (applicationDetail?.job_id === segment) dynamicName = applicationDetail.job_title;
          }

          const label = ROUTE_LABELS[segment] || dynamicName || (isId ? "Details" : segment.charAt(0).toUpperCase() + segment.slice(1));

          if (isLast) {
            return (
              <BreadcrumbItem key={path}>
                <BreadcrumbPage>{label}</BreadcrumbPage>
              </BreadcrumbItem>
            );
          }

          return (
            <React.Fragment key={path}>
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link to={path} />}>
                  {label}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default AppBreadcrumb;
