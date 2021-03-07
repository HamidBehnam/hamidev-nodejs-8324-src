import {Router} from "express";
import {authService} from "../common/services/auth.service";
import {profilesController} from "./controllers/profiles.controller";

export const profilesRoutesConfig = (): Router => {

    const profileRouter = Router();

    profileRouter.post('/profiles', [
        authService.jwtCheck,
        profilesController.createProfile
    ]);

    profileRouter.get('/profiles', [
        authService.jwtCheck,
        profilesController.getProfiles
    ]);

    profileRouter.get('/profiles/my', [
        authService.jwtCheck,
        profilesController.getMyProfile
    ]);

    profileRouter.get('/profiles/:id', [
        authService.jwtCheck,
        profilesController.getProfile
    ]);

    return profileRouter;
};
