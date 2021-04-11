import {Router} from "express";
import {authMiddleware} from "../common/middlewares/auth.middleware";
import {Auth0Permissions} from "../common/services/types.service";
import {permissionsController} from "./controllers/permissions.controller";

export const permissionsRoutesConfig = (): Router => {
    const permissionsRouter = Router();

    permissionsRouter.post('/permissions', [
        authMiddleware.checkJwt,
        authMiddleware.checkAuth0Permissions([Auth0Permissions.CreatePermissions]),
        permissionsController.createPermission
    ]);

    permissionsRouter.get('/permissions', [
        authMiddleware.checkJwt,
        authMiddleware.checkAuth0Permissions([Auth0Permissions.ReadPermissions]),
        permissionsController.getPermissions
    ]);

    permissionsRouter.get('/permissions/:id', [
        authMiddleware.checkJwt,
        authMiddleware.checkAuth0Permissions([Auth0Permissions.ReadPermissions]),
        permissionsController.getPermission
    ]);

    permissionsRouter.delete('/permissions/:id', [
        authMiddleware.checkJwt,
        authMiddleware.checkAuth0Permissions([Auth0Permissions.DeletePermissions]),
        permissionsController.deletePermission
    ]);

    permissionsRouter.patch('/permissions/:id', [
        authMiddleware.checkJwt,
        authMiddleware.checkAuth0Permissions([Auth0Permissions.UpdatePermissions]),
        permissionsController.updatePermission
    ]);

    return permissionsRouter;
};
