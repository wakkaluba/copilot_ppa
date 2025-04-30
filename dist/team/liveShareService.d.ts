import { TeamSession, TeamMember } from './teamService';
export declare class LiveShareService {
    private sessions;
    startSharing(session: TeamSession): Promise<void>;
    joinSession(session: TeamSession, member: TeamMember): Promise<void>;
    syncContext(session: TeamSession, context: any): Promise<void>;
    private initializeLiveShare;
    private createSharedService;
    private connectToSharedService;
    private broadcastUpdate;
}
