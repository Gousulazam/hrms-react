import { useEffect, useState } from "react";
import axios from "axios";

export default function Sidebar(props) {
    const nameStyle = {
        fontSize: "16px",
        fontWeight: "bold",
        color: "white",
    };
    const [menu, setMenu] = useState(`<li style="${nameStyle}" className="navbar-brand">${props.userDetails.name}<br />Employee ID:${props.userDetails.id}</span></a>
    </li>
    <li>
                        <Link to="/dashboard"> <i class="menu-icon fa fa-dashboard"></i>Dashboard </Link>
                    </li>
    `)
    useEffect(() => {
        axios.post(`${props.baseURL}/getMenuRoleWise`, {
            role: props.role,
            userDetails: props.userDetails,
        })
            .then((response) => {
                setMenu(response.data);
                // console.log(response.data);
            });
    }, [props.role])
    

    return (
        <aside id="left-panel" className="left-panel">
            <nav className="navbar navbar-expand-sm navbar-default">

                <div className="navbar-header">
                    <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#main-menu" aria-controls="main-menu" aria-expanded="false" aria-label="Toggle navigation">
                        <i className="fa fa-bars"></i>
                    </button>
                    <a className="navbar-brand" href="./"><img src="images/logo.png" alt="Logo" /></a>
                    <a className="navbar-brand hidden" href="./"><img src="images/logo2.png" alt="Logo" /></a>
                </div>

                <div id="main-menu" className="main-menu collapse navbar-collapse">
                    <ul className="nav navbar-nav" dangerouslySetInnerHTML={{ __html: menu }}>

                    </ul>
                </div>
            </nav>
        </aside>
    )
}
