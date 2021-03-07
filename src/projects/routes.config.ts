import {Router} from "express";
import {authService} from "../common/services/auth.service";
import {projectsController} from "./controllers/projects.controller";

export const projectsRoutesConfig = (): Router => {
    const projectsRouter = Router();

    projectsRouter.get('/projects', [
        authService.jwtCheck,
        projectsController.getProjects
    ]);

    projectsRouter.post('/projects', [
        authService.jwtCheck,
        projectsController.createProject
    ]);

    return projectsRouter;
};
