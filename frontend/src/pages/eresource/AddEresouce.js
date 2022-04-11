import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AddEresouce(props) {
    let navigate = useNavigate();
    const [subjectOption, setSubjectOption] = useState(`<option value="">Select Subject</option>`);
    const [subject, setSubject] = useState("");
    const [academicYearOption, setAcademicYearOption] = useState(`<option value="">Select Academic Year</option>`);
    const [academicYear, setAcademicYear] = useState("");
    const [ptbody, setPtbody] = useState("");
    const [semType, setSemType] = useState("");
    const [ftype, setFtype] = useState("");
    const [link, setLink] = useState("");
    const [title, setTitle] = useState("");

    const addResource = (e) => {
        e.preventDefault();
        axios.post(`${props.baseURL}/adderesource`, {
            subject: subject,
            ftype: ftype,
            link: link,
            title: title,
        })
            .then((response) => {
                if (response.data.length > 0) {
                    // setResult(response.data);
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

    let LinkOrFileFeild = () => {

        if (ftype == '') {
            return "";
        } else if (ftype == "LINK") {
            return <div className="form-group">
                <label htmlFor="">Link</label>
                <input type="text" className="form-control" name="link" id="link" aria-describedby="helpId" placeholder="Enter Link" onChange={e => setLink(e.target.value)} />
            </div>
        } else {
            return <div className="form-group">
                <label htmlFor="">Upload {ftype}</label>
                <input type="file" className="form-control-file" name="flnm" id="flnm" placeholder="" aria-describedby="fileHelpId" />
            </div>
        }
    }

    useEffect(() => {
        LinkOrFileFeild()
    }, [ftype])

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
        if (subject != '') {
            axios.post(`${props.baseURL}/getpreviousyeareresource`, {
                fid: props.userDetails.id,
                subject: subject,
                academicYear: academicYear
            })
                .then((response) => {
                        setPtbody(response.data);
                        console.log(response.data);
                });
        } else {
            setPtbody("<tr><td colspan='7' class='text-center font-weight-bold text-danger' >Please Select Academic Year and Sem Type</td></tr>");
        }
    }, [subject])

    return (
        <>
            <div className="card">
                <div className="card-header text-center font-weight-bold">Upload E-Resources</div>
                <form onSubmit={addResource}>
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
                            <select name="subject" id="subject" className="form-control" onChange={e => { setSubject(e.target.value) }} required="" dangerouslySetInnerHTML={{ __html: subjectOption }}>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlor="">File Type</label>
                            <select required="" className="form-control" id="ftyp" name="ftyp" onChange={e => setFtype(e.target.value)}>
                                <option value="">Select File Type </option>
                                <option value="LINK">LINK</option>
                                <option value="PDF">PDF</option>
                                <option value="MP4">MP4</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="">Title</label>
                            <input className="form-control" id="title" name="title" placeholder="Enter Title" required="" onChange={e => setTitle(e.target.value)}/>
                        </div>

                        <LinkOrFileFeild />
                    </div>
                    <div className="card-footer">
                        <center><button type="submit" className="btn btn-primary btn-sm rounded mr-2">
                            <i className="fa fa-dot-circle-o"></i> Submit
                        </button>
                            <button type="reset" className="btn btn-danger btn-sm rounded" onClick={e => { setPtbody("<tr><td colspan='7' class='text-center font-weight-bold text-danger' >Please Select Academic Year and Sem Type</td></tr>"); setFtype(""); }} >
                                <i className="fa fa-ban"></i> Reset
                            </button>
                        </center>
                    </div>
                </form>
            </div>

            <div className="card">
                <div className="card-header">
                    <center><strong>E-Resource</strong> </center>
                </div>
                <div className="card-body">
                    <table id="bootstrap-data-table-export" className="table table-striped table-bordered">
                        <thead className="thead-dark">
                            <tr><th>Sl No</th>
                                <th>Scode</th>
                                <th>Subject</th>
                                <th>Sem &amp; Division</th>
                                <th>Title</th>
                                <th>Type</th>
                                <th>Download</th>
                            </tr></thead>
                        <tbody dangerouslySetInnerHTML={{ __html: ptbody }}>
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}
