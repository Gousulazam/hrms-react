import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import swal from 'sweetalert';
import "./attendance.css"
export default function Attendance(props) {
    let navigate = useNavigate();
    const [subjectOption, setSubjectOption] = useState(`<option value="">Select Subject</option>`);
    const [academicYearOption, setAcademicYearOption] = useState(`<option value="">Select Academic Year</option>`);

    const [academicYear, setAcademicYear] = useState("");
    const [subject, setSubject] = useState("");
    const [semType, setSemType] = useState("");
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [lessonPlan, setLessonPlan] = useState([{ topic: '', subTopic: '', status: '' }]);
    const [topicOption, setTopicOption] = useState(`<option value="">Select Topic</option>`);
    const handleFormChange = (event, index) => {
        let data = [...lessonPlan];
        data[index][event.target.name] = event.target.value;
        setLessonPlan(data);
    }

    const addLessonPlanFields = () => {
        let object = { topic: '', subTopic: '', status: '' };
        setLessonPlan([...lessonPlan, object])
    }

    const removeLessonPlanFields = (index) => {
        let data = [...lessonPlan];
        if (index != 0) {
            data.splice(index, 1)
            setLessonPlan(data)
        } else {
            swal("Cannot Delete First Row", "", "warning");
        }
    }

    const coAdd = (e) => {
        e.preventDefault();
        navigate("/addattendance", { state: { academicYear, subject, semType, date, startTime, endTime ,lessonPlan } });
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

    useEffect(() => {
        axios.post(`${props.baseURL}/getlessonplantopic`, {
            id: subject
        })
            .then((response) => {
                setTopicOption(response.data);
            });
    }, [subject])
    
    return (
        <div className="card">
            <div className="card-header text-center font-weight-bold">Attendance</div>
            <form onSubmit={coAdd}>
                <div className="card-body">
                    <div className="form-group">
                        <label htmlFor="semtype">Academic Year</label>
                        <select className="form-control" required onChange={e => { setAcademicYear(e.target.value) }} id="academic_year" dangerouslySetInnerHTML={{ __html: academicYearOption }}>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="semtype">Sem Type</label>
                        <select required className="form-control" onChange={e => { setSemType(e.target.value) }}>
                            <option value="">Select Sem Type</option>
                            <option value="1">Odd</option>
                            <option value="0">Even</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="">Subjects</label>
                        <select className="form-control" onChange={e => { setSubject(e.target.value) }} required dangerouslySetInnerHTML={{ __html: subjectOption }}>
                        </select>
                    </div>
                    <div className="form-group">
                        <table>
                            <tbody>
                            {lessonPlan.map((form, index) => {
                                return (
                                    <tr key={index}>
                                        <td><select name="topic" required className="form-control" onChange={event => handleFormChange(event, index)} dangerouslySetInnerHTML={{ __html: topicOption }}>
                                        </select></td>
                                        <td><select name="subTopic" className="form-control" onChange={event => handleFormChange(event, index)}>
                                            <option value="">Sub Topic Is Optional</option>
                                        </select>
                                        </td>
                                        <td><select name="status" required className="form-control" onChange={event => handleFormChange(event, index)}>
                                            <option value="">Select Status</option>
                                            <option value="not complete">Not Complete</option>
                                            <option value="completed">Completed</option>
                                        </select></td>
                                        <td>
                                            <i className="fa fa-plus-square mr-2 add_new" aria-hidden="true" onClick={addLessonPlanFields}></i>
                                            <i className="fa fa-minus-square delete" aria-hidden="true" onClick={() => removeLessonPlanFields(index)} ></i>
                                        </td>
                                    </tr>

                                )
                            })}
                            </tbody>
                        </table>
                    </div>
                    <div className="form-group">
                        <label htmlFor="">Date</label>
                        <input type="date" className="form-control" onChange={e => { setDate(e.target.value) }} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="">Start Time</label>
                        <input type="time" className="form-control" onChange={e => { setStartTime(e.target.value) }} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="">End Time</label>
                        <input type="time" className="form-control" onChange={e => { setEndTime(e.target.value) }} required />
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
