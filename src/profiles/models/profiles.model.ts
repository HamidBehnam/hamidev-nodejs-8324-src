import {model, Model, Document, Schema} from "mongoose";

interface IProfile extends Document{
    //the userId here is the user's id in Auth0.
    userId: string;
    firstName: string;
    lastName: string;
    description: string;
}

const ProfileSchema: Schema = new Schema<any>({
    userId: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
});

export const Profile: Model<IProfile> = model('Profile', ProfileSchema);
