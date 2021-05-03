class ProfilesQueryService {
    private readonly getProfilesQueryParamsDefaults = {
        limit: 10,
        page: 1,
        sort: 'createdAt'
    };

    getProfilesQueryParams(queryParams: any) {
        const getProfilesQueryParams = {
            ...this.getProfilesQueryParamsDefaults,
            ...queryParams
        };

        getProfilesQueryParams.limit = + getProfilesQueryParams.limit;
        getProfilesQueryParams.page = + getProfilesQueryParams.page;

        return getProfilesQueryParams;
    }
}

export const profilesQueryService = new ProfilesQueryService();