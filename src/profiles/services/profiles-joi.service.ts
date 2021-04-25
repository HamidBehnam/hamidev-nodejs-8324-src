import Joi from "joi";

class ProfilesJoiService {
    private readonly _getProfilesSchema = Joi.object({
        limit: Joi.number().integer().min(1).max(100),
        page: Joi.number().integer().min(1)
    });

    get getProfilesSchema(): Joi.ObjectSchema<any> {
        return this._getProfilesSchema;
    }
}

export const profilesJoiService = new ProfilesJoiService();