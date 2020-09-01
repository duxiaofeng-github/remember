import VConsole from "vconsole";
import React from "react";
import {render} from "react-dom";
import App from "../App";
import featherFont from "react-native-vector-icons/Fonts/Feather.ttf";

new VConsole();

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
  renderApp();
}

init();
