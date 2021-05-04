import {NextFunction, Response} from "express";
import {Profile, profilesProjection} from "../models/profiles.model";
import {authService} from "../../common/services/auth.service";
import {Email} from "../../emails/models/emails.model";
import {configService} from "../../common/services/config.service";
import {profilesQueryService} from "../services/profiles-query.service";
import {multerMiddleware} from "../../common/middlewares/multer.middleware";
import {dbService} from "../../common/services/db.service";
import {Types} from "mongoose";
import {Auth0MetaData, Auth0Request, FileOptions, FileStream, FileUploadResult} from "../../common/types/interfaces";
import {FileCategory} from "../../common/types/enums";

class ProfilesController {
     async createProfile(request: Auth0Request, response: Response, next: NextFunction) {
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
    }

    async getProfiles(request: Auth0Request, response: Response) {
        try {

            const queryParams = profilesQueryService.getProfilesQueryParams(request.query);

            const profiles = await Profile.find({})
                .limit(queryParams.limit)
                .skip(--queryParams.page * queryParams.limit)
                .sort(queryParams.sort)
                .select(profilesProjection)
                .populate('image', 'filename metadata uploadDate');

            response.status(200).send(profiles);
        } catch (error) {

            response.status(500).send(error);
        }
    }

    async getProfile(request: Auth0Request, response: Response) {
        try {

            const profile = await Profile.findById(request.params.id);

            response.status(200).send(profile);
        } catch (error) {

            response.status(500).send(error);
        }
    }

    async updateProfile(request: Auth0Request, response: Response) {
         try {
             const updatedProfile = await Profile.findOneAndUpdate({
                 _id: request.params.id,
                 userId: request.user.sub
             }, request.body, {
                 new: true,
                 runValidators: true
             });

             if (!updatedProfile) {
                 return response.status(404).send("the profile does not exist or does not belong to the user");
             }

             response.status(200).send(updatedProfile);
         } catch (error) {

             response.status(500).send(error);
         }
    }

    async deleteProfile(request: Auth0Request, response: Response) {
         try {
             const deletedProfile = await Profile.findOneAndDelete({
                 _id: request.params.id,
                 userId: request.user.sub
             });

             if (!deletedProfile) {
                 return response.status(404).send("the profile does not exist or does not belong to the user");
             }

             response.status(200).send("profile was successfully deleted");
         } catch (error) {

             response.status(500).send(error);
         }
    }

    async getUserProfiles(request: Auth0Request, response: Response) {
        try {
            const userProfiles = await Profile.find({userId: request.params.id === 'me' ? request.user.sub : request.params.id});

            response.status(200).send(userProfiles);
        } catch (error) {

            response.status(500).send(error);
        }
    }

    async uploadProfileImage(request: Auth0Request, response: Response) {

        multerMiddleware.imageMulter('image')(request, response, async (error: any) => {
            try {

                if (error) {
                    return response.status(400).send(error);
                }

                if (!request.file) {
                    return response.status(400).send('file is not sent');
                }

                const profile = await Profile.findOne({
                    _id: request.params.id,
                    userId: request.user.sub
                });

                if (!profile) {
                    return response.status(404).send("the profile does not exist or does not belong to the user");
                }

                const fileOptions: FileOptions = {
                    gridFSBucketOpenUploadStreamOptions: {
                        metadata: {
                            profile: profile._id
                        }
                    }
                };

                const fileUploadResult: FileUploadResult =
                    await dbService.saveFile(FileCategory.Images, request.file, fileOptions);

                const oldImageId = profile.image;

                await profile.updateOne({
                    image: fileUploadResult.id
                });

                if (oldImageId) {

                    await dbService.deleteFile(FileCategory.Images, (oldImageId as Types.ObjectId).toString());
                }

                response.status(201).send('profile image was successfully uploaded');
            } catch (error) {

                response.status(500).send(error);
            }
        });
    }

    async deleteProfileImage(request: Auth0Request, response: Response) {
         try {

             const profile = await Profile.findOne({
                 _id: request.params.id,
                 userId: request.user.sub
             });

             if (!profile) {
                 return response.status(404).send("the profile does not exist or does not belong to the user");
             }

             await dbService.deleteFile(FileCategory.Images, request.params.fileId);

             await profile.updateOne({
                 $unset: {
                     image: 1
                 }
             });

             response.status(201).send('profile image was successfully removed');
         } catch (error) {

             response.status(500).send(error);
         }
    }

    async getProfileImage(request: Auth0Request, response: Response) {
         try {

             // loading the profile data before loading its file is not needed atm but the profile id
             // will be in request.params.id
             const fileStream: FileStream = await dbService.getFileStream(FileCategory.Images, request.params.fileId);
             response.header('Content-Disposition', `attachment; filename="${fileStream.file.filename}"`);
             fileStream.stream.pipe(response);
         } catch (error) {

             response.status(500).send(error);
         }
    }
}

export const profilesController = new ProfilesController();
