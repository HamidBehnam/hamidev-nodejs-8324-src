import {Auth0Request} from "../../common/services/types.service";
import {NextFunction, Response} from "express";
import {Profile, profilesProjection} from "../models/profiles.model";

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

export const getProfiles = async (request: Auth0Request, response: Response) => {
    try {

        const profiles = await Profile.find({}).select(profilesProjection);

        response.status(200).send(profiles);
    } catch (error) {

        response.status(500).send(error);
    }
};

export const getMyProfile = async (request: Auth0Request, response: Response) => {
    try {

        const profile = await Profile.findOne({userId: request.user.sub});

        response.status(200).send(profile);
    } catch (error) {

        response.status(500).send(error);
    }
};

export const getProfile = async (request: Auth0Request, response: Response) => {
    try {

        const profile = await Profile.findById(request.params.id);

        response.status(200).send(profile);
    } catch (error) {

        response.status(500).send(error);
    }
};
