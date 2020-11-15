import {Application} from "express";
import * as projectsController from "./controllers/projects.controller";

export const projectsRoutesConfig = (app: Application) => {
    app.get('/projects', [
        projectsController.getProjects
    ]);
};
