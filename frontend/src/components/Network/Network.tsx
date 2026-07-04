import React, { useState, useEffect } from 'react';
import { 
    Clock, 
    Users, 
    Loader2
} from 'lucide-react';
import { 
    getNetwork, 
    searchMusicians, 
    sendConnectionRequest, 
    acceptConnection, 
    removeConnection 
} from '../../infra/network.api';
import type { NetworkUser, ConnectionWithUser } from '../../infra/network.api';
import { ConnectionsTab } from './ConnectionsTab';
import { RequestsTab } from './RequestsTab';
import { useNetworkStore } from '../../store/networkStore';
import './Network.css';

export const Network: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'connections' | 'requests'>('connections');
    
    // Data states
    const [connections, setConnections] = useState<ConnectionWithUser[]>([]);
    const [incomingRequests, setIncomingRequests] = useState<ConnectionWithUser[]>([]);
    const [outgoingRequests, setOutgoingRequests] = useState<ConnectionWithUser[]>([]);
    
    // Search states
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<NetworkUser[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    
    // Status states
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const loadNetworkData = async () => {
        try {
            setErrorMessage(null);
            const data = await getNetwork();
            setConnections(data.accepted);
            setIncomingRequests(data.incoming);
            setOutgoingRequests(data.outgoing);
            useNetworkStore.getState().setIncomingCount(data.incoming.length);
        } catch (error) {
            console.error('Error fetching network details:', error);
            setErrorMessage('Could not load network details. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadNetworkData();
    }, []);

    // Perform user search
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }
        
        setIsSearching(true);
        setErrorMessage(null);
        try {
            const results = await searchMusicians(searchQuery);
            setSearchResults(results);
        } catch (error) {
            console.error('Error searching users:', error);
            setErrorMessage('Failed to search musicians.');
        } finally {
            setIsSearching(false);
        }
    };

    // Auto-search on clear
    useEffect(() => {
        if (!searchQuery) {
            setSearchResults([]);
        }
    }, [searchQuery]);

    // Send connection request
    const handleSendRequest = async (receiverId: string) => {
        setActionLoadingId(receiverId);
        try {
            await sendConnectionRequest(receiverId);
            await loadNetworkData();
            if (searchQuery.trim()) {
                const results = await searchMusicians(searchQuery);
                setSearchResults(results);
            }
        } catch (error) {
            console.error('Error sending connection request:', error);
            setErrorMessage('Could not send connection request.');
        } finally {
            setActionLoadingId(null);
        }
    };

    // Accept request
    const handleAcceptRequest = async (connectionId: string) => {
        setActionLoadingId(connectionId);
        try {
            await acceptConnection(connectionId);
            await loadNetworkData();
            if (searchQuery.trim()) {
                const results = await searchMusicians(searchQuery);
                setSearchResults(results);
            }
        } catch (error) {
            console.error('Error accepting request:', error);
            setErrorMessage('Failed to accept request.');
        } finally {
            setActionLoadingId(null);
        }
    };

    // Decline / Cancel / Remove connection
    const handleRemoveConnection = async (connectionId: string) => {
        if (activeTab === 'connections') {
            const confirmDelete = window.confirm('Are you sure you want to remove this connection?');
            if (!confirmDelete) return;
        }
        
        setActionLoadingId(connectionId);
        try {
            await removeConnection(connectionId);
            await loadNetworkData();
            if (searchQuery.trim()) {
                const results = await searchMusicians(searchQuery);
                setSearchResults(results);
            }
        } catch (error) {
            console.error('Error removing connection:', error);
            setErrorMessage('Failed to remove connection.');
        } finally {
            setActionLoadingId(null);
        }
    };

    // Helper to check user relationship state
    const getUserConnectionState = (userId: string) => {
        const conn = connections.find(c => c.user.id === userId);
        if (conn) {
            return { type: 'connected' as const, connectionId: conn.id };
        }

        const incoming = incomingRequests.find(r => r.user.id === userId);
        if (incoming) {
            return { type: 'incoming' as const, connectionId: incoming.id };
        }

        const outgoing = outgoingRequests.find(r => r.user.id === userId);
        if (outgoing) {
            return { type: 'outgoing' as const, connectionId: outgoing.id };
        }

        return { type: 'none' as const };
    };

    if (isLoading) {
        return (
            <div className="network-loading-container">
                <Loader2 className="animate-spin" size={32} />
                <span>Loading your network...</span>
            </div>
        );
    }

    const totalRequests = incomingRequests.length;

    return (
        <div className="network-container dashboard-main animate-fade-in">
            {/* Header section */}
            <div className="welcome-banner glass-panel">
                <div className="welcome-info">
                    <h1 className="welcome-title">My Network</h1>
                    <p className="welcome-subtitle">
                        Find and connect with other musicians to build your collaboration circle.
                    </p>
                </div>
                <div className="network-stats">
                    <div className="stat-card glass-panel animate-fade-in">
                        <Users size={20} className="stat-icon" />
                        <div className="stat-details">
                            <span className="stat-value">{connections.length}</span>
                            <span className="stat-label">Connections</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error notifications */}
            {errorMessage && (
                <div className="network-error-banner glass-panel">
                    <Clock className="error-close" size={16} onClick={() => setErrorMessage(null)} />
                    <p>{errorMessage}</p>
                </div>
            )}

            {/* Main Tabs */}
            <div className="network-navigation glass-panel">
                <div className="tabs-container">
                    <button 
                        className={`tab-btn ${activeTab === 'connections' ? 'active' : ''}`}
                        onClick={() => setActiveTab('connections')}
                    >
                        <Users size={16} />
                        <span>Connections</span>
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
                        onClick={() => setActiveTab('requests')}
                    >
                        <Clock size={16} />
                        <span>Requests</span>
                        {totalRequests > 0 && (
                            <span className="badge-count animate-pulse">{totalRequests}</span>
                        )}
                    </button>
                </div>
            </div>

            {/* Tab content panels */}
            <div className="network-content-section">
                {activeTab === 'connections' ? (
                    <ConnectionsTab 
                        connections={connections}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        searchResults={searchResults}
                        isSearching={isSearching}
                        onSearch={handleSearch}
                        getUserConnectionState={getUserConnectionState}
                        onConnect={handleSendRequest}
                        onAccept={handleAcceptRequest}
                        onRemove={handleRemoveConnection}
                        actionLoadingId={actionLoadingId}
                    />
                ) : (
                    <RequestsTab 
                        incoming={incomingRequests}
                        outgoing={outgoingRequests}
                        onAccept={handleAcceptRequest}
                        onRemove={handleRemoveConnection}
                        actionLoadingId={actionLoadingId}
                    />
                )}
            </div>
        </div>
    );
};
