import axios from 'axios';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import swal from 'sweetalert';

export default function StudentEditFeeDetails(props) {
    let navigate = useNavigate();
    let transaction = props.transaction;
    const [uni_fee, setUni_fee] = useState(transaction.uni_fee);
    const [tut_fee, setTut_fee] = useState(transaction.tut_fee);
    const [id, setId] = useState(transaction.id);
    const [paidFee, setPaidFee] = useState(transaction.paid_fee);
    const [remarks, setRemarks] = useState('');

    const addEditFeeTransaction = async (e) => {
        e.preventDefault();
        await axios.post(`${props.baseURL}/addfeedetailsedittranscation`, {
            id, paidFee, remarks,uni_fee,tut_fee, uid: props.userDetails.id
        })
            .then((response) => {
                swal(response.data[0], "", response.data[1]);
                navigate("/editstudentfeedetails");
            });
    }

    return (
        <div className="card font-weight-bold">
            <div className="card-body">
                <div className="row">
                    <div className="col-sm-4">Name: {transaction.name}</div>
                    <div className="col-sm-4">USN: {transaction.usn}</div>
                    <div className="col-sm-4">Student Id: {transaction.student_id}</div>
                    
                    <br /><br />

                    <form onSubmit={addEditFeeTransaction}>
                        <div class="container row">
                            <div class="form-group col-sm-6">
                                <label for="">University Fee</label>
                                <input type="text" class="form-control uniFee" name="uniFee" aria-describedby="helpId" placeholder="Enter University Fee" required="" onChange={ e => setUni_fee(parseFloat(e.target.value))} value={uni_fee}  />
                            </div>
                            <div class="form-group col-sm-6">
                                <label for="">Tuition Fee</label>
                                <input type="text" class="form-control tutFee" name="tutFee" aria-describedby="helpId" placeholder="Enter Tuition Fee" required="" onChange={ e => setTut_fee(parseFloat(e.target.value)) }value={tut_fee} />
                            </div>

                            <div class="form-group col-sm-6">
                                <label for="">Total Fee</label>
                                <input type="text" class="form-control totalFee" name="totalFee" aria-describedby="helpId" placeholder="Enter Total Fee" required="" value={(uni_fee+tut_fee)} readonly="" />
                            </div>
                            <div class="form-group col-sm-6">
                                <label for="">Remark</label>
                                <textarea type="text" class="form-control remark" name="remark" aria-describedby="helpId" placeholder="Enter Remark" onChange={e=> setRemarks(e.target.value) } required=""></textarea>
                            </div>
                            <div class="form-group col-sm-12">
                                <label for="">Total Fee Paid</label>
                                <input type="text" class="form-control" aria-describedby="helpId" placeholder="Enter Total Fee" required="" value={paidFee} disabled />
                            </div>
                        </div>
                        <center>
                            <button type="submit" class="btn btn-primary rounded mr-2" id="submit">Submit</button>
                            <button type="reset" class="btn btn-danger rounded">Reset</button>
                        </center>
                    </form>
                </div>
            </div>
        </div>
    )
}
