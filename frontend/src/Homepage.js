
import MyImage from "./—Pngtree—glass jar and love png_4425351 (1).png"

import "./Homepage.css";

import {useNavigate} from "react-router-dom";

const Home = () => {
    const navigate = useNavigate();

    return(
    <div className= "home-container">
        <h1 className ="text"> Welcome to Jar of Joy!!!  </h1>
        <h5 className ="summary"> 2025 SWE Project </h5>
        <img src={MyImage} alt="Jar of Joy" />
        <div className= "home-button-container">
        <button className="btn-custom" onClick={() => navigate("/login")}>Login</button>
        <button className="btn-custom" onClick={() => navigate("/register")}>Register</button>
        </div>
    </div>
    )

}
export default Home;