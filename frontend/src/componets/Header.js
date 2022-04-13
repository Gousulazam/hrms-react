import { useEffect, useState } from "react";
import axios from "axios";
import { Navigate } from 'react-router-dom';
import swal from 'sweetalert';

export default function Header(props) {
    const roles = props.userDetails.roles.split(',');
    const rolesDropdown = roles.map((role, i) => <a key={i} className="nav-link" href="#" onClick={(e) => { e.preventDefault(); sessionStorage.setItem('role', role); alert(`Role Changed to ${role}`); props.setRole(role) }} ><i className="fa fa-user"></i> {role}</a>);
    const [collegeOption, setcollegeOption] = useState(`<option value="">Select College</option>`);
    const [cid, setcid] = useState("");
    const [departmentOption, setdepartmentOption] = useState(`<option value="">Select Department</option>`);
    const [did, setdid] = useState("");
    const [userOption, setuserOption] = useState(`<option value="">Select Department</option>`);
    const [fid, setfid] = useState("");

    useEffect(() => {
        axios.get(`${props.baseURL}/getcollegeoption`)
            .then((response) => {
                if (response.data.length > 0) {
                    setcollegeOption(response.data);
                }
            });
    }, [])
    useEffect(() => {
        if(cid!=''){
            axios.post(`${props.baseURL}/getdepartmenteoption`,{cid:cid})
            .then((response) => {
                if (response.data.length > 0) {
                    setdepartmentOption(response.data);
                }
            });
        }else{
           setdepartmentOption(`<option value="">Select Department</option>`); 
        }
    }, [cid])
    useEffect(() => {
        if(cid!=''){
            axios.post(`${props.baseURL}/getemployeeeoption`,{cid:cid,did:did})
            .then((response) => {
                if (response.data.length > 0) {
                    setuserOption(response.data);
                }
            });
        }else{
           setdepartmentOption(`<option value="">Select Department</option>`); 
        }
    }, [did])

    const masterLogin = (e) =>{
        e.preventDefault();
        axios.post(`${props.baseURL}/masterlogin`, {
            fid
        })
            .then((response) => {
                if (response.data.length > 0) {
                    sessionStorage.setItem('login',true);
                    sessionStorage.setItem('masterLogin',true);
                    props.setLogin(sessionStorage.getItem('login'));
                    sessionStorage.setItem('userDetails',JSON.stringify(response.data[0]))
                    props.setUserDetails(JSON.parse(sessionStorage.getItem('userDetails')));
                    sessionStorage.setItem('role',JSON.parse(sessionStorage.getItem('userDetails')).roles.split(",")[0]);
                    window.location.reload();
                }else{
                    swal("Error...!","", "error");
                }
            });
    }
    return (
        <header id="header" className="header">
            <div className="header-menu">
                <div className="col-sm-7">
                    <a id="menuToggle" className="menutoggle pull-left"><i className="fa fa fa-tasks"></i></a>
                    <div className="header-left">
                        <div className="dropdown for-notification">
                            <button className="btn btn-secondary dropdown-toggle" type="button" id="notification" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <i className="fa fa-bell"></i>
                                <span className="count bg-danger">5</span>
                            </button>
                            <div className="dropdown-menu" aria-labelledby="notification">
                                <p className="red">You have 3 Notification</p>
                                <a className="dropdown-item media bg-flat-color-1" href="#">
                                    <i className="fa fa-check"></i>
                                    <p>Server #1 overloaded.</p>
                                </a>
                                <a className="dropdown-item media bg-flat-color-4" href="#">
                                    <i className="fa fa-info"></i>
                                    <p>Server #2 overloaded.</p>
                                </a>
                                <a className="dropdown-item media bg-flat-color-5" href="#">
                                    <i className="fa fa-warning"></i>
                                    <p>Server #3 overloaded.</p>
                                </a>
                            </div>
                        </div>

                        <div className="dropdown for-message">
                            <button className="btn btn-secondary dropdown-toggle" type="button"
                                id="message"
                                data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <i className="ti-email"></i>
                                <span className="count bg-primary">9</span>
                            </button>
                            <div className="dropdown-menu" aria-labelledby="message">
                                <p className="red">You have 4 Mails</p>
                                <a className="dropdown-item media bg-flat-color-1" href="#">
                                    <span className="photo media-left"><img alt="avatar" src="images/avatar/1.jpg" /></span>
                                    <span className="message media-body">
                                        <span className="name float-left">Jonathan Smith</span>
                                        <span className="time float-right">Just now</span>
                                        <p>Hello, this is an example msg</p>
                                    </span>
                                </a>
                                <a className="dropdown-item media bg-flat-color-4" href="#">
                                    <span className="photo media-left"><img alt="avatar" src="images/avatar/2.jpg" /></span>
                                    <span className="message media-body">
                                        <span className="name float-left">Jack Sanders</span>
                                        <span className="time float-right">5 minutes ago</span>
                                        <p>Lorem ipsum dolor sit amet, consectetur</p>
                                    </span>
                                </a>
                                <a className="dropdown-item media bg-flat-color-5" href="#">
                                    <span className="photo media-left"><img alt="avatar" src="images/avatar/3.jpg" /></span>
                                    <span className="message media-body">
                                        <span className="name float-left">Cheryl Wheeler</span>
                                        <span className="time float-right">10 minutes ago</span>
                                        <p>Hello, this is an example msg</p>
                                    </span>
                                </a>
                                <a className="dropdown-item media bg-flat-color-3" href="#">
                                    <span className="photo media-left"><img alt="avatar" src="images/avatar/4.jpg" /></span>
                                    <span className="message media-body">
                                        <span className="name float-left">Rachel Santos</span>
                                        <span className="time float-right">15 minutes ago</span>
                                        <p>Lorem ipsum dolor sit amet, consectetur</p>
                                    </span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                {sessionStorage.getItem('masterLogin') == 'true' && <form  onSubmit={masterLogin}>
                    <div className="row">
                        <div className="input-group col-sm-3">
                            <select required onChange={e=> setcid(e.target.value)} className="form-control" dangerouslySetInnerHTML={{__html:collegeOption}}>
                            </select>
                        </div>
                        <div className="input-group col-sm-3">
                            <select required onChange={e=> setdid(e.target.value)} className="form-control" dangerouslySetInnerHTML={{__html:departmentOption}}>
                            </select>
                        </div>
                        <div className="input-group col-sm-3">
                            <select required onChange={e=> setfid(e.target.value)} className="form-control" dangerouslySetInnerHTML={{__html:userOption}}>
                            </select>
                        </div>

                        <button className="btn btn-primary rounded" type="submit">Submit</button>
                    </div>
                </form>}
                <div className="col-sm-5">
                    <div className="user-area dropdown float-right">
                        <a href="#" className="dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <img className="user-avatar rounded-circle" src="images/admin.jpg" alt="User Avatar" />
                        </a>

                        <div className="user-menu dropdown-menu">
                            {
                                rolesDropdown
                            }
                            <a className="nav-link" href="#" onClick={(e) => { e.preventDefault(); sessionStorage.removeItem('login'); sessionStorage.removeItem('userDetails'); sessionStorage.removeItem('role'); return <Navigate to="/" /> }}><i className="fa fa-power-off"></i> Logout</a>
                        </div>
                    </div>
                </div>
               
            </div>

        </header>
    )
}
