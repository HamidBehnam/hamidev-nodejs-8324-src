import {Project} from "../models/projects.model";
import {
    ProjectAuthorization,
    ProjectAuthorizationByMember, ProjectAuthorizationByTask,
    ProjectOperationRole
} from "../../common/services/types.service";
import {IMember, Member} from "../../members/models/members.model";
import {Task} from "../../tasks/models/tasks.model";

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

        const authorizationResult = (populatedProject.members as IMember[]).some(member => member.userId === userId && member.role >= expectedRole);

        return {
            isAuthorized: authorizationResult,
            project
        };
    }

    async authorizeByMember(userId: string, memberId: string, expectedRole: ProjectOperationRole): Promise<ProjectAuthorizationByMember> {

        const member = await Member.findById(memberId);

        if (!member) {
            return {
                isAuthorized: false
            };
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
            return {
                isAuthorized: false
            };
        }

        const projectAuthorization = await this.authorize(userId, task.project.toString(), expectedRole);

        return {
            ...projectAuthorization,
            task
        };
    }
}

export const projectAuthorizationService = new ProjectAuthorizationService();
