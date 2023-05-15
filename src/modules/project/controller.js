import { Router } from "express";
import { authenticatedUserRequired } from "../../middlewares/authentication.js";
import mongoose from "mongoose";
import UserRepository from "../../repositories/user_repository.js";
import ProjectRepository from "../../repositories/project_repository.js";
import { VALID_PROJECT_LANGUAGES } from "../../constants.js";

const router = Router();

// create new project in org
router.post("/", authenticatedUserRequired, async function (req, res) {
  const user = req._user;
  const organizationID = req.body.organizationID;
  const projectLanguage = req.body.language;

  // validate that user is in this organization
  const ur = new UserRepository(null);
  const organizations = await ur.getAllOrganizationsForUser(user.id);
  const orgIDs = organizations.map((org) => org.id);
  if (!orgIDs.includes(organizationID)) {
    return res.status(403).json({ message: "user not in this organization" });
  }

  // validate project language
  if (!VALID_PROJECT_LANGUAGES.includes(projectLanguage)) {
    return res.status(400).json({ message: "invalid project language" });
  }

  const projectName = req.body.name;
  const session = await mongoose.startSession();
  session.startTransaction();
  const pr = new ProjectRepository(session);
  let project;
  try {
    project = await pr.createProject(
      projectName,
      organizationID,
      projectLanguage
    );
    await session.commitTransaction();
  } catch (error) {
    console.error(error);
    await session.abortTransaction();
    await session.endSession();
    return res.status(500).json({ message: "error creating project" });
  }
  await session.endSession();
  return res.json({ project });
});

// get specific project by ID
router.get("/:projectID", authenticatedUserRequired, async function (req, res) {
  const projectID = req.params.projectID;
  const pr = new ProjectRepository(null);
  const project = await pr.getProject(projectID);
  return res.json({ project });
});

export default router;
