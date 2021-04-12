import {IProject} from "../models/projects.model";
import {ProjectOperationRole} from "../../common/services/types.service";

class ProjectAuthorizationService {
    async isAuthorized(userId: string, project: IProject, expectedRole: ProjectOperationRole): Promise<boolean> {

        if (project.createdBy === userId) {
            return true;
        }

        const populatedProject = await project.populate('members').execPopulate();

        return populatedProject.members.some(member => member.userId === userId && member.role >= expectedRole);
    }
}

export const projectAuthorizationService = new ProjectAuthorizationService();
