import axios from 'axios';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import swal from 'sweetalert';

export default function PayFeeDetails(props) {
    let navigate = useNavigate();
    const [pdate, setPdate] = useState("");
    const [scrollNo, setScrollNo] = useState("");
    const [paidAmt, setPaidAmt] = useState("");
    const [feeId, setFeeId] = useState("");
    const [balance1, setBalance1] = useState("");
    const [student_id, setStudent_id] = useState("");
    let redirect = 0;
    const numberWithCommas = (x) => {
        return x.toString().split('.')[0].length > 3 ? x.toString().substring(0, x.toString().split('.')[0].length - 3).replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + x.toString().substring(x.toString().split('.')[0].length - 3) : x.toString();
    }

    const setValues = (e)=>{
        setPaidAmt(e.target.value);
        setFeeId(e.target.attributes.getNamedItem('fee_id').value);
        setBalance1(e.target.attributes.getNamedItem('balance').value);
        setStudent_id(e.target.attributes.getNamedItem('student_id').value);
    }
    const payFees = async (e) =>{
        e.preventDefault();
        if(parseInt(paidAmt) > parseInt(balance1)){
            swal(`Please Enter Amount Less Than or Equal to ${balance1}`, "", "warning");
        }else{
            await axios.post(`${props.baseURL}/payfees`, {
                cid: props.userDetails.cid,
                id: props.userDetails.id,
                pdate,
                scrollNo,
                feeId,
                student_id,
                paidAmt
            }).then((response) => {
                let data = response.data;
                swal(data[0],"",data[1]);
                navigate("/afterpaytransaction", { state: { feeId,redirect } });
            });
        }
    }
    return (
        <div className="card">
            <div className="card-body">
                <div className="row font-weight-bold">
                    <div className="col-sm-4">Name: {props.data[0].name}</div>
                    <div className="col-sm-4">USN: {props.data[0].usn}</div>
                    <div className="col-sm-4">Student Id: {props.data[0].student_id}</div>

                    <table className="table table-bordered">
                        <thead className="thead-dark">
                            <tr>
                                <th>Year</th>
                                <th>Fee Fixed</th>
                                <th>Paid Fee</th>
                                <th>Balance</th>
                                <th style={{ textAlign: "center" }}>Pay</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                props.data.map((data, i) => {
                                    let balance = data.fee_fixed - data.paid_fee;
                                    return <tr key={i}>
                                        <td>{data.year}</td>
                                        <td>{numberWithCommas(data.fee_fixed)}</td>
                                        <td>{numberWithCommas(data.paid_fee)}</td>
                                        <td>{numberWithCommas(balance)}</td>
                                        <td>
                                            {
                                                balance == 0 ? <span className="text-center text-success text-uppercase">fees paid</span> : <form onSubmit={payFees}>

                                                    <input type="text" onChange={(e) => { setScrollNo(e.target.value); }} className="form-control" placeholder="Enter Scroll Number" required />
                                                    <br />
                                                    <input type="date" onChange={(e) => { setPdate(e.target.value) }} className="form-control" required />
                                                    <br />
                                                    <input type="text" onChange={(e) => { setValues(e); }} className="form-control" placeholder="Enter Paid Amount" fee_id={data.id} balance={balance} student_id={data.student_id} required />
                                                    <br />
                                                    <center><button className="btn btn-outline-success btn-sm rounded pay1" type="submit">Submit</button></center>
                                                </form>
                                            }
                                        </td>
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
