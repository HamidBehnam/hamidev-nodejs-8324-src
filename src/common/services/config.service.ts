import fs from "fs";
import dotenv from "dotenv";

if (fs.existsSync(".env")) {
    console.log("Using .env file to supply config environment variables");
    dotenv.config({ path: ".env" });
} else {
    console.log("Using .env.example file to supply config environment variables");
    dotenv.config({ path: ".env.example" });
}

class ConfigService {
    private readonly _port;
    private readonly _mongodb_uri: string;
    private readonly _auth0_domain: string;
    private readonly _auth0_audience: string;
    private readonly _machine_to_machine_client_id: string;
    private readonly _machine_to_machine_client_secret: string;

    constructor() {
        this._port = process.env.PORT;
        this._mongodb_uri = process.env.MONGODB_URI as string;
        this._auth0_domain = process.env.AUTH0_DOMAIN as string;
        this._auth0_audience = process.env.AUTH0_AUDIENCE as string;
        this._machine_to_machine_client_id = process.env.MACHINE_TO_MACHINE_CLIENT_ID as string;
        this._machine_to_machine_client_secret = process.env.MACHINE_TO_MACHINE_CLIENT_SECRET as string;
    }


    get port() {
        return this._port;
    }

    get mongodb_uri(): string {
        return this._mongodb_uri;
    }

    get auth0_domain(): string {
        return this._auth0_domain;
    }

    get auth0_audience(): string {
        return this._auth0_audience;
    }

    get machine_to_machine_client_id(): string {
        return this._machine_to_machine_client_id;
    }

    get machine_to_machine_client_secret(): string {
        return this._machine_to_machine_client_secret;
    }
}

export const configService = new ConfigService();
