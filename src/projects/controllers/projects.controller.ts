import {Response} from "express";
import {Project} from "../models/projects.model";
import {Auth0Request} from "../../common/services/types.service";

export const createProject = async (request: Auth0Request, response: Response) => {
    try {

        const projectData = {
            ...request.body
        };

        const project = await Project.create(projectData);

        response.status(201).send(project);
    } catch (error) {

        response.status(500).send(error);
    }
};

export const getProjects = async (request: Auth0Request, response: Response) => {
    try {

        const projects = await Project.find({});

        response.status(200).send(projects);
    } catch (error) {

        response.status(500).send(error);
    }
};
