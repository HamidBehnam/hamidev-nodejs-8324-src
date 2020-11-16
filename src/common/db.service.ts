import mongoose from "mongoose";

export const connect = (dbUri: string) => {

    const dbOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }

    mongoose.connect(dbUri, dbOptions)
        .then(() => {
            console.log("successfully connected to the DB");
        }).catch(error => {
            console.log("unable to connect to the DB", error);
    });
};
