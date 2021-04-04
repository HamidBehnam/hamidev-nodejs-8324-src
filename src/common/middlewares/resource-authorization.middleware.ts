import {Auth0MetaData, Auth0Request} from "../services/types.service";
import {NextFunction, Response} from "express";

class ResourceAuthorizationMiddleware {
    public authorize<T extends Auth0MetaData>(type: { new(): T }) {
        const something = new type();

        return (request: Auth0Request, response: Response, next: NextFunction) => {
            console.log("this is the resource level authorization************************************", request.user.sub);
            console.log("here's the newly created instance of the class that you passed: ", something);
            next();
        };
    }

    public async doSomething(callback: (text: string, code: number) => Promise<string>) {
        const theResult = await callback('hamid', 234);
        console.log(theResult);
        return "this is the doSomething method!";
    }
}

export const resourceAuthorizationMiddleware = new ResourceAuthorizationMiddleware();
