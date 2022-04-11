import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import swal from 'sweetalert';
export default function ViewQuestionPaper(props) {
    let navigate = useNavigate();
    const [subjectOption, setSubjectOption] = useState(`<option value="">Select Subject</option>`);
    const [academicYearOption, setAcademicYearOption] = useState(`<option value="">Select Academic Year</option>`);

    const [academicYear, setAcademicYear] = useState("")
    const [subject, setSubject] = useState("")
    const [semType, setSemType] = useState("")
    const [result, setResult] = useState("")
    const [internal, setInternal] = useState("")
    const getQuestionPaper = (e) => {
        e.preventDefault();
        // if(academicYear == ''){
        //     swal("Please Select Academic Year","", "warning");
        //     setResult("");
        // }else if(semType == ''){
        //     swal("Please Select Sem Type","", "warning");
        //     setResult("");
        // }else if(subject == ''){
        //     swal("Please Select Subject","", "warning");
        //     setResult("");
        // }else if(internal == ''){
        //     swal("Please Select Internal","", "warning");
        //     setResult("");
        // }else{
            axios.post(`${props.baseURL}/getquestionpaper`, {
                fid: props.userDetails.id,
                semType: semType,
                subject:subject,
                academicYear: academicYear,
                internal: internal,
            })
                .then((response) => {
                    if (response.data.length > 0) {
                        setResult(response.data);
                    }
                });
        // }
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
            semType: semType,
            academicYear: academicYear,
            stype: "theory"
        })
            .then((response) => {
                if (response.data.length > 0) {
                    setSubjectOption(response.data);
                }
            });
    }, [semType])
    return (
        <>
            <div className="card">
                <div className="card-header text-center font-weight-bold">View Question Paper</div>
                <form onSubmit={getQuestionPaper}>
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

                        <div className="form-group">
                            <label htmlFor="">Subjects</label>
                            <select required name="subject" id="subject" className="form-control" onChange={e => { setSubject(e.target.value) }} dangerouslySetInnerHTML={{ __html: subjectOption }}>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="">Internal</label>
                            <select required name="internal" id="internal" className="form-control" onChange={e => { setInternal(e.target.value) }}>
                                <option value="">Select Internal</option>
                                <option value="I">I</option>
                                <option value="II">II</option>
                                <option value="III">III</option>
                            </select>
                        </div>
                    </div>
                    <div className="card-footer">
                        <center><button type="submit" className="btn btn-primary btn-sm rounded mr-2">
                            <i className="fa fa-dot-circle-o"></i> Submit
                        </button>
                            <button type="reset" className="btn btn-danger btn-sm rounded" onClick={ e => setResult("") } >
                                <i className="fa fa-ban"></i> Reset
                            </button>
                        </center>
                    </div>
                </form>
            </div>

            <div id="result" dangerouslySetInnerHTML={{ __html: result }}></div>
        </>
    )
}
