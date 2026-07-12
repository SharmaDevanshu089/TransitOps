import { useEffect, useState } from "react";
import "./titlebar.css";
import { getCurrentWindow } from "@tauri-apps/api/window";

// getting the current window instance
const appWindow = getCurrentWindow();

export function TitleBar() {
  const [maximized, setMaximized] = useState(true);

  useEffect(() => {
    // checking if window is maximized or not
    appWindow.isMaximized().then((isMaximized) => {
      setMaximized(isMaximized);
    });
  }, []);

  // close Window button
  const closeWindow = () => {
    appWindow.close();
  };

  // minimize Window button
  const minimizeWindow = () => {
    appWindow.minimize();
  };

  // maximize Window button
  const maximizeWindow = (isMaximized) => {
    //setting the next maximize to be the opposite of the current maximize
    const nextMaximized = !isMaximized;

    if (nextMaximized) {
      appWindow.maximize();
    } else {
      appWindow.unmaximize();
    }
    // setting the state of maximize
    setMaximized(nextMaximized);
  };

  //TODO => Add finl return Statement
}
