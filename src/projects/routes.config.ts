import {Router} from "express";
import {authMiddleware} from "../common/middlewares/auth.middleware";
import {projectsController} from "./controllers/projects.controller";

export const projectsRoutesConfig = (): Router => {
    const projectsRouter = Router();

    projectsRouter.get('/projects', [
        authMiddleware.checkJwt,
        projectsController.getProjects
    ]);

    projectsRouter.post('/projects', [
        authMiddleware.checkJwt,
        projectsController.createProject
    ]);

    return projectsRouter;
};
