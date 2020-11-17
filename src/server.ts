import express = require("express");
import http = require("http");
import {Application} from "express";
import {projectsRoutesConfig} from "./projects/routes.config";
import {connectDB} from "./common/db.service";
import {PORT} from "./common/config.service";

connectDB();

const app: Application = express();
const main: Application = express();

projectsRoutesConfig(app);

main.use('/api/v1', app);

const server = http.createServer(main);

server.listen(PORT, () => {
    return console.log(`server is listening on ${PORT}`);
});
