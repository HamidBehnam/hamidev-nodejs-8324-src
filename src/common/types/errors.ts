// the reason for adding the GenericError type is because express doesn't send the error object of the errors with the
// type of "Error" properly. For instance if you throw new Error('error') and try to send it to client using:
// response.send(error), an empty error message will be sent to the client.
export class GenericError extends Error {
    error: string;

    constructor(message: string) {
        super(message);
        this.name = 'GenericError';
        this.error = message;
        Error.captureStackTrace(this, GenericError);
        Object.setPrototypeOf(this, GenericError.prototype);
    }
}