import {Router} from "express";
import {authMiddleware} from "../common/middlewares/auth.middleware";
import {profilesController} from "./controllers/profiles.controller";
import {fieldsMiddleware} from "../common/middlewares/fields.middleware";
import {profilesJoiService} from "./services/profiles-joi.service";
import {ValidationDataSource} from "../common/services/types.service";

export const profilesRoutesConfig = (): Router => {

    const profileRouter = Router();

    profileRouter.post('/profiles', [
        authMiddleware.checkJwt,
        fieldsMiddleware.disallow(['userId']),
        profilesController.createProfile
    ]);

    profileRouter.get('/profiles', [
        authMiddleware.checkJwt,
        fieldsMiddleware.validate(profilesJoiService.getProfilesSchema, ValidationDataSource.Query),
        profilesController.getProfiles
    ]);

    profileRouter.get('/profiles/:id', [
        authMiddleware.checkJwt,
        profilesController.getProfile
    ]);

    profileRouter.patch('/profiles/:id', [
        authMiddleware.checkJwt,
        profilesController.updateProfile
    ]);

    profileRouter.delete('/profiles/:id', [
        authMiddleware.checkJwt,
        profilesController.deleteProfile
    ]);

    profileRouter.get('/user-profiles/:id', [
        authMiddleware.checkJwt,
        profilesController.getUserProfiles
    ]);

    return profileRouter;
};
