import React, { useEffect, useState } from 'react'
import axios from "axios";
import swal from 'sweetalert';

export default function Scheme(props) {
    const [academicYearOption, setAcademicYearOption] = useState(`<option value="">Select Academic Year</option>`);
    const [subjectOption, setSubjectOption] = useState(`<option value="">Select Subject</option>`);
    const [internal, setInternal] = useState("");
    const [subject, setSubject] = useState("");
    const [pdf, setPdf] = useState("");
    const [tbody, setTbody] = useState("");
    const [changeEvent, setchangeEvent] = useState(0);
    const [pacademicYear, setPacademicYear] = useState("");
    const [ptbody, setPtbody] = useState("");

    const UploadScheme = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('file', pdf);
        formData.append('subject', subject)
        formData.append('internal', internal);
        let date = new Date()
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();
        let fullDate = `${year}-${month}-${day}`;
        formData.append('date', fullDate);
        axios.post(`${props.baseURL}/addscheme`, formData)
            .then((response) => {
                if (response.data.insertId > 0) {
                    swal("Record Added", "", "success");
                    document.getElementById("scheme").reset();
                    setchangeEvent(changeEvent + 1);
                } else {
                    swal("Record Not Added", "", "error");
                    document.getElementById("scheme").reset();
                }
            });
    };

    const deleteScheme = (e) => {
        e.preventDefault();
        let id = e.target.value;
        axios.delete(`${props.baseURL}/deletescheme/${id}`).then((response) => {
            if (response.data[0] > 0) {
                swal("Record Deleted", "", "success");
                setchangeEvent(changeEvent + 1);
            } else {
                swal("Record Not Deleted", "", "error");
            }
        });
    };

    useEffect(() => {
        axios.post(`${props.baseURL}/getcurrentfacultysubjectsoption`, {
            fid: props.userDetails.id
        })
            .then((response) => {
                if (response.data.length > 0) {
                    setSubjectOption(response.data);
                }
            });
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
        axios.post(`${props.baseURL}/getcurrentyearscheme`, {
            fid: props.userDetails.id,
            cid: props.userDetails.cid,
        })
            .then((response) => {
                let data = response.data;
                setTbody(
                    data.map((element, i) => {
                        return <tr key={i}>
                            <td>{i + 1}</td>
                            <td>{element.subject}</td>
                            <td>{element.scode}</td>
                            <td>{element.dv ? `${element.sem} (${element.dv})` : `${element.sem}`}</td>
                            <td>{element.utype}</td>
                            <td>{element.itype}</td>
                            <td><a href={element.path} target="_blank" rel="noopener noreferrer" className='btn btn-info rounded'><i className="fa fa-download" aria-hidden="true"></i> Download</a></td>
                            <td><button className="btn btn-danger rounded" onClick={deleteScheme} value={element.id} ><i class="fa fa-trash-o" aria-hidden="true"></i> Delete</button></td>
                        </tr>
                    })
                );
            });
    }, [changeEvent])

    useEffect(() => {
        if (pacademicYear != '') {
            axios.post(`${props.baseURL}/getpreviousyearscheme`, {
                fid: props.userDetails.id,
                academicYear: pacademicYear
            })
                .then((response) => {
                    setPtbody(response.data);
                });
        } else {
            setPtbody("<tr><td colspan='8' class='text-center font-weight-bold text-danger' >Please Select Academic Year</td></tr>");
        }
    }, [pacademicYear])


    return (
        <>
            <div className="card">
                <div className="card-header">
                    <center><strong>Upload Scheme</strong> </center>
                </div>
                <form onSubmit={UploadScheme} id="scheme">
                    <div className="card-body">

                        <div className="form-group">
                            <div className="input-group">
                                <div className="input-group-addon"><i className="fa fa-th-list"></i></div>
                                <select required className="form-control" onChange={e => setSubject(e.target.value)} dangerouslySetInnerHTML={{ __html: subjectOption }}>
                                </select>
                            </div>

                        </div>
                        <div className="form-group">
                            <div className="input-group">
                                <div className="input-group-addon"><i className="fa fa-th-list"></i></div>
                                <select required className="form-control" onChange={e => setInternal(e.target.value)}>
                                    <option value="">Select Internal </option>
                                    <option value="I">I</option>
                                    <option value="II">II</option>
                                    <option value="III">III</option>
                                </select>
                            </div>

                        </div>

                        <div className="form-group">
                            <div className="input-group">
                                <input type="file" className="form-control-file" required onChange={e => { setPdf(e.target.files[0]); }} />
                            </div>
                        </div>
                    </div>

                    <div className="card-footer">
                        <div className="form-group">
                            <div className="input-group"><button type="submit" className="btn btn-success btn-sm">Submit</button>
                                <center><strong className='text-danger'>Note:- Kindly Upload PDF Files Only</strong></center>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            <div class="card">
                <div class="card-header">
                    <center><strong>Current Year Scheme</strong> </center>
                </div>
                <div class="card-body">
                    <table class="table table-striped table-bordered">
                        <thead className="thead-dark">
                            <tr>
                                <th>Sl No</th>
                                <th>Subject</th>
                                <th>Scode</th>
                                <th>Sem &amp; Division</th>
                                <th>Type</th>
                                <th>Internal</th>
                                <th>Download</th>
                                <th>Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tbody}
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
                            <tr>
                                <th>Sl No</th>
                                <th>Subject</th>
                                <th>Scode</th>
                                <th>Sem &amp; Division</th>
                                <th>Type</th>
                                <th>Internal</th>
                                <th>Download</th>
                            </tr>
                        </thead>
                        <tbody dangerouslySetInnerHTML={{ __html: ptbody }}>
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}
