import express, { json, urlencoded } from "express";
import {
  userAuthenticateMiddleware,
  projectAuthenticateMiddleware,
} from "./middlewares/authorization.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import logger from "morgan";
import mongoose from "mongoose";
import { setupFirebaseApp, getFirebaseApp } from "./firebase-app.js";
import functionRecordRouter from "./modules/function_record/controller.js";
import organizationRouter from "./modules/organization/controller.js";
import projectRouter from "./modules/project/controller.js";

setupFirebaseApp();
const FIREBASE_APP = getFirebaseApp();

const dbUri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@${process.env.MONGODB_URI}/${process.env.MONGODB_DB}?retryWrites=true&w=majority`;

// Mongoose connect to mongodb
mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.on("disconnected", function (x) {
  console.info("MongoDB disconnected!");
  console.log(x);
  mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true });
});
mongoose.connection.on("connected", function () {
  console.info("MongoDB connected!");
});
mongoose.Promise = global.Promise;

mongoose.connection.on("error", (error) => console.error(error));

var app = express();

let morganLogLevel = "dev";
if (process.env.NODE_ENV === "production") {
  morganLogLevel = "combined";
}

app.use(cors({ origin: "*" }));
app.use(logger(morganLogLevel));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());
app.use(userAuthenticateMiddleware(FIREBASE_APP));
app.use(projectAuthenticateMiddleware());
app.use("/api/v1/function_records", functionRecordRouter);
app.use("/api/v1/organizations", organizationRouter);
app.use("/api/v1/projects", projectRouter);

const PORT = process.env.PORT || 3001;

app.listen(PORT);
