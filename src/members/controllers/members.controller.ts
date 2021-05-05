import {Response} from "express";
import {Member} from "../models/members.model";
import {projectAuthorizationService} from "../../projects/services/project-authorization.service";
import {Profile} from "../../profiles/models/profiles.model";
import {Auth0Request, ProjectAuthorization, ProjectAuthorizationByMember} from "../../common/types/interfaces";
import {ProjectOperationRole} from "../../common/types/enums";
import {errorHandlerService} from "../../common/services/error-handler.service";
import {BadRequestError} from "../../common/types/errors";

class MembersController {

    async createMember(request: Auth0Request, response: Response) {
        try {

            const projectAuthorization: ProjectAuthorization = await projectAuthorizationService.authorize(
                request.user.sub,
                request.body.project,
                ProjectOperationRole.Admin
            );

            const existingMember = await Member.findOne({
                project: request.body.project,
                profile: request.body.profile
            })

            if (existingMember) {
                const error = new BadRequestError('project already has this member');
                return response.status(errorHandlerService.getStatusCode(error)).send(error);
            }

            const profile = await Profile.findById(request.body.profile);

            if (!profile) {
                const error = new BadRequestError('profile does not exist');
                return response.status(errorHandlerService.getStatusCode(error)).send(error);
            }

            if (request.body.role === ProjectOperationRole.Creator) {
                if (request.body.profile !== projectAuthorization.project.creatorProfile.toString()) {
                    const error = new BadRequestError('creator role can be assigned only to the project creator');
                    return response.status(errorHandlerService.getStatusCode(error)).send(error);
                }
            }

            if (request.body.profile === projectAuthorization.project.creatorProfile.toString()) {
                if ( request.body.role !== ProjectOperationRole.Creator) {
                    const error = new BadRequestError('if the project creator is going to be added as a member, they should have a creator role');
                    return response.status(errorHandlerService.getStatusCode(error)).send(error);
                }
            }

            const memberData = {
                ...request.body,
                userId: profile.userId
            };

            const member = await Member.create(memberData);

            await projectAuthorization.project.updateOne({
                $push: {
                    members: member._id
                }
            });

            response.status(201).send(member);
        } catch (error) {

            response.status(errorHandlerService.getStatusCode(error)).send(error);
        }
    }

    async getMembers(request: Auth0Request, response: Response) {
        try {
            const members = await Member.find({}).populate('project profile', '-members -__v');

            response.status(200).send(members);
        } catch (error) {

            response.status(errorHandlerService.getStatusCode(error)).send(error);
        }
    }

    async getMember(request: Auth0Request, response: Response) {
        try {
            const member = await Member.findById(request.params.id).populate('project profile', '-members -__v');

            response.status(200).send(member);
        } catch (error) {

            response.status(errorHandlerService.getStatusCode(error)).send(error);
        }
    }

    async updateMember(request: Auth0Request, response: Response) {
        try {

            const projectAuthorizationByMember: ProjectAuthorizationByMember = await projectAuthorizationService.authorizeByMember(
                request.user.sub,
                request.params.id,
                ProjectOperationRole.Admin
            );

            if (request.body.role === ProjectOperationRole.Creator) {
                if (request.body.profile !== projectAuthorizationByMember.project.creatorProfile.toString()) {
                    const error = new BadRequestError('creator role can be assigned only to the project creator');
                    return response.status(errorHandlerService.getStatusCode(error)).send(error);
                }
            }

            if (projectAuthorizationByMember.member.profile === projectAuthorizationByMember.project.creatorProfile) {
                if ( request.body.role !== ProjectOperationRole.Creator) {
                    const error = new BadRequestError("'creator' is the only role the a project creator can be assigned to");
                    return response.status(errorHandlerService.getStatusCode(error)).send(error);
                }
            }

            await projectAuthorizationByMember.member.updateOne(
                request.body,
                {
                    runValidators: true
                }
            );

            response.status(200).send('member was successfully updated');
        } catch (error) {

            response.status(errorHandlerService.getStatusCode(error)).send(error);
        }
    }

    async deleteMember(request: Auth0Request, response: Response) {
        try {

            const projectAuthorizationByMember: ProjectAuthorizationByMember = await projectAuthorizationService.authorizeByMember(
                request.user.sub,
                request.params.id,
                ProjectOperationRole.Admin
            );

            await projectAuthorizationByMember.member.deleteOne();

            await projectAuthorizationByMember.project.updateOne({
                $pull: {
                    members: projectAuthorizationByMember.member._id
                }
            });

            response.status(200).send("the member was successfully deleted");
        } catch (error) {

            response.status(errorHandlerService.getStatusCode(error)).send(error);
        }
    }
}

export const membersController = new MembersController();
