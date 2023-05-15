import BaseRepository from "./base.js";
import OrganizationModel from "../db_models/organization.js";
import mongoose from "mongoose";

const ObjectIdIsValid = mongoose.Types.ObjectId.isValid;

class OrganizationRepository extends BaseRepository {
  constructor(session) {
    super(session);
  }

  async createOrganization(orgName, userID) {
    const orgInfo = {
      orgName,
      users: [userID],
    };
    const orgs = await OrganizationModel.insertMany([orgInfo], {
      session: this.session,
    });
    const org = orgs[0];
    return org.toObject();
  }

  async getOrganizationByID(orgID) {
    if (!ObjectIdIsValid(orgID)) {
      return null;
    }
    const org = await OrganizationModel.findById(orgID)
      .populate({ path: "users", select: "name" })
      .exec();
    if (org === null) {
      return null;
    }
    return org.toObject();
  }
}

export default OrganizationRepository;
