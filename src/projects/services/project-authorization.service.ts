import {Project} from "../models/projects.model";
import {ProjectAuthorization, ProjectOperationRole} from "../../common/services/types.service";
import {Member} from "../../members/models/members.model";

class ProjectAuthorizationService {
    async authorize(userId: string, projectId: string, expectedRole: ProjectOperationRole): Promise<ProjectAuthorization> {

        const project = await Project.findById(projectId);

        if (!project) {
            return {
                isAuthorized: false
            };
        }

        if (project.createdBy === userId) {
            return {
                isAuthorized: true,
                project
            };
        }

        const populatedProject = await project.populate('members').execPopulate();

        const authorizationResult = populatedProject.members.some(member => member.userId === userId && member.role >= expectedRole);

        return {
            isAuthorized: authorizationResult,
            project
        };
    }

    async authorizeByMember(userId: string, memberId: string, expectedRole: ProjectOperationRole): Promise<ProjectAuthorization> {

        const member = await Member.findById(memberId);

        if (!member) {
            return {
                isAuthorized: false
            };
        }

        return this.authorize(userId, member.project.toString(), expectedRole);
    }
}

export const projectAuthorizationService = new ProjectAuthorizationService();
