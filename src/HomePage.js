import React, { useState, useEffect } from 'react';
import annyang from 'annyang';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import HomeContent from './home_content';


function Homepage(props) {
  const user = props.user;
  const accessToken = props.accessToken;

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',

    }}>
      

      <div style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
      }}>

        <HomeContent
          accessToken={accessToken}
          user={user}
        />

      </div>

    </div>
  );
}

const Dictaphone = () => {
  const {
    transcript,
    listening,
    resetTranscript,
  } = useSpeechRecognition();

  const startListening = () => SpeechRecognition.startListening({ continuous: true });

  return (
    <div>
      <p>Microphone: {listening ? 'on' : 'off'}</p>
      <button
        onTouchStart={startListening}
        onMouseDown={startListening}
        onTouchEnd={SpeechRecognition.stopListening}
        onMouseUp={SpeechRecognition.stopListening}
      >Hold to talk</button>
      <p>{transcript}</p>
    </div>
  );
};

export default Homepage;
