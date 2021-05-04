import {Document, model, Model, Schema, Types} from "mongoose";
import {WorkStatus} from "../../common/types/enums";

export interface ITask extends Document {
    ownerUserId: string;
    owner: Types.ObjectId;
    project: Types.ObjectId;
    title: string;
    description: string;
    status: string;
}

const TaskSchema: Schema = new Schema({
    ownerUserId: {
        type: String
    },
    owner: {
        type: Types.ObjectId,
        ref: 'Member'
    },
    project: {
        type: Types.ObjectId,
        ref: 'Project',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: [
            WorkStatus.NotStarted,
            WorkStatus.InProgress,
            WorkStatus.Done,
            WorkStatus.QA,
            WorkStatus.UAT,
            WorkStatus.MoreWorkIsNeeded,
            WorkStatus.Accepted
        ],
        required: true
    }
}, {
    timestamps: true
});

export const Task: Model<ITask> = model('Task', TaskSchema);

