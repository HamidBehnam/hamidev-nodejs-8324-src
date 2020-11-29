import mongoose from "mongoose";
import {MONGODB_URI} from "./config.service";

export const connectDB = () => {

    const dbOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }

    mongoose.connect(MONGODB_URI, dbOptions)
        .then(() => {
            console.log("successfully connected to the DB");
        }).catch(error => {
            console.log("unable to connect to the DB", error);
    });
};
