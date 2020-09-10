import React from "react";
import {render} from "react-dom";
import App from "../App";
import featherFont from "react-native-vector-icons/Fonts/Feather.ttf";
import {notifyTasks} from "../src/utils/common";

function renderApp() {
  render(
    <>
      <style type="text/css">{`
        @font-face {
          font-family: 'Feather';
          src: url(${featherFont}) format('truetype');
        }

        *:focus {
          outline: none;
        } 
      `}</style>
      <App />
    </>,
    document.getElementById("container"),
  );
}

async function init() {
  const timeInterval = 1000 * 60;

  setInterval(() => {
    notifyTasks(true);
  }, timeInterval);

  renderApp();
}

init();
