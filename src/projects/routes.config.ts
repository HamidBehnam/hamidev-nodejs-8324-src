import {Router} from "express";
import {authMiddleware} from "../common/middlewares/auth.middleware";
import {projectsController} from "./controllers/projects.controller";

export const projectsRoutesConfig = (): Router => {
    const projectsRouter = Router();

    projectsRouter.post('/projects', [
        authMiddleware.checkJwt,
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

    return projectsRouter;
};
