import {Request, Response} from "express";
import * as projectsModel from "../models/projects.model";

export const getProjects = async (request: Request, response: Response) => {
    try {

        const theResult = await projectsModel.getProjects();

        response.status(200).send(theResult);
    } catch (error) {

        response.status(500).send(error);
    }
};
