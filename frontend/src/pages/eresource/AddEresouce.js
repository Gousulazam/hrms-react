import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import swal from 'sweetalert';

export default function AddEresouce(props) {
    let navigate = useNavigate();
    const [subjectOption, setSubjectOption] = useState(`<option value="">Select Subject</option>`);
    const [subject, setSubject] = useState("");
    const [academicYearOption, setAcademicYearOption] = useState(`<option value="">Select Academic Year</option>`);
    const [pacademicYear, setPacademicYear] = useState("");
    const [academicYear, setAcademicYear] = useState("");
    const [ptbody, setPtbody] = useState("");
    const [tbody, settbody] = useState("<tr><td colspan='8' class='text-center font-weight-bold text-danger' >Please Select Academic Year</td></tr>");
    const [semType, setSemType] = useState("");
    const [ftype, setFtype] = useState("");
    const [link, setLink] = useState("");
    const [title, setTitle] = useState("");
    const [pdf, setPdf] = useState("")
    const [changeEvent, setchangeEvent] = useState(0)

    const addResource = (e) => {
        e.preventDefault();
        if (ftype == "LINK") {
            axios.post(`${props.baseURL}/adderesource`, {
                subject: subject,
                ftype: ftype,
                link: link,
                title: title,
            })
                .then((response) => {
                    if (response.data.insertId > 0) {
                        swal("Record Added", "", "success");
                        document.getElementById("eresource").reset();
                        setFtype("");
                        setchangeEvent(changeEvent+1);
                    } else {
                        swal("Record Not Added", "", "error");
                        document.getElementById("eresource").reset();
                        setFtype("");
                    }
                })
        } else {
            const formData = new FormData();
            formData.append('file', pdf);
            formData.append('subject', subject)
            formData.append('ftype', ftype);
            formData.append('link', link);
            formData.append('title', title);
            axios.post(`${props.baseURL}/adderesource`, formData)
                .then((response) => {
                    if (response.data.insertId > 0) {
                        swal("Record Added", "", "success");
                        document.getElementById("eresource").reset();
                        setFtype("");
                    } else {
                        swal("Record Not Added", "", "error");
                        document.getElementById("eresource").reset();
                        setFtype("");
                    }
                });
        }
    };

    const deleteResource = (e) => {
        e.preventDefault();
        let id = e.target.value;
        axios.delete(`${props.baseURL}/deleteresource/${id}`).then((response) => {
            if (response.data[0] > 0) {
                swal("Record Deleted", "", "success");
                setchangeEvent(changeEvent+1);
            } else {
                swal("Record Not Deleted", "", "error");
            }
        });
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
                <input type="text" className="form-control" name="link" id="link" aria-describedby="helpId" placeholder="Enter Link" onChange={e => setLink(e.target.value)} value={link} />
            </div>
        } else {
            return <div className="form-group">
                <label htmlFor="">Upload {ftype}</label>
                <input type="file" className="form-control-file" name="flnm" id="flnm" placeholder="" aria-describedby="fileHelpId" onChange={e => { setPdf(e.target.files[0]); }} />
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
        if (pacademicYear != '') {
            axios.post(`${props.baseURL}/getpreviousyeareresource`, {
                fid: props.userDetails.id,
                academicYear: pacademicYear
            })
                .then((response) => {
                    settbody(response.data);
                });
        } else {
            settbody("<tr><td colspan='8' class='text-center font-weight-bold text-danger' >Please Select Academic Year</td></tr>");
        }
    }, [pacademicYear])

    useEffect(() => {
        axios.post(`${props.baseURL}/getcurrentyeareresource`, {
            fid: props.userDetails.id,
            cid: props.userDetails.cid,
        })
            .then((response) => {
                let data =response.data;
                setPtbody(
                    data.map((element,i)=>{
                        return <tr key={ i }>
                            <td>{ i+1 }</td>
                            <td>{ element.scode }</td>
                            <td>{ element.subject }</td>
                            <td>{ element.dv ? `${element.sem} (${element.dv})`: `${element.sem}` }</td>
                            <td>{ element.title }</td>
                            <td>{ element.utp }</td>
                            <td>{ element.utp == "LINK" ? <a href={element.path} target="_blank" rel="noopener noreferrer"><i className="fa fa-link" aria-hidden="true"></i>{element.path}</a> : <a href={element.path} target="_blank" rel="noopener noreferrer" className='btn btn-info rounded'><i className="fa fa-download" aria-hidden="true"></i> Download</a>}</td>
                            <td><button className="btn btn-danger rounded" onClick={deleteResource} value={element.id} ><i class="fa fa-trash-o" aria-hidden="true"></i> Delete</button></td>
                        </tr>
                    })
                );
            });
    }, [changeEvent])
    
    return (
        <>
            <div className="card">
                <div className="card-header text-center font-weight-bold">Upload E-Resources</div>
                <form onSubmit={addResource} id="eresource">
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
                            <input className="form-control" id="title" name="title" placeholder="Enter Title" required="" onChange={e => setTitle(e.target.value)} />
                        </div>
                        <LinkOrFileFeild />
                    </div>
                    <div className="card-footer">
                        <center><button type="submit" className="btn btn-primary btn-sm rounded mr-2">
                            <i className="fa fa-dot-circle-o"></i> Submit
                        </button>
                            <button type="reset" className="btn btn-danger btn-sm rounded" onClick={e => { setPtbody("<tr><td colspan='8' className='text-center font-weight-bold text-danger' >Please Select Subject</td></tr>"); setFtype(""); }} >
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
                                <th>Delete</th>
                            </tr></thead>
                        <tbody>
                            {ptbody}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <center><strong>Previous Year</strong> </center>
                    <select className="form-control" name="academic_year" required onChange={e => { setPacademicYear(e.target.value) }} id="academic_year" dangerouslySetInnerHTML={{ __html: academicYearOption }}>
                    </select>
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
                        <tbody dangerouslySetInnerHTML={{ __html: tbody }}>
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}
