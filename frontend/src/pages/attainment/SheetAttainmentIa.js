import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom';


export default function SheetAttainmentIa(props) {
    const { state } = useLocation();
    const [table, setTable] = useState(``);

    const test = async () => {
        await axios.post(`${props.baseURL}/getattainmentsheetia`, {
            subject:state.subject,
            internal:state.internal,
            benchMarks:state.benchMarks,
        })
            .then((response) => {
                setTable(response.data);
            });
        }

    useEffect(() => {
        test();
    }, [])

    return (
        <div className="card">
            <div className="card-body" dangerouslySetInnerHTML={{__html:table}}>

            </div>
        </div>
    )
}
