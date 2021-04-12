import {Auth0Request} from "../services/types.service";
import {NextFunction, Response} from "express";

class FieldsMiddleware {

    disallow(disallowedFields: string[]) {
        return (request: Auth0Request, response: Response, next: NextFunction) => {
            const sentFields = Object.keys(request.body);
            let foundDisallowedField;
            disallowedFields.some(disallowedField => {
                const hasDisallowedFields = sentFields.includes(disallowedField);
                if (hasDisallowedFields) {
                    foundDisallowedField = disallowedField;
                }
                return hasDisallowedFields;
            });

            if (foundDisallowedField) {
                return response.status(400).send(`request data has disallowed fields: ${foundDisallowedField}`);
            }

            next();
        };
    }
}

export const fieldsMiddleware = new FieldsMiddleware();
