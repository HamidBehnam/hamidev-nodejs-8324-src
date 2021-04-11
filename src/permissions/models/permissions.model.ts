import {Document, model, Model, Schema} from "mongoose";

export interface IPermission extends Document {
    permission: string;
}

const PermissionSchema: Schema = new Schema({
    permission: {
        type: String,
        required: true
    }
});

export const Permission: Model<IPermission> = model('Permission', PermissionSchema);

