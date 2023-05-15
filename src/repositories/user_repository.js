import BaseRepository from "./base.js";
import UserModel from "../db_models/user.js";
import mongoose from "mongoose";

const ObjectIdIsValid = mongoose.Types.ObjectId.isValid;

class UserRepository extends BaseRepository {
  constructor(session) {
    super(session);
  }

  async createUser(userName, providerId) {
    const userInfo = {
      providerId: providerId,
      userName: userName,
    };
    const users = await UserModel.insertMany([userInfo], {
      session: this.session,
    });
    console.log(users);
    const user = users[0];
    return user.toObject();
  }

  async getUserByProviderId(providerId) {
    // use UserModel to find user by providerId
    // return user object
    const user = await UserModel.findOne({ providerId: providerId }).exec();
    if (user === null) {
      return null;
    }
    return user.toObject();
  }

  async addOrganizationToUser(userID, organizationID) {
    // use UserModel to add organizationID to user
    // return user object
    const user = await UserModel.findByIdAndUpdate(
      userID,
      { $push: { organizations: organizationID } },
      { session: this.session }
    ).exec();
    return user.toObject();
  }

  async getAllOrganizationsForUser(userID) {
    if (!ObjectIdIsValid(userID)) {
      return [];
    }
    const user = await UserModel.findById(userID, { organizations: 1 })
      .populate({ path: "organizations", select: "orgName" })
      .exec();
    return user.organizations.map((doc) => doc.toObject());
  }
}

export default UserRepository;
