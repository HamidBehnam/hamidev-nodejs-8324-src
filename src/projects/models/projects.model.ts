import {Document, model, Model, Schema} from "mongoose";

interface IProject extends Document {
    projectName: string;
    projectCode: string;
}

const ProjectSchema: Schema = new Schema<any>({
    projectName: {
        type: String,
        required: true
    },
    projectCode: {
        type: String,
        required: true
    }
});

export const Project: Model<IProject> = model('Project', ProjectSchema);


// export const getProjects = async () => {
//     return {
//         name: "Hamid",
//         code: "ASDF458"
//     };
// };
