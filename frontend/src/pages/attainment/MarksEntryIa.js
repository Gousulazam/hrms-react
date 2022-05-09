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

    const test = async () => {
        await axios.post(`${props.baseURL}/getsubjectdetailbyid`, {
            id: state.subject
        })
            .then((response) => {
                setSubjectDetails(response.data[0]);
            });
        await axios.post(`${props.baseURL}/getiamarksentry`, {
            id: state.subject,
            academic_year: state.academicYear,
            internal: state.internal
        })
            .then((response) => {
                // setStudentList(response.data[0]);
                setQpDetails(response.data[1]);
                let data = [{ usn: "", name: "", value: 1, text: "P", classes: "btn btn-success rounded" }];
                for (let i = 0; i < response.data[0].length; i++) {
                    const element = response.data[0][i];
                    data[i] = { usn: element.usn, name: element.name, value: 1, text: "P", classes: "btn btn-success rounded" }
                }
                setStudentList(data);
            });
    }

    useEffect(() => {
        test();
    }, [])
    const updateAttendance = (e, i) => {
        let data2 = [...studentList];
        if (data2[i]['value'] == 1) {
            data2[i]['classes'] = "btn btn-danger rounded";
            data2[i]['value'] = 0;
            data2[i]['text'] = "A";
        } else {
            data2[i]['classes'] = "btn btn-success rounded";
            data2[i]['value'] = 1;
            data2[i]['text'] = "P";
        }
        setStudentList(data2);

        // if(studentList[i]['value'] == 1){
        //     e.target.className="btn btn-danger rounded";
        //     e.target.value=0;
        //     e.target.innerText="A"
        //     studentList[i]['value'] == 

        // }else{
        //     e.target.className="btn btn-success rounded";
        //     e.target.value=1;
        //     e.target.innerText="P" 
        // }

    }

    const setValues = (e) => {
        qno = e.target.attributes.getNamedItem('qno').value;
        maxmarks = e.target.attributes.getNamedItem('maxmarks').value;
        student_id = e.target.attributes.getNamedItem('student_id').value;
        marks = e.target.value;
    };

    const addMarks = async (e) => {
        if (e.target.value != '') {
            // alert(`qno:${qno} \n max marks : ${maxmarks} \n marks : ${marks}\n`);
            await axios.post(`${props.baseURL}/addiamarks`, {
                fid:subjectDetails.fid,
                studentId:student_id,
                scode:subjectDetails.scode,
                qno:qno,
                marks: marks,
                internal:state.internal,
                cid:subjectDetails.cid,
                did:subjectDetails.did,
                sem:subjectDetails.sem,
                dv:subjectDetails.dv,
                academicYear:subjectDetails.academic_year,
                marksType:"internal",
                max_marks:maxmarks,
                uid:props.userDetails.id,
            })
                .then((response) => {
                    if(response.data[0] > 0){
                        e.target.disabled = true;
                    }else{
                        swal("Record Not Added","","warning");
                    }
                });
        }
    }

    const QpTd = (studId) => {
        return qpDetails.map((data, i) => {
            return <td key={i} className="text-center"><input style={{ width: "45px" }} className="form-control" type="text" onChange={(e) => setValues(e)} onBlur={(e) => addMarks(e)} student_id={studId} qno={data.qno} maxmarks={data.marks} /></td>
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
                                        <td style={{ width: "50px" }}><button className={data.classes} value={data.value} onClick={(e) => updateAttendance(e, i)}>{data.text}</button></td>
                                        <QpTd student_id={data.student_id} />

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
