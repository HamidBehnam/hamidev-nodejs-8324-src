import {Document, model, Model, Schema, Types} from "mongoose";

export interface IProject extends Document {
    title: string;
    description: string;
    status: string;
    createdBy: string;
    creatorProfile: string;
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
        required: true
    },
    createdBy: {
        type: String,
        required: true
    },
    creatorProfile: {
        type: String,
        required: true
    },
    members: {
        type: [{
            type: Types.ObjectId,
            ref: 'Member'
        }]
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
