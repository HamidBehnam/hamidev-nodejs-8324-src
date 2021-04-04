import {Router} from "express";
import {authMiddleware} from "../common/middlewares/auth.middleware";
import {usersController} from "./controllers/users.controller";
import {Permissions} from "../common/services/types.service";

export const usersRoutesConfig = (): Router => {
    const usersRouter = Router();

    usersRouter.get('/users', [
        authMiddleware.checkJwt,
        authMiddleware.checkPermissions([Permissions.ReadUsers]),
        usersController.getUsers
    ]);

    usersRouter.get('/users/:id/roles', [
        authMiddleware.checkJwt,
        authMiddleware.checkPermissions([Permissions.ReadUserRoles]),
        usersController.getUserRoles
    ]);

    usersRouter.post('/users/:id/roles', [
        authMiddleware.checkJwt,
        authMiddleware.checkPermissions([Permissions.CreateUserRoles]),
        usersController.setUserRoles
    ]);

    usersRouter.delete('/users/:id/roles', [
        authMiddleware.checkJwt,
        authMiddleware.checkPermissions([Permissions.DeleteUserRoles]),
        usersController.deleteUserRoles
    ]);

    usersRouter.get('/users/:id/permissions', [
        authMiddleware.checkJwt,
        authMiddleware.checkPermissions([Permissions.ReadUserPermissions]),
        usersController.getUserPermissions
    ]);

    usersRouter.get('/roles', [
        authMiddleware.checkJwt,
        authMiddleware.checkPermissions([Permissions.ReadRoles]),
        usersController.getRoles
    ]);

    return usersRouter;
};
