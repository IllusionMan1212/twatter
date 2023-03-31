import { Session } from "../../controllers/utils/tokens";
import "express";

declare global {
    namespace Express {
        export interface Request {
            session: Session;
        }
    }
}
