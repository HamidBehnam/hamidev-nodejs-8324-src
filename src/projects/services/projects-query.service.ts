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
}

export const projectsQueryService = new ProjectsQueryService();