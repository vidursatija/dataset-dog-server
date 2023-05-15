import BaseRepository from "./base.js";
import ProjectModel from "../db_models/project.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import crypto from "crypto";

const ObjectIdIsValid = mongoose.Types.ObjectId.isValid;

const SALT_ROUNDS = 10;

async function createHashedApiSecret(unhashed_secret) {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  const hash = await bcrypt.hash(unhashed_secret, salt);
  return hash;
}

class ProjectRepository extends BaseRepository {
  constructor(session) {
    super(session);
  }

  async createProject(projectName, organizationID, projectLanguage) {
    const apiSecretGenerator = `${projectName}-${organizationID}-${Date.now()}`;
    const apiSecret =
      "dds-" +
      crypto
        .createHash("sha256")
        .update(apiSecretGenerator)
        .digest("hex")
        .slice(0, 32);
    const hashedApiSecret = await createHashedApiSecret(apiSecret);
    const projectInfo = {
      projectName,
      organization: organizationID,
      apiSecret: hashedApiSecret,
      projectLanguage,
    };
    const projects = await ProjectModel.insertMany([projectInfo], {
      session: this.session,
    });
    const project = projects[0];
    return { ...project.toObject(), apiSecret };
  }

  async getProject(projectID) {
    if (!ObjectIdIsValid(projectID)) {
      return null;
    }
    const project = await ProjectModel.findById(projectID)
      .populate({ path: "organization", select: "name" })
      .exec();
    return project.toObject();
  }

  async getValidatedProject(projectID, apiSecret) {
    // call getProject
    // validate apiSecret using bcrypt
    // return project
    if (!ObjectIdIsValid(projectID)) {
      return null;
    }
    const project = await ProjectModel.findById(projectID)
      .populate({ path: "organization", select: "name" })
      .exec();
    if (project === null) {
      return null;
    }
    const isApiSecretValid = await bcrypt.compare(apiSecret, project.apiSecret);
    if (!isApiSecretValid) {
      return null;
    }
    return project.toObject();
  }

  async getAllProjectsForOrganization(organizationID) {
    const projects = await ProjectModel.find({ organization: organizationID });
    return projects.map((doc) => doc.toObject());
  }
}

export default ProjectRepository;
