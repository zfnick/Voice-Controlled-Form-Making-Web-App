// authHandlers.js
import jwt_decode from "jwt-decode";

export const handleCallbackResponse = (response, setUser) => {
  console.log("Encoded JwT ID token: " + response.credential);
  var userObject = jwt_decode(response.credential);
  console.log(userObject);
  setUser(userObject);
  // document.getElementById("signInDiv").hidden = true;
};

export const handleSignOut = (setUser) => {
  setUser({});
  // document.getElementById("signInDiv").hidden = false;
};
