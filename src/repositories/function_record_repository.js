import BaseRepository from "./base.js";
import FunctionRecordModel from "../db_models/function_records.js";

class FunctionRecordRepository extends BaseRepository {
  constructor(session) {
    super(session);
  }

  async createFunctionRecord(
    functionName,
    dataType,
    dataDump,
    tags,
    projectID
  ) {
    // create function record
    // return function record
    const functionRecordInfo = {
      functionName,
      dataType,
      dataDump,
      tags,
      project: projectID,
    };
    await FunctionRecordModel.insertMany([functionRecordInfo], {
      session: this.session,
    });
    return true;
  }
}

export default FunctionRecordRepository;
