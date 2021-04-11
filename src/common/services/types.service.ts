import {Request} from "express";

export interface Auth0Request extends Request {
    user?: any;
}

export interface Auth0MetaData {
    user_metadata?: object;
    app_metadata?: object;
}

export enum Auth0Permissions {
    ReadAuth0Users = 'read:auth0_users',
    ReadAuth0UserRoles = 'read:auth0_user_roles',
    ReadAuth0UserPermissions = 'read:auth0_user_permissions',
    ReadAuth0Roles = 'read:auth0_roles',
    CreateAuth0UserRoles = 'create:auth0_user_roles',
    DeleteAuth0UserRoles = 'delete:auth0_user_roles',
    ReadPermissions = 'read:permissions',
    ReadRoles = 'read:roles',
    CreatePermissions = 'create:permissions',
    CreateRoles = 'create:roles',
    DeletePermissions = 'delete:permissions',
    DeleteRoles = 'delete:roles',
    UpdatePermissions = 'update:permissions',
    UpdateRoles = 'update:roles'
}

