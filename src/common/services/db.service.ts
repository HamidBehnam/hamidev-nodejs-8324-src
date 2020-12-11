import mongoose from "mongoose";
import {configService} from "./config.service";

class DbService {
    connectDB() {
        const dbOptions = {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }

        mongoose.connect(configService.mongodb_uri, dbOptions)
            .then(() => {
                console.log("successfully connected to the DB");
            }).catch(error => {
            console.log("unable to connect to the DB", error);
        });
    };
}

export const dbService = new DbService();
