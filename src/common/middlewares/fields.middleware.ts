import {Auth0Request, ValidationDataSource} from "../services/types.service";
import {NextFunction, Response} from "express";
import Joi, {ValidationResult} from "joi";

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

    validate(schema: Joi.Schema, dataSource?: ValidationDataSource) {
        return (request: Auth0Request, response: Response, next: NextFunction) => {
            let validationDataSource;

            switch (dataSource) {
                case ValidationDataSource.Headers:
                    validationDataSource = request.headers;
                    break;
                case ValidationDataSource.Query:
                    validationDataSource = request.query;
                    break;
                case ValidationDataSource.Body:
                default:
                    validationDataSource = request.body;
                    break;
            }

            const validationResult: ValidationResult = schema.validate(validationDataSource, {
                stripUnknown: true
            });

            if (validationResult.error) {
                return response.status(400).send(validationResult.error);
            }

            next();
        };
    }
}

export const fieldsMiddleware = new FieldsMiddleware();
