import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import swal from 'sweetalert';


export default function DepartmentWisePay(props) {
    const { state } = useLocation();
    let navigate = useNavigate();
    const [list, setList] = useState([]);
    const [pdate, setPdate] = useState("");
    const [scrollNo, setScrollNo] = useState("");
    const [paidAmt, setPaidAmt] = useState("");
    const [feeId, setFeeId] = useState("");
    const [balance1, setBalance1] = useState("");
    const [student_id, setStudent_id] = useState("");
    let redirect = 1;
    const test = async () => {
        await axios.post(`${props.baseURL}/getstudentfeelist`, {
            academicYear: state.academicYear,
            did: state.did,
            year: state.year,
            cid: props.userDetails.cid,
        })
            .then((response) => {
                setList(response.data);
            });
    };

    useEffect(() => {
        test();
    }, [])
    const setValues = (e) => {
        setPaidAmt(e.target.value);
        setFeeId(e.target.attributes.getNamedItem('fee_id').value);
        setBalance1(e.target.attributes.getNamedItem('balance').value);
        setStudent_id(e.target.attributes.getNamedItem('student_id').value);
    }
    const payFees = async (e) => {
        e.preventDefault();
        if (parseInt(paidAmt) > parseInt(balance1)) {
            swal(`Please Enter Amount Less Than or Equal to ${balance1}`, "", "warning");
        } else {
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
                swal(data[0], "", data[1]);
                navigate("/afterpaytransaction", { state: { feeId,redirect } });
            });
        }
    }
    return (
        <div className="card text-uppercase font-weight-bold text-center">
            <div className="card-header">
                {list.length > 0 ? list[0].iname:''}
            </div>
            <div className="card-body">
                <table className="table table-bordered">
                    <thead className="thead-dark">
                        <tr>
                            <th>sl no</th>
                            <th>usn</th>
                            <th>name</th>
                            <th>fee fixed</th>
                            <th>paid fee</th>
                            <th>balance</th>
                            <th>pay fees</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            list.map((data, i) => {
                                let bal = data.fee_fixed - data.paid_fee;
                                return <tr>
                                    <td>{i + 1}</td>
                                    <td>{data.usn} <br /> ({data.student_id})</td>
                                    <td>{data.name}</td>
                                    <td>{props.numberWithCommas(data.fee_fixed)}</td>
                                    <td>{props.numberWithCommas(data.paid_fee)}</td>
                                    <td>{props.numberWithCommas(bal)}</td>
                                    <td>{
                                        bal == 0 ? <span className="text-success">Fees Paid</span> :
                                            <>
                                                <form onSubmit={payFees}>

                                                    <input type="text" onChange={(e) => { setScrollNo(e.target.value); }} className="form-control" placeholder="Enter Scroll Number" required />
                                                    <br />
                                                    <input type="date" onChange={(e) => { setPdate(e.target.value) }} className="form-control" required />
                                                    <br />
                                                    <input type="text" onChange={(e) => { setValues(e); }} className="form-control" placeholder="Enter Paid Amount" fee_id={data.id} balance={bal} student_id={data.student_id} required />
                                                    <br />
                                                    <center><button className="btn btn-outline-success btn-sm rounded pay1" type="submit">Submit</button></center>
                                                </form>
                                            </>

                                    }</td>
                                </tr>
                            })
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
}
