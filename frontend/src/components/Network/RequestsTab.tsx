import React from 'react';
import { Clock, Send } from 'lucide-react';
import { MusicianCard } from './MusicianCard';
import type { ConnectionWithUser } from '../../infra/network.api';
import { useTranslation } from '../../hooks/useTranslation';

interface RequestsTabProps {
    incoming: ConnectionWithUser[];
    outgoing: ConnectionWithUser[];
    onAccept: (connectionId: string) => void;
    onRemove: (connectionId: string) => void;
    actionLoadingId: string | null;
}

export const RequestsTab: React.FC<RequestsTabProps> = ({
    incoming,
    outgoing,
    onAccept,
    onRemove,
    actionLoadingId
}) => {
    const { t } = useTranslation();

    return (
        <div className="requests-panel">
            <div className="incoming-requests-wrapper glass-panel">
                <h3 className="section-title">{t.network.incomingRequestsHeading} ({incoming.length})</h3>
                {incoming.length === 0 ? (
                    <div className="empty-state-card small">
                        <Clock size={30} className="empty-icon" />
                        <p className="empty-title">{t.network.noPendingRequests}</p>
                    </div>
                ) : (
                    <div className="users-grid">
                        {incoming.map((req) => (
                            <MusicianCard 
                                key={req.id}
                                user={req.user}
                                relationship="incoming"
                                connectionId={req.id}
                                actionLoadingId={actionLoadingId}
                                onAccept={onAccept}
                                onRemove={onRemove}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="outgoing-requests-wrapper glass-panel">
                <h3 className="section-title">{t.network.sentRequestsHeading} ({outgoing.length})</h3>
                {outgoing.length === 0 ? (
                    <div className="empty-state-card small">
                        <Send size={30} className="empty-icon" />
                        <p className="empty-title">{t.network.noSentRequests}</p>
                    </div>
                ) : (
                    <div className="users-grid">
                        {outgoing.map((req) => (
                            <MusicianCard 
                                key={req.id}
                                user={req.user}
                                relationship="outgoing"
                                connectionId={req.id}
                                actionLoadingId={actionLoadingId}
                                onRemove={onRemove}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
