import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
export default function DepartmentFeeDetails(props) {
    let navigate = useNavigate();
    const [academicYearOption, setAcademicYearOption] = useState(`<option value="">Select Academic Year</option>`);
    const [departmentOption, setDepartmentOption] = useState(`<option value="">Select Department</option>`);
    const [yearOption, setYearOption] = useState(`<option value="">Select Year</option>`);

    const [academicYear, setAcademicYear] = useState(``);
    const [did, setDid] = useState(``);
    const [year, setYear] = useState(``);
    const coAdd = (e) => {
        e.preventDefault();
        navigate("/feedetailsdepartment", { state: { academicYear } });
    };

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

    


    return (
        <div className="card">
            <div className="card-header text-center font-weight-bold">Department Fee Details</div>
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
                        <label htmlFor="semtype">Year</label>
                        <select className="form-control" name="year" required onChange={e => { setYear(e.target.value) }} id="academic_year" dangerouslySetInnerHTML={{ __html: yearOption }}>
                        </select>
                    </div>


                </div>
                <div className="card-footer">
                    <center><button type="submit" className="btn btn-primary btn-sm rounded mr-2">
                        <i className="fa fa-dot-circle-o"></i> Submit
                    </button>
                        <button type="reset" className="btn btn-danger btn-sm rounded">
                            <i className="fa fa-ban"></i> Reset
                        </button>
                    </center>
                </div>
            </form>
        </div>
    )
}
