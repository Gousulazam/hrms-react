import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Updatestudentlist = (props) => {
    let navigate = useNavigate();

    const [studentId, setStudentId] = useState()
    const { state } = useLocation();
    const [studentDetails, setStudentDetails] = useState([])
    const [academicYear, setAcademicYear] = useState(state.academicYear)
    const [department, setDepartment] = useState(state.department)
    const [cid, setCid] = useState(state.cid)
    const [sem, setSem] = useState(state.sem)
    const [dv, setDv] = useState(state.dv)
    const [collegeDetail, setCollegeDetail] = useState('')

    useEffect(() => {
        axios.post(`${props.baseURL}/getstudentlist`, {
            academicYear: state.academicYear,
            department: state.department,
            sem: state.sem,
            dv: state.dv,
            cid: state.cid.cid
        })
            .then((response) => {
                setStudentDetails(response.data);
            });
    }, [])

    useEffect(() => {
        axios.post(`${props.baseURL}/getdepartmentdetailsbyid`, {
            cid: state.cid
        })
            .then((response) => {
                setCollegeDetail(response.data[0]);
            });
    }, [])

    const edit = (e) => {

        e.preventDefault();
        navigate("/editstudentdetail", { state: { academicYear, department, cid, dv, sem, studentId: e.target.value } });
    };

    return (
        <div className="card">
            <div className="card-header text-capitalize text-center font-weight-bold">
                <h5>department of {collegeDetail.name}
                    <br />
                    Semester : {state.sem}
                    <br />
                    student list</h5>
            </div>
            <div className="card-body">
                <table className="table table-bordered dataTable">
                    <thead className="thead-dark">
                        <tr className="text-capitalize">
                            <th>sl no</th>
                            <th>usn</th>
                            <th>name</th>
                            <th>mobile</th>
                            <th>action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            studentDetails.map((user, index) => (
                                <tr className="text-capitalize">
                                    <td>{index + 1}</td>
                                    <td>{user.usn}</td>
                                    <td>{user.studentname}</td>
                                    <td>{user.mobile}</td>
                                    <td><button onClick={edit} value={user.id} className="btn btn-info btn-sm rounded" id="upid" name="upid" >EDIT</button></td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Updatestudentlist