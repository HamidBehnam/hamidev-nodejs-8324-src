import {Document, model, Model, Schema} from "mongoose";

export interface IProject extends Document {
    title: string;
    description: string;
    status: string;
    createdBy: string;
}

const ProjectSchema: Schema = new Schema<any>({
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
    }
}, {
    toJSON: {
        virtuals: true
    }
});

ProjectSchema.virtual("titleStatus").get(function (this: any) {
    return `${this.title} - ${this.status}`;
});

export const Project: Model<IProject> = model('Project', ProjectSchema);
