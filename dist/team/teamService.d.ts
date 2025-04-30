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
export declare class TeamService {
    private sessions;
    private liveShare;
    constructor();
    createSession(owner: TeamMember): Promise<TeamSession>;
    joinSession(sessionId: string, member: TeamMember): Promise<void>;
    shareContext(sessionId: string, context: any): Promise<void>;
}
