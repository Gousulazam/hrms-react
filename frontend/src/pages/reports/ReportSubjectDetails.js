import React, { useEffect, useState } from 'react'
import axios from "axios";
import { useLocation } from 'react-router-dom';


export default function ReportSubjectDetails(props) {
    const { state } = useLocation();
    const [table, setTable] = useState(props.loader());

    useEffect(() => {
        
        axios.post(`${props.baseURL}/getsubjectreportdetails`, {
            id: state.subject, fdate: state.fdate, tdate: state.tdate
        })
            .then((response) => {
                setTable(response.data);
            });
    }, [])

    return (
        <div className="card text-uppercase" dangerouslySetInnerHTML={{ __html: table }}>
            
        </div>
    )
}