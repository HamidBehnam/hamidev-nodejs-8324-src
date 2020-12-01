import {Document, model, Model, Schema} from "mongoose";

export interface IProject extends Document {
    projectName: string;
    projectCode: string;
    projectStatus: string;
}

const ProjectSchema: Schema = new Schema<any>({
    projectName: {
        type: String,
        required: true
    },
    projectCode: {
        type: String,
        required: true
    },
    projectStatus: {
        type: String,
        required: true
    }
}, {
    toJSON: {
        virtuals: true
    }
});

ProjectSchema.virtual("projectNameCode").get(function (this: any) {
    return `${this.projectName} - ${this.projectCode}`;
});

export const Project: Model<IProject> = model('Project', ProjectSchema);
