import {Auth0MetaData, Auth0Request} from "../../common/services/types.service";
import {NextFunction, Response} from "express";
import {Profile, profilesProjection} from "../models/profiles.model";
import {authService} from "../../common/services/auth.service";
import {Email} from "../../emails/models/emails.model";
import {configService} from "../../common/services/config.service";

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

        const emailData = {
            userId: request.user.sub,
            email: request.user[`${configService.auth0_custom_rule_namespace}email`]
        };

        const userProfile = await Profile.create(profileData);
        const userEmail = await Email.create(emailData);

        // todo: the following approach in terms of adding the profile status to the token might be useful for
        //  insensitive scenarios like f/e scenarios but might not work for all the b/e scenarios because we can't
        //  revoke the access token in Auth0, as a result the next request still comes with the wrong value in the
        //  token, this approach (adding the information to the token) might work for insensitive data where we won't
        //  lose much even if user sends the current token before it gets expired

        const metadata: Auth0MetaData = {
            app_metadata: {
                has_profile: true
            }
        };

        await authService.updateMetaData(request.user.sub, metadata);

        response.status(201).send({
            userProfile,
            userEmail
        });
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
