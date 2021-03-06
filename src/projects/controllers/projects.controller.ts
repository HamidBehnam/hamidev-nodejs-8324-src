import {Response} from "express";
import {Project} from "../models/projects.model";
import {Profile} from "../../profiles/models/profiles.model";
import {sendgridService} from "../../common/services/sendgrid.service";
import {projectAuthorizationService} from "../services/project-authorization.service";
import {Member} from "../../members/models/members.model";
import {winstonService} from "../../common/services/winston.service";
import {projectsQueryService} from "../services/projects-query.service";
import {dbService} from "../../common/services/db.service";
import {multerMiddleware} from "../../common/middlewares/multer.middleware";
import {Types} from "mongoose";
import {
    Auth0Request,
    FileOptions,
    FileStream,
    FileUploadResult,
    ProjectAuthorization
} from "../../common/types/interfaces";
import {FileCategory, ProjectOperationRole} from "../../common/types/enums";
import {errorHandlerService} from "../../common/services/error-handler.service";
import {BadRequestError} from "../../common/types/errors";
import {Task} from "../../tasks/models/tasks.model";

class ProjectsController {
    async createProject(request: Auth0Request, response: Response) {
        try {

            const creatorProfile = await Profile.findById(request.body.creatorProfile);

            if (!creatorProfile) {
                const error = new BadRequestError('creator profile does not exist');
                return response.status(errorHandlerService.getStatusCode(error)).send(error);
            } else if (creatorProfile.userId !== request.user.sub) {
                const error = new BadRequestError('provided profile does not belong to the user');
                return response.status(errorHandlerService.getStatusCode(error)).send(error);
            }

            const projectData = {
                ...request.body,
                createdBy: request.user.sub
            };

            const project = await Project.create(projectData);

            await project.populate('creatorProfile', '-__v').execPopulate();

            response.status(201).send(project);
        } catch (error) {

            response.status(errorHandlerService.getStatusCode(error)).send(error);
        }
    }

    async getProjects(request: Auth0Request, response: Response) {
        try {

            const queryParams = projectsQueryService.getProjectsQueryParams(request.query);

            const projects = await Project.aggregate(projectsQueryService.getProjectsAggregateQuery(request.user.sub))
            .sort(queryParams.sort)
            .limit(queryParams.limit)
            .skip(--queryParams.page * queryParams.limit);

            // sendgridService
            //     .sendEmail(
            //         {email: "xxxxxx@gmail.com", name: "Hamid"},
            //         {email: "info@hamidbehnam.com", name: "Project Management App"},
            //         "d-bb86afa964f741f88da1c473b3382fe2"
            //     )
            //     .then(() => winstonService.Logger.info('Email sent'))
            //     .catch(error => winstonService.Logger.error(error));

            response.status(200).send(projects);
        } catch (error) {

            response.status(errorHandlerService.getStatusCode(error)).send(error);
        }
    }

    async getProject(request: Auth0Request, response: Response) {
        try {

            const project = await Project
                .aggregate(projectsQueryService.getProjectAggregateQuery(request.user.sub, request.params.id));

            response.status(200).send(project.pop());
        } catch (error) {

            response.status(errorHandlerService.getStatusCode(error)).send(error);
        }
    }

    async getProjectVerbose(request: Auth0Request, response: Response) {
        try {

            const project = await Project
                .aggregate(projectsQueryService.getProjectVerboseAggregateQuery(request.user.sub, request.params.id));

            response.status(200).send(project.pop());
        } catch (error) {

            response.status(errorHandlerService.getStatusCode(error)).send(error);
        }
    }

    async getProjectMembers(request: Auth0Request, response: Response) {
        try {

            const members = await Member
                .aggregate(projectsQueryService.getProjectMembersAggregateQuery(request.params.id));

            response.status(200).send(members);
        } catch (error) {

            response.status(errorHandlerService.getStatusCode(error)).send(error);
        }
    }

    async getProjectTasks(request: Auth0Request, response: Response) {
        try {

            const tasks = await Task
                .aggregate(projectsQueryService.getProjectTasksAggregateQuery(request.params.id));

            response.status(200).send(tasks);
        } catch (error) {

            response.status(errorHandlerService.getStatusCode(error)).send(error);
        }
    }

    async updateProject(request: Auth0Request, response: Response) {
        try {

            const projectAuthorization: ProjectAuthorization = await projectAuthorizationService.authorize(
                request.user.sub,
                request.params.id,
                ProjectOperationRole.Admin
            );

            await projectAuthorization.project.updateOne(
                request.body,
                {
                    runValidators: true
                });

            response.status(200).send('project was successfully updated');
        } catch (error) {

            response.status(errorHandlerService.getStatusCode(error)).send(error);
        }
    }

    async deleteProject(request: Auth0Request, response: Response) {
        try {
            const projectAuthorization: ProjectAuthorization = await projectAuthorizationService.authorize(
                request.user.sub,
                request.params.id,
                ProjectOperationRole.Admin
            );

            await Member.deleteMany({
                project: request.params.id
            });

            await Task.deleteMany({
                project: request.params.id
            });

            if (projectAuthorization.project.image) {
                await dbService.deleteFile(FileCategory.Images, projectAuthorization.project.image.toString());
            }

            // using global.Promise to avoid getting the typescript warning suggesting that it needs to be imported.
            await global.Promise.all((projectAuthorization.project.attachments as Types.ObjectId[])
                .map((attachment) => dbService.deleteFile(FileCategory.Attachments, attachment.toString())));

            await projectAuthorization.project.deleteOne();

            response.status(200).send({
                message: 'project was successfully deleted'
            });
        } catch (error) {

            response.status(errorHandlerService.getStatusCode(error)).send(error);
        }
    }

    async uploadProjectImage(request: Auth0Request, response: Response) {

        multerMiddleware.imageMulter('image')(request, response, async (error: any) => {
            try {

                if (error) {
                    return response.status(errorHandlerService.getStatusCode(error)).send(error);
                }

                if (!request.file) {
                    const error = new BadRequestError('file is not sent');
                    return response.status(errorHandlerService.getStatusCode(error)).send(error);
                }

                const projectAuthorization: ProjectAuthorization = await projectAuthorizationService.authorize(
                    request.user.sub,
                    request.params.id,
                    ProjectOperationRole.Admin
                );

                const fileOptions: FileOptions = {
                    gridFSBucketOpenUploadStreamOptions: {
                        metadata: {
                            project: projectAuthorization.project._id
                        }
                    }
                };

                const fileUploadResult: FileUploadResult =
                    await dbService.saveFile(FileCategory.Images, request.file, fileOptions);

                const oldImageId = projectAuthorization.project.image;

                await projectAuthorization.project.updateOne({
                    image: fileUploadResult.id
                });

                if (oldImageId) {

                    await dbService.deleteFile(FileCategory.Images, (oldImageId as Types.ObjectId).toString());
                }

                response.status(201).send({
                    id: fileUploadResult.id
                });
            } catch (error) {

                response.status(errorHandlerService.getStatusCode(error)).send(error);
            }
        });
    }

    async deleteProjectImage(request: Auth0Request, response: Response) {

        try {

            const projectAuthorization: ProjectAuthorization = await projectAuthorizationService.authorize(
                request.user.sub,
                request.params.id,
                ProjectOperationRole.Admin
            );

            await dbService.deleteFile(FileCategory.Images, request.params.fileId);

            await projectAuthorization.project.updateOne({
                $unset: {
                    image: 1
                }
            });

            response.status(201).send({
                message: 'project image was successfully removed'
            });
        } catch (error) {

            response.status(errorHandlerService.getStatusCode(error)).send(error);
        }
    }

    async getProjectImage(request: Auth0Request, response: Response) {
        try {

            // loading the project data before loading its file is not needed atm but the project id
            // will be in request.params.id
            const fileStream: FileStream = await dbService.getFileStream(FileCategory.Images, request.params.fileId);
            response.header('Content-Disposition', `attachment; filename="${fileStream.file.filename}"`);
            fileStream.stream.pipe(response);
        } catch (error) {

            response.status(errorHandlerService.getStatusCode(error)).send(error);
        }
    }

    async uploadProjectAttachment(request: Auth0Request, response: Response) {

        multerMiddleware.attachmentMulter('attachment')(request, response, async (error: any) => {
            try {

                if (error) {
                    return response.status(errorHandlerService.getStatusCode(error)).send(error);
                }

                if (!request.file) {
                    const error = new BadRequestError('file is not sent');
                    return response.status(errorHandlerService.getStatusCode(error)).send(error);
                }

                const projectAuthorization: ProjectAuthorization = await projectAuthorizationService.authorize(
                    request.user.sub,
                    request.params.id,
                    ProjectOperationRole.Admin
                );

                const fileOptions: FileOptions = {
                    gridFSBucketOpenUploadStreamOptions: {
                        metadata: {
                            project: projectAuthorization.project._id
                        }
                    }
                };

                const fileUploadResult: FileUploadResult =
                    await dbService.saveFile(FileCategory.Attachments, request.file, fileOptions);

                await projectAuthorization.project.updateOne({
                    $push: {
                        attachments: fileUploadResult.id
                    }
                });

                response.status(201).send({
                    id: fileUploadResult.id
                });
            } catch (error) {

                response.status(errorHandlerService.getStatusCode(error)).send(error);
            }
        });
    }


    async deleteProjectAttachment(request: Auth0Request, response: Response) {

        try {

            const projectAuthorization: ProjectAuthorization = await projectAuthorizationService.authorize(
                request.user.sub,
                request.params.id,
                ProjectOperationRole.Admin
            );

            await dbService.deleteFile(FileCategory.Attachments, request.params.fileId);

            await projectAuthorization.project.updateOne({
                $pull: {
                    attachments: request.params.fileId
                }
            });

            response.status(201).send({
                message: 'project attachment was successfully removed'
            });
        } catch (error) {

            response.status(errorHandlerService.getStatusCode(error)).send(error);
        }
    }

    async getProjectAttachment(request: Auth0Request, response: Response) {
        try {

            // loading the project data before loading its file is not needed atm but the project id
            // will be in request.params.id
            const fileStream: FileStream = await dbService.getFileStream(FileCategory.Attachments, request.params.fileId);
            response.header('Content-Disposition', `attachment; filename="${fileStream.file.filename}"`);
            fileStream.stream.pipe(response);
        } catch (error) {

            response.status(errorHandlerService.getStatusCode(error)).send(error);
        }
    }

    async getProjectAttachments(request: Auth0Request, response: Response) {
        try {

            const projects = await Project
                .aggregate(projectsQueryService.getProjectAttachmentsAggregateQuery(request.params.id));

            response.status(200).send(projects.pop());
        } catch (error) {

            response.status(errorHandlerService.getStatusCode(error)).send(error);
        }
    }
}

export const projectsController = new ProjectsController();
