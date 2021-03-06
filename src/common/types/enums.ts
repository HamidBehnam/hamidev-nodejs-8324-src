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
    Images = 'images',
    Attachments = 'attachments'
}