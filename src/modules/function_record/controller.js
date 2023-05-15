import { Router } from "express";
import { authenticatedProjectRequired } from "../../middlewares/authentication.js";
import FunctionRecordRepository from "../../repositories/function_record_repository.js";
import mongoose from "mongoose";

const router = Router();

// create new function record for this project
router.post("/", authenticatedProjectRequired, async function (req, res) {
  const project = req._project;
  const functionName = req.body.functionName;
  const dataType = req.body.dataType;
  const dataDump = req.body.dataDump;
  const tags = req.body.tags;
  const session = await mongoose.startSession();
  session.startTransaction();
  const frr = new FunctionRecordRepository(session);
  let functionRecord;
  try {
    functionRecord = await frr.createFunctionRecord(
      functionName,
      dataType,
      dataDump,
      tags,
      project.id
    );
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    return res.status(500).json({ message: "error creating function record" });
  }
  await session.endSession();
  return res.json({ functionRecord });
});

export default router;
