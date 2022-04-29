import axios from 'axios';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import swal from 'sweetalert';

export default function DeleteTransactionsDetails(props) {
    let navigate = useNavigate();
    let transaction = props.transaction;
    let totalPaidAmount = 0;
    const [id, setId] = useState(0);
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
                                <th>USN</th>
                                <th>Name</th>
                                <th>Paid Date</th>
                                <th>Scroll No</th>
                                <th>Paid Amount</th>
                                <th>Delete</th>
                            </tr>
                        </thead>

                        <tbody>
                            {
                                transaction.map((data, i) => {
                                    totalPaidAmount += data.pait_amt
                                    return <tr key={i}>
                                        <td>{i + 1}</td>
                                        <td>{data.usn}</td>
                                        <td>{data.name}</td>
                                        <td>{props.formatDate("", data.paid_date)}</td>
                                        <td>{data.scr_no}</td>
                                        <td>{props.numberWithCommas(data.pait_amt)}</td>
                                        <td>
                                            {
                                                data.delete_sts == 1 ? <span className="text-warning font-weight-bold">Transaction Submitted for Approval</span> :<form onSubmit={addDeleteTransaction}>
                                                <button type="submit" className="btn btn-danger rounded" onClick={(e) => setId(e.target.value)} value={data.id}>Delete</button>
                                            </form>
                                            }
                                        </td>
                                    </tr>
                                })
                            }
                            <tr>
                                <td colSpan='5' className='text-center'>Total</td>
                                <td colSpan='2'>{props.numberWithCommas(totalPaidAmount)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
