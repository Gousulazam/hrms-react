import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
export default function FeeCollectionDetails(props) {
    let navigate = useNavigate();
    const [academicYearOption, setAcademicYearOption] = useState(`<option value="">Select Academic Year</option>`);
    const [departmentOption, setDepartmentOption] = useState(`<option value="">Select Department</option>`);
    const [did, setDid] = useState(``);
    const [academicYear, setAcademicYear] = useState(``);
    const [type, setType] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [toBody, setToBody] = useState("");

    const coAdd = async (e) => {
        e.preventDefault();
        navigate("/collectionfeedetails", { state: { academicYear, did, type, fromDate, toDate } });

    };

    const test = async () => {
        await axios.post(`${props.baseURL}/getacademicyearoption`, {
            cid: props.userDetails.cid
        })
            .then((response) => {
                if (response.data.length > 0) {
                    setAcademicYearOption(response.data);
                }
            });
        await axios.post(`${props.baseURL}/getfeedepartmentoption`, {
            cid: props.userDetails.cid,
            role: sessionStorage.getItem('role'),
            did: props.userDetails.did
        })
        .then((response) => {
            if (response.data.length > 0) {
                setDepartmentOption(response.data);
            }
        });
    }

    useEffect(() => {
        test()
    }, [])

    useEffect(() => {
        if (type == "custom") {
            setToBody(
                <div className="form-group">
                    <label htmlFor="exampleInputUsername1" className="card-description text-uppercase">to</label>
                    <input required="" type="date" className="form-control" name="date1" id="date1" onChange={e => setToDate(e.target.value)} />
                </div>
            )
        } else {
            setToBody("")
        }
    }, [type])

    return (
        <>
            <div className="card">
                <div className="card-header text-center font-weight-bold">Fee Collection Details</div>
                <form onSubmit={coAdd}>
                    <div className="card-body">
                        <div className="form-group">
                            <label htmlFor="semtype">Academic Year</label>
                            <select className="form-control" name="academic_year" required onChange={e => { setAcademicYear(e.target.value) }} id="academic_year" dangerouslySetInnerHTML={{ __html: academicYearOption }}>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="semtype">Department</label>
                            <select className="form-control" name="did" required onChange={e => { setDid(e.target.value) }} id="academic_year" dangerouslySetInnerHTML={{ __html: departmentOption }}>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="exampleInputUsername1" className="card-description text-uppercase">Type</label>
                            <select className="form-control" id="type" name="type" onChange={e => { setType(e.target.value) }} required>
                                <option value="">Select Type</option>
                                <option value="daily">Daily</option>
                                <option value="monthly">Monthly</option>
                                <option value="custom">Custom</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="exampleInputUsername1" className="card-description text-uppercase date">date</label>
                            <input required type="date" className="form-control" name="date" id="date" onChange={e => setFromDate(e.target.value)} />
                        </div>

                        {
                            toBody
                        }
                    </div>
                    <div className="card-footer">
                        <center><button type="submit" className="btn btn-primary btn-sm rounded mr-2">
                            <i className="fa fa-dot-circle-o"></i> Submit
                        </button>
                            <button type="reset" className="btn btn-danger btn-sm rounded" onClick={() => { setToBody("") }}>
                                <i className="fa fa-ban"></i> Reset
                            </button>
                        </center>
                    </div>
                </form>
            </div>
        </>
    )
}
