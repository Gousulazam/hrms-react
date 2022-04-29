import axios from 'axios';
import React, { useEffect, useState } from 'react'
import DeleteApprovalTbody from './DeleteApprovalTbody';

export default function ApproveDeleteTranscations(props) {
    const [result, setResult] = useState('');
    const [admin, setAdmin] = useState('');
   

   

    
    
    const test = async ()=>{
        

        axios.post(`${props.baseURL}/approvedeletetransaction`, {
            cid: props.userDetails.cid,
            fid: props.userDetails.id,
        })
            .then((response) => {
                console.log(response.data)
                setAdmin(response.data[1]);
                setResult(<DeleteApprovalTbody data={response.data} baseURL={props.baseURL} userDetails={props.userDetails} formatDate={props.formatDate} numberWithCommas={props.numberWithCommas} />);
            });
    }

    useEffect(() => {
        test()
    }, [])

    return (
        <div className="card font-weight-bold text-uppercase">
            <div className="card-body">
                <table className="table table-bordered">
                    <thead className="thead-dark">
                        <tr>
                            <th>sl no</th>
                            <th>usn</th>
                            <th>name</th>
                            <th>transaction id</th>
                            <th>paid date</th>
                            <th>scroll no</th>
                            <th>paid amount</th>
                            { admin['admin'] == 1 ? <th>{props.userDetails.cid == 1 ? 'Registrar':'HOD' }</th> : <><th>Registrar</th><th>VP Admin</th></> }
                        </tr>
                    </thead>
                    <tbody>
                        { result }
                    </tbody>
                </table>
            </div>
        </div>

    )
}
