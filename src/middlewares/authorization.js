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

async function _validateIdTokenFromFirebase(idToken, firebaseApp) {
  // calls firebase to authenticate token
  // return claims if valid
  // else null
  const decodedToken = await firebaseApp
    .auth()
    .verifyIdToken(idToken)
    .catch((_error) => {
      return null;
    });
  return decodedToken;
}

async function _validateIdTokenFromLocal(idToken) {
  // check if idToken is the same as provided in .env
  // return {name: "root", uid: "root"} as decodedToken
  if (idToken === process.env.ROOT_API_KEY) {
    return { name: "root", uid: "root" };
  }
  return null;
}

async function _getTokenFromReq(firebaseApp, req) {
  const idToken = _getBearerTokenFromReq(req);
  if (!idToken) {
    return null;
  }
  // if provider is firebase => validate with firebase
  // else if provider is local => validate with local
  if (process.env.AUTH_PROVIDER === "firebase") {
    return await _validateIdTokenFromFirebase(idToken, firebaseApp);
  }
  if (process.env.AUTH_PROVIDER === "local") {
    return await _validateIdTokenFromLocal(idToken);
  }
  return null;
}

function userAuthenticateMiddleware(firebaseApp) {
  return async function _firebaseAuthenticateMiddleware(req, res, next) {
    const userToken = await _getTokenFromReq(firebaseApp, req);
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

export { userAuthenticateMiddleware, projectAuthenticateMiddleware };
