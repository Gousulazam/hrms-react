import logo from './logo.svg';
import './App.css';
import Sidebar from './componets/Sidebar';
import Header from './componets/Header';
import Login from './pages/user/Login';
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AddCo from './pages/attainment/AddCo';
import MappingCo from './pages/attainment/MappingCo';
import SubjectReport from './pages/reports/SubjectReport';
import ReportSubject from './pages/reports/ReportSubject';
import ViewCo from './pages/attainment/ViewCo';
import CoView from './pages/attainment/CoView';
import ViewQuestionPaper from './pages/attainment/ViewQuestionPaper';
import HandlingSubject from './pages/reports/HandlingSubject';
import AddEresouce from './pages/eresource/AddEresouce';
import Scheme from './pages/scheme/Scheme';
import SubjectReportDetails from './pages/reports/SubjectReportDetails';
import ReportSubjectDetails from './pages/reports/ReportSubjectDetails';
import ViewAttendance from './pages/reports/ViewAttendance';
import AttendanceView from './pages/reports/AttendanceView';
import IaReport from './pages/reports/IaReport';
import ReportIa from './pages/reports/ReportIa';
import Attendance from './pages/attendance/Attendance';
import Addattendance from './pages/attendance/Addattendance';
import LabAttendance from './pages/attendance/LabAttendance';
import AddLabAttendance from './pages/attendance/AddLabAttendance';
import MappingCoPo from './pages/attainment/MappingCoPo';
import CopoMapping from './pages/attainment/CopoMapping';
import AddPso from './pages/attainment/AddPso';
import PsoAdd from './pages/attainment/PsoAdd';
import Admissionform from './pages/Student-module/Admissionform';
import Getviewstudent from './pages/Student-module/Getviewstudent';
import Getstudentlist from './pages/Student-module/Getstudentlist';
import Getupdatestudentlist from './pages/Student-module/Getupdatestudentlist';
import Updatestudentlist from './pages/Student-module/Updatestudentlist';
import Editstudentdetail from './pages/Student-module/Editstudentdetail';
import Getdeletestudent from './pages/Student-module/Getdeletestudent';
import Deletestudentlist from './pages/Student-module/Deletestudentlist';
import Assignsubject from './pages/subject/Assignsubject';
import Assignsubjectlist from './pages/subject/Assignsubjectlist';
import Assingdivison from './pages/Student-module/Assingdivison';
import Studentlistview from './pages/Student-module/Studentlistview';
import DepartmentFeeDetails from './pages/reports/DepartmentFeeDetails';
import FeeDetailsDepartment from './pages/reports/FeeDetailsDepartment';
import ConsolidateDepartmentFeeDetails from './pages/reports/ConsolidateDepartmentFeeDetails';
import ConsolidateDepartment from './pages/reports/ConsolidateDepartment';
import DepartmentConsolidate from './pages/reports/DepartmentConsolidate';
import FeeCollectionDetails from './pages/reports/FeeCollectionDetails';
import CollectionFeeDetails from './pages/reports/CollectionFeeDetails';
import PayUsnWise from './pages/fees/PayUsnWise';
import AfterPayTransaction from './pages/fees/AfterPayTransaction';
import ViewConsolidateFeesDetails from './pages/reports/ViewConsolidateFeesDetails';
import DeleteTransaction from './pages/fees/DeleteTransaction';
import ViewDeleteTranscationStatus from './pages/fees/ViewDeleteTranscationStatus';
import ApproveDeleteTranscations from './pages/fees/ApproveDeleteTranscations';
import DeleteTransactionsDetails from './pages/fees/DeleteTransactionsDetails';
import DeleteStudentFeeDetails from './pages/fees/DeleteStudentFeeDetails';
import DeleteStudentfeeDetailsStatus from './pages/fees/DeleteStudentfeeDetailsStatus';
import ApproveDeleteStudentFeedetails from './pages/fees/ApproveDeleteStudentFeedetails';
import EditStudentFeedetails from './pages/fees/EditStudentFeedetails';
import EditFeeFixationStatus from './pages/fees/EditFeeFixationStatus';
import ApproveEditFeeFixation from './pages/fees/ApproveEditFeeFixation';
import PayDepartmentWise from './pages/fees/PayDepartmentWise';
import DepartmentWisePay from './pages/fees/DepartmentWisePay';
import IaMarksEntry from './pages/attainment/IaMarksEntry';
import MarksEntryIa from './pages/attainment/MarksEntryIa';
import IaAttainmentSheet from './pages/attainment/IaAttainmentSheet';
import SheetAttainmentIa from './pages/attainment/SheetAttainmentIa';


function App() {
  const Dashboard = () => {
    return <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  }

  const formatDate = (type, date22) => {
    var today = new Date(date22);
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    if (type == 'db') {
      return `${yyyy}-${mm}-${dd}`;
    } else {
      return `${dd}-${mm}-${yyyy}`;
    }
  }

  const wordify = (num) => {
    const single = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const double = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "Ten", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const formatTenth = (digit, prev) => {
      return 0 == digit ? "" : " " + (1 == digit ? double[prev] : tens[digit])
    };
    const formatOther = (digit, next, denom) => {
      return (0 != digit && 1 != next ? " " + single[digit] : "") + (0 != next || digit > 0 ? " " + denom : "")
    };
    let res = "";
    let index = 0;
    let digit = 0;
    let next = 0;
    let words = [];
    if (num += "", isNaN(parseInt(num))) {
      res = "";
    }
    else if (parseInt(num) > 0 && num.length <= 10) {
      for (index = num.length - 1; index >= 0; index--) switch (digit = num[index] - 0, next = index > 0 ? num[index - 1] - 0 : 0, num.length - index - 1) {
        case 0:
          words.push(formatOther(digit, next, ""));
          break;
        case 1:
          words.push(formatTenth(digit, num[index + 1]));
          break;
        case 2:
          words.push(0 != digit ? " " + single[digit] + " Hundred" + (0 != num[index + 1] && 0 != num[index + 2] ? " and" : "") : "");
          break;
        case 3:
          words.push(formatOther(digit, next, "Thousand"));
          break;
        case 4:
          words.push(formatTenth(digit, num[index + 1]));
          break;
        case 5:
          words.push(formatOther(digit, next, "Lakh"));
          break;
        case 6:
          words.push(formatTenth(digit, num[index + 1]));
          break;
        case 7:
          words.push(formatOther(digit, next, "Crore"));
          break;
        case 8:
          words.push(formatTenth(digit, num[index + 1]));
          break;
        case 9:
          words.push(0 != digit ? " " + single[digit] + " Hundred" + (0 != num[index + 1] || 0 != num[index + 2] ? " and" : " Crore") : "")
      };
      res = words.reverse().join("")
      res = res + " rupees"
    } else res = "";
    return res
  };

  const numberWithCommas = (x) => {
    return x.toString().split('.')[0].length > 3 ? x.toString().substring(0, x.toString().split('.')[0].length - 3).replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + x.toString().substring(x.toString().split('.')[0].length - 3) : x.toString();
  }

  const [login, setLogin] = useState(sessionStorage.getItem('login'))
  const [userDetails, setUserDetails] = useState(JSON.parse(sessionStorage.getItem('userDetails')));
  const [role, setRole] = useState(sessionStorage.getItem('role'))

  if (userDetails == null) {
    setUserDetails({
      name: "",
      id: "",
      roles: "",
    })
  }
  const baseURL = `http://localhost:5000`;
  const loader = () => { return `<center><img width="80%" height="500px" src='/assets/loader/Vanilla-1s-280px.svg' /></center>`;}
  return (
    <>
      {login && <Sidebar userDetails={userDetails} setRole={setRole} role={role} baseURL={baseURL} />}
      <div id="right-panel" className="right-panel">
        {login && <Header userDetails={userDetails} setRole={setRole} setLogin={setLogin} baseURL={baseURL} setUserDetails={setUserDetails} />}
        <div className="content mt-3">
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Login setLogin={setLogin} baseURL={baseURL} setUserDetails={setUserDetails} setRole={setRole} />} />
              <Route path="/dashboard" element={<Dashboard />} force='refresh' />
              <Route path="/addco" element={<AddCo baseURL={baseURL} userDetails={userDetails} />} />
              <Route path="/mappingco" element={<MappingCo baseURL={baseURL} userDetails={userDetails} />} />
              <Route path="/viewco" element={<ViewCo baseURL={baseURL} userDetails={userDetails} />} />
              <Route path="/coview" element={<CoView baseURL={baseURL} userDetails={userDetails} />} />
              <Route path="/subjectreport" element={<SubjectReport baseURL={baseURL} userDetails={userDetails} />} />
              <Route path="/reportSubject" element={<ReportSubject baseURL={baseURL} userDetails={userDetails} formatDate={formatDate} loader={loader} />}  />
              <Route path="/viewquestionpaper" element={<ViewQuestionPaper baseURL={baseURL} userDetails={userDetails} />} />
              <Route path="/handlingsubject" element={<HandlingSubject baseURL={baseURL} userDetails={userDetails} />} />
              <Route path="/eresource" element={<AddEresouce baseURL={baseURL} userDetails={userDetails} />} />
              <Route path="/uploadscheme" element={<Scheme baseURL={baseURL} userDetails={userDetails} />} />
              <Route path="/subjectreportdetails" element={<SubjectReportDetails baseURL={baseURL} userDetails={userDetails} />} />
              <Route path="/reportsubjectdetails" element={<ReportSubjectDetails baseURL={baseURL} userDetails={userDetails} loader={loader} />} />
              <Route path="/viewattendance" element={<ViewAttendance baseURL={baseURL} userDetails={userDetails} />} />
              <Route path="/attendanceview" element={<AttendanceView baseURL={baseURL} userDetails={userDetails} />} />
              <Route path="/iareport" element={<IaReport baseURL={baseURL} userDetails={userDetails} />} />
              <Route path="/reportia" element={<ReportIa baseURL={baseURL} userDetails={userDetails} />} />
              <Route path="/admissionform" element={<Admissionform baseURL={baseURL} userDetails={userDetails} />} />
              <Route path="/getviewstudent" element={<Getviewstudent baseURL={baseURL} userDetails={userDetails} />} />
              <Route path="/getstudentlist" element={<Getstudentlist baseURL={baseURL} userDetails={userDetails} />} />
              <Route path="/getupdatestudentlist" element={<Getupdatestudentlist baseURL={baseURL} userDetails={userDetails} />} />
              <Route path="/Updatestudentlist" element={<Updatestudentlist baseURL={baseURL} userDetails={userDetails} />} />
              <Route path="/editstudentdetail" element={<Editstudentdetail baseURL={baseURL} userDetails={userDetails} />} />
              <Route path="/getdeletestudent" element={<Getdeletestudent baseURL={baseURL} userDetails={userDetails} />} />
              <Route path="/deletestudentlist" element={<Deletestudentlist baseURL={baseURL} userDetails={userDetails} />} />
              <Route path="/attendance" element={<Attendance baseURL={baseURL} userDetails={userDetails} />} />
              <Route path="/addattendance" element={<Addattendance baseURL={baseURL} userDetails={userDetails} />} />
              <Route path="/labattendance" element={<LabAttendance baseURL={baseURL} userDetails={userDetails} />} />
              <Route path="/addlabattendance" element={<AddLabAttendance baseURL={baseURL} userDetails={userDetails} />} />
              <Route path="/copomapping" element={<CopoMapping baseURL={baseURL} userDetails={userDetails} />} />
              <Route path="/mappingcopo" element={<MappingCoPo baseURL={baseURL} userDetails={userDetails} />} />
              <Route path="/addpso" element={<AddPso baseURL={baseURL} userDetails={userDetails} />} />
              <Route path="/psoadd" element={<PsoAdd baseURL={baseURL} userDetails={userDetails} />} />
              <Route path="/assignsubject" element={<Assignsubject baseURL={baseURL} userDetails={userDetails} />} />
              <Route path="/assignsubjectlist" element={<Assignsubjectlist baseURL={baseURL} userDetails={userDetails} />} />
              <Route path="/assingdivison" element={<Assingdivison baseURL={baseURL} userDetails={userDetails} />} />
              <Route path="/studentlistview" element={<Studentlistview baseURL={baseURL} userDetails={userDetails} />} />
              <Route path="/departmentfeeDetails" element={<DepartmentFeeDetails baseURL={baseURL} userDetails={userDetails} />} />
              <Route path="/feeDetailsdepartment" element={<FeeDetailsDepartment baseURL={baseURL} userDetails={userDetails} loader={loader} />} />
              <Route path="/consolidatedepartmentfeeDetails" element={<ConsolidateDepartmentFeeDetails baseURL={baseURL} userDetails={userDetails} loader={loader} />} />
              <Route path="/consolidatedepartment" element={<ConsolidateDepartment baseURL={baseURL} userDetails={userDetails} />} />
              <Route path="/departmentconsolidate" element={<DepartmentConsolidate baseURL={baseURL} userDetails={userDetails} loader={loader} />} />
              <Route path="/feecollectiondetails" element={<FeeCollectionDetails baseURL={baseURL} userDetails={userDetails}  />} />
              <Route path="/collectionfeedetails" element={<CollectionFeeDetails baseURL={baseURL} userDetails={userDetails} loader={loader} />} />
              <Route path="/payusnwise" element={<PayUsnWise baseURL={baseURL} userDetails={userDetails} />} />
              <Route path="/afterpaytransaction" element={<AfterPayTransaction baseURL={baseURL} userDetails={userDetails} formatDate={formatDate} numberWithCommas={numberWithCommas} />} />
              <Route path="/viewconsolidatefeesdetails" element={<ViewConsolidateFeesDetails baseURL={baseURL} userDetails={userDetails} formatDate={formatDate} numberWithCommas={numberWithCommas} loader={loader} />} />
              <Route path="/deletetransaction" element={<DeleteTransaction baseURL={baseURL} userDetails={userDetails} formatDate={formatDate} numberWithCommas={numberWithCommas} />} />
              <Route path="/viewdeletetranscationstatus" element={<ViewDeleteTranscationStatus baseURL={baseURL} userDetails={userDetails} />} />
              <Route path="/approvedeletetranscations" element={<ApproveDeleteTranscations baseURL={baseURL} userDetails={userDetails} formatDate={formatDate} numberWithCommas={numberWithCommas} />} />
              <Route path="/deletestudentfeedetails" element={<DeleteStudentFeeDetails baseURL={baseURL} userDetails={userDetails} formatDate={formatDate} numberWithCommas={numberWithCommas} />} />
              <Route path="/deletestudentfeedetailsstatus" element={<DeleteStudentfeeDetailsStatus baseURL={baseURL} userDetails={userDetails} formatDate={formatDate} numberWithCommas={numberWithCommas} />} />
              <Route path="/approvedeletestudentfeedetails" element={<ApproveDeleteStudentFeedetails baseURL={baseURL} userDetails={userDetails} formatDate={formatDate} numberWithCommas={numberWithCommas} />} />
              <Route path="/editstudentfeedetails" element={<EditStudentFeedetails baseURL={baseURL} userDetails={userDetails} formatDate={formatDate} numberWithCommas={numberWithCommas} />} />
              <Route path="/editfeefixationstatus" element={<EditFeeFixationStatus baseURL={baseURL} userDetails={userDetails} formatDate={formatDate} numberWithCommas={numberWithCommas} />} />
              <Route path="/approveeditfeefixation" element={<ApproveEditFeeFixation baseURL={baseURL} userDetails={userDetails} formatDate={formatDate} numberWithCommas={numberWithCommas} />} />
              <Route path="/paydepartmentwise" element={<PayDepartmentWise baseURL={baseURL} userDetails={userDetails} />} />
              <Route path="/departmentwisepay" element={<DepartmentWisePay baseURL={baseURL} userDetails={userDetails} numberWithCommas={numberWithCommas} />} />
              <Route path="/iamarksentry" element={<IaMarksEntry baseURL={baseURL} userDetails={userDetails} />} />
              <Route path="/marksentryia" element={<MarksEntryIa baseURL={baseURL} userDetails={userDetails} />} />
              <Route path="/iaattainmentsheet" element={<IaAttainmentSheet baseURL={baseURL} userDetails={userDetails} />} />
              <Route path="/sheetattainmentia" element={<SheetAttainmentIa baseURL={baseURL} userDetails={userDetails} loader={loader} />} />
            </Routes>
          </BrowserRouter>
        </div>
      </div>
    </>
  );
}

export default App;
