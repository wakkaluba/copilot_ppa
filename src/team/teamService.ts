import * as vscode from 'vscode';
import { LiveShareService } from './liveShareService';

export interface TeamMember {
    id: string;
    name: string;
    role: 'owner' | 'editor' | 'viewer';
}

export interface TeamSession {
    id: string;
    members: TeamMember[];
    sharedContext: Map<string, any>;
}

export class TeamService {
    private sessions: Map<string, TeamSession> = new Map();
    private liveShare: LiveShareService;

    constructor() {
        this.liveShare = new LiveShareService();
    }

    async createSession(owner: TeamMember): Promise<TeamSession> {
        const session = {
            id: `session_${Date.now()}`,
            members: [owner],
            sharedContext: new Map()
        };
        this.sessions.set(session.id, session);
        await this.liveShare.startSharing(session);
        return session;
    }

    async joinSession(sessionId: string, member: TeamMember): Promise<void> {
        const session = this.sessions.get(sessionId);
        if (!session) throw new Error('Session not found');
        session.members.push(member);
        await this.liveShare.joinSession(session, member);
    }

    async shareContext(sessionId: string, context: any): Promise<void> {
        const session = this.sessions.get(sessionId);
        if (!session) throw new Error('Session not found');
        await this.liveShare.syncContext(session, context);
    }
}
