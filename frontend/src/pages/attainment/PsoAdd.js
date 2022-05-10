import React, { useEffect, useState } from 'react'
import axios from "axios";
import { useLocation, useNavigate } from 'react-router-dom';
import './attainment.css';
import swal from 'sweetalert';

export default function PsoAdd(props) {
    let navigate = useNavigate();
    const { state } = useLocation();
    const [subjectDetails, setSubjectDetails] = useState([])
    const [psoData, setPsoData] = useState([
        {
            pso: 'PSO1', stmt: '',id:''
        },
        {
            pso: 'PSO2', stmt: '',id:''
        },
    ]);
    const test = async () => {
        await axios.post(`${props.baseURL}/getdepartmentdetails`, {
            did: props.userDetails.did
        })
            .then((response) => {
                setSubjectDetails(response.data);
            });

        await axios.post(`${props.baseURL}/getpso`, {
                did: props.userDetails.did,
                academic_year:state.academicYear
            })
                .then((response) => {
                    if(response.data.length > 0){
                        setPsoData(response.data)
                    }
                });
    }

    useEffect(() => {
        test()
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

    const handleChange = (e,i)=>{
        let data = [...psoData];
        data[i][e.target.name]=e.target.value;
        setPsoData(data);
    };

    const addFeild=()=>{
        if(psoData.length < 4){
            let pso = `PSO${psoData.length+1}`
        let object = {
            pso: pso, stmt: '',id:''
        }
        setPsoData([...psoData, object])
        }else{
            swal("Only 4 PSO Are Allowed","", "warning")
        }
    }

    const removeFeild = (index) => {
        let data = [...psoData];
        data.splice(index, 1)
        setPsoData(data)
    }

    const checkDelete = (i,id)=>{
        if (i > 1) {
            if(id!=''){
                if(window.confirm("Are you sure you want to delete")){
                    axios.delete(`${props.baseURL}/deletepso/${id}`).then((response) => {
                        if (response.data[0] > 0) {
                            swal("PSO Deleted", "", "success");
                            navigate("/addpso");
                        } else {
                            swal("PSO Not Deleted", "", "error");
                            navigate("/addpso");
                        }
                    });
                }
            }else{
                removeFeild(i);
            }
        }else{
            swal("Cannot Delete 2 PSO are Minimum", "", "warning");
        }
    }

    const addCo = async (e) => {
        e.preventDefault();
        await axios.post(`${props.baseURL}/psoadded`, {
            fid: props.userDetails.id,
            cid: props.userDetails.cid,
            did: props.userDetails.did,
            academic_year: state.academicYear,
            psoData: psoData,
        })
            .then((response) => {
                if(response.data[0] > 0){
                    swal("PSO Added", "", "success");
                    navigate("/addpso");
                }else{
                    swal("PSO Not Added", "", "error");
                    navigate("/addpso");
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
                        <p style={p2style} className="text-uppercase">DEPARTMENT OF {subjectDetails['name']}</p>
                    </div>

                </div>
                <hr style={hrStyle} />
                <h4 className="mt-2 text-center mb-3">Academic Year {state.academicYear}</h4>
                <form onSubmit={addCo}>
                <table className="table table-bordered maintable">
                    <thead className="thead-dark">
                        <tr>
                            <th rowSpan="2" className="text-center align-middle">PSO Identification No</th>
                            <th className="text-center">PSO Statement</th>
                            <th rowSpan="2" className="align-middle">Add / Delete </th>
                        </tr>
                        <tr>
                            <th className="text-center">At the end of the course, the students will be able to</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            psoData.map((details, i) => {
                                return <tr key={i}>
                                    <td>{details.pso}</td>
                                    <td><textarea required className="psoStmt form-control" cols="80" name='stmt' onChange={(e)=>{ handleChange(e,i)}} placeholder="Enter PSO Statement" value={details.stmt}></textarea></td>
                                    <td>
                                        <center className="mt-3">
                                            <i className="fa fa-plus-circle mr-2 add_new hide " onClick={()=>addFeild()}></i>
                                            <i className="fa fa-times-circle   delete " onClick={()=>{checkDelete(i,details.id)}}></i>
                                        </center>
                                    </td>
                                </tr>
                            })
                        }
                    </tbody>
                </table>
                <center><button className="btn btn-primary rounded" type="submit">submit</button></center>
                </form>
            </div>
        </div>
    )
}