import {Router} from "express";
import {authMiddleware} from "../common/middlewares/auth.middleware";
import {tasksController} from "./controllers/tasks.controller";
import {fieldsMiddleware} from "../common/middlewares/fields.middleware";

export const tasksRoutesConfig = (): Router => {
    const tasksRouter = Router();

    tasksRouter.post('/tasks', [
        authMiddleware.checkJwt,
        // the reason for disallowing the ownerUserId is because it should be changed in the controller
        // once the owner field is being set to make sure ownerUserId is the userId of the owner
        fieldsMiddleware.disallow(['ownerUserId']),
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

    // tasksRouter.patch('/tasks/:id', [
    //     authMiddleware.checkJwt,
    //     // the reason for disallowing the project field is because changing the project field will change
    //     // the context of the task, if it needs to be changed it makes sense to delete the task and add it again.
    //     // the reason for disallowing the ownerUserId is because it should be changed in the controller
    //     // once the owner field is being set to make sure ownerUserId is the userId of the owner
    //     fieldsMiddleware.disallow(['project', 'ownerUserId']),
    //     tasksController.updateTask
    // ]);
    //
    // tasksRouter.delete('/tasks/:id', [
    //     authMiddleware.checkJwt,
    //     tasksController.deleteTask
    // ]);

    return tasksRouter;
};
