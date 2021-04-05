import {Request} from "express";

export interface Auth0Request extends Request {
    user?: any;
}

export interface Auth0MetaData {
    user_metadata?: object;
    app_metadata?: object;
}

export enum Permissions {
    ReadUsers = 'read:users',
    ReadUserRoles = 'read:user_roles',
    ReadUserPermissions = 'read:user_permissions',
    ReadRoles = 'read:roles',
    CreateUserRoles = 'create:user_roles',
    DeleteUserRoles = 'delete:user_roles'
}

