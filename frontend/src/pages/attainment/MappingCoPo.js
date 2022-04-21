import React, { useEffect, useState } from 'react'
import axios from "axios";
import { useLocation, useNavigate } from 'react-router-dom';
import './attainment.css';
import swal from 'sweetalert';

export default function MappingCoPo(props) {
    let navigate = useNavigate();
    const { state } = useLocation();
    const [subjectDetails, setSubjectDetails] = useState([])
    const [cosData, setCosData] = useState([])
    const test = async () => {

        await axios.post(`${props.baseURL}/getsubjectdetailbyid`, {
            id: state.subject
        }).then((response) => {
            setSubjectDetails(response.data[0]);
        });
        await axios.post(`${props.baseURL}/getcos`, {
            id: state.subject
        }).then((response) => {
            setCosData(response.data);
            // console.log(response.data)
        });
    }
    useEffect(() => {
        test();
    }, [])

    const associationStyle = {
        fontSize: "17pt",
        textAlign: "center",
        fontFamily: "Cambria",
        color: "#0047b3",
        lineHeight: "50%",
    }

    const p1style = {
        fontSize: "16pt",
        textAlign: "center",
        fontFamily: "Cambria",
        color: "#0047b3",
        lineHeight: "50%"
    }

    const p2style = {
        fontSize: "14pt",
        textAlign: "center",
        fontFamily: "Cambria",
        color: "#cc0000",
        lineHeight: "50%"
    }

    const hrStyle = {
        borderTop: "1px dashed green"
    }

    const imgStyle = {
        width: "40%",
        height: "80px",
    }

    const po = ["PO1", "PO2", "PO3", "PO4", "PO5", "PO6", "PO7", "PO8", "PO9", "PO10", "PO11", "PO12"];
    const pso = ["PSO1", "PSO2", "PSO3"];

    const addPo = async (e,ind,i,type) => {
        e.preventDefault();
        let value = e.target.value;
        let pos='';
        if(type == "PO"){
            pos=po[i];
        }else{
            pos=pso[i];
        }
        await axios.post(`${props.baseURL}/addpo`, {
            id: state.subject,
            co_id:cosData[ind].id,
            pos:pos,
            po:value,
        }).then((response) => {
            if(response.data[0] > 0){
                console.log("added")
            }else{
                console.log("Not Added")
            }
        });
    };

    return (
        <div className="card">
            <div className="card-body table-responsive">
                <p style={associationStyle} className="text-uppercase text-center">SECAB‌ ‌Association’s‌</p>
                <div className="row">
                    <div className="col-md-3">
                        <center><img src="https://hrms.secab.org/images/siet.png" alert="No images" style={imgStyle} /></center>
                    </div>
                    <div className="col-md-7">
                        <p style={p1style} className="text-uppercase">{subjectDetails['iname']},</p>
                        <p style={p1style} className="text-uppercase">VIJAYAPUR-586109</p>
                        <p style={p2style} className="text-uppercase">DEPARTMENT OF {subjectDetails['dept']}</p>
                    </div>

                </div>
                <hr style={hrStyle} />
                <h4 className="mt-2 text-center mb-3">Academic Year {state.academicYear}</h4>
                <table className="table table-bordered ">
                    <thead>
                        <tr>
                            <th>Course Name</th>
                            <td>{subjectDetails['sname']}</td>
                        </tr>
                        <tr>
                            <th>Course Code</th>
                            <td>{subjectDetails['scode']}</td>
                        </tr>
                        <tr>
                            <th>Sem</th>
                            <td>{subjectDetails['sem']}</td>
                        </tr>
                    </thead>
                </table>
                <h5 className="mb-2"><u>Course Outcomes</u></h5>
                <table className="table table-bordered">
                    <thead className="thead-dark">
                        <tr>
                            <th rowSpan="2" className='text-center align-middle'>CO Identification No</th>
                            <th colSpan={po.length} className='text-center align-middle'>Program Outcomes</th>
                            <th colSpan={pso.length} className='text-center align-middle'>PSO</th>
                        </tr>
                        <tr>
                            {
                                po.map((details, i) => {
                                    return <th>{details}</th>
                                })
                            }
                            {
                                pso.map((details, i) => {
                                    return <th>{details}</th>
                                })
                            }
                        </tr>
                    </thead>
                    <tbody>
                        {
                            cosData.map((details, ind) => {
                                return <tr key={ind}>
                                    <td>{details.cos}</td>
                                    {
                                        po.map((details, i) => {
                                            return <td key={i}>
                                                <select onChange={(e)=>{addPo(e,ind,i,"PO")}}>
                                                    <option value="">Select PO</option>
                                                    <option value="-">-</option>
                                                    <option value="1">1</option>
                                                    <option value="2">2</option>
                                                    <option value="3">3</option>
                                                </select>
                                            </td>
                                        })
                                    }
                                    {
                                        pso.map((details, i) => {
                                            return <td key={i}>
                                            <select>
                                                <option value="">Select PSO</option>
                                                <option value="-">-</option>
                                                <option value="1">1</option>
                                                <option value="2">2</option>
                                                <option value="3">3</option>
                                            </select>
                                        </td>
                                        })
                                    }
                                </tr>
                            })
                        }
                    </tbody>
                </table>
                <br />
                <center>
                <button className="btn btn-primary rounded" onClick={()=>{ swal("Record Added", "", "success");navigate("/copomapping"); }}>Submit</button>
                </center>
            </div>
        </div>
    )
}