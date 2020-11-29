import {Application} from "express";
import * as projectsController from "./controllers/projects.controller";
import {jwtCheck} from "../common/services/auth.service";

export const projectsRoutesConfig = (app: Application) => {
    app.get('/projects', [
        jwtCheck,
        projectsController.getProjects
    ]);

    app.post('/projects', [
        projectsController.createProject
    ]);
};
