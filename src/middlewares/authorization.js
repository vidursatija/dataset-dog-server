import UserRepository from "../repositories/user_repository.js";
import OrganizationRepository from "../repositories/organization_repository.js";
import ProjectRepository from "../repositories/project_repository.js";
import mongoose from "mongoose";

function _getBearerTokenFromReq(req) {
  const bearerHeader = req.headers.authorization;
  if (bearerHeader) {
    // Bearer ey....
    const bearer = bearerHeader.split(" ");
    const idToken = bearer[1];
    return idToken;
  } else {
    return null;
  }
}

async function _getFirebaseTokenFromReq(firebaseApp, req) {
  // finds authorization header Bearer
  // calls firebase to authenticate token
  // return claims if valid
  // else null
  const idToken = _getBearerTokenFromReq(req);
  if (idToken) {
    const decodedToken = await firebaseApp
      .auth()
      .verifyIdToken(idToken)
      .catch((_error) => {
        return null;
      });
    return decodedToken;
  } else {
    return null;
  }
}

function firebaseAuthenticateMiddleware(firebaseApp) {
  return async function _firebaseAuthenticateMiddleware(req, res, next) {
    const userToken = await _getFirebaseTokenFromReq(firebaseApp, req);
    req._user = null;
    if (userToken === null || userToken.uid === null) {
      req._user = null;
    } else {
      // find uid in MongoDB
      const session = await mongoose.startSession();
      session.startTransaction();
      const ur = new UserRepository(session);
      const or = new OrganizationRepository(session);
      let thisUser = await ur.getUserByFirebaseId(userToken.uid);
      if (thisUser === null) {
        // first time user is sending an API request => make a user
        const userFullName = userToken.name;
        const firebaseId = userToken.uid;
        thisUser = await ur.createUser(userFullName, firebaseId);
        const thisOrg = await or.createOrganization(
          "Default Organization",
          thisUser.id
        );
        thisUser = await ur.addOrganizationToUser(thisUser.id, thisOrg.id);
      }
      session.commitTransaction();
      session.endSession();
      req._user = thisUser;
    }
    next();
  };
}

function projectAuthenticateMiddleware() {
  return async function _projectAuthenticateMiddleware(req, res, next) {
    const idToken = _getBearerTokenFromReq(req);
    const base64DecodedIdToken = Buffer.from(idToken, "base64").toString(
      "ascii"
    );
    // split by :
    const [projectId, projectApiSecret] = base64DecodedIdToken.split(":");
    // if not projectId or projectApiSecret => return 401
    if (projectId === "" || projectApiSecret === "") {
      req._project = null;
    } else {
      const pr = new ProjectRepository(null);
      // find project
      console.log(projectId, projectApiSecret);
      const project = await pr.getValidatedProject(projectId, projectApiSecret);
      req._project = project;
    }
    next();
  };
}

export { firebaseAuthenticateMiddleware, projectAuthenticateMiddleware };
