import {Request} from "express";
import {IProject} from "../../projects/models/projects.model";
import {IMember} from "../../members/models/members.model";
import {ITask} from "../../tasks/models/tasks.model";
import {GridFSBucketOpenUploadStreamOptions, GridFSBucketReadStream} from "mongodb";

export interface Auth0Request extends Request {
    user?: any;
}

export interface Auth0MetaData {
    user_metadata?: object;
    app_metadata?: object;
}

// the reason for adding the CustomError type is because express doesn't send the error object of the errors with the
// type of "Error" properly. For instance if you throw new Error('error') and try to send it to client using:
// response.send(error), an empty error message will be sent to the client.
export class CustomError extends Error {
    error: string;

    constructor(message: string) {
        super(message);
        this.name = 'CustomError';
        this.error = message;
        Error.captureStackTrace(this, CustomError)
    }
}

export enum ValidationDataSource {
    Query,
    Headers,
    Body
}

export enum Auth0Permissions {
    ReadAuth0Users = 'read:auth0_users',
    ReadAuth0UserRoles = 'read:auth0_user_roles',
    ReadAuth0UserPermissions = 'read:auth0_user_permissions',
    ReadAuth0Roles = 'read:auth0_roles',
    CreateAuth0UserRoles = 'create:auth0_user_roles',
    DeleteAuth0UserRoles = 'delete:auth0_user_roles'
}

export enum ProjectOperationRole {
    Guest = 1000,
    Viewer = 2000,
    Developer = 3000,
    Admin = 4000,
    Creator = 5000
}

export enum WorkStatus {
    NotStarted = 'not_started',
    InProgress = 'in_progress',
    Done = 'done',
    QA = 'qa',
    UAT = 'uat',
    MoreWorkIsNeeded = 'more_work_is_needed',
    Accepted = 'accepted'
}

export enum FileCategory {
    Pictures = 'pictures',
    Attachments = 'attachments'
}

export interface ProjectAuthorization {
    isAuthorized: boolean;
    project?: IProject;
}

export interface ProjectAuthorizationByMember extends ProjectAuthorization {
    member?: IMember
}

export interface ProjectAuthorizationByTask extends ProjectAuthorization {
    task?: ITask
}

export interface FileOptions {
    filename?: string;
    gridFSBucketOpenUploadStreamOptions?: GridFSBucketOpenUploadStreamOptions;
}

export interface FileStream {
    file: any;
    stream: GridFSBucketReadStream;
}
