import React, { useEffect, useState } from 'react'
import axios from "axios";
import { useLocation } from 'react-router-dom';


export default function AttendanceView(props) {
    const { state } = useLocation();
    const [table, setTable] = useState("");

    useEffect(() => {
        axios.post(`${props.baseURL}/viewattendance`, {
            id: state.subject, fdate: state.fdate
        })
            .then((response) => {
                setTable(response.data);
            });
    }, [])

    return (
        <div class="card">
            <div class="card-header text-center">
                <center><strong>ATTENDANCE </strong> </center>

            </div>
            <div class="card-body" dangerouslySetInnerHTML={{__html:table}}>
            </div>
        </div>
    )
}