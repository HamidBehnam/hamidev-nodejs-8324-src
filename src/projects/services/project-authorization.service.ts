import {Project} from "../models/projects.model";
import {ProjectOperationRole} from "../../common/services/types.service";
import {Member} from "../../members/models/members.model";

class ProjectAuthorizationService {
    async isAuthorized(userId: string, projectId: string, expectedRole: ProjectOperationRole): Promise<boolean> {

        const project = await Project.findById(projectId);

        if (!project) {
            return false;
        }

        if (project.createdBy === userId) {
            return true;
        }

        const populatedProject = await project.populate('members').execPopulate();

        return populatedProject.members.some(member => member.userId === userId && member.role >= expectedRole);
    }

    async isAuthorizedByMember(userId: string, memberId: string, expectedRole: ProjectOperationRole): Promise<boolean> {

        const member = await Member.findById(memberId);

        if (!member) {
            return false;
        }

        return this.isAuthorized(userId, member.project.toString(), expectedRole);
    }
}

export const projectAuthorizationService = new ProjectAuthorizationService();
