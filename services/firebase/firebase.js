const firebaseAdmin = require("firebase-admin");

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  }),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

exports.createUser = userInfo => {
  return firebaseAdmin.auth().createUser(userInfo);
};

exports.setCustomUserClaims = (uid, roleObj) => {
  return firebaseAdmin.auth().setCustomUserClaims(uid, roleObj);
};

exports.listUsers = () => {
  return firebaseAdmin.auth().listUsers();
};

exports.getUser = id => {
  return firebaseAdmin.auth().getUser(id);
};

exports.updateUser = (id, userInfo) => {
  return firebaseAdmin.auth().updateUser(id, userInfo);
};

exports.deleteUser = id => {
  return firebaseAdmin.auth().deleteUser(id);
};

exports.verifyIdToken = token => {
  return firebaseAdmin.auth().verifyIdToken(token);
};
