import React, { useEffect, useState } from 'react'
import axios from "axios";
import { useLocation, useNavigate } from 'react-router-dom';

const Assingdivison = (props) => {

    let navigate = useNavigate();
    const [collegeDetail, setCollegeDetail] = useState('')

    useEffect(() => {
        axios.post(`${props.baseURL}/getcollegedetailsbyid`, {
            cid: props.userDetails.cid
        })
            .then((response) => {
                setCollegeDetail(response.data[0]);
            });
    }, [])

    const [academicYearOption, setAcademicYearOption] = useState(`<option value="">Select Academic Year</option>`);
    const [academicYear, setAcademicYear] = useState("")
    useEffect(() => {
        axios.post(`${props.baseURL}/getacademicyearoption`, {
            cid: props.userDetails.cid
        })
            .then((response) => {
                if (response.data.length > 0) {
                    setAcademicYearOption(response.data);
                }
            });
    }, [])

    const [semOption, setSemOption] = useState(`<option value="">Select Sem</option>`);
    const [sem, setSem] = useState("")
    useEffect(() => {
        axios.post(`${props.baseURL}/getsem`, {
            cid: props.userDetails.cid

        })
            .then((response) => {
                if (response.data.length > 0) {
                    setSemOption(response.data);
                }
            });
    }, [])

    const getstudentlis = (e) => {
        e.preventDefault();
        navigate("/studentlistview", { state: {sem,academicYear,cid: props.userDetails.cid,did: props.userDetails.did } });
    };

    return (
        <div>
            <div className="card">
                <div className="card-body">
                    <h2 align='center' className="text-uppercase">
                        {collegeDetail.iname}
                        <br /> New Admission Assign Division
                    </h2>
                    <form method="post" onSubmit={getstudentlis}>
                        <div className="form-group">
                            <label htmlFor="">Academic Year</label>
                            <select className="form-control" name="academic_year" required="" onChange={e => { setAcademicYear(e.target.value) }} id="academic_year" dangerouslySetInnerHTML={{ __html: academicYearOption }}>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="">Sem</label>
                            <select className="form-control" name="sem" required="" onChange={e => { setSem(e.target.value) }} id="sem" dangerouslySetInnerHTML={{ __html: semOption }}>
                            </select>
                        </div>

                        <center><button type="submit" className="btn btn-primary rounded" id="submit2">Submit</button></center>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Assingdivison
