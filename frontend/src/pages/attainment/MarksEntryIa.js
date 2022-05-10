import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom';
import swal from 'sweetalert';

export default function MarksEntryIa(props) {
    const { state } = useLocation();
    const [subjectDetails, setSubjectDetails] = useState([]);
    const [studentList, setStudentList] = useState([]);
    const [qpDetails, setQpDetails] = useState([])

    let qno = '';
    let maxmarks = '';
    let marks = '';
    let student_id = '';
    let name1 = '';
    let usn1 = '';

    const test = async () => {
        await axios.post(`${props.baseURL}/getsubjectdetailbyid`, {
            id: state.subject
        })
            .then((response) => {
                setSubjectDetails(response.data);
            });
        await axios.post(`${props.baseURL}/getiamarksentry`, {
            id: state.subject,
            academic_year: state.academicYear,
            internal: state.internal
        })
            .then((response) => {
                setStudentList(response.data[0]);
                setQpDetails(response.data[1]);
                
            });
    }

    useEffect(() => {
        test();
    }, [])
    

    const handleColor = (e) => {
        const btn = e.target;
        let button = [...studentList];
        e.preventDefault();
        if (parseInt(e.target.value) === 1) {
          e.target.innerText = "Absent";
          e.target.value = 0;
          e.target.className="btn btn-danger rounded";
        }
        else {
          e.target.value = 1;
          e.target.innerText = "Present";
          e.target.className="btn btn-success rounded";
        }
        button[parseInt(e.target.getAttribute('abp'))].value = parseInt(e.target.value);
        console.log(button);
      }

    const setValues = (e) => {
        qno = e.target.attributes.getNamedItem('qno').value;
        maxmarks = e.target.attributes.getNamedItem('maxmarks').value;
        marks = e.target.value;
        student_id = e.target.attributes.getNamedItem('student_id').value;
        name1 = e.target.attributes.getNamedItem('name').value;
        usn1 = e.target.attributes.getNamedItem('usn').value;
    };

    const addMarks = async (e) => {
        if (e.target.value != '') {
            if (marks > maxmarks) {
                swal(`Please Enter Marks Less Than or Equal to ${maxmarks}`, "", "warning");
            } else {
                await axios.post(`${props.baseURL}/addiamarks`, {
                    fid: subjectDetails.fid,
                    studentId: student_id,
                    name: name1,
                    usn: usn1,
                    scode: subjectDetails.scode,
                    qno: qno,
                    marks: marks,
                    internal: state.internal,
                    cid: subjectDetails.cid,
                    did: subjectDetails.did,
                    sem: subjectDetails.sem,
                    dv: subjectDetails.dv,
                    academicYear: subjectDetails.academic_year,
                    marksType: "internal",
                    max_marks: maxmarks,
                    uid: props.userDetails.id,
                })
                    .then((response) => {
                        if (response.data[0] > 0) {
                            e.target.disabled = true;
                        } else {
                            swal("Record Not Added", "", "warning");
                        }
                    });
            }
        }
    }

    const QpTd = (student_id,name,usn) => {
            return qpDetails.map((data, i) => {
                return <td key={i} className="text-center"><input style={{ width: "45px" }} className="form-control" type="text" onClick={(e) => e.target.disabled = false} onChange={(e) => setValues(e)} onBlur={(e) => addMarks(e)} student_id={student_id} name={name} usn={usn} qno={data.qno} maxmarks={data.marks} /></td>
            })
    }
    return (
        <div className="card">
            <div className="card-body">

                <p style={{ fontSize: "17pt", textAlign: "center", fontFamily: "Cambria", color: "#0047b3", lineHeight: "50%" }} className="text-uppercase text-center">SECAB&zwnj; &zwnj;Association’s&zwnj;</p>
                <div className="row">
                    <div className="col-md-3">
                        <center><img src="https://hrms.secab.org/images/siet.png" alert="No images" style={{ width: "40%", height: "80px" }} /></center>
                    </div>
                    <div className="col-md-7">
                        <p style={{ fontSize: "16pt", textAlign: "center", fontFamily: "Cambria", color: "#0047b3", lineHeight: "50%" }} className="text-uppercase">{subjectDetails['iname']},</p>
                        <p style={{ fontSize: "16pt", textAlign: "center", fontFamily: "Cambria", color: "#0047b3", lineHeight: "50%" }} className="text-uppercase">VIJAYAPUR-586109</p>
                        <p style={{ fontSize: "14pt", textAlign: "center", fontFamily: "Cambria", color: "#cc0000", lineHeight: "50%" }} className="text-uppercase">DEPARTMENT OF {subjectDetails['dept']}</p>
                        <p style={{ fontSize: "16pt", textAlign: "center", fontFamily: "Cambria", color: "#0047b3", lineHeight: "50%" }} className="text-uppercase">COURSE OUTCOME ATTAINMENT THROUGH INTERNAL EVALUATION (CIE)</p>
                    </div>

                    <table className="table table-bordered text-uppercase text-center">
                        <thead className="thead-dark">
                            <tr>
                                <th>Subject name : {subjectDetails['sname']}</th>
                                <th>Branch : {subjectDetails['dsname']}</th>
                            </tr>
                            <tr>
                                <th>Subject code : {subjectDetails['scode']} </th>
                                <th>div : {subjectDetails['dv']}</th>
                            </tr>
                            <tr>
                                <th>course id : </th>
                                <th>IA : {state.internal}</th>
                            </tr>
                        </thead>
                    </table>




                    <table className="table table-bordered text-uppercase text-center" id="table-freeze">
                        <thead className="thead-dark">
                            <tr>
                                <th colSpan="4" className="text-center">qno</th>
                                {qpDetails.map((data, i) => {
                                    return <th key={i}>{data.qno}</th>
                                })}
                            </tr>
                            <tr>
                                <th colSpan="4" className="text-center">co</th>
                                {qpDetails.map((data, i) => {
                                    return <th key={i}>{data.cos}</th>
                                })}
                            </tr>
                            <tr>
                                <th rowSpan="2" className="align-middle">sl no</th>
                                <th rowSpan="2" className="align-middle">usn</th>
                                <th rowSpan="2" className="align-middle">name</th>
                                <th rowSpan="2" className="align-middle">attendance</th>
                                <th colSpan={qpDetails.length} className="text-center">max marks</th>
                            </tr>
                            <tr>
                                {qpDetails.map((data, i) => {
                                    return <th key={i}>{data.marks}</th>
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {
                                studentList.map((data, i) => {
                                    return <tr key={i}>
                                        <td>{i + 1}</td>
                                        <td>{data.usn}</td>
                                        <td>{data.name}</td>
                                        <td><button abp={i} className="btn btn-success rounded" value="1" onClick={handleColor}>P</button></td>
                                        {
                                            QpTd(data.student_id,data.name,data.usn)
                                        }

                                    </tr>
                                })
                            }
                        </tbody>
                    </table>

                </div>
            </div>
            <br /><br />
            <center> <button className="btn btn-primary rounded">Submit</button> </center>
        </div>
    )
}
