import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    organizations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "organizations",
        default: [],
      },
    ],
    firebaseId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
  },
  {
    toObject: {
      virtuals: true,
      versionKey: false,
      flattenMaps: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.firebaseId;
      },
    },
    versionKey: false,
  }
);

const UserModel = mongoose.model("users", UserSchema);

export default UserModel;
