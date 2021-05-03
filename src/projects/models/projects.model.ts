import {Document, model, Model, Schema, Types} from "mongoose";
import {WorkStatus} from "../../common/services/types.service";

export interface IProject extends Document {
    title: string;
    description: string;
    status: string;
    createdBy: string;
    creatorProfile: Types.ObjectId;
    //members type could be IMember[] or Types.ObjectId[] depending on if it's populated or not
    members: any[];
    tasks: any[];
    image: any;
}

const ProjectSchema: Schema = new Schema({
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
    },
    createdBy: {
        type: String,
        required: true
    },
    creatorProfile: {
        type: Types.ObjectId,
        ref: 'Profile',
        required: true
    },
    members: {
        type: [{
            type: Types.ObjectId,
            ref: 'Member'
        }]
    },
    tasks: {
        type: [{
            type: Types.ObjectId,
            ref: 'Task'
        }]
    },
    image: {
        type: Types.ObjectId,
        ref: 'Image'
    }
}, {
    toJSON: {
        virtuals: true
    },
    timestamps: true
});

ProjectSchema.virtual("titleStatus").get(function (this: IProject) {
    return `${this.title} - ${this.status}`;
});

export const Project: Model<IProject> = model('Project', ProjectSchema);
