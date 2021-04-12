import {Router} from "express";
import {authMiddleware} from "../common/middlewares/auth.middleware";
import {membersController} from "./controllers/members.controller";
import {fieldsMiddleware} from "../common/middlewares/fields.middleware";

export const membersRoutesConfig = (): Router => {
    const membersRouter = Router();

    membersRouter.post('/members', [
        authMiddleware.checkJwt,
        membersController.createMember
    ]);

    membersRouter.get('/members', [
        authMiddleware.checkJwt,
        membersController.getMembers
    ]);

    membersRouter.get('/members/:id', [
        authMiddleware.checkJwt,
        membersController.getMember
    ]);

    membersRouter.patch('/members/:id', [
        authMiddleware.checkJwt,
        fieldsMiddleware.disallow(['project', 'profile', 'userId']),
        membersController.updateMember
    ]);

    membersRouter.delete('/members/:id', [
        authMiddleware.checkJwt,
        membersController.deleteMember
    ]);

    return membersRouter;
};
