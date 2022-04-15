import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Deletestudentlist = (props) => {
    let navigate = useNavigate();

    const { state } = useLocation();
    const [studentDetails, setStudentDetails] = useState([])
    const [department, setDepartment] = useState(state.department)
    const [sem, setSem] = useState(state.sem)
    const [dv, setDv] = useState(state.dv)
    const [academicYear, setAcademicYear] = useState(state.academicYear)
    const [collegeDetail, setCollegeDetail] = useState('')
    const [sendRequest, setSendRequest] = useState(false);

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
    }, [sendRequest])

    useEffect(() => {
        axios.post(`${props.baseURL}/getdepartmentdetailsbyid`, {
            cid: state.cid
        })
            .then((response) => {
                setCollegeDetail(response.data[0]);
            });
    }, [])

    const deleteStudent = (e) => {
        e.preventDefault();
        axios.post(`${props.baseURL}/deleteStudent`, {
            department, sem, dv, studentId:e.target.value, academicYear
        })
            .then((response) => {
                if (response.data.affectedRows > 0) {
                    alert("Record Deleted Successfully");
                    setSendRequest(true)
                    setSendRequest(false)
                }
                else {
                    alert("failed to Deleted");
                }
            });
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
                                    <td><button onClick={deleteStudent} value={user.id} className="btn btn-danger btn-sm rounded" id="upid" name="upid" >Delete</button></td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Deletestudentlist