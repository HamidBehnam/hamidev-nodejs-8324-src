import fs from "fs";
import dotenv from "dotenv";

if (fs.existsSync(".env")) {
    console.log("Using .env file to supply config environment variables");
    dotenv.config({ path: ".env" });
} else {
    console.log("Using .env.example file to supply config environment variables");
    dotenv.config({ path: ".env.example" });
}

export const PORT = process.env.PORT;
export const MONGODB_URI: string = process.env.MONGODB_URI as string;
export const AUTH0_DOMAIN: string = process.env.AUTH0_DOMAIN as string;
export const AUTH0_AUDIENCE: string = process.env.AUTH0_AUDIENCE as string;
