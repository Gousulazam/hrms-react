import React, { useEffect, useState } from 'react'
import axios from "axios";
import { useLocation } from 'react-router-dom';

const Assignsubjectlist = (props) => {
    const { state } = useLocation();
    const [collegeDetail, setCollegeDetail] = useState('')
    const [studentId, setStudentId] = useState([])

    useEffect(() => {
        axios.post(`${props.baseURL}/getdepartmentdetailsbyid`, {
            did: state.did
        })
            .then((response) => {
                setCollegeDetail(response.data[0]);
            });
    }, [])

    const [subject, setSubject] = useState()
    const [subjectOption, setSubjectOption] = useState(`<option value="">Select Subject</option>`);
    useEffect(() => {
        axios.post(`${props.baseURL}/getSubjectList`, {
            did: state.did,
            academicYear: state.academicYear,
            cid: state.cid,
            dv: state.dv,
            sem: state.sem
        })
            .then((response) => {
                setSubjectOption(response.data);
            });
    }, [])

    const [studentDetailList, setStudentDetailList] = useState([])
    useEffect(() => {
        axios.post(`${props.baseURL}/getStudentList2`, {
            did: state.did,
            academicYear: state.academicYear,
            cid: state.cid,
            dv: state.dv,
            sem: state.sem
        })
            .then((response) => {
                setStudentDetailList(response.data);
            });
    }, [])

    const addSubject = (e) => {
        e.preventDefault();
        if (studentId==''){
            alert('Select Atleast one Student');
        }
        axios.post(`${props.baseURL}/addSubject`, {
            studentId,
            scd: subject,
            did: state.did,
            academicYear: state.academicYear,
            cid: state.cid.cid,
            dv: state.dv,
            sem: state.sem
        })
            .then((response) => {
                if (response.data > 0) {
                    alert("Record Updated Successfully");
                }
                else{
                    alert("failed to Updated");
                }
            });

    };

    const onchangeInput = (val, index) => {
        let temp = studentId;
        temp[index] = val.target.value;
        setStudentId(temp);
      };

    return (
        <div className="card">
            <div className="card-header text-capitalize text-center font-weight-bold">
                <h5>department of {collegeDetail.name}
                    <br />
                    Semester : {state.sem}
                    <br />
                    Assign Subjects To Students</h5>
            </div>
            <form method="post" onSubmit={addSubject}>
            <div className="card-body">
                <div className="form-group">
                    <label htmlFor="">Subject</label>
                    <select className="form-control" name="subject" required onChange={(e) => setSubject(e.target.value)} id="subject" dangerouslySetInnerHTML={{ __html: subjectOption }}>
                    </select>
                </div>
                <table className='table table-bordered'>
                    <thead className="thead-dark text-uppercase">
                        <tr className="text-uppercase">
                            <th>sl no</th>
                            <th>
                                <center><input type='checkbox' id='chckal' name='chckall' value='' /> Check All</center>
                            </th>
                            <th>usn</th>
                            <th>name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            studentDetailList.map((user, index) => (
                                <tr className="text-capitalize">
                                    <td>{index + 1}</td>
                                    <td className="text-center"><input type='checkbox' key={index} onChange={(val)=>{onchangeInput(val, index)}} id='chck' name='chck' value={user.student_id} /></td>
                                    <td>{user.usn}</td>
                                    <td>{user.name}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
            <div className="card-footer text-center">
                <button type='submit' name='submit' id='chckbtn' class='btn btn-md btn-success rounded'>Submit</button>
            </div>
            </form>
        </div>

    )
}

export default Assignsubjectlist