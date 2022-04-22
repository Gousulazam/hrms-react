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
  const [login, setLogin] = useState(sessionStorage.getItem('login'))
  const [userDetails, setUserDetails] = useState(JSON.parse(sessionStorage.getItem('userDetails')));
  const [role, setRole] = useState(sessionStorage.getItem('role'))

  if(userDetails == null){
    setUserDetails({
      name:"",
      id:"",
      roles:"",
    })
  }
  const baseURL = `http://localhost:5000`;
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
              <Route path="/addco" element={<AddCo baseURL={baseURL} userDetails={userDetails}/>} />
              <Route path="/mappingco" element={<MappingCo baseURL={baseURL} userDetails={userDetails}/>} />
              <Route path="/viewco" element={<ViewCo baseURL={baseURL} userDetails={userDetails}/>} />
              <Route path="/coview" element={<CoView baseURL={baseURL} userDetails={userDetails}/>} />
              <Route path="/subjectreport" element={<SubjectReport baseURL={baseURL} userDetails={userDetails}/>} />
              <Route path="/reportSubject" element={<ReportSubject baseURL={baseURL} userDetails={userDetails}/>} />
              <Route path="/viewquestionpaper" element={<ViewQuestionPaper baseURL={baseURL} userDetails={userDetails}/>} />
              <Route path="/handlingsubject" element={<HandlingSubject baseURL={baseURL} userDetails={userDetails}/>} />
              <Route path="/eresource" element={<AddEresouce baseURL={baseURL} userDetails={userDetails}/>} />
              <Route path="/uploadscheme" element={<Scheme baseURL={baseURL} userDetails={userDetails}/>} />
              <Route path="/subjectreportdetails" element={<SubjectReportDetails baseURL={baseURL} userDetails={userDetails}/>} />
              <Route path="/reportsubjectdetails" element={<ReportSubjectDetails baseURL={baseURL} userDetails={userDetails}/>} />
              <Route path="/viewattendance" element={<ViewAttendance baseURL={baseURL} userDetails={userDetails}/>} />
              <Route path="/attendanceview" element={<AttendanceView baseURL={baseURL} userDetails={userDetails}/>} />
              <Route path="/iareport" element={<IaReport baseURL={baseURL} userDetails={userDetails}/>} />
              <Route path="/reportia" element={<ReportIa baseURL={baseURL} userDetails={userDetails}/>} />
              <Route path="/admissionform" element={<Admissionform baseURL={baseURL} userDetails={userDetails}/>} />
              <Route path="/getviewstudent" element={<Getviewstudent baseURL={baseURL} userDetails={userDetails}/>} />
              <Route path="/getstudentlist" element={<Getstudentlist baseURL={baseURL} userDetails={userDetails}/>} />
              <Route path="/getupdatestudentlist" element={<Getupdatestudentlist baseURL={baseURL} userDetails={userDetails}/>} />
              <Route path="/Updatestudentlist" element={<Updatestudentlist baseURL={baseURL} userDetails={userDetails}/>} />
              <Route path="/editstudentdetail" element={<Editstudentdetail baseURL={baseURL} userDetails={userDetails}/>} />
              <Route path="/getdeletestudent" element={<Getdeletestudent baseURL={baseURL} userDetails={userDetails}/>} />
              <Route path="/deletestudentlist" element={<Deletestudentlist baseURL={baseURL} userDetails={userDetails}/>} />
              <Route path="/attendance" element={<Attendance baseURL={baseURL} userDetails={userDetails}/>} />
              <Route path="/addattendance" element={<Addattendance baseURL={baseURL} userDetails={userDetails}/>} />
              <Route path="/labattendance" element={<LabAttendance baseURL={baseURL} userDetails={userDetails}/>} />
              <Route path="/addlabattendance" element={<AddLabAttendance baseURL={baseURL} userDetails={userDetails}/>} />
              <Route path="/copomapping" element={<CopoMapping baseURL={baseURL} userDetails={userDetails}/>} />
              <Route path="/mappingcopo" element={<MappingCoPo baseURL={baseURL} userDetails={userDetails}/>} />
              <Route path="/addpso" element={<AddPso baseURL={baseURL} userDetails={userDetails}/>} />
              <Route path="/psoadd" element={<PsoAdd baseURL={baseURL} userDetails={userDetails}/>} />
              <Route path="/assignsubject" element={<Assignsubject baseURL={baseURL} userDetails={userDetails}/>} />
              <Route path="/assignsubjectlist" element={<Assignsubjectlist baseURL={baseURL} userDetails={userDetails}/>} />
              <Route path="/assingdivison" element={<Assingdivison baseURL={baseURL} userDetails={userDetails}/>} />
              <Route path="/studentlistview" element={<Studentlistview baseURL={baseURL} userDetails={userDetails}/>} />
            </Routes>
          </BrowserRouter>
        </div>
      </div>
    </>
  );
}

export default App;
