import {Document, model, Model, Schema, Types} from "mongoose";
import {ProjectOperationRole} from "../../common/types/enums";

export interface IMember extends Document {
    userId: string;
    profile: Types.ObjectId;
    project: Types.ObjectId;
    role: number;
}

const MemberSchema: Schema = new Schema({
    userId: {
        type: String,
        required: true
    },
    profile: {
        type: Types.ObjectId,
        ref: 'Profile',
        required: true
    },
    project: {
        type: Types.ObjectId,
        ref: 'Project',
        required: true
    },
    role: {
        type: Number,
        enum: [
            ProjectOperationRole.Viewer,
            ProjectOperationRole.Developer,
            ProjectOperationRole.Admin,
            ProjectOperationRole.Creator
        ],
        required: true
    }
}, {
    timestamps: true
});

export const Member: Model<IMember> = model('Member', MemberSchema);

