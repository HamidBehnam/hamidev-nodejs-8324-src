import mongoose from "mongoose";
import {configService} from "./config.service";
import {winstonService} from "./winston.service";

class DbService {
    connectDB() {
        const dbOptions = {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }

        mongoose.connect(configService.mongodb_uri, dbOptions)
            .then(() => {
                winstonService.Logger.info("successfully connected to the DB");
            }).catch(error => {
            winstonService.Logger.info("unable to connect to the DB", error);
        });
    };
}

export const dbService = new DbService();
