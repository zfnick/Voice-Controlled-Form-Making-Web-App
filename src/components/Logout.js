// Handle User logout
import React from 'react';

const Logout = ({ handleSignOut }) => {
  return (
    <button onClick={handleSignOut}>
      Sign Out
    </button>
  );
};

export default Logout;
