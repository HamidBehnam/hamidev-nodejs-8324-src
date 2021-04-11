import {Auth0Request} from "../../common/services/types.service";
import {Response} from "express";
import {Permission} from "../models/permissions.model";

class PermissionsController {

    async createPermission(request: Auth0Request, response: Response) {
        try {

            const permission = await Permission.create(request.body);

            response.status(201).send(permission);
        } catch (error) {

            response.status(500).send(error);
        }
    }

    async getPermissions(request: Auth0Request, response: Response) {
        try {

            const permissions = await Permission.find({});

            response.status(200).send(permissions);
        } catch (error) {

            response.status(500).send(error);
        }
    }

    async getPermission(request: Auth0Request, response: Response) {
        try {

            const permission = await Permission.findById(request.params.id);

            response.status(200).send(permission);
        } catch (error) {

            response.status(500).send(error);
        }
    }

    async deletePermission(request: Auth0Request, response: Response) {
        try {

            const deletedPermission = await Permission.findByIdAndDelete(request.params.id);

            if (!deletedPermission) {
                return response.status(404).send("permission does not exist");
            }

            response.status(200).send("permission was successfully deleted");
        } catch (error) {

            response.status(500).send(error);
        }
    }

    async updatePermission(request: Auth0Request, response: Response) {
        try {

            const updatedPermission = await Permission.findByIdAndUpdate(
                request.params.id,
                request.body, {
                    new: true,
                    runValidators: true
                });

            if (!updatedPermission) {
                return response.status(404).send("permission does not exist");
            }

            response.status(200).send(updatedPermission);
        } catch (error) {

            response.status(500).send(error);
        }
    }
}

export const permissionsController = new PermissionsController();
