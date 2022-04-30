import axios from 'axios';
import React, { useEffect, useState } from 'react'
import DeleteFeedetailsApprovalTbodyDeleteApprovalTbody from './DeleteFeedetailsApprovalTbody';

export default function ApproveDeleteStudentFeedetails(props) {
    const [result, setResult] = useState('');
    const [admin, setAdmin] = useState('');
    
    const test = async ()=>{
        

        axios.post(`${props.baseURL}/approvedeletestudentfeedetails`, {
            cid: props.userDetails.cid,
            fid: props.userDetails.id,
        })
            .then((response) => {
                console.log(response.data)
                setAdmin(response.data[1]);
                setResult(<DeleteFeedetailsApprovalTbodyDeleteApprovalTbody data={response.data} baseURL={props.baseURL} userDetails={props.userDetails} formatDate={props.formatDate} numberWithCommas={props.numberWithCommas} />);
            });
    }

    useEffect(() => {
        test()
    }, [])

    return (
        <div className="card font-weight-bold text-uppercase">
            <div className="card-body">
            <h2 className="mt-2 mb-4">{admin['iname']}</h2>
                <table className="table table-bordered">
                    <thead className="thead-dark">
                        <tr>
                            <th>sl no</th>
                            <th>usn</th>
                            <th>name</th>
                            <th>year</th>
                            <th>academic year</th>
                            <th>fee fixed</th>
                            <th>paid fee</th>
                            <th>balance</th>
                            <th>remark</th>
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
