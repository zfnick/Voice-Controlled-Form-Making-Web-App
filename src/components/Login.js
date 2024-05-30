//Handle user google login

import { useEffect} from 'react';
import { CLIENT_ID } from '../config';

const Login = ({ handleCallbackResponse}) => {

    useEffect(() => {
        const google = window.google;
        google.accounts.id.initialize({
            client_id: CLIENT_ID,
            callback: handleCallbackResponse
        });

        google.accounts.id.renderButton(
            document.getElementById("signInDiv"),
            { theme: "outline", size:"large"}
        );

        google.accounts.id.prompt();
    }, [handleCallbackResponse]);
    
    return <div id = "signInDiv"></div>;
};

export default Login;