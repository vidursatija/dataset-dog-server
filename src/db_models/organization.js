import mongoose from "mongoose";

const OrganizationSchema = new mongoose.Schema(
  {
    orgName: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    users: [
      { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    ],
  },
  {
    toObject: {
      virtuals: true,
      flattenMaps: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
      },
    },
    versionKey: false,
  }
);

const OrganizationModel = mongoose.model("organizations", OrganizationSchema);

export default OrganizationModel;
