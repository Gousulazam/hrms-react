import axios from 'axios';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import swal from 'sweetalert';

export default function StudentDeleteFeeDetails(props) {
    let navigate = useNavigate();
    let transaction = props.transaction;
    let totalPaidAmount = 0;
    const [id, setId] = useState(0);
    const [paidFee, setPaidFee] = useState(0);
    const [remarks, setRemarks] = useState('');

    const addDeleteTransaction = async (e) => {
        e.preventDefault();
        await axios.post(`${props.baseURL}/addfeedetailsdeletetranscation`, {
            id,paidFee,remarks,uid: props.userDetails.id
        })
            .then((response) => {
                swal(response.data[0], "", response.data[1]).then(() =>{
                    window.location.reload();
                });
                // navigate("/deletestudentfeedetails");
            });
    }

    const setValues = (e) => {
        setId(e.target.value);
        setPaidFee(e.target.attributes.getNamedItem('paid_fee').value);
    }

    return (
        <div className="card font-weight-bold">
            <div className="card-body">
                <div className="row">
                    <div className="col-sm-4">Name: {transaction[0].name}</div>
                    <div className="col-sm-4">USN: {transaction[0].usn}</div>
                    <div className="col-sm-4">Student Id: {transaction[0].student_id}</div>
                    <table style={{ borderCollapse: "collapse", width: "100%" }} border="1" id="table1" className="mt-2 table table-bordered table-striped">
                        <thead className="thead-dark">
                            <tr className="text-uppercase">
                                <th>Sl No</th>
                                <th>Name</th>
                                <th>Academic Year</th>
                                <th>Fee Fixed</th>
                                <th>Paid Fee</th>
                                <th>Balance</th>
                                <th>Remark</th>
                                <th>Delete</th>
                            </tr>
                        </thead>

                        <tbody>
                            {
                                transaction.map((data, i) => {
                                    totalPaidAmount += data.pait_amt
                                    return <tr key={i}>
                                        <td>{i + 1}</td>
                                        <td>{data.name}</td>
                                        <td>{data.acd_year}</td>
                                        <td>{props.numberWithCommas(data.fee_fixed)}</td>
                                        <td>{props.numberWithCommas(data.paid_fee)}</td>
                                        <td>{props.numberWithCommas(data.fee_fixed-data.paid_fee)}</td>
                                        <td><textarea type="text" className="form-control" name="remark" placeholder="Enter Remarks" onChange={ e => setRemarks(e.target.value)} required></textarea></td>
                                        <td><form onSubmit={addDeleteTransaction}><button type='submit' className="btn btn-danger rounded" paid_fee={ data.paid_fee ==0 ? 0 : data.paid_fee } onClick={ e => setValues(e) } value={data.id}>Delete</button></form></td>
                                    </tr>
                                })
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
