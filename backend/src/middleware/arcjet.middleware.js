import aj from "../libs/arcjet.js";
import { isSpoofedBot } from "@arcjet/inspect";

export const arcjetProtection = async (req, res, next) => {
    try {
        const decision = await aj.protect(req);
        if (decision.isDenied()) {
            if(decision.reason.isRateLimit()) {
                return res.status(429).json({ message: "Too Many Requests" });
            }  else if (decision.reason.isBot()) {
                return res.status(403).json({ message: "Bot access denied" });
            } else {
                return res.status(403).json({ message: "Access denied" });
            }
        }

        if (decision.results.some(isSpoofedBot)) {
            return res.status(403).json({
                message: "Bot access denied",

            });
        }
        
        next();
    } catch (err) {
        console.error("Arcjet evaluation error:", err);
        next();
    }
};