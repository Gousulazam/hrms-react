import React, { useEffect, useState } from 'react'
import axios from "axios";
import { useLocation } from 'react-router-dom';


export default function FeeDetailsDepartment(props) {
    const { state } = useLocation();
    const [body, setBody] = useState(props.loader());
    const test = async () =>{

        axios.post(`${props.baseURL}/getdepartmentfeereport`, {
            did:state.did,
            academic_year:state.academicYear,
            year:state.year,
            cid:props.userDetails.cid
        })
            .then((response) => {
                setBody(response.data);
            });
    }
    useEffect(() => {
        test();
    }, [])

    return (
        <div class="card text-uppercase">
            <div className="card-body" dangerouslySetInnerHTML={{__html:body}}>
            </div>
        </div>
    )
}