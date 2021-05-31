class ProjectsQueryService {
    private readonly getProjectsQueryParamsDefaults = {
        limit: 10,
        page: 1,
        sort: 'createdAt'
    };

    getProjectsQueryParams(queryParams: any) {
        const getProjectsQueryParams = {
            ...this.getProjectsQueryParamsDefaults,
            ...queryParams
        };

        getProjectsQueryParams.limit = + getProjectsQueryParams.limit;
        getProjectsQueryParams.page = + getProjectsQueryParams.page;

        return getProjectsQueryParams;
    }

    getProjectsAggregateQuery(userId: string) {
        return [
            {
                $lookup: {
                    from: 'members',
                    let: { members: '$members' },
                    pipeline: [
                        { $match: { $expr: { $and: [ { $in: ['$_id', '$$members'] }, { $eq: ['$userId', userId] } ] } } },
                        { $project: { _id: 0, viewerAssociatedRole: '$role' } } // in case there's no need for renaming the field you can use role: 1 instead
                    ],
                    as: 'viewerAssociation'
                }
            },
            {
                $replaceRoot: { newRoot: { $mergeObjects: [ { $arrayElemAt: [ "$viewerAssociation", 0 ] }, "$$ROOT" ] } }
            },
            {
                $project: { viewerAssociation: 0 }
            },
            {
                $lookup: {
                    from: 'members',
                    let: { members: '$members' },
                    pipeline: [
                        { $match: { $expr: { $in: ['$_id', '$$members'] } } },
                        {
                            $lookup: {
                                from: 'profiles',
                                let: { profile: '$profile' },
                                pipeline: [
                                    { $match: { $expr: { $eq: ['$_id', '$$profile'] } } }
                                ],
                                as: 'profile'
                            }
                        },
                        {
                            $unwind: {
                                path: '$profile',
                                preserveNullAndEmptyArrays: true
                            }
                        }
                    ],
                    as: 'members'
                }
            },
            {
                $lookup: {
                    from: 'tasks',
                    localField: 'tasks',
                    foreignField: '_id',
                    as: 'tasks'
                }
            },
            {
                $lookup: {
                    from: 'profiles',
                    localField: 'creatorProfile',
                    foreignField: '_id',
                    as: 'creatorProfile'
                }
            },
            {
                $unwind: {
                    path: '$creatorProfile',
                    preserveNullAndEmptyArrays: true
                }
            },
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
                $lookup: {
                    from: 'attachments.files',
                    localField: 'attachments',
                    foreignField: '_id',
                    as: 'attachments'
                }
            },
            {
                $addFields: {
                    viewerIsCreator: {
                        $eq: ['$createdBy', userId]
                    }
                }
            }
        ];

        // TODO: similar query with mongoose populate, kept for the reference
        // const projects = await Project.find({})
        //     .limit(queryParams.limit)
        //     .skip(--queryParams.page * queryParams.limit)
        //     .sort(queryParams.sort)
        //     .populate([
        //         {
        //             path: 'creatorProfile',
        //             model: 'Profile',
        //             select: '-__v'
        //         },{
        //             path: 'members',
        //             model: 'Member',
        //             populate: [{
        //                 path: 'profile',
        //                 model: 'Profile',
        //                 select: '-__v'
        //             }],
        //             select: '-__v -project'
        //         }, {
        //             path: 'tasks',
        //             model: 'Task',
        //             select: '-__v',
        //             populate: [{
        //                 path: 'owner',
        //                 model: 'Member',
        //                 select: 'profile',
        //                 populate: [{
        //                     path: 'profile',
        //                     model: 'Profile',
        //                     select: '-__v'
        //                 }]
        //             }]
        //         }, {
        //             path: 'image',
        //             model: 'Image'
        //         }, {
        //             path: 'attachments',
        //             model: 'Attachment'
        //         }
        //     ]);
    }
}

export const projectsQueryService = new ProjectsQueryService();
