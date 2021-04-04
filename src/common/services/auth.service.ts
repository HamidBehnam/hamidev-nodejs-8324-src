import jwt_decode from "jwt-decode";
import {AxiosError, AxiosRequestConfig, AxiosResponse} from "axios";
import {configService} from "./config.service";
import {Auth0MetaData} from "./types.service";
import axios = require("axios");

class AuthService {
    private machineToMachineAccessToken = '';

    private static checkTokenExpiration(decodedToken: any): boolean {
        return decodedToken.exp * 1000 > Date.now();
    }

    private getMachineToMachineAccessToken(): Promise<string | AxiosError> {
        return new Promise<string | AxiosError>((resolve, reject) => {

            if (this.machineToMachineAccessToken && AuthService.checkTokenExpiration(jwt_decode(this.machineToMachineAccessToken))) {

                // re using the cached token
                resolve(this.machineToMachineAccessToken);
            } else {

                const options: AxiosRequestConfig = {
                    method: 'POST',
                    url: `https://${configService.auth0_domain}/oauth/token`,
                    headers: {'content-type': 'application/json'},
                    data: {
                        grant_type: 'client_credentials',
                        client_id: configService.machine_to_machine_client_id,
                        client_secret: configService.machine_to_machine_client_secret,
                        audience: `https://${configService.auth0_domain}/api/v2/`
                    }
                };

                axios.default.request(options).then((response: AxiosResponse) => {

                    this.machineToMachineAccessToken = response.data.access_token;
                    resolve(this.machineToMachineAccessToken);
                }).catch((error: AxiosError) => {

                    reject(error);
                });
            }
        });
    }

    async updateMetaData(userId: string, metadata: Auth0MetaData): Promise<AxiosResponse | AxiosError> {
        const token = await this.getMachineToMachineAccessToken();

        const userPatchOptions: AxiosRequestConfig = {
            method: 'PATCH',
            url: `https://${configService.auth0_domain}/api/v2/users/` + userId,
            headers: {'content-type': 'application/json', 'authorization': 'Bearer ' + token},
            data: metadata
        };

        return axios.default.request(userPatchOptions);
    }

    async getUsers(): Promise<AxiosResponse | AxiosError> {
        const token = await this.getMachineToMachineAccessToken();

        const usersGetOptions: AxiosRequestConfig = {
            method: 'GET',
            url: `https://${configService.auth0_domain}/api/v2/users`,
            headers: {'content-type': 'application/json', 'authorization': 'Bearer ' + token}
        };

        return axios.default.request(usersGetOptions);
    }

    async getUserRoles(userId: string): Promise<AxiosResponse | AxiosError> {
        const token = await this.getMachineToMachineAccessToken();

        const userRolesGetOptions: AxiosRequestConfig = {
            method: 'GET',
            url: `https://${configService.auth0_domain}/api/v2/users/${userId}/roles`,
            headers: {'content-type': 'application/json', 'authorization': 'Bearer ' + token}
        };

        return axios.default.request(userRolesGetOptions);
    }

    async setUserRoles(userId: string, data: {roles: string[]}): Promise<AxiosResponse | AxiosError> {
        const token = await this.getMachineToMachineAccessToken();

        const userRolesGetOptions: AxiosRequestConfig = {
            method: 'POST',
            url: `https://${configService.auth0_domain}/api/v2/users/${userId}/roles`,
            headers: {'content-type': 'application/json', 'authorization': 'Bearer ' + token},
            data
        };

        return axios.default.request(userRolesGetOptions);
    }

    async deleteUserRoles(userId: string, data: {roles: string[]}): Promise<AxiosResponse | AxiosError> {
        const token = await this.getMachineToMachineAccessToken();

        const userRolesGetOptions: AxiosRequestConfig = {
            method: 'DELETE',
            url: `https://${configService.auth0_domain}/api/v2/users/${userId}/roles`,
            headers: {'content-type': 'application/json', 'authorization': 'Bearer ' + token},
            data
        };

        return axios.default.request(userRolesGetOptions);
    }

    async getUserPermissions(userId: string): Promise<AxiosResponse | AxiosError> {
        const token = await this.getMachineToMachineAccessToken();

        const userPermissionsGetOptions: AxiosRequestConfig = {
            method: 'GET',
            url: `https://${configService.auth0_domain}/api/v2/users/${userId}/permissions`,
            headers: {'content-type': 'application/json', 'authorization': 'Bearer ' + token}
        };

        return axios.default.request(userPermissionsGetOptions);
    }

    async getRoles(): Promise<AxiosResponse | AxiosError> {
        const token = await this.getMachineToMachineAccessToken();

        const rolesGetOptions: AxiosRequestConfig = {
            method: 'GET',
            url: `https://${configService.auth0_domain}/api/v2/roles`,
            headers: {'content-type': 'application/json', 'authorization': 'Bearer ' + token}
        };

        return axios.default.request(rolesGetOptions);
    }
}

export const authService = new AuthService();

