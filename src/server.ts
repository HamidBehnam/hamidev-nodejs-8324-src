import express = require("express");
import http = require("http");
import {Application} from "express";
import {projectsRoutesConfig} from "./projects/routes.config";
import {connect} from "./common/db.service";
import {MONGODB_URI, PORT} from "./common/config.service";

connect(MONGODB_URI);

const app: Application = express();
const main: Application = express();

projectsRoutesConfig(app);

main.use('/api/v1', app);

const server = http.createServer(main);

server.listen(PORT, () => {
    return console.log(`server is listening on ${PORT}`);
});
