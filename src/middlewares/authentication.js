function authenticatedUserRequired(req, res, next) {
  const user = req._user;
  if (user === null) {
    return res.status(401).json({ message: "user not authenticated" });
  }
  next();
}

function authenticatedProjectRequired(req, res, next) {
  const project = req._project;
  if (project === null) {
    return res.status(401).json({ message: "invalid api key" });
  }
  next();
}

export { authenticatedUserRequired, authenticatedProjectRequired };
