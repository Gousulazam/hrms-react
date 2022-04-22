import React, { useEffect, useState } from 'react'
import axios from "axios";
import { useLocation } from 'react-router-dom';


export default function FeeDetailsDepartment(props) {
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
            </div>
            <div className="card-body" >
            </div>
        </div>
    )
}