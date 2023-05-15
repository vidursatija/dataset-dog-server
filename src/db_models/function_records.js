import mongoose from "mongoose";

const FunctionRecordSchema = new mongoose.Schema(
  {
    functionName: {
      type: String,
      required: true,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      index: true,
    },
    dataType: {
      type: String,
      required: true,
    },
    dataDump: {
      type: mongoose.SchemaTypes.Mixed,
      required: true,
    },
    tags: {
      type: Map,
      of: String, // eg: device: "iPhone", browser: "Chrome"
      default: {},
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "projects",
      required: true,
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
      },
    },
    versionKey: false,
  }
);

const FunctionRecordModel = mongoose.model(
  "function_records",
  FunctionRecordSchema
);

export default FunctionRecordModel;
