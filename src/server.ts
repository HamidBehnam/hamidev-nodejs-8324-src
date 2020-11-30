import express = require("express");
import http = require("http");
import {Application} from "express";
import {projectsRoutesConfig} from "./projects/routes.config";
import {connectDB} from "./common/services/db.service";
import {PORT} from "./common/services/config.service";
import {profilesRoutesConfig} from "./profiles/routes.config";

connectDB();

const app: Application = express();
const main: Application = express();

app.use(express.json());
app.use(express.urlencoded());

profilesRoutesConfig(app);
projectsRoutesConfig(app);

main.use('/api/v1', app);

const server = http.createServer(main);

server.listen(PORT, () => {
    return console.log(`server is listening on ${PORT}`);
});
