import {Response} from "express";
import {Task} from "../models/tasks.model";
import {projectAuthorizationService} from "../../projects/services/project-authorization.service";
import {Member} from "../../members/models/members.model";
import {Auth0Request, ProjectAuthorization, ProjectAuthorizationByTask} from "../../common/types/interfaces";
import {ProjectOperationRole} from "../../common/types/enums";
import {errorHandlerService} from "../../common/services/error-handler.service";

class TasksController {
    async createTask(request: Auth0Request, response: Response) {
        try {
            const projectAuthorization: ProjectAuthorization = await projectAuthorizationService.authorize(
                request.user.sub,
                request.body.project,
                ProjectOperationRole.Developer
            );

            let taskData = {
                ...request.body
            };

            if (request.body.owner) {

                if (!projectAuthorization.project.members.includes(request.body.owner)) {
                    return response.status(400).send('owner should be one of the members of the project');
                }

                const owner = await Member.findById(request.body.owner);

                if (!owner) {
                    return response.status(404).send('owner does not exist');
                }

                taskData = {
                    ...taskData,
                    ownerUserId: owner.userId
                };
            }

            const task = await Task.create(taskData);

            await projectAuthorization.project.updateOne({
                $push: {
                    tasks: task._id
                }
            });

            response.status(201).send(task);
        }
        catch (error) {
            response.status(errorHandlerService.getStatusCode(error)).send(error);
        }
    }

    async getTasks(request: Auth0Request, response: Response) {
        try {
            const tasks = await Task.find({});

            response.status(200).send(tasks);
        } catch (error) {

            response.status(errorHandlerService.getStatusCode(error)).send(error);
        }
    }

    async getTask(request: Auth0Request, response: Response) {
        try {
            const task = await Task.findById(request.params.id).populate([{
                path: 'project',
                model: 'Project'
            }, {
                path: 'owner',
                model: 'Member',
                select: 'profile',
                populate: [{
                    path: 'profile',
                    model: 'Profile'
                }]
            }]);

            response.status(200).send(task);
        } catch (error) {

            response.status(errorHandlerService.getStatusCode(error)).send(error);
        }
    }

    async updateTask(request: Auth0Request, response: Response) {
        try {

            const projectAuthorizationByTask: ProjectAuthorizationByTask = await projectAuthorizationService.authorizeByTask(
                request.user.sub,
                request.params.id,
                ProjectOperationRole.Developer
            );

            let taskData = {
                ...request.body
            };

            if (request.body.owner) {

                if (!projectAuthorizationByTask.project.members.includes(request.body.owner)) {
                    return response.status(400).send('owner should be one of the members of the project');
                }

                const owner = await Member.findById(request.body.owner);

                if (!owner) {
                    return response.status(404).send('owner does not exist');
                }

                taskData = {
                    ...taskData,
                    ownerUserId: owner.userId
                };
            }

            await projectAuthorizationByTask.task.updateOne(
                taskData,
                {
                    runValidators: true
                }
            );

            response.status(200).send('task was successfully updated');
        } catch (error) {

            response.status(errorHandlerService.getStatusCode(error)).send(error);
        }
    }

    async deleteTask(request: Auth0Request, response: Response) {
        try {
            const projectAuthorizationByTask: ProjectAuthorizationByTask = await projectAuthorizationService.authorizeByTask(
                request.user.sub,
                request.params.id,
                ProjectOperationRole.Developer
            );

            await projectAuthorizationByTask.task.deleteOne();

            await projectAuthorizationByTask.project.updateOne({
                $pull: {
                    tasks: projectAuthorizationByTask.task._id
                }
            });

            response.status(200).send('task was successfully deleted');
        } catch (error) {

            response.status(errorHandlerService.getStatusCode(error)).send(error);
        }
    }
}

export const tasksController = new TasksController();
