import {Auth0Request} from "../../common/services/types.service";
import {NextFunction, Response} from "express";
import {Profile} from "../models/profiles.model";

export const createProfile = async (request: Auth0Request, response: Response, next: NextFunction) => {
    try {

        const existingProfile = await Profile.findOne({userId: request.user.sub});

        if (existingProfile) {
            response.status(400).send('user already has a profile');
            return next();
        }

        const profileData = {
            ...request.body,
            userId: request.user.sub
        };

        const profile = await Profile.create(profileData);

        response.status(201).send(profile);
    } catch (error) {

        response.status(500).send(error);
    }
};
