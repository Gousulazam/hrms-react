import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import swal from 'sweetalert';

export default function Login(props) {
    let navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = (e) => {
        e.preventDefault();
        axios.post(`${props.baseURL}/checkuser`, {
            email, password
        })
            .then((response) => {
                if (response.data.length > 0) {
                    sessionStorage.setItem('login',true);
                    props.setLogin(sessionStorage.getItem('login'));
                    sessionStorage.setItem('userDetails',JSON.stringify(response.data[0]))
                    props.setUserDetails(JSON.parse(sessionStorage.getItem('userDetails')));
                    // console.log(sessionStorage.getItem('userDetails'));
                    navigate("/dashboard");
                }else{
                    swal("Wrong Credentials","", "warning");
                }
            });
    }

    return (
        <div className="sufee-login d-flex align-content-center flex-wrap">
            <div className="container">
                <div className="login-content">
                    <div className="login-logo">
                        <a href="index.html">
                            <img className="align-content" src="images/logo.png" alt="" />
                        </a>
                    </div>
                    <div className="login-form">
                        <form onSubmit={handleLogin}>
                            <div className="form-group">
                                <label>Email address/MOBILE NO</label>
                                <input type="text" className="form-control" onChange={e => setEmail(e.target.value)} placeholder="Email/Mobile No" />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input type="password" className="form-control" onChange={e => setPassword(e.target.value)} placeholder="Password" />
                            </div>

                            <button type="submit" className="btn btn-success btn-flat m-b-30 m-t-30">Sign in</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
