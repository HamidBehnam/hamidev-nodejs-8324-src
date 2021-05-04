import {Document, model, Model, Schema, Types} from "mongoose";
import {WorkStatus} from "../../common/services/types.service";
import {IMember} from "../../members/models/members.model";
import {ITask} from "../../tasks/models/tasks.model";
import {IGridFSFile} from "../../common/services/gridfs-model-builder.service";
import {IProfile} from "../../profiles/models/profiles.model";

export interface IProject extends Document {
    title: string;
    description: string;
    status: string;
    createdBy: string;
    creatorProfile: Types.ObjectId | IProfile;
    members: Types.ObjectId[] | IMember[];
    tasks: Types.ObjectId[] | ITask[];
    image: Types.ObjectId | IGridFSFile;
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
