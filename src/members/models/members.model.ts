import {Document, model, Model, Schema, Types} from "mongoose";

export interface IMember extends Document {
    project: Types.ObjectId;
    profile: Types.ObjectId;
    role: Types.ObjectId;
}

const MemberSchema: Schema = new Schema({
    project: {
        type: Types.ObjectId,
        ref: 'Project',
        required: true
    },
    profile: {
        type: Types.ObjectId,
        ref: 'Profile',
        required: true
    },
    role: {
        type: Types.ObjectId,
        ref: 'Role',
        required: true
    }
});

export const Member: Model<IMember> = model('Member', MemberSchema);

