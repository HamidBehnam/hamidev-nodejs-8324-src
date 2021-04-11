import {Document, model, Model, Schema} from "mongoose";

export interface IPermission extends Document {
    name: string;
    description: string;
}

const PermissionSchema: Schema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
});

export const Permission: Model<IPermission> = model('Permission', PermissionSchema);

