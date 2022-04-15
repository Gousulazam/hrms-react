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
        {login && <Header userDetails={userDetails} setRole={setRole} baseURL={baseURL} setLogin={setLogin} setUserDetails={setUserDetails} />}
        <div className="content mt-3">
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Login setLogin={setLogin} baseURL={baseURL} setUserDetails={setUserDetails} setRole={setRole} />} />
              <Route path="/dashboard" element={<Dashboard />} force='refresh' />
              <Route path="/addco" element={<AddCo baseURL={baseURL} userDetails={userDetails}/>} />
              <Route path="/viewco" element={<ViewCo baseURL={baseURL} userDetails={userDetails}/>} />
              <Route path="/mappingco" element={<MappingCo baseURL={baseURL} userDetails={userDetails}/>} />
              <Route path="/coview" element={<CoView baseURL={baseURL} userDetails={userDetails}/>} />
              <Route path="/subjectreport" element={<SubjectReport baseURL={baseURL} userDetails={userDetails}/>} />
              <Route path="/reportsubject" element={<ReportSubject baseURL={baseURL} userDetails={userDetails}/>} />
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
            </Routes>
          </BrowserRouter>
        </div>
      </div>
    </>
  );
}

export default App;
