import {Auth0Request, ProjectAuthorization, ProjectOperationRole} from "../../common/services/types.service";
import {Response} from "express";
import {Task} from "../models/tasks.model";
import {projectAuthorizationService} from "../../projects/services/project-authorization.service";
import {Member} from "../../members/models/members.model";

class TasksController {
    async createTask(request: Auth0Request, response: Response) {
        try {
            const projectAuthorization: ProjectAuthorization = await projectAuthorizationService.authorize(
                request.user.sub,
                request.body.project,
                ProjectOperationRole.Developer
            );

            if (!projectAuthorization.isAuthorized) {
                return response.status(401).send('permission denied, please contact the project admin');
            }

            let taskData = {
                ...request.body
            };

            if (request.body.owner) {
                const project = projectAuthorization.project;

                if (!project) {
                    return response.status(400).send('project does not exist');
                }

                if (!project.members.includes(request.body.owner)) {
                    return response.status(400).send('owner should be one of the members of the project');
                }

                const owner = await Member.findById(request.body.owner);

                if (!owner) {
                    return response.status(400).send('owner does not exist');
                }

                taskData = {
                    ...taskData,
                    ownerUserId: owner.userId
                };
            }

            const task = await Task.create(taskData);

            response.status(201).send(task);
        }
        catch (error) {
            response.status(500).send(error);
        }
    }
}

export const tasksController = new TasksController();
