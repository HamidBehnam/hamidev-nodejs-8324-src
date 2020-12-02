import {Application} from "express";
import * as profilesController from "./controllers/profiles.controller";
import {jwtCheck} from "../common/services/auth.service";

export const profilesRoutesConfig = (app: Application) => {
    app.post('/profiles', [
        jwtCheck,
        profilesController.createProfile
    ]);

    app.get('/profiles', [
        jwtCheck,
        profilesController.getProfiles
    ]);

    app.get('/profiles/:id', [
        jwtCheck,
        profilesController.getProfile
    ]);
};
