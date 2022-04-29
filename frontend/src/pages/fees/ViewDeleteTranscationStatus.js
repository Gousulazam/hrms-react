import axios from 'axios';
import React, { useEffect, useState } from 'react'

export default function ViewDeleteTranscationStatus(props) {
    const [result, setResult] = useState('');
    useEffect(() => {
        axios.post(`${props.baseURL}/deletestudenttranscationstatus`, {
            cid:props.userDetails.cid
        })
            .then((response) => {
                setResult(response.data);
            });
    }, [])

    return (
        <div className="card font-weight-bold text-uppercase">
            <div className="card-body" dangerouslySetInnerHTML={{ __html: result }}></div>
        </div>
    )
}
