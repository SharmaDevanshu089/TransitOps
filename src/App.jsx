import { LoginPage } from "./src/loginPage/LoginPage";
import { TitleBar } from "./src/TitleBar/TitleBar";
import "./App.css";

export default function App(){

  return(<div>
    <div>
      <TitleBar/>
    </div>
    <div>
      <LoginPage/>
    </div>
  </div>)
}