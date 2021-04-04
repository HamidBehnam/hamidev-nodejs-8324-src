import {NextFunction, Response} from "express";
import {Project} from "../models/projects.model";
import {Auth0Request} from "../../common/services/types.service";
import {Profile} from "../../profiles/models/profiles.model";
import {sendgridService} from "../../common/services/sendgrid.service";

class ProjectsController {
    async createProject(request: Auth0Request, response: Response, next: NextFunction) {
        try {

            const creatorProfile = await Profile.findById(request.body.creatorProfile);

            if (!creatorProfile) {
                response.status(400).send('creator profile does not exist');
                return next();
            }

            const projectData = {
                ...request.body,
                createdBy: request.user.sub
            };

            const project = await Project.create(projectData);

            response.status(201).send(project);
        } catch (error) {

            response.status(500).send(error);
        }
    }

    async getProjects(request: Auth0Request, response: Response) {
        try {

            const projects = await Project.find({createdBy: request.user.sub});

            sendgridService
                .sendEmail(
                    {email: "xxxxxx@gmail.com", name: "Hamid"},
                    {email: "info@hamidbehnam.com", name: "Project Management App"},
                    "d-bb86afa964f741f88da1c473b3382fe2"
                )
                .then(() => console.log('Email sent'))
                .catch(error => console.log(error));

            response.status(200).send(projects);
        } catch (error) {

            response.status(500).send(error);
        }
    }
}

export const projectsController = new ProjectsController();
