import React from 'react'
import { useState, useEffect } from 'react';
import Axios from "axios";


const Beadmissionform = (props) => {
    let styles ={ border: "25px solid #247098" }

    const [academicYearOption, setAcademicYearOption] = useState(`<option value="">Select Academic Year</option>`);
    const [academicYear, setAcademicYear] = useState("")

    const [tuition1, setTuition1] = useState("0")
    const [university1, setUniversity1] = useState("0")

    const totalYear1 = parseInt(tuition1)+parseInt(university1);
    
    const [total1, setTotal1] = useState(totalYear1)
    console.log(totalYear1)
    
    useEffect(() => {
        Axios.post(`${props.baseURL}/getacademicyearoption`, {
            cid: props.userDetails.cid
        })
            .then((response) => {
                if (response.data.length > 0) {
                    setAcademicYearOption(response.data);
                }
            });
    }, [])

    const [departmentOption, setDepartmentOption] = useState(`<option value="">Select Department</option>`);
    const [department, setDepartment] = useState("")
    useEffect(() => {
        Axios.post(`${props.baseURL}/getacademicdepartmentoption`, {
            cid: props.userDetails.cid
        })
            .then((response) => {
                if (response.data.length > 0) {
                    setDepartmentOption(response.data);
                }
            });
    }, [])

    const [quotaOption, setQuotaOption] = useState(`<option value="">Select Quota</option>`);
    const [quota, setQuota] = useState("")
    useEffect(() => {
        Axios.post(`${props.baseURL}/getquotaoption`, {
            cid: props.userDetails.cid
        })
            .then((response) => {
                if (response.data.length > 0) {
                    setQuotaOption(response.data);
                }
            });
    }, [])

    const [categoryOption, setCategoryOption] = useState(`<option value="">Select Caste Category</option>`);
    const [Category, setCategory] = useState("")
    useEffect(() => {
        Axios.post(`${props.baseURL}/getcategoriesoption`, {
            cid: props.userDetails.cid
        })
            .then((response) => {
                if (response.data.length > 0) {
                    setCategoryOption(response.data);
                }
            });
    }, [])

  return (
    <div style={styles}>
      <div className="text-uppercase">
    <h5 align='center'>secab association's</h5>
    {/* <h2 align='center'> <?php echo getInstitutesDetails($cid)['iname'] ?></h2> */}
    {/* //<h4 align='center'><u>admission form to first year b.e degree college</u></h4> */}
</div>
<form  method="post">

    <table className="table table-bordered mt-2">
       <tbody>
        <tr>
            <th rowSpan="11" className="align-middle text-center">Details of Candidate</th>
        </tr>

        <tr>
            <td colspan="2">
            <div className="form-group">
                    <label htmlFor="name" className="font-weight-bold">Academic Year<span>*</span></label>
                    <select className="form-control" name="academic_year" required="" onChange={e =>{ setAcademicYear(e.target.value) }} id="academic_year" dangerouslySetInnerHTML={{ __html: academicYearOption }}>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="name" className="font-weight-bold">Name of the Candidate(In Block Letters as per 10+2/P.U.C marks card)<span>*</span></label>
                    <input required type="text" className="form-control" name="name" id="name" placeholder="Enter Name" />
                </div>
            </td>
        </tr>
		
		 <tr>
            <td colspan="2">
                <div className="form-group">
                    <label htmlFor="name" className="font-weight-bold">Quota<span>*</span></label>
                    <select className="form-control" name="Quota" required="" onChange={e =>{ setQuota(e.target.value) }} id="Quota" dangerouslySetInnerHTML={{ __html: quotaOption }}>
                    </select>
                </div>
            </td>
        </tr>

        <tr>
            <td colspan="2">
                <div className="form-group">
                    <label htmlFor="department" className="font-weight-bold">Desired Branch<span>*</span></label>
                    <select className="form-control" name="department" required="" onChange={e =>{ setDepartment(e.target.value) }} id="department" dangerouslySetInnerHTML={{ __html: departmentOption }}>
                    </select>
                </div>
            </td>
        </tr>

        <tr>
            <td>
                <div className="form-group">
                    <label htmlFor="contactNo" className="font-weight-bold">Contact No<span>*</span></label>
                    <input required type="number" className="form-control" name="contactNo" id="contactNo" placeholder="Enter Contact Number" />
                </div>
            </td>
            <td>
                <div className="form-group">
                    <label htmlFor="gender" className="font-weight-bold">Gender<span>*</span></label>
                    <select required className="form-control" name="gender" id="gender">
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>
            </td>
        </tr>

        <tr>
            <td>
                <div className="form-group">
                    <label htmlFor="dob" className="font-weight-bold">Date of Birth<span>*</span></label>
                    <input required type="date" className="form-control" name="dob" id="dob" />
                </div>
            </td>

            <td>
                <div className="form-group">
                    <label htmlFor="placeOfBirth" className="font-weight-bold">Place of Birth</label>
                    <input type="text" className="form-control" name="placeOfBirth" id="placeOfBirth" placeholder="Enter Place of Birth" />
                </div>
            </td>
        </tr>

        <tr>
            <td>
                <div className="form-group">
                    <label htmlFor="caste" className="font-weight-bold">Religion / Caste<span>*</span></label>
                    <input required type="text" className="form-control" name="caste" id="caste" placeholder="Enter Religion / Caste" />
                </div>
            </td>

            <td>
                <div className="form-group">
                    <label htmlFor="casteCategory" className="font-weight-bold">Caste Category<span>*</span></label>
                    <select className="form-control" name="department" required="" onChange={e =>{ setCategory(e.target.value) }} id="department" dangerouslySetInnerHTML={{ __html: categoryOption }}>
                    </select>
                </div>
            </td>
        </tr>

        <tr>
            <td>
                <div className="form-group">
                    <label htmlFor="nationality" className="font-weight-bold">Nationality<span>*</span></label>
                    <input required type="text" className="form-control" name="nationality" id="nationality" placeholder="Enter Nationality" />
                </div>
            </td>

            <td>
                <div className="form-group">
                    <label htmlFor="bloodGroup" className="font-weight-bold">Blood Group</label>
                    <input  type="text" className="form-control" name="bloodGroup" id="bloodGroup" placeholder="Enter Blood Group" />
                </div>
            </td>
        </tr>

        <tr>
            <td>
                <div className="form-group">
                    <label htmlFor="aadharNo" className="font-weight-bold">Aadhar No<span>*</span></label>
                    <input required type="text" className="form-control" name="aadharNo" id="aadharNo" placeholder="Enter Aadhar No" />
                </div>
            </td>

            <td>
                <div className="form-group">
                    <label htmlFor="email" className="font-weight-bold">E-mail</label>
                    <input type="email" className="form-control" name="email" id="email" placeholder="Enter E-mail" />
                </div>
            </td>
        </tr>

        <tr>
            <td>
                <div className="form-group">
                    <label htmlFor="bankName" className="font-weight-bold">Bank Name</label>
                    <input  type="text" className="form-control" name="bankName" id="bankName" placeholder="Enter Bank Name" />
                </div>
            </td>

            <td>
                <div className="form-group">
                    <label htmlFor="accountNo" className="font-weight-bold">Account No</label>
                    <input  type="number" className="form-control" name="accountNo" id="accountNo" placeholder="Enter Account No" />
                </div>
            </td>
        </tr>

        <tr>
            <td>
                <div className="form-group">
                    <label htmlFor="branch" className="font-weight-bold">Branch</label>
                    <input  type="text" className="form-control" name="branch" id="branch" placeholder="Enter Branch" />
                </div>
            </td>

            <td>
                <div className="form-group">
                    <label htmlFor="ifscCode" className="font-weight-bold">IFSC Code</label>
                    <input  type="text" className="form-control" name="ifscCode" id="ifscCode" placeholder="Enter IFSC Code" />
                </div>
            </td>
        </tr>

        {/* //Candidate Details End

        //Parents / Guardian */}
        <tr>
            <th rowSpan="6" className="align-middle text-center">Details of Parents / Guardian</th>
        </tr>

        <tr>
            <td colspan="2">
                <div className="form-group">
                    <label htmlFor="fatherName" className="font-weight-bold">Name of Father / Guardian<span>*</span></label>
                    <input required type="text" className="form-control" name="fatherName" id="fatherName" placeholder="Enter Father / Guardian Name" />
                </div>
            </td>
        </tr>

        <tr>
            <td>
                <div className="form-group">
                    <label htmlFor="occupation" className="font-weight-bold">Occupation<span>*</span></label>
                    <input required type="text" className="form-control" name="occupation" id="occupation" placeholder="Enter Occupation" />
                </div>
            </td>

            <td>
                <div className="form-group">
                    <label htmlFor="annualIncome" className="font-weight-bold">Annual Income Rs.<span>*</span></label>
                    <input required type="number" className="form-control" name="annualIncome" id="annualIncome" placeholder="Enter Annual Income Rs." />
                </div>
            </td>
        </tr>

        <tr>
            <td>
                <div className="form-group">
                    <label htmlFor="parentsContactNo" className="font-weight-bold">Contact No<span>*</span></label>
                    <input required type="number" className="form-control" name="parentsContactNo" id="parentsContactNo" placeholder="Enter Father / Guardian Contact No" />
                </div>
            </td>

            <td>
                <div className="form-group">
                    <label htmlFor="landPhone" className="font-weight-bold">Landphone(Resi)</label>
                    <input  type="number" className="form-control" name="landPhone" id="landPhone" placeholder="Enter Landphone(Resi)" />
                </div>
            </td>
        </tr>

        <tr>
            <td>
                <div className="form-group">
                    <label htmlFor="parentsContactNo" className="font-weight-bold">Office</label>
                    <input type="number" className="form-control" name="parentsOfficeNo" id="parentsOfficeNo" placeholder="Enter Office No" />
                </div>
            </td>

            <td>
                <div className="form-group">
                    <label htmlFor="fatherEmail" className="font-weight-bold">E-mail</label>
                    <input type="email" className="form-control" name="fatherEmail" id="fatherEmail" placeholder="Enter E-mail" />
                </div>
            </td>
        </tr>

        <tr>
            <td>
                <div className="form-group">
                    <label htmlFor="motherName" className="font-weight-bold">Mothers Name<span>*</span></label>
                    <input required type="text" className="form-control" name="motherName" id="motherName" placeholder="Enter Mother's Name" />
                </div>
            </td>

            <td>
                <div className="form-group">
                    <label htmlFor="gurdianOccupation" className="font-weight-bold">Occupation<span>*</span></label>
                    <input required type="text" className="form-control" name="gurdianOccupation" id="gurdianOccupation" placeholder="Enter Occupation" />
                </div>
            </td>
        </tr>

        {/* //Parents / Guardian End

        //address */}
        <tr>
            <th rowSpan="2" className="align-middle text-center">Correspondence Address</th>
        </tr>

        <tr>
            <td>
                <div className="form-group">
                    <label htmlFor="address" className="font-weight-bold">Address<span>*</span></label>
                    <textarea required className="form-control" name="address" id="address" rows="4" placeholder="Enter Address"></textarea>
                </div>
            </td>
            <td>
                <div className="form-group">
                    <label htmlFor="pincode" className="font-weight-bold">Pincode<span>*</span></label>
                    <input required type="number" className="form-control" name="pincode" id="pincode" placeholder="Enter Pincode" />
                </div>
            </td>
        </tr>
        {/* //end address

        //details of sslc */}
        <tr>
            <th rowSpan="2" className="align-middle text-center">Details of SSLC</th>
        </tr>

        <tr>
            <td colspan="2">
                <table className="table table-bordered">
                    <thead className="thead-dark">
                        <tr>
                            <th colspan="3" className="text-center align-middle">Calender Year</th>
                            <th rowSpan="2" className="align-middle text-center">Name of the Institution<span>*</span></th>
                            <th rowSpan="2" className="align-middle text-center">District<span>*</span></th>
                            <th rowSpan="2" className="align-middle text-center">State<span>*</span></th>
                            <th rowSpan="2" className="align-middle text-center">Class Obtained<span>*</span></th>
                        </tr>
                        <tr>
                            <th></th>
                            <th className="text-center">From<span>*</span></th>
                            <th className="text-center">To<span>*</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>10th</td>
                            <td><input required type="date" name="sslcFrom" id="sslcFrom" className="form-control" /></td>
                            <td><input required type="date" name="sslcTo" id="sslcTo" className="form-control" /></td>
                            <td><input required type="text" name="sslcInstitute" className="form-control" placeholder="Enter Name of the Institution" /></td>
                            <td><input required type="text" name="sslcDistrict" className="form-control" placeholder="Enter Name of District" /></td>
                            <td><input required type="text" name="sslcState" className="form-control" placeholder="Enter Name of State" /></td>
                            <td><input required type="text" name="sslcClassObtained" className="form-control" placeholder="Enter Class Obtained" /></td>
                        </tr>
                    </tbody>
                </table>
            </td>
        </tr>
        {/* //details of sslc end

        //Details of Qualifying Examination Passed */}
        <tr>
            <th rowSpan="2" className="align-middle text-center">Details of Qualifying Examination Passed</th>
        </tr>

        <tr>
            <td colspan="2">
                <table className="table table-bordered">
                    <thead className="thead-dark">
                        <tr>
                            <th>Name of the Institution / College Last Attended<span>*</span></th>
                            <th>Name Of University / Board<span>*</span></th>
                            <th>Reg.No.<span>*</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><input required type="text" name="lastAttendedCOllegeName" id="lastAttendedCOllegeName" className="form-control" placeholder="Enter Institution / College" /></td>
                            <td><input required type="text" name="collegeBoardName" id="collegeBoardName" className="form-control" placeholder="Enter University / Board" /></td>
                            <td><input required type="text" name="collegeRegisterNumber" id="collegeRegisterNumber" className="form-control" placeholder="Enter Reg.No." /></td>
                        </tr>
                    </tbody>
                </table>


                <table className="table table-bordered">
                    <thead className="thead-dark">
                        <tr>
                            <th>Subject</th>
                            <th>Maximum Marks<span>*</span></th>
                            <th>Marks Obtained<span>*</span></th>
                            <th>Percentage<span>*</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Physics<span>*</span></td>
                            <td><input required type="text" name="physicsMaximumMarks" id="physicsMaximumMarks" className="form-control" placeholder="Enter Maximum Marks" /></td>
                            <td><input required type="text" name="physicsMarksObtained" id="physicsMarksObtained" className="form-control" placeholder="Enter Marks Obtained" /></td>
                            <td><input required type="text" name="physicsPecentage" id="physicsPecentage" className="form-control" placeholder="Enter Percentage" /></td>
                        </tr>

                        <tr>
                            <td>Chemistry / Biology / Comp.Sci<span>*</span></td>
                            <td><input required type="text" name="chemistryMaximumMarks" id="chemistryMaximumMarks" className="form-control" placeholder="Enter Maximum Marks" /></td>
                            <td><input required type="text" name="chemistryMarksObtained" id="chemistryMarksObtained" className="form-control" placeholder="Enter Marks Obtained" /></td>
                            <td><input required type="text" name="chemistryPecentage" id="chemistryPecentage" className="form-control" placeholder="Enter Percentage" /></td>
                        </tr>

                        <tr>
                            <td>Mathematics<span>*</span></td>
                            <td><input required type="text" name="mathematicsMaximumMarks" id="mathematicsMaximumMarks" className="form-control" placeholder="Enter Maximum Marks" /></td>
                            <td><input required type="text" name="mathematicsMarksObtained" id="mathematicsMarksObtained" className="form-control" placeholder="Enter Marks Obtained" /></td>
                            <td><input required type="text" name="mathematicsPecentage" id="mathematicsPecentage" className="form-control" placeholder="Enter Percentage" /></td>
                        </tr>

                        <tr>
                            <td>Aggregate Total Marks<span>*</span></td>
                            <td><input required type="text" name="aggregateMaximumMarks" id="aggregateMaximumMarks" className="form-control" placeholder="Enter Maximum Marks" /></td>
                            <td><input required type="text" name="aggregateMarksObtained" id="aggregateMarksObtained" className="form-control" placeholder="Enter Marks Obtained" /></td>
                            <td><input required type="text" name="aggregatePecentage" id="aggregatePecentage" className="form-control" placeholder="Enter Percentage" /></td>
                        </tr>
                    </tbody>
                </table>
            </td>
        </tr>
        {/* //end Details of Qualifying Examination Passed

         /Details of Fee Fixation */}
        <tr>
            <th rowSpan="2" className="align-middle text-center">Fee Fixation Details</th>
        </tr>

        <tr>
            <td colspan="2" className="feeStructure">
                <div id="ugTable">
                    <table className="table table-bordered">
                        <thead className="thead-dark">
                            <tr>
                                <th>Sr. No</th>
                                <th>Particular</th>
                                <th>First Year<span>*</span></th>
                                <th>Second Year<span>*</span></th>
                                <th>Third Year<span>*</span></th>
                                <th>Fourth Year<span>*</span></th>
                            </tr>
                        </thead>
                        <tbody>
                        <tr>
                                <td>1</td>
                                <td>University Fee<span>*</span></td>
                                <td><input required onblur="reSum();" value={university1} onChange={e => setUniversity1(e.target.value)} type="number" name="university1stYear" id="university1stYear" className="form-control" placeholder="Enter First Year University Fee" /></td>
                                <td><input required type="number" name="university2ndYear" id="university2ndYear" className="form-control" placeholder="Enter Second Year University Fee" /></td>
                                <td><input required type="number" name="university3rdYear" id="university3rdYear" className="form-control" placeholder="Enter Third Year University Fee" /></td>
                                <td><input required type="number" name="university4thYear" id="university4thYear" className="form-control" placeholder="Enter Fourth Year University Fee" /></td>
                               

                            </tr>
                            <tr>
                                <td>2</td>
                                <td>Tuition Fee<span>*</span></td>
                                <td><input required value={tuition1} onChange={e => setTuition1(e.target.value)} type="number" name="tuition1stYear" id="tuition1stYear" className="form-control" placeholder="Enter First Year Tuition Fee" /></td>
                                <td><input required type="number" name="tuition2ndYear" id="tuition2ndYear" className="form-control" placeholder="Enter Second Year Tuition Fee" /></td>
                                <td><input required type="number" name="tuition3rdYear" id="tuition3rdYear" className="form-control" placeholder="Enter Third Year Tuition Fee" /></td>
                                <td><input required type="number" name="tuition4thYear" id="tuition4thYear" className="form-control" placeholder="Enter Fourth Year Tuition Fee" /></td>
                              
                            </tr>
                            


                            <tr>
                                <td colspan="2">Total</td>
                                <td><input type="number" value={total1} onChange={e => setTotal1(e.target.value)} className="form-control" name="total1" id="total1" readOnly /></td>
                                <td><input type="number" className="form-control" name="total2" id="total2" value="0" readOnly /></td>
                                <td><input type="number" className="form-control" name="total3" id="total3" value="0" readOnly /></td>
                                <td><input type="number" className="form-control" name="total4" id="total4" value="0" readOnly /></td>
                                
                            </tr>
                        </tbody>
                    </table>
                </div>
            </td>
        </tr>
        {/* //  End of Fee Fixation  */}
    </tbody>
    </table>
    <center>
        <button className="btn btn-primary rounded mb-3" type="submit">Submit</button>
    </center>
</form>
    </div>
  )
}

export default Beadmissionform
