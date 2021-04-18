import {Document, model, Model, Schema, Types} from "mongoose";
import {ProjectOperationRole} from "../../common/services/types.service";

export interface ITask extends Document {
    ownerUserId: string;
    owner: Types.ObjectId;
    project: Types.ObjectId;
    title: string;
    description: string;
    status: string;
}

const TaskSchema: Schema = new Schema({
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
            ProjectOperationRole.Admin
        ],
        required: true
    }
}, {
    timestamps: true
});

export const Member: Model<IMember> = model('Member', MemberSchema);

