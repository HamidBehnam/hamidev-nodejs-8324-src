import multer from "multer";

class MulterMiddleware {

    private readonly storage;
    private attachmentMulterCore;

    constructor() {
        this.storage = multer.memoryStorage();

        this.attachmentMulterCore = multer({
            storage: this.storage,
            limits: {
                fileSize: 10000000
            }
        });
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