import React, { useEffect, useState } from 'react'
import axios from "axios";
import { useLocation } from 'react-router-dom';


export default function ReportIa(props) {
    const { state } = useLocation();
    const [subjectDetails, setSubjectDetails] = useState([]);
    const [tbody, setTbody] = useState("");
    useEffect(() => {
        axios.post(`${props.baseURL}/getsubjectdetailbyid`, {
            id: state.subject
        })
            .then((response) => {
                setSubjectDetails(response.data[0]);
            });

        axios.post(`${props.baseURL}/getiareport`, {
            id: state.subject
        })
            .then((response) => {
                setTbody(response.data);
            });
    }, [])

    return (
        <div class="card text-uppercase">
            <div class="card-header">
                <br />
                <center>
                    <strong>
                        {subjectDetails['iname']} <br />
                        Department Of {subjectDetails['dept']} <br />
                        Semester - {subjectDetails['sem']}<br />subject - {subjectDetails['sname'] + " (" + subjectDetails['scode'] + ")"}<br /></strong>
                </center>
            </div>
            <div className="card-body">
                <table className="table table-bordered">
                    <thead className="thead-dark">
                        <tr>
                            <th>sl no</th>
                            <th>usn</th>
                            <th>name</th>
                            <th>Ist IA</th>
                            <th>IInd IA</th>
                            <th>IIIrd IA</th>
                            <th>Average</th>
                            <th>Assignment Marks</th>
                            <th>Total</th>
                            <th>Signature of Student</th>
                        </tr>
                    </thead>
                    <tbody dangerouslySetInnerHTML={{ __html: tbody }}>
                    </tbody>
                </table>
            </div>
        </div>
    )
}