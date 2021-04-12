import {Auth0Request, ProjectOperationRole} from "../../common/services/types.service";
import {Response} from "express";
import {Member} from "../models/members.model";
import {Project} from "../../projects/models/projects.model";
import {projectAuthorizationService} from "../../projects/services/project-authorization.service";

class MembersController {

    async createMember(request: Auth0Request, response: Response) {
        try {

            const isAuthorized = await projectAuthorizationService.isAuthorized(request.user.sub, request.body.project, ProjectOperationRole.Admin);

            if (!isAuthorized) {
                return response.status(401).send('permission denied, please contact the project owner');
            }

            const existingMember = await Member.findOne({
                project: request.body.project,
                profile: request.body.profile
            })

            if (existingMember) {
                return response.status(400).send('project already has this member');
            }

            const member = await Member.create(request.body);

            await Project.findByIdAndUpdate(request.body.project, {
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

            const isAuthorized = await projectAuthorizationService.isAuthorizedByMember(request.user.sub, request.params.id, ProjectOperationRole.Admin);

            if (!isAuthorized) {
                return response.status(401).send('permission denied, please contact the project owner');
            }

            const updatedMember = await Member.findByIdAndUpdate(
                request.params.id,
                request.body, {
                    new: true,
                    runValidators: true
                }).populate('project profile', '-members -__v');

            if (!updatedMember) {
                return response.status(404).send("member does not exist");
            }

            response.status(200).send(updatedMember);
        } catch (error) {

            response.status(500).send(error);
        }
    }

    async deleteMember(request: Auth0Request, response: Response) {
        try {

            const isAuthorized = await projectAuthorizationService.isAuthorizedByMember(request.user.sub, request.params.id, ProjectOperationRole.Admin);

            if (!isAuthorized) {
                return response.status(401).send('permission denied, please contact the project owner');
            }

            const deletedMember = await Member.findByIdAndDelete(request.params.id);

            if (!deletedMember) {
                return response.status(404).send("the member does not exist");
            }

            await Project.findByIdAndUpdate(request.body.project, {
                $pull: {
                    members: deletedMember._id
                }
            });

            response.status(200).send("the member was successfully deleted");
        } catch (error) {

            response.status(500).send(error);
        }
    }
}

export const membersController = new MembersController();
