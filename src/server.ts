import express = require("express");
import http = require("http");
import {Application} from "express";
import {projectsRoutesConfig} from "./projects/routes.config";

const app: Application = express();
const main: Application = express();

projectsRoutesConfig(app);

main.use('/api/v1', app);

const port = 8324;
const server = http.createServer(main);

server.listen(port, () => {
    return console.log(`server is listening on ${port}`);
});
