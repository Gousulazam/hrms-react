import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function HandlingSubject(props) {
    let navigate = useNavigate();
    const [academicYearOption, setAcademicYearOption] = useState(`<option value="">Select Academic Year</option>`);
    const [academicYear, setAcademicYear] = useState("");
    const [semType, setSemType] = useState("");
    const [result, setResult] = useState(``)
    const getSubjectReport = (e) => {
        e.preventDefault();
        axios.post(`${props.baseURL}/getfacultyhandlingsubject`, {
            fid: props.userDetails.id,
            semType: semType,
            academicYear: academicYear,
        })
            .then((response) => {
                if (response.data.length > 0) {
                    setResult(response.data);
                }
            })
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
        <>
            <div className="card">
                <div className="card-header text-center font-weight-bold">Handling Subject</div>
                <form onSubmit={getSubjectReport}>
                    <div className="card-body">
                        <div className="form-group">
                            <label htmlFor="semtype">Academic Year</label>
                            <select className="form-control" name="academic_year" required onChange={e => { setAcademicYear(e.target.value) }} id="academic_year" dangerouslySetInnerHTML={{ __html: academicYearOption }}>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="semtype">Sem Type</label>
                            <select required id="semtype" name="semtype" className="form-control" onChange={e => { setSemType(e.target.value) }}>
                                <option value="">Select Sem Type</option>
                                <option value="1">Odd</option>
                                <option value="0">Even</option>
                            </select>
                        </div>
                    </div>
                    <div className="card-footer">
                        <center><button type="submit" className="btn btn-primary btn-sm rounded mr-2">
                            <i className="fa fa-dot-circle-o"></i> Submit
                        </button>
                            <button type="reset" className="btn btn-danger btn-sm rounded" onClick={e => setResult("") } >
                                <i className="fa fa-ban"></i> Reset
                            </button>
                        </center>
                    </div>
                </form>
            </div>

            <div className="form-group" dangerouslySetInnerHTML={{ __html: result }}></div>
        </>
    )
}
