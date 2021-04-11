import {Document, model, Model, Schema, Types} from "mongoose";

export interface IRole extends Document {
    roleName: string;
    permissions: Types.ObjectId[];
}

const RoleSchema: Schema = new Schema({
    roleName: {
        type: String,
        required: true
    },
    permissions: {
        type: [{
            type: Types.ObjectId,
            ref: 'Permission',
        }],
        required: true
    }
});

export const Role: Model<IRole> = model('Role', RoleSchema);

