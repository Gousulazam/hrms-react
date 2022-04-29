import axios from 'axios';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import swal from 'sweetalert';

export default function StudentDeleteFeeDetails(props) {
    let navigate = useNavigate();
    let transaction = props.transaction;
    let totalPaidAmount = 0;
    const [id, setId] = useState(0);
    const [remarks, setRemarks] = useState('');
    const addDeleteTransaction = async (e) => {
        e.preventDefault();
        await axios.post(`${props.baseURL}/adddeletetranscation`, {
            id
        })
            .then((response) => {
                swal(response.data[0], "", response.data[1]);
                navigate("/deletetransaction");
            });

    }
    return (
        <div className="card font-weight-bold">
            <div className="card-body">
                <div className="row">
                    <div class="col-sm-4">Name: {transaction[0].name}</div>
                    <div class="col-sm-4">USN: {transaction[0].usn}</div>
                    <div class="col-sm-4">Student Id: {transaction[0].student_id}</div>
                    <table style={{ borderCollapse: "collapse", width: "100%" }} border="1" id="table1" class="mt-2 table table-bordered table-striped">
                        <thead class="thead-dark">
                            <tr class="text-uppercase">
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
                                        <td>Delete</td>
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
