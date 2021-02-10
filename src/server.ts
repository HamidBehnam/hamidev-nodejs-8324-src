import express = require("express");
import http = require("http");
import {Application} from "express";
import {projectsRoutesConfig} from "./projects/routes.config";
import {dbService} from "./common/services/db.service";
import {configService} from "./common/services/config.service";
import {profilesRoutesConfig} from "./profiles/routes.config";

dbService.connectDB();

const app: Application = express();
const main: Application = express();

// https://stackoverflow.com/a/51844327/2281403
app.use(express.json());
app.use(express.urlencoded());

profilesRoutesConfig(app);
projectsRoutesConfig(app);

main.use('/api/v1', app);

// https://stackoverflow.com/q/17696801/2281403
const server = http.createServer(main);

server.listen(configService.port, () => {
    return console.log(`server is listening on ${configService.port}`);
});
