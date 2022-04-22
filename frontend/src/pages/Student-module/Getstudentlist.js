import React, { useEffect, useState } from 'react'
import axios from "axios";
import { useLocation } from 'react-router-dom';

const Getstudentlist = (props) => {
    const { state } = useLocation();
    const [studentDetails, setStudentDetails] = useState([])
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
                // console.log(response.data)
            });
    }, [])

    useEffect(() => {
        axios.post(`${props.baseURL}/getdepartmentdetailsbyid`, {
            did: state.did.did
        })
            .then((response) => {
                setCollegeDetail(response.data[0]);
            });
    }, [])
    

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
                            <th>Roll No</th>
                            <th>usn</th>
                            <th>name</th>
                            <th>scheme</th>
                            <th>mobile</th>
                        </tr>
                    </thead>
                    <tbody>
                            {
                            studentDetails.map((user, index) => (
                                <tr className="text-capitalize">
                                    <td>{index+1}</td>
                                    <td>{user.rno}</td>
                                    <td>{user.usn}</td>
                                    <td>{user.studentname}</td>
                                    <td>{user.scheme}</td>
                                    <td>{user.mobile}</td>
                                    </tr>
                            ))
                            }
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Getstudentlist
