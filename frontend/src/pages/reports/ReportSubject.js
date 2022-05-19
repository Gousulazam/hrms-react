import React, { useEffect, useState } from 'react'
import axios from "axios";
import { useLocation } from 'react-router-dom';


export default function ReportSubject(props) {
    const { state } = useLocation();
    const [tbody, setTbody] = useState(props.loader());
    useEffect(() => {

        axios.post(`${props.baseURL}/getsubjectreport`, {
            id: state.subject, fdate: state.fdate, tdate: state.tdate
        })
            .then((response) => {
                setTbody(response.data);
            });
    }, [])

    return (
        <div class="card text-uppercase" dangerouslySetInnerHTML={{ __html: tbody }}>
        </div>
    )
}