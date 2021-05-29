import { Types } from 'mongoose';

class ProfilesQueryService {
    private readonly getProfilesQueryParamsDefaults = {
        limit: 10,
        page: 1,
        sort: 'createdAt'
    };

    private static getGenericQuery(userId: string) {
        return [
            {
                $lookup: {
                    from: 'images.files',
                    localField: 'image',
                    foreignField: '_id',
                    as: 'image'
                }
            },
            {
                $unwind: {
                    path: '$image',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    fullName: {
                        $concat: ['$firstName', ' ', '$lastName']
                    },
                    viewerIsCreator: {
                        $eq: ['$userId', userId]
                    }
                }
            }
        ];
    }

    getProfilesQueryParams(queryParams: any) {
        const getProfilesQueryParams = {
            ...this.getProfilesQueryParamsDefaults,
            ...queryParams
        };

        getProfilesQueryParams.limit = + getProfilesQueryParams.limit;
        getProfilesQueryParams.page = + getProfilesQueryParams.page;

        return getProfilesQueryParams;
    }

    getProfilesAggregateQuery(userId: string) {
        return [
            ...ProfilesQueryService.getGenericQuery(userId)
        ];
    }

    getProfileAggregateQuery(userId: string, profileId: string) {
        return [
            {
                $match: {
                    _id: Types.ObjectId(profileId)
                }
            },
            ...ProfilesQueryService.getGenericQuery(userId)
        ];
    }
}

export const profilesQueryService = new ProfilesQueryService();
