import {Project} from "../models/projects.model";
import {IMember, Member} from "../../members/models/members.model";
import {Task} from "../../tasks/models/tasks.model";
import {NotAuthorizedError, NotFoundError} from "../../common/types/errors";
import {ProjectOperationRole} from "../../common/types/enums";
import {
    ProjectAuthorization,
    ProjectAuthorizationByMember,
    ProjectAuthorizationByTask
} from "../../common/types/interfaces";

class ProjectAuthorizationService {
    async authorize(userId: string, projectId: string, expectedRole: ProjectOperationRole): Promise<ProjectAuthorization> {

        const project = await Project.findById(projectId);

        if (!project) {
            throw new NotFoundError('project does not exist');
        }

        if (project.createdBy === userId) {
            return {
                project
            };
        }

        const populatedProject = await project.populate('members').execPopulate();

        const authorizationResult = (populatedProject.members as IMember[]).some(member => member.userId === userId && member.role >= expectedRole);

        if (authorizationResult) {
            return {
                project
            };
        } else {
            throw new NotAuthorizedError('permission denied, please contact the project admin');
        }
    }

    async authorizeByMember(userId: string, memberId: string, expectedRole: ProjectOperationRole): Promise<ProjectAuthorizationByMember> {

        const member = await Member.findById(memberId);

        if (!member) {
            throw new NotFoundError('member does not exist');
        }

        const projectAuthorization = await this.authorize(userId, member.project.toString(), expectedRole);

        return {
            ...projectAuthorization,
            member
        };
    }

    async authorizeByTask(userId: string, taskId: string, expectedRole: ProjectOperationRole): Promise<ProjectAuthorizationByTask> {

        const task = await Task.findById(taskId);

        if (!task) {
            throw new NotFoundError('task does not exist');
        }

        const projectAuthorization = await this.authorize(userId, task.project.toString(), expectedRole);

        return {
            ...projectAuthorization,
            task
        };
    }
}

export const projectAuthorizationService = new ProjectAuthorizationService();
