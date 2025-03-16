import LoginButton from "./components/ButtonFile.js";
import RegisterButton from "./components/register-button-file.js";
import MyImage from "./—Pngtree—glass jar and love png_4425351 (1).png"

import "./Home.css";

import {useNavigate} from "react-router-dom";

const Home = () => {
    const navigate = useNavigate();

    return(
    <div className= "home-container">
        <h1 className ="text"> Welcome to Jar of Joy!!!  </h1>
        <img src={MyImage} alt="Jar of Joy" />

        <div className= "button-container">
        <button onClick={() => navigate("/login")}>Login</button>
        <button onClick={() => navigate("/register")}>Register</button>
        </div>
    </div>
    )

}
export default Home;
