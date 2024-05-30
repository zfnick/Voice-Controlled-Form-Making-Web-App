import { useEffect, useState } from 'react';
import './App.css';
import Login from './components/Login';
import Logout from './components/Logout';
import { handleCallbackResponse, handleSignOut } from './components/authHandlers'; // Import the functions
import HomePage from './HomePage';
import { CLIENT_ID } from './config';

const SCOPES = "https://www.googleapis.com/auth/drive"; //to create documents/forms

const darkButtonStyle = {
  backgroundColor: '#333', // Dark background color
  color: '#fff',           // Text color
  padding: '10px 20px',    // Padding
  border: 'none',          // No border
  borderRadius: '5px',     // Rounded corners
  cursor: 'pointer',       // Cursor on hover
};


function App() {
  const [user, setUser] = useState({});
  const [tokenClient, setTokenClient] = useState({});
  const [accessToken, setAccessToken] = useState();

  function createFormFile() {
    tokenClient.requestAccessToken();
  }

  // when token client is ready, request access token
  // useEffect(() => {
  //   if (Object.keys(tokenClient).length !== 0) {
  //     tokenClient.requestAccessToken();
  //   }
  // }, [tokenClient]);

  // useEffect(() => {
  //   const google = window.google;
  //   google.accounts.id.initialize({
  //     client_id: CLIENT_ID,
  //     callback: handleCallbackResponse
  //   });

  //   google.accounts.id.prompt();
  // });

  // useEffect(() => {

  // }, [])

  // function performGoogleSignIn() {

  // }

  //global google
  useEffect(() => {

    const google = window.google;
    google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: (response) => handleCallbackResponse(response, setUser)
    })

    google.accounts.id.renderButton(
      document.getElementById("signInDiv"),
      { theme: "outline", size: "large" }
    );

    //Access Token
    //Upload to specific users google drive
    setTokenClient(
      google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (tokenResponse) => {
          console.log("Token response:", tokenResponse);
          //Have access to access any google API

          setAccessToken(tokenResponse.access_token);
          console.log(tokenResponse.access_token);

          // if (tokenResponse && tokenResponse.access_token){
          //   fetch ("https://www.googleapis.com/drive/v3/files", {
          //     method: 'POST',
          //     headers: {
          //       'Content-Type': 'application/json', 
          //       'Authorization': `Bearer ${tokenResponse.access_token}`
          //     },
          //     body: JSON.stringify({"name": "Sample", "mimeType": "application/vnd.google-apps.form"})
          //   })
          //   .then(response => response.json())
          //   .then(data => {
          //     console.log("Form created:", data);
          //   })
          //   .catch(error => {
          //     console.error("Error creating form:", error);
          //   });
          // };
        }
      })
    ); //To initialize constructor token client

    google.accounts.id.prompt();
    //tokenClient.requestAccessToken();
  }, []);

  function onLogout() {
    setUser({});
    setAccessToken(undefined);
  }


  if (user) {
    // return <HomePage />
  }

  return (
    <div
    style={{
      display: "flex",
      flexDirection: "column",
      width: "100%",
      alignItems: "center",
      "justifyContent": "center"
    }}
    className="App">

      {
        Object.keys(user).length === 0 ? (
          <div id="signInDiv"></div>
        ) : (
          <button
            onClick={onLogout}
          >
            Sign Out
          </button>
        )
      }




      {
        (Object.keys(user).length !== 0 && !accessToken) && (
          <button
            onClick={() => {
              tokenClient.requestAccessToken();
            }}
          >
            Initalize Access
          </button>
        )
      }

      {(user && Object.keys(user).length !== 0 && accessToken) && (
        <HomePage user={user} accessToken={accessToken} />
      )}
    </div>
  );
}

export default App;