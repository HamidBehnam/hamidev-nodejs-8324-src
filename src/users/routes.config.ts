import {Router} from "express";
import {authService} from "../common/services/auth.service";
import {usersController} from "./controllers/users.controller";

export const usersRoutesConfig = (): Router => {
    const usersRouter = Router();

    usersRouter.get('/users', [
        authService.jwtCheck,
        usersController.getUsers
    ]);

    usersRouter.get('/users/:id/roles', [
        authService.jwtCheck,
        usersController.getUserRoles
    ]);

    usersRouter.post('/users/:id/roles', [
        authService.jwtCheck,
        usersController.setUserRoles
    ]);

    usersRouter.delete('/users/:id/roles', [
        authService.jwtCheck,
        usersController.deleteUserRoles
    ]);

    usersRouter.get('/users/:id/permissions', [
        authService.jwtCheck,
        usersController.getUserPermissions
    ]);

    usersRouter.get('/roles', [
        authService.jwtCheck,
        usersController.getRoles
    ]);

    return usersRouter;
};
