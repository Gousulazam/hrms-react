import React, { useEffect, useState } from 'react'
import axios from "axios";
import { useLocation } from 'react-router-dom';


export default function ReportSubject(props) {
    const { state } = useLocation();
    const [subjectDetails, setSubjectDetails] = useState([]);
    const [tbody, setTbody] = useState("");
    const [fdate, setFdate] = useState(state.fdate);
    const [tdate, setTdate] = useState(state.tdate);
    let [classConducted,setClasses] = useState("");
    useEffect(() => {
        axios.post(`${props.baseURL}/getsubjectdetailbyid`, {
            id: state.subject
        })
            .then((response) => {
                setSubjectDetails(response.data[0]);
            });

        axios.post(`${props.baseURL}/getsubjectreport`, {
            id: state.subject, fdate: state.fdate, tdate: state.tdate
        })
            .then((response) => {
                setTbody(response.data[0]);
                setClasses(response.data[1]);
            });
    }, [])

    return (
        <div class="card text-uppercase">
            <div class="card-header">
                <center><img src="https://hrms.secab.org/images/slo2.png" alert="no Image" /> </center>
                <br />
                <center>
                    <strong>
                        {subjectDetails['iname']} <br />
                        Department Of {subjectDetails['dept']} <br />
                        Semester - {subjectDetails['sem']}<br />subject - {subjectDetails['sname']+" ("+subjectDetails['scode']+")"}<br />
                        REPORT FROM {fdate} TO {tdate}</strong>
                </center>
            </div>
            <div className="card-body">
                <table className="table table-bordered">
                    <thead className="thead-dark">
                        <tr>
                            <th colSpan="5" className="text-center">Classes Conducted : {classConducted}</th>
                        </tr>
                        <tr>
                            <th>sl no</th>
                            <th>usn</th>
                            <th>name</th>
                            <th>attended</th>
                            <th>percentage</th>
                        </tr>
                    </thead>
                    <tbody dangerouslySetInnerHTML={{__html:tbody}}>
                    </tbody>
                </table>
            </div>
        </div>
    )
}