import React from 'react';
import { Search, Send, Loader2, Users } from 'lucide-react';
import { MusicianCard } from './MusicianCard';
import type { NetworkUser, ConnectionWithUser } from '../../infra/network.api';
import { useTranslation } from '../../hooks/useTranslation';

interface ConnectionsTabProps {
    connections: ConnectionWithUser[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    searchResults: NetworkUser[];
    isSearching: boolean;
    onSearch: (e: React.FormEvent) => void;
    getUserConnectionState: (userId: string) => { type: 'connected' | 'incoming' | 'outgoing' | 'none'; connectionId?: string };
    onConnect: (userId: string) => void;
    onAccept: (connectionId: string) => void;
    onRemove: (connectionId: string) => void;
    actionLoadingId: string | null;
}

export const ConnectionsTab: React.FC<ConnectionsTabProps> = ({
    connections,
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    onSearch,
    getUserConnectionState,
    onConnect,
    onAccept,
    onRemove,
    actionLoadingId
}) => {
    const { t } = useTranslation();

    return (
        <>
            {/* Search Section */}
            <div className="search-section-wrapper glass-panel">
                <h3 className="section-title">{t.network.findMusicians}</h3>
                <form onSubmit={onSearch} className="network-search-form">
                    <div className="search-input-container">
                        <Search className="search-icon" size={18} />
                        <input 
                            type="text" 
                            placeholder={t.network.searchPlaceholder} 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <button type="submit" className="btn-search-network" disabled={isSearching}>
                        {isSearching ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                        <span>{t.network.searchButton}</span>
                    </button>
                </form>

                {searchResults.length > 0 && (
                    <div className="search-results-list">
                        <h4 className="results-heading">{t.network.searchResultsHeading}</h4>
                        <div className="users-grid">
                            {searchResults.map((user) => {
                                const state = getUserConnectionState(user.id);
                                return (
                                    <MusicianCard 
                                        key={user.id}
                                        user={user}
                                        relationship={state.type}
                                        connectionId={state.connectionId}
                                        actionLoadingId={actionLoadingId}
                                        onConnect={onConnect}
                                        onAccept={onAccept}
                                        onRemove={onRemove}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
                {searchQuery.trim() && searchResults.length === 0 && !isSearching && (
                    <div className="no-results-banner">
                        {t.network.noMusiciansFound} "{searchQuery}"
                    </div>
                )}
            </div>

            {/* Active Connections Panel */}
            <div className="connections-panel glass-panel">
                <h3 className="section-title">{t.network.connectionsHeading} ({connections.length})</h3>
                {connections.length === 0 ? (
                    <div className="empty-state-card">
                        <Users size={40} className="empty-icon" />
                        <p className="empty-title">{t.network.noConnectionsYet}</p>
                        <p className="empty-desc">{t.network.searchToGrowNetwork}</p>
                    </div>
                ) : (
                    <div className="users-grid">
                        {connections.map((conn) => (
                            <MusicianCard 
                                key={conn.id}
                                user={conn.user}
                                relationship="active"
                                connectionId={conn.id}
                                actionLoadingId={actionLoadingId}
                                onRemove={onRemove}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};
