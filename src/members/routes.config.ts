import {Router} from "express";
import {authMiddleware} from "../common/middlewares/auth.middleware";
import {membersController} from "./controllers/members.controller";

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
        membersController.updateMember
    ]);

    membersRouter.delete('/members/:id', [
        authMiddleware.checkJwt,
        membersController.deleteMember
    ]);

    return membersRouter;
};
