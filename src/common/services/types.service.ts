import {Request} from "express";

export interface Auth0Request extends Request {
    user?: any;
}
