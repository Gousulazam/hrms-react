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
import Admissionform from './pages/Student-module/Admissionform';
import Getviewstudent from './pages/Student-module/Getviewstudent';
import Getstudentlist from './pages/Student-module/Getstudentlist';
import Getupdatestudentlist from './pages/Student-module/Getupdatestudentlist';
import Updatestudentlist from './pages/Student-module/Updatestudentlist';
import Editstudentdetail from './pages/Student-module/Editstudentdetail';
import Getdeletestudent from './pages/Student-module/Getdeletestudent';
import Deletestudentlist from './pages/Student-module/Deletestudentlist';

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
        {login && <Header userDetails={userDetails} setRole={setRole} />}
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
              <Route path="/reportSubject" element={<ReportSubject baseURL={baseURL} userDetails={userDetails}/>} />
              <Route path="/viewquestionpaper" element={<ViewQuestionPaper baseURL={baseURL} userDetails={userDetails}/>} />
              <Route path="/handlingsubject" element={<HandlingSubject baseURL={baseURL} userDetails={userDetails}/>} />
              <Route path="/admissionform" element={<Admissionform baseURL={baseURL} userDetails={userDetails}/>} />
              <Route path="/getviewstudent" element={<Getviewstudent baseURL={baseURL} userDetails={userDetails}/>} />
              <Route path="/getstudentlist" element={<Getstudentlist baseURL={baseURL} userDetails={userDetails}/>} />
              <Route path="/getupdatestudentlist" element={<Getupdatestudentlist baseURL={baseURL} userDetails={userDetails}/>} />
              <Route path="/Updatestudentlist" element={<Updatestudentlist baseURL={baseURL} userDetails={userDetails}/>} />
              <Route path="/editstudentdetail" element={<Editstudentdetail baseURL={baseURL} userDetails={userDetails}/>} />
              <Route path="/getdeletestudent" element={<Getdeletestudent baseURL={baseURL} userDetails={userDetails}/>} />
              <Route path="/deletestudentlist" element={<Deletestudentlist baseURL={baseURL} userDetails={userDetails}/>} />
            </Routes>
          </BrowserRouter>
        </div>
      </div>
    </>
  );
}

export default App;
