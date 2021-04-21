import {Response} from "express";
import {Project} from "../models/projects.model";
import {Auth0Request, ProjectAuthorization, ProjectOperationRole} from "../../common/services/types.service";
import {Profile} from "../../profiles/models/profiles.model";
import {sendgridService} from "../../common/services/sendgrid.service";
import {projectAuthorizationService} from "../services/project-authorization.service";
import {Member} from "../../members/models/members.model";

class ProjectsController {
    async createProject(request: Auth0Request, response: Response) {
        try {

            const creatorProfile = await Profile.findById(request.body.creatorProfile);

            if (!creatorProfile) {
                return response.status(400).send('creator profile does not exist');
            } else if (creatorProfile.userId !== request.user.sub) {
                return response.status(400).send('provided profile does not belong to the user');
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

            const projects = await Project.find({}).populate({
                path: 'members',
                model: 'Member',
                populate: [{
                    path: 'profile',
                    model: 'Profile',
                    select: '-__v'
                }],
                select: '-__v -project'
            });

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

    async getProject(request: Auth0Request, response: Response) {
        try {

            const project = await Project.findById(request.params.id).populate({
                path: 'members',
                model: 'Member',
                populate: [{
                    path: 'profile',
                    model: 'Profile',
                    select: '-__v'
                }],
                select: '-__v -project'
            });

            response.status(200).send(project);
        } catch (error) {

            response.status(500).send(error);
        }
    }

    async updateProject(request: Auth0Request, response: Response) {
        try {

            const projectAuthorization: ProjectAuthorization = await projectAuthorizationService.authorize(
                request.user.sub,
                request.params.id,
                ProjectOperationRole.Admin
            );

            if (!projectAuthorization.isAuthorized) {
                return response.status(401).send('permission denied, please contact the project owner');
            }

            if (!projectAuthorization.project) {
                return response.status(400).send('project does not exist');
            }

            await projectAuthorization.project.updateOne(request.body);

            // TODO: REMOVE THIS AFTER TESTING
            // const updatedProject = await Project.findByIdAndUpdate(
            //     request.params.id,
            //     request.body, {
            //         new: true,
            //         runValidators: true
            //     });

            response.status(200).send('project was successfully updated');
        } catch (error) {

            response.status(500).send(error);
        }
    }

    async deleteProject(request: Auth0Request, response: Response) {
        try {
            const projectAuthorization: ProjectAuthorization = await projectAuthorizationService.authorize(
                request.user.sub,
                request.params.id,
                ProjectOperationRole.Admin
            );

            if (!projectAuthorization.isAuthorized) {
                return response.status(401).send('permission denied, please contact the project owner');
            }

            await Member.deleteMany({
                project: request.params.id
            });

            if (!projectAuthorization.project) {
                return response.status(400).send('project does not exist');
            }

            await projectAuthorization.project.deleteOne();

            response.status(200).send('project was successfully deleted');
        } catch (error) {

            response.status(500).send(error);
        }
    }
}

export const projectsController = new ProjectsController();
