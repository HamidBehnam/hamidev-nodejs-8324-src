import {NextFunction, Response} from "express";
import {Project} from "../models/projects.model";
import {Auth0Request} from "../../common/services/types.service";
import {Profile} from "../../profiles/models/profiles.model";

export const createProject = async (request: Auth0Request, response: Response, next: NextFunction) => {
    try {

        const userProfile = await Profile.findOne({userId: request.user.sub});

        if (!userProfile) {
            response.status(400).send('user must have a profile');
            return next();
        }

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
