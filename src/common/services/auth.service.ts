import jwt from "express-jwt";
import JwksRsa from "jwks-rsa";
import jwt_decode from "jwt-decode";
import {AxiosError, AxiosRequestConfig, AxiosResponse} from "axios";
import {configService} from "./config.service";
import {Auth0MetaData} from "./types.service";

class AuthService {
    private readonly _jwtCheck: jwt.RequestHandler;
    private machineToMachineAccessToken: string | undefined;

    constructor() {
        this._jwtCheck = jwt({
            secret: JwksRsa.expressJwtSecret({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 5,
                jwksUri: `https://${configService.auth0_domain}/.well-known/jwks.json`
            }),
            audience: configService.auth0_audience,
            issuer: `https://${configService.auth0_domain}/`,
            algorithms: ['RS256']
        });
    }

    get jwtCheck(): jwt.RequestHandler {
        return this._jwtCheck;
    }

    private static checkTokenExpiration(decodedToken: any): boolean {
        return decodedToken.exp * 1000 > Date.now();
    }

    private getMachineToMachineAccessToken(): Promise<string | AxiosError> {
        return new Promise<string>((resolve, reject) => {

            if (this.machineToMachineAccessToken && AuthService.checkTokenExpiration(jwt_decode(this.machineToMachineAccessToken))) {

                // re using the cached token
                resolve(this.machineToMachineAccessToken);
            } else {

                console.log('connecting to the auth0 server to get the token.............');
                const axios = require("axios").default;

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

                axios.request(options).then((response: AxiosResponse) => {

                    this.machineToMachineAccessToken = response.data.access_token;
                    resolve(this.machineToMachineAccessToken);
                }).catch((error: AxiosError) => {

                    reject(error);
                });
            }
        });
    }

    async updateMetaData(userId: string, metadata: Auth0MetaData): Promise<AxiosResponse | AxiosError> {
        const axios = require("axios").default;

        const token = await this.getMachineToMachineAccessToken();

        const userPatchOptions: AxiosRequestConfig = {
            method: 'PATCH',
            url: `https://${configService.auth0_domain}/api/v2/users/` + userId,
            headers: {'content-type': 'application/json', 'authorization': 'Bearer ' + token},
            data: metadata
        };

        return axios.request(userPatchOptions);
    }
}

export const authService = new AuthService();

