import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import type { Zikresource } from '../../infra/zikresource.api';
import { useTranslation } from '../../hooks/useTranslation';
import { ZikresourceCard } from '../Cards/ZikresourceCard';

interface ZikresourceListProps {
  resources: Zikresource[];
  viewMode?: 'grid' | 'list';
}

export const ZikresourceList: React.FC<ZikresourceListProps> = ({ resources, viewMode = 'grid' }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (resources.length === 0) {
    return (
      <div className="no-results-panel glass-panel">
        <p>{t.dashboard.noResourcesFound}</p>
      </div>
    );
  }

  return (
    <div className={viewMode === 'grid' ? 'reverb-cards-grid' : 'reverb-cards-list'}>
      {resources.map((resource) => (
        <ZikresourceCard
          key={resource._id}
          resource={resource}
          viewMode={viewMode}
          onClick={() => navigate({ to: `/zikresources/${resource._id}` })}
        />
      ))}
    </div>
  );
};
