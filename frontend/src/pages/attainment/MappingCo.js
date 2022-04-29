import React, { useEffect, useState } from 'react'
import axios from "axios";
import { useLocation } from 'react-router-dom';
import './attainment.css';

export default function MappingCo(props) {
    const { state } = useLocation();
    const [subjectDetails, setSubjectDetails] = useState([])

    useEffect(() => {
        axios.post(`${props.baseURL}/getsubjectdetailbyid`, {
            id: state.subject
        })
            .then((response) => {
                setSubjectDetails(response.data[0]);
                // console.log(response.data)
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

    let tbody = [];
    let sl = 1;
    const addCo = (e) => {
        e.preventDefault();
    };

    for (let index = 0; index < 4; index++) {
        let co = `C`;
        if (subjectDetails['sem'] == 1 || subjectDetails['sem'] == 2) {
            co += `1`;
        } else if (subjectDetails['sem'] == 3 || subjectDetails['sem'] == 4) {
            co += `2`;
        } else if (subjectDetails['sem'] == 5 || subjectDetails['sem'] == 6) {
            co += `3`;
        } else if (subjectDetails['sem'] == 7 || subjectDetails['sem'] == 8) {
            co += `4`;
        }

        let remainder = subjectDetails['sem'] % 2;
        if (remainder == 0) {
            co += 1;
        } else {
            co += 0;
        }
        if (subjectDetails['scode']) {
            co += subjectDetails['scode'][5];
        }
        tbody[index] = co + "." + sl;
        // console.log(tbody[index]);
        sl++;

    }

    const [body, setbody] = useState(tbody.map((role, i) => {
        console.log(role,i)
        return <tr key={i}>
            <td>{role}</td>
            <td><textarea required="" name="coStatement[]" className="coStatement form-control" placeholder="Enter CO Statement" cols="80"></textarea></td>
            <td>-</td>
            <td>
                <center className="mt-3">
                    <i className="fa fa-plus-circle mr-2 add_new hide "></i>
                    <i className="fa fa-times-circle   delete "></i>
                </center>
            </td>
        </tr>
    }))
    console.log(tbody)
    return (
        <div className="card">
            <div className="card-body table-responsive">
                <p style={associationStyle} className="text-uppercase text-center">SECAB‌ ‌Association’s‌</p>
                <div className="row">
                    <div className="col-md-3">
                        <center><img src="https://hrms.secab.org/images/siet.png" alert="No images" style={imgStyle} /></center>
                    </div>
                    <div className="col-md-7">
                        <p style={p1style} className="text-uppercase">{subjectDetails['iname']},</p>
                        <p style={p1style} className="text-uppercase">VIJAYAPUR-586109</p>
                        <p style={p2style} className="text-uppercase">DEPARTMENT OF {subjectDetails['dept']}</p>
                    </div>

                </div>
                <hr style={hrStyle} />
                <h4 className="mt-2 text-center mb-3">Academic Year {state.academicYear}</h4>
                <table className="table table-bordered ">
                    <thead>
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
                    </thead>
                </table>
                <h5 className="mb-2"><u>Course Outcomes</u></h5>
                <form onSubmit={addCo}>
                    <table className="table table-bordered maintable">
                        <thead className="thead-dark">
                            <tr>
                                <th rowSpan="2" className='text-center align-middle'>CO Identification No</th>
                                <th className='text-center'>CO Statement</th>
                                <th rowSpan="2" className='text-center align-middle'>HOD</th>
                                <th rowSpan="2" className='text-center align-middle'>Add / Delete </th>
                            </tr>
                            <tr>
                                <th className='text-center'>At the end of the course, the students will be able to</th>
                            </tr>
                        </thead>
                        <tbody id='atten'>
                            {body}
                        </tbody>
                    </table>
                    <center>
                        <button type="submit" className="btn btn-primary rounded mt-3">Submit</button>
                    </center>
                </form>
            </div>
        </div>
    )
}