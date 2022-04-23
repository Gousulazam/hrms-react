import React,{ useState } from "react";
import axios from "axios";
import swal from 'sweetalert';
export default function PayUsnWise(props) {
    const [result, setResult] = useState();
    const [usn, setUsn] = useState("");
    const [pdate, setPdate] = useState("");
    const [scrollNo, setScrollNo] = useState("");
    const [paidAmt, setPaidAmt] = useState("");
    const [feeId, setFeeId] = useState("");
    const [balance1, setBalance1] = useState("");
    const [student_id, setStudent_id] = useState("");
    
    const numberWithCommas = (x) => {
        return x.toString().split('.')[0].length > 3 ? x.toString().substring(0, x.toString().split('.')[0].length - 3).replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + x.toString().substring(x.toString().split('.')[0].length - 3) : x.toString();
    }

    const setValues = (e)=>{
        setPaidAmt(e.target.value);
        setFeeId(e.target.attributes.getNamedItem('fee_id').value);
        setBalance1(e.target.attributes.getNamedItem('balance').value);
        setStudent_id(e.target.attributes.getNamedItem('student_id').value);
    }

    const payFees = (e)=>{
        e.preventDefault();
        console.log(scrollNo);
        // alert(`
        // student_id:${student_id},
        // paidAmt:${paidAmt},
        // pdate:${pdate},
        // scrollNo:${scrollNo},
        // balance1:${balance1},
        // feeId:${feeId},
        // `);
        
        if(paidAmt > balance1){
            swal(`Please Enter Amount Less Than or Equal to ${balance1}`, "", "warning");
        }else{

        }
    }

    const fetchDetails = async (e) => {
        e.preventDefault();
        await axios.post(`${props.baseURL}/getpayfeedetails`, {
            usn: usn,
            cid: props.userDetails.cid
        }).then((response) => {
            if (response.data.length > 0) {
                setResult(
                    <div className="card">
                        <div className="card-body">
                            <div className="row font-weight-bold">
                                <div className="col-sm-4">Name: {response.data[0].name}</div>
                                <div className="col-sm-4">USN: {response.data[0].usn}</div>
                                <div className="col-sm-4">Student Id: {response.data[0].student_id}</div>

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
                                            response.data.map((data, i) => {
                                                let balance = data.fee_fixed - data.paid_fee;
                                                return <tr key={i}>
                                                    <td>{data.year}</td>
                                                    <td>{numberWithCommas(data.fee_fixed)}</td>
                                                    <td>{numberWithCommas(data.paid_fee)}</td>
                                                    <td>{numberWithCommas(balance)}</td>
                                                    <td>
                                                       {
                                                           balance == 0 ? <span className="text-center text-success text-uppercase">fees paid</span>: <form onSubmit={payFees}>
                                                        
                                                           <input type="text" onChange={ (e)=>{ setScrollNo(e.target.value); }} className="form-control" placeholder="Enter Scroll Number" required />
                                                           <br />
                                                           <input type="date" onChange={ (e)=>{ setPdate(e.target.value) }} className="form-control" required/>
                                                           <br />
                                                           <input type="text" onChange={ (e) => { setValues(e); } } className="form-control" placeholder="Enter Paid Amount" fee_id={data.id} balance={balance} student_id={data.student_id} required/>
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
                );
                console.log(response.data)
            } else {
                setResult(<h6 className="text-danger font-weight-bold">No Data Found</h6>);
            }
        });
    };

    return (
        <>
            <div className="card">
                <div className="card-header text-center font-weight-bold">PAY USN WISE FEES</div>
                <form onSubmit={fetchDetails}>
                    <div className="card-body">
                        <div className="form-group">
                            <label htmlFor="semtype">USN/Student Id</label>
                            <input type="text" className="form-control" id="usn" name="usn" onChange={e => setUsn(e.target.value)} placeholder="Enter USN/Student Id" />
                        </div>
                    </div>
                    <div className="card-footer">
                        <center><button type="submit" className="btn btn-primary btn-sm rounded mr-2">
                            <i className="fa fa-dot-circle-o"></i> Submit
                        </button>
                            <button type="reset" className="btn btn-danger btn-sm rounded" onClick={() => { setResult("") }}>
                                <i className="fa fa-ban"></i> Reset
                            </button>
                        </center>
                    </div>
                </form>
            </div>
            {result}
        </>
    )
}
