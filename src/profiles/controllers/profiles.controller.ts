import {Auth0Request} from "../../common/services/types.service";
import {NextFunction, Response} from "express";
import {Profile, profilesProjection} from "../models/profiles.model";
import {AxiosError, AxiosRequestConfig, AxiosResponse} from "axios";
import {authService} from "../../common/services/auth.service";
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

        const profile = await Profile.create(profileData);

        response.status(201).send(profile);
    } catch (error) {

        response.status(500).send(error);
    }
};

export const getProfiles = async (request: Auth0Request, response: Response) => {

    const axios = require("axios").default;

    try {
        const token = await authService.getMachineToMachineAccessToken();

        const userPatchOptions: AxiosRequestConfig = {
            method: 'PATCH',
            url: `https://${configService.auth0_domain}/api/v2/users/` + request.user.sub,
            headers: {'content-type': 'application/json', 'authorization': 'Bearer ' + token},
            data: {
                user_metadata: {
                    my_name: 'Hamid3'
                },
                app_metadata: {
                    test_field: 'this is the test field!'
                }
            }
        };

        axios.request(userPatchOptions).then((response: AxiosResponse) => {
            console.log("response");
        }).catch((error: AxiosError) => {
            console.log("error");
        });
    } catch (error) {

        response.status(500).send(error);
    }


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
