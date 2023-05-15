import { Router } from "express";
import OrganizationRepository from "../../repositories/organization_repository.js";
import { authenticatedUserRequired } from "../../middlewares/authentication.js";
import mongoose from "mongoose";
import UserRepository from "../../repositories/user_repository.js";
import ProjectRepository from "../../repositories/project_repository.js";

const router = Router();

// create new organization for this user
router.post("/", authenticatedUserRequired, async function (req, res) {
  const user = req._user;
  const organizationName = req.body.name;
  const session = await mongoose.startSession();
  session.startTransaction();
  const or = new OrganizationRepository(session);
  const ur = new UserRepository(session);
  let organization;
  try {
    organization = await or.createOrganization(organizationName, user.id);
    await ur.addOrganizationToUser(user.id, organization.id);
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    return res.status(500).json({ message: "error creating organization" });
  }
  await session.endSession();

  return res.json({ organization });
});

// get all organizations for this user
router.get("/", authenticatedUserRequired, async function (req, res) {
  const user = req._user;
  const ur = new UserRepository(null);
  const organizations = await ur.getAllOrganizationsForUser(user.id);
  return res.json({ organizations });
});

// get info about particular organization
router.get(
  "/:organizationID",
  authenticatedUserRequired,
  async function (req, res) {
    const organizationID = req.params.organizationID;
    const or = new OrganizationRepository(null);
    const pr = new ProjectRepository(null);
    const organization = await or.getOrganizationByID(organizationID);
    const projects = await pr.getAllProjectsForOrganization(organizationID);
    organization.projects = projects;
    return res.json({ organization });
  }
);

export default router;
