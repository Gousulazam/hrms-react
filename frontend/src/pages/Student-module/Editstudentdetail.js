import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom';
import axios from "axios";

const Editstudentdetail = (props) => {

    const { state } = useLocation();

    const [collegeDetail, setCollegeDetail] = useState('')
    const [studentDetail, setStudentDetail] = useState('')
    const [usn, setUsn] = useState('')
    const [rno, setRno] = useState('')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [mobile, setMobile] = useState('')
    const [academicType, setAcademicType] = useState('')
    const [dv, setDv] = useState(`${state.dv}`)
    const [studentId, setStudentId] = useState(`${state.studentId}`)

    useEffect(() => {
        axios.post(`${props.baseURL}/getdepartmentdetailsbyid`, {
            cid: state.cid
        })
            .then((response) => {
                setCollegeDetail(response.data[0]);
            });
    }, [])

    useEffect(() => {
        axios.post(`${props.baseURL}/getstudentdetail`, {
            studentId: state.studentId,
        })
            .then((response) => {
                setStudentDetail(response.data[0]);
                setUsn(response.data[0].usn)
                setRno(response.data[0].rno)
                setName(response.data[0].name)
                setMobile(response.data[0].mobile)
                setEmail(response.data[0].email)
                setAcademicType(response.data[0].academic_type)
            });
    }, [])

    const [semOption, setSemOption] = useState(`<option value="">Select Sem</option>`);
    const [sem, setSem] = useState(`${state.sem}`)
    useEffect(() => {
        axios.post(`${props.baseURL}/getsem`, {
            cid: props.userDetails.cid
        })
            .then((response) => {
                if (response.data.length > 0) {
                    setSemOption(response.data);
                }
            });
    }, [])

    const [department, setDepartment] = useState(`${state.department}`)
    const [departmentOption, setDepartmentOption] = useState(`<option value="">Select Department</option>`);
    useEffect(() => {
        axios.post(`${props.baseURL}/getacademicdepartmentoption`, {
            cid: props.userDetails.cid
        })
            .then((response) => {
                if (response.data.length > 0) {

                    setDepartmentOption(response.data);
                }
            });
    }, [])


    const updateStudentDetail = (e) => {
        e.preventDefault();
        axios.post(`${props.baseURL}/updatestudent`, {
            usn, rno, name, department, sem, email, mobile, dv, academicType ,studentId
        })
            .then((response) => {
                if (response.data.affectedRows > 0) {
                    alert("Record Updated Successfully");
                }
                else{
                    alert("failed to Updated");
                }
            });
    };

    return (
        <div>
            <div className="card">
                <div className="card-header text-capitalize text-center font-weight-bold">
                    <h5>department of {collegeDetail.name}<br />Semester : {state.sem}<br />Student Details</h5>
                </div>
                <form method="post" onSubmit={updateStudentDetail}>
                    <div className="card-body card-block">
                        <div className="form-group">
                            <div className="input-group">
                                <div className="input-group-addon"><i className="fa fa-square"></i> USN</div>
                                <input className='form-control' id='usn' name='usn' value={usn} onChange={(e) => setUsn(e.target.value)} />
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-group">
                                <div className="input-group-addon"><i className="fa fa-square"> Roll no</i></div>
                                <input className='form-control' id='rno' name='rno' onChange={(e) => setRno(e.target.value)} value={rno} placeholder="Enter Roll Number" />
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-group">
                                <div className="input-group-addon"><i className="fa fa-square"></i> Name</div>
                                <input className='form-control' id='studn' name='studn' onChange={(e) => setName(e.target.value)} value={name} />
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-group">
                                <div className='input-group-addon'><i className='fa fa-th-list'></i> Deparment</div>
                                <select className="form-control" name="department" required="" value={department} defaultValue={"default"} onChange={(e) => setDepartment(e.target.value)} id="department" dangerouslySetInnerHTML={{ __html: departmentOption }}>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-group">
                                <div className='input-group-addon'><i className='fa fa-th-list'></i> Sem</div>
                                <select className="form-control" name="sem" required="" value={sem} defaultValue={"default"} onChange={e => { setSem(e.target.value) }} id="sem" dangerouslySetInnerHTML={{ __html: semOption }}>
                                </select>
                            </div>
                        </div>

                        <div className="form-group" id='dvhide'>
                            <div className="input-group">
                                <div className="input-group-addon"><i className="fa fa-th-list"></i> Division</div>
                                <select name="division" value={dv} defaultValue={"default"} onChange={e => { setDv(e.target.value) }} className="form-control">
                                    <option value="">Select Division</option>
                                    <option>A</option>
                                    <option>B</option>
                                    <option>C</option>
                                    <option>P1</option>
                                    <option>P2</option>
                                    <option>C1</option>
                                    <option>C2</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-group">
                                <div className="input-group-addon"><i className="fa fa-square"></i> Academic Type</div>
                                <select className="form-control" name="academic_type" required="" value={academicType} defaultValue={"default"} onChange={e => { setAcademicType(e.target.value) }} id="academic_type">
                                    <option value="regular">Regular</option>
                                    <option value="parallel">Parallel</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-group">
                                <div className="input-group-addon"><i className="fa fa-square"></i> Mobile</div>
                                <input className='form-control' id='smno' name='smno' onChange={(e) => setMobile(e.target.value)} value={mobile} placeholder="Enter Mobile Number" />
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-group">
                                <div className="input-group-addon"><i className="fa fa-square"></i> E-mail</div>
                                <input className='form-control' id='semail' name='semail' onChange={(e) => setEmail(e.target.value)} value={email} placeholder="Enter Email" />
                            </div>
                        </div>

                        <div className="form-actions form-group">
                            <center><button type="submit" className="btn btn-success btn-sm rounded" id="studup" name="studup">Submit</button></center>
                        </div>
                    </div>
                </form>
            </div>
        </div >
    )
}

export default Editstudentdetail