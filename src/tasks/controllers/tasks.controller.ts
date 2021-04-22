import {
    Auth0Request,
    ProjectAuthorization,
    ProjectAuthorizationByTask,
    ProjectOperationRole
} from "../../common/services/types.service";
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

            const project = projectAuthorization.project;

            if (!project) {
                return response.status(404).send('project does not exist');
            }

            let taskData = {
                ...request.body
            };

            if (request.body.owner) {

                if (!project.members.includes(request.body.owner)) {
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

            await project.updateOne({
                $push: {
                    tasks: task._id
                }
            });

            response.status(201).send(task);
        }
        catch (error) {
            response.status(500).send(error);
        }
    }

    async getTasks(request: Auth0Request, response: Response) {
        try {
            const tasks = await Task.find({});

            response.status(200).send(tasks);
        } catch (error) {

            response.status(500).send(error);
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

            response.status(500).send(error);
        }
    }

    async updateTask(request: Auth0Request, response: Response) {
        try {

            const projectAuthorizationByTask: ProjectAuthorizationByTask = await projectAuthorizationService.authorizeByTask(
                request.user.sub,
                request.params.id,
                ProjectOperationRole.Developer
            );

            if (!projectAuthorizationByTask.isAuthorized) {
                return response.status(401).send('permission denied, please contact the project admin');
            }

            const task = projectAuthorizationByTask.task;

            if (!task) {
                return response.status(404).send("task does not exist");
            }

            const project = projectAuthorizationByTask.project;

            if (!project) {
                return response.status(404).send('project does not exist');
            }

            let taskData = {
                ...request.body
            };

            if (request.body.owner) {

                if (!project.members.includes(request.body.owner)) {
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

            await task.updateOne(
                taskData,
                {
                    runValidators: true
                }
            );

            response.status(200).send('task was successfully updated');
        } catch (error) {

            response.status(500).send(error);
        }
    }

    async deleteTask(request: Auth0Request, response: Response) {
        try {
            const projectAuthorizationByTask: ProjectAuthorizationByTask = await projectAuthorizationService.authorizeByTask(
                request.user.sub,
                request.params.id,
                ProjectOperationRole.Developer
            );

            if (!projectAuthorizationByTask.isAuthorized) {
                return response.status(401).send('permission denied, please contact the project admin');
            }

            const task = projectAuthorizationByTask.task;

            if (!task) {
                return response.status(404).send('task does not exist');
            }

            await task.deleteOne();

            const project = projectAuthorizationByTask.project;

            if (!project) {
                return response.status(404).send('project does not exist');
            }

            await project.updateOne({
                $pull: {
                    tasks: task._id
                }
            });

            response.status(200).send('task was successfully deleted');
        } catch (error) {

            response.status(500).send(error);
        }
    }
}

export const tasksController = new TasksController();
