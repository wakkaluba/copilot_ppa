"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamService = void 0;
const liveShareService_1 = require("./liveShareService");
class TeamService {
    constructor() {
        this.sessions = new Map();
        this.liveShare = new liveShareService_1.LiveShareService();
    }
    async createSession(owner) {
        const session = {
            id: `session_${Date.now()}`,
            members: [owner],
            sharedContext: new Map()
        };
        this.sessions.set(session.id, session);
        await this.liveShare.startSharing(session);
        return session;
    }
    async joinSession(sessionId, member) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error('Session not found');
        }
        session.members.push(member);
        await this.liveShare.joinSession(session, member);
    }
    async shareContext(sessionId, context) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error('Session not found');
        }
        await this.liveShare.syncContext(session, context);
    }
}
exports.TeamService = TeamService;
//# sourceMappingURL=teamService.js.map