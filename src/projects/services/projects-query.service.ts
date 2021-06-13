import { Types } from 'mongoose';

class ProjectsQueryService {
    private readonly getProjectsQueryParamsDefaults = {
        limit: 10,
        page: 1,
        sort: 'createdAt'
    };

    private static getGenericQuery(userId: string) {
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
                $addFields: {
                    viewerIsCreator: {
                        $eq: ['$createdBy', userId]
                    }
                }
            }
        ];
    }

    private static getDetailQuery() {
        return [
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
                    from: 'attachments.files',
                    localField: 'attachments',
                    foreignField: '_id',
                    as: 'attachments'
                }
            }
        ];
    }

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
            ...ProjectsQueryService.getGenericQuery(userId)
        ];
    }

    getProjectAggregateQuery(userId: string, projectId: string) {
        return [
            {
                $match: {
                    _id: Types.ObjectId(projectId)
                }
            },
            ...ProjectsQueryService.getGenericQuery(userId)
        ];
    }

    getProjectVerboseAggregateQuery(userId: string, projectId: string) {
        return [
            {
                $match: {
                    _id: Types.ObjectId(projectId)
                }
            },
            ...ProjectsQueryService.getGenericQuery(userId),
            ...ProjectsQueryService.getDetailQuery()
        ];
    }

    getProjectMembersAggregateQuery(projectId: string) {
        return [
            {
                $match: {
                    project: Types.ObjectId(projectId)
                },
            },
            {
                $lookup: {
                    from: 'profiles',
                    let: {
                        profile: '$profile'
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ['$_id', '$$profile']
                                }
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
                        }
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
        ];
    }

    getProjectTasksAggregateQuery(projectId: string) {
        return [
            {
                $match: {
                    project: Types.ObjectId(projectId)
                }
            },
            {
                $lookup: {
                    from: 'members',
                    let: {
                        owner: '$owner'
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ['$_id', '$$owner']
                                }
                            }
                        },
                        {
                            $lookup: {
                                from: 'profiles',
                                let: {
                                    profile: '$profile'
                                },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $eq: ['$_id', '$$profile']
                                            }
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
                                    }
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
                    as: 'owner'
                }
            },
            {
                $unwind: {
                    path: '$owner',
                    preserveNullAndEmptyArrays: true
                }
            }
        ];
    }
}

export const projectsQueryService = new ProjectsQueryService();
