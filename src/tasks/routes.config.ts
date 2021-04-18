import {Router} from "express";
import {authMiddleware} from "../common/middlewares/auth.middleware";
import {tasksController} from "./controllers/tasks.controller";
import {fieldsMiddleware} from "../common/middlewares/fields.middleware";

export const tasksRoutesConfig = (): Router => {
    const tasksRouter = Router();

    tasksRouter.post('/tasks', [
        authMiddleware.checkJwt,
        tasksController.createTask
    ]);

    tasksRouter.get('/tasks', [
        authMiddleware.checkJwt,
        tasksController.getTasks
    ]);

    tasksRouter.get('/tasks/:id', [
        authMiddleware.checkJwt,
        tasksController.getTask
    ]);

    tasksRouter.patch('/tasks/:id', [
        authMiddleware.checkJwt,
        tasksController.updateTask
    ]);

    tasksRouter.delete('/tasks/:id', [
        authMiddleware.checkJwt,
        tasksController.deleteTask
    ]);

    return tasksRouter;
};
