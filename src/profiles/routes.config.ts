import {Application} from "express";
import * as profilesController from "./controllers/profiles.controller";
import {authService} from "../common/services/auth.service";

export const profilesRoutesConfig = (app: Application) => {
    app.post('/profiles', [
        authService.jwtCheck,
        profilesController.createProfile
    ]);

    app.get('/profiles', [
        authService.jwtCheck,
        profilesController.getProfiles
    ]);

    app.get('/profiles/my', [
        authService.jwtCheck,
        profilesController.getMyProfile
    ]);

    app.get('/profiles/:id', [
        authService.jwtCheck,
        profilesController.getProfile
    ]);
};
