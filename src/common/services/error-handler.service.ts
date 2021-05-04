import {BadRequestError, GenericError, NotAuthorizedError, NotFoundError} from "../types/errors";

class ErrorHandlerService {
    getStatusCode(error: Error): number {

        if (error instanceof NotFoundError) {
            return 404;
        } else if (error instanceof BadRequestError) {
            return 400;
        } else if (error instanceof NotAuthorizedError) {
            return 401;
        } else if (error instanceof GenericError) {
            return 500;
        } else {
            return 500;
        }
    }
}

export const errorHandlerService = new ErrorHandlerService();