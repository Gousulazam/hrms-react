import React, { useEffect, useState } from 'react'
import axios from "axios";
import { useLocation, useNavigate } from 'react-router-dom';

const Studentlistview = (props) => {
    const { state } = useLocation();
    const [studentList, setStudentList] = useState([])
    const [studentId, setStudentId] = useState([])

    useEffect(() => {
        axios.post(`${props.baseURL}/getstudentlis`, {
            did: state.did,
            academicYear: state.academicYear,
            cid: state.cid,
            sem: state.sem
        })
            .then((response) => {
                setStudentList(response.data)
            });
    }, [])

    const onchangeInput = (val, index) => {
        let temp = studentId;
        temp[index] = val.target.value;
        console.log(temp);
        setStudentId(temp);
    };

    return (
        <div>
            <div className="card">
                <div className="card-body">
                    <div className="form-group">
                        <label for="">Division</label>
                        <input type="text" className="form-control" name="division" id="division" aria-describedby="helpId" placeholder="Enter Division" />
                    </div>
                    <br />
                    <table className="table table-bordered">
                        <thead className="thead-dark text-uppercase">
                            <tr>
                                <th className="align-middle">sl no</th>
                                <th>
                                    <input type="checkbox" id="chckal" name="chckal" value="" /> Check All
                                </th>
                                <th className="align-middle">name</th>
                            </tr>

                        </thead>
                        <tbody className="text-uppercase">
                            {
                                studentList.map((user, index) => (
                                    <tr className="text-capitalize">
                                        <td>{index + 1}</td>
                                        <td className="text-center"><input type='checkbox' key={index} onChange={(val) => { onchangeInput(val, index) }} value={user.id} id='chck' name='chck'/></td>
                                        <td>{user.name}</td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                    <div className="text-center">
                        <button type="submit" className="btn btn-primary rounded" id="submit">Submit</button>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default Studentlistview
