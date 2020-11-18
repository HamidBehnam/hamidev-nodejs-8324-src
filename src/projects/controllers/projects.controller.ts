import {Request, Response} from "express";
import {Project} from "../models/projects.model";

export const createProject = async (request: Request, response: Response) => {
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

export const getProjects = async (request: Request, response: Response) => {
    try {

        const projects = await Project.find({});

        response.status(200).send(projects);
    } catch (error) {

        response.status(500).send(error);
    }
};
