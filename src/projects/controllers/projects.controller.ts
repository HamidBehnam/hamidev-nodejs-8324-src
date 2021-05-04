import {Response} from "express";
import {Project} from "../models/projects.model";
import {
    Auth0Request,
    FileCategory,
    FileOptions,
    FileStream,
    FileUploadResult,
    ProjectAuthorization,
    ProjectOperationRole
} from "../../common/services/types.service";
import {Profile} from "../../profiles/models/profiles.model";
import {sendgridService} from "../../common/services/sendgrid.service";
import {projectAuthorizationService} from "../services/project-authorization.service";
import {Member} from "../../members/models/members.model";
import {winstonService} from "../../common/services/winston.service";
import {projectsQueryService} from "../services/projects-query.service";
import {dbService} from "../../common/services/db.service";
import {multerMiddleware} from "../../common/middlewares/multer.middleware";
import {Types} from "mongoose";

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

            await project.populate('creatorProfile', '-__v').execPopulate();

            response.status(201).send(project);
        } catch (error) {

            response.status(500).send(error);
        }
    }

    async getProjects(request: Auth0Request, response: Response) {
        try {

            const queryParams = projectsQueryService.getProjectsQueryParams(request.query);

            const projects = await Project.find({})
                .limit(queryParams.limit)
                .skip(--queryParams.page * queryParams.limit)
                .sort(queryParams.sort)
                .populate([
                    {
                        path: 'creatorProfile',
                        model: 'Profile',
                        select: '-__v'
                    },{
                        path: 'members',
                        model: 'Member',
                        populate: [{
                            path: 'profile',
                            model: 'Profile',
                            select: '-__v'
                        }],
                        select: '-__v -project'
                    }, {
                        path: 'tasks',
                        model: 'Task',
                        select: '-__v',
                        populate: [{
                            path: 'owner',
                            model: 'Member',
                            select: 'profile',
                            populate: [{
                                path: 'profile',
                                model: 'Profile',
                                select: '-__v'
                            }]
                        }]
                    }, {
                        path: 'image',
                        model: 'Image',
                        select: '-__v'
                    }
                ]);

            sendgridService
                .sendEmail(
                    {email: "xxxxxx@gmail.com", name: "Hamid"},
                    {email: "info@hamidbehnam.com", name: "Project Management App"},
                    "d-bb86afa964f741f88da1c473b3382fe2"
                )
                .then(() => winstonService.Logger.info('Email sent'))
                .catch(error => winstonService.Logger.error(error));

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
                return response.status(401).send('permission denied, please contact the project admin');
            }

            if (!projectAuthorization.project) {
                return response.status(400).send('project does not exist');
            }

            await projectAuthorization.project.updateOne(request.body);

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
                return response.status(401).send('permission denied, please contact the project admin');
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

    async uploadProjectImage(request: Auth0Request, response: Response) {

        multerMiddleware.imageMulter('image')(request, response, async (error: any) => {
            try {

                if (error) {
                    return response.status(400).send(error);
                }

                if (!request.file) {
                    return response.status(400).send('file is not sent');
                }

                const projectAuthorization: ProjectAuthorization = await projectAuthorizationService.authorize(
                    request.user.sub,
                    request.params.id,
                    ProjectOperationRole.Admin
                );

                if (!projectAuthorization.isAuthorized) {
                    return response.status(401).send('permission denied, please contact the project admin');
                }

                if (!projectAuthorization.project) {
                    return response.status(400).send('project does not exist');
                }

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

                response.status(201).send('project image was successfully uploaded');
            } catch (error) {

                response.status(500).send(error);
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

            if (!projectAuthorization.isAuthorized) {
                return response.status(401).send('permission denied, please contact the project admin');
            }

            if (!projectAuthorization.project) {
                return response.status(400).send('project does not exist');
            }

            await dbService.deleteFile(FileCategory.Images, request.params.fileId);

            await projectAuthorization.project.updateOne({
                $unset: {
                    image: 1
                }
            });

            response.status(201).send('project image was successfully removed');
        } catch (error) {

            response.status(500).send(error);
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

            response.status(500).send(error);
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

            response.status(500).send(error);
        }
    }
}

export const projectsController = new ProjectsController();
