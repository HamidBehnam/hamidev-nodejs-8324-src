import jwt from "express-jwt";
import JwksRsa from "jwks-rsa";
import jwtAuthz from "express-jwt-authz";
import {configService} from "../services/config.service";

class AuthMiddleware {
    private readonly _checkJwt: jwt.RequestHandler;

    constructor() {
        this._checkJwt = jwt({
            secret: JwksRsa.expressJwtSecret({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 5,
                jwksUri: `https://${configService.auth0_domain}/.well-known/jwks.json`
            }),
            audience: configService.auth0_audience,
            issuer: `https://${configService.auth0_domain}/`,
            algorithms: ['RS256']
        });
    }

    get checkJwt(): jwt.RequestHandler {
        return this._checkJwt;
    }

    checkAuth0Permissions(permissions: string[]) {
        return jwtAuthz(permissions, {
            customScopeKey: "permissions",
            checkAllScopes: true
        });
    }
}

export const authMiddleware = new AuthMiddleware();
