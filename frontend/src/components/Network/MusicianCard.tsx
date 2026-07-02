import React from 'react';
import { 
    Check, 
    X, 
    UserPlus, 
    UserMinus, 
    Clock, 
    Loader2 
} from 'lucide-react';
import type { NetworkUser } from '../../infra/network.api';

interface MusicianCardProps {
    user: NetworkUser;
    relationship: 'active' | 'connected' | 'incoming' | 'outgoing' | 'none';
    connectionId?: string;
    actionLoadingId: string | null;
    onConnect?: (userId: string) => void;
    onAccept?: (connectionId: string) => void;
    onRemove?: (connectionId: string) => void;
}

export const MusicianCard: React.FC<MusicianCardProps> = ({
    user,
    relationship,
    connectionId,
    actionLoadingId,
    onConnect,
    onAccept,
    onRemove
}) => {
    const isActionLoading = actionLoadingId === user.id || (connectionId && actionLoadingId === connectionId);

    return (
        <div className="user-card glass-panel animate-slide-down">
            <div className="user-profile-info">
                {user.picture ? (
                    <img src={user.picture} alt={user.name} className="user-avatar" />
                ) : (
                    <div className="user-avatar fallback">
                        <span>{(user.name || user.email)[0].toUpperCase()}</span>
                    </div>
                )}
                <div className="user-text-details">
                    <span className="user-name">{user.name || 'Musician'}</span>
                    <span className="user-email">{user.email}</span>
                </div>
            </div>

            <div className="user-actions">
                {relationship === 'connected' && (
                    <span className="badge-connected">
                        <Check size={14} /> Connected
                    </span>
                )}
                {relationship === 'active' && (
                    <button 
                        className="btn-action remove"
                        onClick={() => connectionId && onRemove?.(connectionId)}
                        disabled={!!isActionLoading}
                    >
                        {isActionLoading ? <Loader2 className="animate-spin" size={14} /> : <UserMinus size={14} />}
                        <span>Disconnect</span>
                    </button>
                )}
                {relationship === 'outgoing' && (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span className="badge-pending">
                            <Clock size={14} /> Sent
                        </span>
                        <button 
                            className="btn-action-icon decline"
                            title="Cancel Request"
                            onClick={() => connectionId && onRemove?.(connectionId)}
                            disabled={!!isActionLoading}
                        >
                            {isActionLoading ? <Loader2 className="animate-spin" size={14} /> : <X size={14} />}
                        </button>
                    </div>
                )}
                {relationship === 'incoming' && (
                    <div className="button-group">
                        <button 
                            className="btn-action accept"
                            onClick={() => connectionId && onAccept?.(connectionId)}
                            disabled={!!isActionLoading}
                        >
                            {isActionLoading ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
                            <span>Accept</span>
                        </button>
                        <button 
                            className="btn-action-icon decline"
                            title="Decline Request"
                            onClick={() => connectionId && onRemove?.(connectionId)}
                            disabled={!!isActionLoading}
                        >
                            {isActionLoading ? <Loader2 className="animate-spin" size={14} /> : <X size={14} />}
                        </button>
                    </div>
                )}
                {relationship === 'none' && (
                    <button 
                        className="btn-action connect"
                        onClick={() => onConnect?.(user.id)}
                        disabled={!!isActionLoading}
                    >
                        {isActionLoading ? <Loader2 className="animate-spin" size={14} /> : <UserPlus size={14} />}
                        <span>Connect</span>
                    </button>
                )}
            </div>
        </div>
    );
};
