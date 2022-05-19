import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
export default function ConsolidateDepartmentFeeDetails(props) {
    let navigate = useNavigate();
    const [academicYearOption, setAcademicYearOption] = useState(`<option value="">Select Academic Year</option>`);
    const [academicYear, setAcademicYear] = useState(``);
    const [result, setResult] = useState();
    const coAdd = async (e) => {
        e.preventDefault();
        setResult(props.loader());
        await axios.post(`${props.baseURL}/getconsolidatedepartmentdetails`, {
            cid: props.userDetails.cid,
            academic_year:academicYear
        })
            .then((response) => {
                if (response.data.length > 0) {
                    
                    setResult(response.data);
                }
            });
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
    }
    useEffect(() => {
        test()
    }, [])




    return (
        <>
        <div className="card">
            <div className="card-header text-center font-weight-bold">Consolidate Department Fee Details</div>
            <form onSubmit={coAdd}>
                <div className="card-body">
                    <div className="form-group">
                        <label htmlFor="semtype">Academic Year</label>
                        <select className="form-control" name="academic_year" required onChange={e => { setAcademicYear(e.target.value) }} id="academic_year" dangerouslySetInnerHTML={{ __html: academicYearOption }}>
                        </select>
                    </div>
                </div>
                <div className="card-footer">
                    <center><button type="submit" className="btn btn-primary btn-sm rounded mr-2">
                        <i className="fa fa-dot-circle-o"></i> Submit
                    </button>
                        <button type="reset" className="btn btn-danger btn-sm rounded" onClick={()=>{setResult("")}}>
                            <i className="fa fa-ban"></i> Reset
                        </button>
                    </center>
                </div>
            </form>
        </div>
        <div dangerouslySetInnerHTML={{ __html:result}}>

        </div>
        </>
    )
}
