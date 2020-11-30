import {Auth0Request} from "../../common/services/types.service";
import {Response} from "express";
import {Profile} from "../models/profiles.model";

export const createProfile = async (request: Auth0Request, response: Response) => {
    try {

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
