import React, { useEffect, useState } from 'react'
import axios from "axios";
import { useLocation } from 'react-router-dom';


export default function ReportSubjectDetails(props) {
    const { state } = useLocation();
    const [subjectDetails, setSubjectDetails] = useState([]);
    const [table, setTable] = useState("");
    const [fdate, setFdate] = useState(state.fdate);
    const [tdate, setTdate] = useState(state.tdate);

    useEffect(() => {
        axios.post(`${props.baseURL}/getsubjectdetailbyid`, {
            id: state.subject
        })
            .then((response) => {
                setSubjectDetails(response.data);
            });

        axios.post(`${props.baseURL}/getsubjectreportdetails`, {
            id: state.subject, fdate: state.fdate, tdate: state.tdate
        })
            .then((response) => {
                setTable(response.data);
            });
    }, [])

    return (
        <div className="card text-uppercase">
            <div className="card-header">
                <center><img src="https://hrms.secab.org/images/slo2.png" alert="no Image" /> </center>
                <br />
                <center>
                    <strong>
                        {subjectDetails['iname']} <br />
                        Department Of {subjectDetails['dept']} <br />
                        Semester - {subjectDetails['sem']}<br />subject - {subjectDetails['sname'] + " (" + subjectDetails['scode'] + ")"}<br />
                        REPORT FROM {fdate} TO {tdate}</strong>
                </center>
            </div>
            <div className="card-body">
                <div dangerouslySetInnerHTML={{ __html: table }}>

                </div>

            </div>
        </div>
    )
}