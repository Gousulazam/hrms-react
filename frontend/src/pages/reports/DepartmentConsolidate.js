import React, { useEffect, useState } from 'react'
import axios from "axios";
import { useLocation } from 'react-router-dom';


export default function DepartmentConsolidate(props) {
    const { state } = useLocation();
    const [body, setBody] = useState(props.loader());
    const test = async () => {

        axios.post(`${props.baseURL}/departmentconsolidate`, {
            cid: props.userDetails.cid,
            academic_year: state.academicYear,
            type:state.type,
            fromDate:state.fromDate,
            toDate:state.toDate
            
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
            <div className="card-body" dangerouslySetInnerHTML={{ __html: body }}>
            </div>
        </div>
    )
}