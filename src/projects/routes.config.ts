import {Router} from "express";
import {authMiddleware} from "../common/middlewares/auth.middleware";
import {projectsController} from "./controllers/projects.controller";
import {fieldsMiddleware} from "../common/middlewares/fields.middleware";

export const projectsRoutesConfig = (): Router => {
    const projectsRouter = Router();

    projectsRouter.post('/projects', [
        authMiddleware.checkJwt,
        // the reason for disallowing 'members' field is to make sure members are gonna be
        // created through its own endpoint so data will be in sync with the members collection
        fieldsMiddleware.disallow(['members']),
        projectsController.createProject
    ]);

    projectsRouter.get('/projects', [
        authMiddleware.checkJwt,
        projectsController.getProjects
    ]);

    projectsRouter.get('/projects/:id', [
        authMiddleware.checkJwt,
        projectsController.getProject
    ]);

    projectsRouter.patch('/projects/:id', [
        authMiddleware.checkJwt,
        // the reason for disallowing 'members' field is to make sure members are gonna be
        // updated through its own endpoint so data will be in sync with the members collection
        fieldsMiddleware.disallow(['members']),
        projectsController.updateProject
    ]);

    projectsRouter.delete('/projects/:id', [
        authMiddleware.checkJwt,
        projectsController.deleteProject
    ]);

    return projectsRouter;
};
