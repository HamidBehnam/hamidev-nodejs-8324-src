import express = require("express");
import http = require("http");
import {Application} from "express";
import {projectsRoutesConfig} from "./projects/routes.config";
import {connectDB} from "./common/db.service";
import {PORT} from "./common/config.service";
import {jwtCheck} from "./common/auth.service";

connectDB();

const app: Application = express();
const main: Application = express();

app.use(express.json());
app.use(express.urlencoded());
app.use(jwtCheck);

projectsRoutesConfig(app);

main.use('/api/v1', app);

const server = http.createServer(main);

server.listen(PORT, () => {
    return console.log(`server is listening on ${PORT}`);
});
