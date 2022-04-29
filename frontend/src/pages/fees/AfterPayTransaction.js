import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';

export default function AfterPayTransaction(props) {
    let navigate = useNavigate();
    const { state } = useLocation();
    const [transactions, setTransactions] = useState([]);
    let totalPaidAmount = 0;
    let balance = 0;
    const test = async () => {
        await axios.post(`${props.baseURL}/getfeetransactions`, {
            feeId: state.feeId,
        }).then((response) => {
            setTransactions(response.data);
        });
    }

    useEffect(() => {
        test();
    }, []);

    return (
        <div className="card text-uppercase">
            <div className="card-body">
            <div className="row font-weight-bold">
                <div className="col-sm-4">Name: {transactions.length > 0 ? transactions[0].name :"" }</div>
                <div className="col-sm-4">USN: {transactions.length > 0 ? transactions[0].usn :"" }</div>
                <div className="col-sm-4">Student Id: {transactions.length > 0 ? transactions[0].student_id :"" }</div>
                <table style={{ borderCollapse: "collapse", width: "100%" }} border="1" className="mt-4 table table-bordered table-striped">
                    <thead className="thead-dark">
                        <tr>
                            <th>Sl No</th>
                            <th>USN</th>
                            <th>year</th>
                            <th>Transaction id</th>
                            <th>Fee Type</th>
                            <th>Paid Date</th>
                            <th>Scroll No</th>
                            <th>Paid Amount</th>
                            <th>Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            transactions.map((data, i) => {
                                totalPaidAmount += parseFloat(data.paid_amt);
                                balance=data.bal;
                                return <tr key={i}>
                                    <td>{i + 1}</td>
                                    <td>{data.usn}</td>
                                    <td>{data.year}</td>
                                    <td>{data.trans_id}</td>
                                    <td>{data.fee_type}</td>
                                    <td>{props.formatDate("", data.paid_date)}</td>
                                    <td>{data.scr_no}</td>
                                    <td>{props.numberWithCommas(data.paid_amt)}</td>
                                    <td>{props.numberWithCommas(data.bal)}</td>
                                </tr>
                            })
                        }
                        <tr>
                            <td colSpan="7" className="text-center font-weight-bold">Total</td>
                            <td>{props.numberWithCommas(totalPaidAmount)}</td>
                            <td>{props.numberWithCommas(balance)}</td>
                        </tr>
                    </tbody>
                </table>
                </div>
                <br /><br />
                <center>
                    <button className="btn btn-success rounded" onClick={()=> navigate("/payusnwise") }>Submit</button>
                </center>
            </div>
        </div>

    );
}
