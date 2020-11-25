import jwt from "express-jwt";
import JwksRsa from "jwks-rsa";
import {AUTH0_AUDIENCE, AUTH0_DOMAIN} from "./config.service";

export const jwtCheck = jwt({
    secret: JwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${AUTH0_DOMAIN}/.well-known/jwks.json`
    }),
    audience: AUTH0_AUDIENCE,
    issuer: `https://${AUTH0_DOMAIN}/`,
    algorithms: ['RS256']
});
