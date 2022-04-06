import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
export default function AddCo(props) {
    let navigate = useNavigate();
    const [subjectOption, setSubjectOption] = useState(`<option value="">Select Subject</option>`);
    const [academicYearOption, setAcademicYearOption] = useState(`<option value="">Select Academic Year</option>`);

    const [academicYear, setAcademicYear] = useState("")
    const [subject, setSubject] = useState("")
    const [semType, setSemType] = useState("")
    const coAdd = (e) => {
        e.preventDefault();
        navigate("/mappingco", { state: { academicYear,subject,semType} });
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

    useEffect(() => {
        axios.post(`${props.baseURL}/getsubjectoptionbyfidandacademicyear`, {
            fid: props.userDetails.id,
            semType:semType,
            academicYear:academicYear,
            stype:"theory"
        })
            .then((response) => {
                if (response.data.length > 0) {
                    setSubjectOption(response.data);
                }
            });
    }, [semType])
    

    return (
        <div className="card">
            <div className="card-header text-center font-weight-bold">Add CO</div>
            <form onSubmit={coAdd}>
                <div className="card-body">
                    <div className="form-group">
                        <label htmlFor="semtype">Academic Year</label>
                        <select className="form-control" name="academic_year" required="d" onChange={e =>{ setAcademicYear(e.target.value) }} id="academic_year" dangerouslySetInnerHTML={{ __html: academicYearOption }}>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="semtype">Sem Type</label>
                        <select required="" id="semtype" name="semtype" className="form-control" onChange={e =>{ setSemType(e.target.value) }}>
                            <option value="">Select Sem Type</option>
                            <option value="1">Odd</option>
                            <option value="0">Even</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="">Subjects</label>
                        <select  name="subject" id="subject" className="form-control" onChange={e =>{ setSubject(e.target.value) }} required="" dangerouslySetInnerHTML={{ __html: subjectOption }}>
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
