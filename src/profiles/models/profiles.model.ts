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
}, {
    toJSON: {
        virtuals: true
    },
    id: false
});

export const profilesProjection = {
    lastName: true,
    firstName: true,
    fullName: true
};

ProfileSchema.virtual('fullName').get(function (this: any) {
    return `${this.firstName} ${this.lastName}`;
});

export const Profile: Model<IProfile> = model('Profile', ProfileSchema);
