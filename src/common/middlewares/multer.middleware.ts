import multer from "multer";
import {Auth0Request, CustomError} from "../services/types.service";

class MulterMiddleware {

    private readonly storage;
    private pictureMulterCore;
    private attachmentMulterCore;

    constructor() {
        this.storage = multer.memoryStorage();

        this.pictureMulterCore = multer({
            storage: this.storage,
            limits: {
                fileSize: 2000000
            },
            fileFilter(req: Auth0Request, file: Express.Multer.File, callback: multer.FileFilterCallback) {
                const acceptableFileTypes = [
                    'image/png',
                    'image/jpeg',
                    'image/gif',
                    'image/svg+xml'
                ];

                if (acceptableFileTypes.includes(file.mimetype)) {
                    return callback(null, true);
                }

                callback(new CustomError('acceptable files: *.png, *.jpeg, *.jpg, *.gif, *.svg'));
            }
        });

        this.attachmentMulterCore = multer({
            storage: this.storage,
            limits: {
                fileSize: 5000000
            },
            fileFilter(req: Auth0Request, file: Express.Multer.File, callback: multer.FileFilterCallback) {
                const acceptableFileTypes = [
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/vnd.ms-powerpoint',
                    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                    'application/vnd.ms-excel',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'image/png',
                    'image/jpeg',
                    'text/plain'
                ];

                if (acceptableFileTypes.includes(file.mimetype)) {
                    return callback(null, true);
                }

                callback(new CustomError(
                    'acceptable files: *.pdf, *.doc, *.docx, *.ppt, *.pptx, *.xls, *xlsx, *.png, *.jpeg, *.jpg, *.txt'
                ));
            }
        });
    }

    pictureMulter(fieldName: string) {
        return this.pictureMulterCore.single(fieldName);
    }

    pictureMulterArray(fieldName: string, maxCount: number) {
        return this.pictureMulterCore.array(fieldName, maxCount);
    }

    pictureMulterFields(fields: any) {
        return this.pictureMulterCore.fields(fields);
    }

    attachmentMulter(fieldName: string) {
        return this.attachmentMulterCore.single(fieldName);
    }

    attachmentMulterArray(fieldName: string, maxCount: number) {
        return this.attachmentMulterCore.array(fieldName, maxCount);
    }

    attachmentMulterFields(fields: any) {
        return this.attachmentMulterCore.fields(fields);
    }
}

export const multerMiddleware = new MulterMiddleware();