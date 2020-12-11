import {Application} from "express";
import * as projectsController from "./controllers/projects.controller";
import {authService} from "../common/services/auth.service";

export const projectsRoutesConfig = (app: Application) => {
    app.get('/projects', [
        authService.jwtCheck,
        projectsController.getProjects
    ]);

    app.post('/projects', [
        authService.jwtCheck,
        projectsController.createProject
    ]);
};
