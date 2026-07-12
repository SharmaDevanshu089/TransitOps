import { LoginPage } from "./src/loginPage/LoginPage";
import { TitleBar } from "./src/TitleBar/TitleBar";
import "./App.css";
import { ClientPage } from "./src/MainPages/ClientPage/ClientPage";

export default function App() {

  return (<div>
    <div>
      <TitleBar />
    </div>
    <div>
      <LoginPage />
    </div>
  </div>)
}