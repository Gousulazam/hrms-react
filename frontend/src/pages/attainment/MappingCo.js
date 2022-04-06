import React, { useEffect, useState } from 'react'
import axios from "axios";
import { useLocation } from 'react-router-dom';

export default function MappingCo(props) {
    const { state } = useLocation();
    const [subjectDetails, setSubjectDetails] = useState([])

    useEffect(() => {
        axios.post(`${props.baseURL}/getsubjectdetailbyid`, {
            id: state.subject
        })
            .then((response) => {
                setSubjectDetails(response.data[0]);
            });
    }, [])

    const associationStyle = {
        fontSize: "17pt",
        textAlign: "center",
        fontFamily: "Cambria",
        color: "#0047b3",
        lineHeight: "50%",
    }

    const p1style = {
        fontSize: "16pt",
        textAlign: "center",
        fontFamily: "Cambria",
        color: "#0047b3",
        lineHeight: "50%"
    }

    const p2style = {
        fontSize: "14pt",
        textAlign: "center",
        fontFamily: "Cambria",
        color: "#cc0000",
        lineHeight: "50%"
    }

    const hrStyle = {
        borderTop: "1px dashed green"
    }

    const imgStyle = {
        width: "40%",
        height: "80px",
    }
    const addCo = (e) => {
        e.preventDefault();
    };
    return (
        <div className="card">
            <div className="card-body table-responsive">
                <p style={associationStyle} className="text-uppercase text-center">SECAB‌ ‌Association’s‌</p>
                <div className="row">
                    <div className="col-md-3">
                        <center><img src="https://hrms.secab.org/images/siet.png" alert="No images" style={imgStyle} /></center>
                    </div>
                    <div className="col-md-7">
                        <p style={p1style} className="text-uppercase">SECAB INSTITUTE OF ENGINEERING TECHNOLOGY,</p>
                        <p style={p1style} className="text-uppercase">VIJAYAPUR-586109</p>
                        <p style={p2style} className="text-uppercase">DEPARTMENT OF {subjectDetails['dept']}</p>
                    </div>

                </div>
                <hr style={hrStyle} />
                <h4 className="mt-2 text-center mb-3">Academic Year {state.academicYear}</h4>
                <table className="table table-bordered ">
                    <tr>
                        <th>Course Name</th>
                        <td>{subjectDetails['sname']}</td>
                    </tr>
                    <tr>
                        <th>Course Code</th>
                        <td>{subjectDetails['scode']}</td>
                    </tr>
                    <tr>
                        <th>Sem</th>
                        <td>{subjectDetails['sem']}</td>
                    </tr>
                </table>
                <h5 class="mb-2"><u>Course Outcomes</u></h5>
                <form onSubmit={addCo}>
                    <table class="table table-bordered maintable">
                        <thead class="thead-dark">
                            <tr>
                                <th rowspan="2" class='text-center align-middle'>CO Identification No</th>
                                <th class='text-center'>CO Statement</th>
                                <th rowspan="2" class='text-center align-middle'>HOD</th>
                                <th rowspan="2" class='text-center align-middle'>Add / Delete </th>
                            </tr>
                            <tr>
                                <th class='text-center'>At the end of the course, the students will be able to</th>
                            </tr>
                        </thead>
                        <tbody id='atten'>
                            {}
                        </tbody>
                    </table>
                </form>
            </div>
        </div>
    )
}