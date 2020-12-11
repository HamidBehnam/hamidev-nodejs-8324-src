import {Request} from "express";

export interface Auth0Request extends Request {
    user?: any;
}

export interface AuthMetaData {
    user_metadata?: object;
    app_metadata?: object;
}

