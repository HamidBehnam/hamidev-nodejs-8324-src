import {model, Model, Document, Schema} from "mongoose";
import validator from "validator";

interface IProfile extends Document{
    //the userId here is the user's id in Auth0.
    userId: string;
    firstName: string;
    lastName: string;
    description: string;
    email: string;
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
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        validate: [validator.isEmail, "invalid email"],
        required: true
    }
});

export const Profile: Model<IProfile> = model('Profile', ProfileSchema);
