import { Session, TwoFASession } from "../controllers/utils/cookies";
import "express";

declare global {
    namespace Express {
        export interface Request {
            session: Session;
            twoFASession: TwoFASession;
        }
    }
}
