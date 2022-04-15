import React, { useEffect, useState } from 'react'
import Axios from "axios";
import { useLocation,useNavigate } from 'react-router-dom';

const Getdeletestudent = (props) => {
    let navigate = useNavigate();

    const [departmentOption, setDepartmentOption] = useState(`<option value="">Select Department</option>`);
    const [department, setDepartment] = useState("")
    const [cid, setCid] = useState({ cid: props.userDetails.cid })
    const [dv, setDv] = useState('')

    useEffect(() => {
        Axios.post(`${props.baseURL}/getacademicdepartmentoption`, {
            cid: props.userDetails.cid
        })
            .then((response) => {
                if (response.data.length > 0) {
                    setDepartmentOption(response.data);
                }
            });
    }, [])

    const [academicYearOption, setAcademicYearOption] = useState(`<option value="">Select Academic Year</option>`);
    const [academicYear, setAcademicYear] = useState("")
    useEffect(() => {
        Axios.post(`${props.baseURL}/getacademicyearoption`, {
            cid: props.userDetails.cid
        })
            .then((response) => {
                if (response.data.length > 0) {
                    setAcademicYearOption(response.data);
                }
            });
    }, [])

    const [semOption, setSemOption] = useState(`<option value="">Select Sem</option>`);
    const [sem, setSem] = useState("")
    useEffect(() => {
        Axios.post(`${props.baseURL}/getsem`, {
            cid: props.userDetails.cid

        })
            .then((response) => {
                if (response.data.length > 0) {
                    setSemOption(response.data);
                }
            });
    }, [])

    const getstudent = (e) => {
        e.preventDefault();
        navigate("/deletestudentlist", { state: { academicYear, department, sem, dv, cid } });
    };


    return (
        <div>
            <div className="col-lg-12">
                <div className="card rounded">
                    <form method="post" onSubmit={getstudent} className="form-horizontal">
                        <div className="card-header text-center">
                            <strong className="text-center">Delete Student Information</strong>
                        </div>
                        <div className="card-body card-block">
                            <div className="row form-group">
                                <div className="col col-md-3"><label htmlFor="hf-email" className=" form-control-label">Department</label></div>
                                <div className="col-12 col-md-9">
                                    <select className="form-control" name="department" required="" onChange={e => { setDepartment(e.target.value) }} id="department" dangerouslySetInnerHTML={{ __html: departmentOption }}>
                                    </select>
                                    </div>
                            </div>

                            <div className="row form-group">
                                <div className="col col-md-3"><label htmlFor="hf-email" className=" form-control-label">Academic Year</label></div>
                                <div className="col-12 col-md-9">
                                    <select className="form-control" name="academic_year" required="" onChange={e => { setAcademicYear(e.target.value) }} id="academic_year" dangerouslySetInnerHTML={{ __html: academicYearOption }}>
                                    </select>
                                    </div>
                            </div>
                            <div className="row form-group">
                                <div className="col col-md-3"><label htmlFor="hf-password" className=" form-control-label">Sem</label></div>
                                <div className="col-12 col-md-9">
                                    <select className="form-control" name="sem" required="" onChange={e => { setSem(e.target.value) }} id="sem" dangerouslySetInnerHTML={{ __html: semOption }}>
                                    </select>
                                    </div>
                            </div>
                            <div className="row form-group">
                                <div className="col col-md-3"><label htmlFor="hf-password" className=" form-control-label">Division</label></div>
                                <div className="col-12 col-md-9">
                                    <select name="division" onChange={e => { setDv(e.target.value) }} className="form-control">
                                        <option value="">Select Division</option>
                                        <option>A</option>
                                        <option>B</option>
                                        <option>C</option>
                                        <option>P1</option>
                                        <option>P2</option>
                                        <option>C1</option>
                                        <option>C2</option>
                                    </select>
                                    <span className="help-block"></span></div>
                            </div>
                        </div>
                        <div className="card-footer">
                            <center>
                                <button type="submit" className="btn rounded btn-primary btn-sm mx-2">
                                    <i className="fa fa-dot-circle-o"></i> Submit
                                </button>
                                <button type="reset" className="btn rounded btn-danger btn-sm">
                                    <i className="fa fa-ban"></i> Reset
                                </button>
                            </center>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Getdeletestudent
