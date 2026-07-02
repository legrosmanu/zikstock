import React from 'react';
import { Search, Send, Loader2, Users } from 'lucide-react';
import { MusicianCard } from './MusicianCard';
import type { NetworkUser, ConnectionWithUser } from '../../infra/network.api';

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
    return (
        <>
            {/* Search Section */}
            <div className="search-section-wrapper glass-panel">
                <h3 className="section-title">Find Musicians</h3>
                <form onSubmit={onSearch} className="network-search-form">
                    <div className="search-input-container">
                        <Search className="search-icon" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by name or email..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <button type="submit" className="btn-search-network" disabled={isSearching}>
                        {isSearching ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                        <span>Search</span>
                    </button>
                </form>

                {searchResults.length > 0 && (
                    <div className="search-results-list">
                        <h4 className="results-heading">Search Results</h4>
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
                        No musicians found matching "{searchQuery}"
                    </div>
                )}
            </div>

            {/* Active Connections Panel */}
            <div className="connections-panel glass-panel">
                <h3 className="section-title">My Connections ({connections.length})</h3>
                {connections.length === 0 ? (
                    <div className="empty-state-card">
                        <Users size={40} className="empty-icon" />
                        <p className="empty-title">No connections yet</p>
                        <p className="empty-desc">Search for other musicians above to grow your network.</p>
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
