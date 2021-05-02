import mongoose from "mongoose";
import {configService} from "./config.service";
import {winstonService} from "./winston.service";
import {GridFSBucket, GridFSBucketOpenUploadStreamOptions} from "mongodb";
import {Map} from "typescript";
import {FileCategory, CustomError, FileOptions, FileStream} from "./types.service";
import {Readable} from "stream";

class DbService {
    private mongooseInstance: mongoose.Mongoose | null;
    private gridFSBuckets = new Map<string, GridFSBucket>();

    constructor() {
        this.mongooseInstance = null;
    }

    connectDB() {
        if (this.mongooseInstance) {
            throw new CustomError('multiple database initializations')
        }

        const dbOptions = {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }

        mongoose.connect(configService.mongodb_uri, dbOptions)
            .then((mongooseInstance) => {
                this.mongooseInstance = mongooseInstance;
                winstonService.Logger.info("successfully connected to the DB");
            }).catch(error => {
            winstonService.Logger.info("unable to connect to the DB", error);
            // throwing the error to make sure server will stop if there's no db connection.
            throw new Error(error);
        });
    }

    saveFile(fileCategory: FileCategory, file: Express.Multer.File, fileOptions: FileOptions = {}) {
        const selectedFileName = fileOptions.filename || file.originalname;

        const gridFSBucketOpenUploadStreamOptions: GridFSBucketOpenUploadStreamOptions =
            fileOptions.gridFSBucketOpenUploadStreamOptions || {};

        const uploadStream = this.getGridFSBucket(fileCategory).openUploadStream(selectedFileName, gridFSBucketOpenUploadStreamOptions);
        const readableStream = new Readable();

        readableStream.push(file.buffer);
        readableStream.push(null);
        readableStream.pipe(uploadStream);
    }

    async getFileStream(fileCategory: FileCategory, fileId: string): Promise<FileStream> {
        const foundFiles = await this.getGridFSBucket(fileCategory).find({
            _id: mongoose.Types.ObjectId(fileId)
        }).toArray();

        if (foundFiles.length === 0) {
            throw new CustomError('file does not exist');
        }

        return {
            file: foundFiles.pop(),
            stream: this.getGridFSBucket(fileCategory).openDownloadStream(mongoose.Types.ObjectId(fileId))
        };
    }

    private getGridFSBucket(fileCategory: FileCategory): GridFSBucket {
        let bucket;

        if (this.gridFSBuckets.has(fileCategory)) {
            bucket = this.gridFSBuckets.get(fileCategory);
        } else {
            if (!this.mongooseInstance) {
                throw new CustomError('database is disconnected');
            }

            bucket = DbService.createGridFSBucket(this.mongooseInstance, fileCategory);
            this.gridFSBuckets.set(fileCategory, bucket);
        }

        if (!bucket) {
            throw new CustomError('bucket is not defined');
        }

        return bucket;
    }

    private static createGridFSBucket(mongooseInstance: mongoose.Mongoose, bucketName: string): GridFSBucket {
        return new mongooseInstance.mongo.GridFSBucket(mongooseInstance.connection.db, {
            bucketName
        });
    }
}

export const dbService = new DbService();
