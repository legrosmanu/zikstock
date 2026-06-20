import React from 'react';
import { Activity } from 'lucide-react';

interface IntegrationStatusBarProps {
  connectionStatus: 'checking' | 'active' | 'error';
}

export const IntegrationStatusBar: React.FC<IntegrationStatusBarProps> = ({ connectionStatus }) => {
  return (
    <div className="integration-status-bar glass-panel">
      <span className="integration-label">
        <Activity size={16} />
        Secure API Gateway Local Synchronization
      </span>
      <div className="status-indicator">
        {connectionStatus === 'checking' && (
          <>
            <span className="status-dot checking"></span>
            <span style={{ color: '#f59e0b' }}>CHECKING GATEWAY...</span>
          </>
        )}
        {connectionStatus === 'active' && (
          <>
            <span className="status-dot active"></span>
            <span style={{ color: '#10b981' }}>CONNECTED & VALIDATED</span>
          </>
        )}
        {connectionStatus === 'error' && (
          <>
            <span className="status-dot error"></span>
            <span style={{ color: '#ef4444' }}>OFFLINE / VERIFICATION ERROR</span>
          </>
        )}
      </div>
    </div>
  );
};
