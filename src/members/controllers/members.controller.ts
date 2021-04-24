import {
    Auth0Request,
    ProjectAuthorization,
    ProjectAuthorizationByMember,
    ProjectOperationRole
} from "../../common/services/types.service";
import {Response} from "express";
import {Member} from "../models/members.model";
import {projectAuthorizationService} from "../../projects/services/project-authorization.service";
import {Profile} from "../../profiles/models/profiles.model";

class MembersController {

    async createMember(request: Auth0Request, response: Response) {
        try {

            const projectAuthorization: ProjectAuthorization = await projectAuthorizationService.authorize(
                request.user.sub,
                request.body.project,
                ProjectOperationRole.Admin
            );

            if (!projectAuthorization.isAuthorized) {
                return response.status(401).send('permission denied, please contact the project admin');
            }

            const existingMember = await Member.findOne({
                project: request.body.project,
                profile: request.body.profile
            })

            if (existingMember) {
                return response.status(400).send('project already has this member');
            }

            const profile = await Profile.findById(request.body.profile);
            const project = projectAuthorization.project;

            if (!profile || !project) {
                return response.status(400).send('profile or project does not exist');
            }

            if (request.body.role === ProjectOperationRole.Creator) {
                if (request.body.profile !== project.creatorProfile.toString()) {
                    return response.status(400).send('creator role can be assigned only to the project creator');
                }
            }

            if (request.body.profile === project.creatorProfile.toString()) {
                if ( request.body.role !== ProjectOperationRole.Creator) {
                    return response.status(400).send("if the project creator is going to be added as a member, they should have a creator role");
                }
            }

            const memberData = {
                ...request.body,
                userId: profile.userId
            };

            const member = await Member.create(memberData);

            await project.updateOne({
                $push: {
                    members: member._id
                }
            });

            response.status(201).send(member);
        } catch (error) {

            response.status(500).send(error);
        }
    }

    async getMembers(request: Auth0Request, response: Response) {
        try {
            const members = await Member.find({}).populate('project profile', '-members -__v');

            response.status(200).send(members);
        } catch (error) {

            response.status(500).send(error);
        }
    }

    async getMember(request: Auth0Request, response: Response) {
        try {
            const member = await Member.findById(request.params.id).populate('project profile', '-members -__v');

            response.status(200).send(member);
        } catch (error) {

            response.status(500).send(error);
        }
    }

    async updateMember(request: Auth0Request, response: Response) {
        try {

            const projectAuthorizationByMember: ProjectAuthorizationByMember = await projectAuthorizationService.authorizeByMember(
                request.user.sub,
                request.params.id,
                ProjectOperationRole.Admin
            );

            if (!projectAuthorizationByMember.isAuthorized) {
                return response.status(401).send('permission denied, please contact the project admin');
            }

            if (!projectAuthorizationByMember.member) {
                return response.status(404).send("member does not exist");
            }

            await projectAuthorizationByMember.member.updateOne(
                request.body,
                {
                    runValidators: true
                }
            );

            response.status(200).send('member was successfully updated');
        } catch (error) {

            response.status(500).send(error);
        }
    }

    async deleteMember(request: Auth0Request, response: Response) {
        try {

            const projectAuthorizationByMember: ProjectAuthorizationByMember = await projectAuthorizationService.authorizeByMember(
                request.user.sub,
                request.params.id,
                ProjectOperationRole.Admin
            );

            if (!projectAuthorizationByMember.isAuthorized) {
                return response.status(401).send('permission denied, please contact the project admin');
            }

            if (!projectAuthorizationByMember.member) {
                return response.status(404).send("member does not exist");
            }

            await projectAuthorizationByMember.member.deleteOne();

            if (!projectAuthorizationByMember.project) {
                return response.status(404).send("project does not exist");
            }

            await projectAuthorizationByMember.project.updateOne({
                $pull: {
                    members: projectAuthorizationByMember.member._id
                }
            });

            response.status(200).send("the member was successfully deleted");
        } catch (error) {

            response.status(500).send(error);
        }
    }
}

export const membersController = new MembersController();
