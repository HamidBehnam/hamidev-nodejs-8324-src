import {Auth0Request} from "../../common/services/types.service";
import {Response} from "express";
import {Member} from "../models/members.model";
import {Project} from "../../projects/models/projects.model";

class MembersController {

    async createMember(request: Auth0Request, response: Response) {
        try {
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
            const members = await Member.find({}).populate('project profile', '-__v');

            response.status(200).send(members);
        } catch (error) {

            response.status(500).send(error);
        }
    }

    async getMember(request: Auth0Request, response: Response) {
        try {
            const member = await Member.findById(request.params.id).populate('project profile', '-__v');

            response.status(200).send(member);
        } catch (error) {

            response.status(500).send(error);
        }
    }

    async updateMember(request: Auth0Request, response: Response) {
        try {
            const updatedMember = await Member.findByIdAndUpdate(
                request.params.id,
                request.body, {
                    new: true,
                    runValidators: true
                }).populate('project profile', '-__v');

            if (!updatedMember) {
                return response.status(404).send("the member does not exist");
            }

            response.status(200).send(updatedMember);
        } catch (error) {

            response.status(500).send(error);
        }
    }

    async deleteMember(request: Auth0Request, response: Response) {
        try {
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
