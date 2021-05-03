import Joi from "joi";

class ProjectsJoiService {
    private readonly _getProjectsSchema = Joi.object({
        limit: Joi.number().integer().min(1).max(100),
        page: Joi.number().integer().min(1),
        sort: Joi.string().valid('title', '-title', 'createdAt', '-createdAt')
    });

    get getProjectsSchema(): Joi.ObjectSchema<any> {
        return this._getProjectsSchema;
    }
}

export const projectsJoiService = new ProjectsJoiService();