// import React, { useEffect, useState } from 'react'
// import axios from "axios";
// import { useLocation, useNavigate } from 'react-router-dom';
// import swal from 'sweetalert';

// export default function Addattendance(props) {
//   let navigate = useNavigate();
//   const { state } = useLocation();
//   const [subjectDetails, setSubjectDetails] = useState("");
//   const [list, setList] = useState([]);
//   const [button, setbutton] = useState([]);
//   let dataNew = [{ student_id: "", scode: "", classes: "", values: "", text: "" }];

//   useEffect(() => {
//     axios.post(`${props.baseURL}/getsubjectdetailbyid`, {
//       id: state.subject
//     })
//       .then((response) => {
//         setSubjectDetails(response.data[0]);
//       });

//     axios.post(`${props.baseURL}/getattendancelist`, {
//       id: state.subject
//     })
//       .then((response) => {
//         setList(response.data);
//         console.log(list.length)
//         for (let i = 0; i < list.length; i++) {
//           const element = list[i];
//           dataNew[i]={ student_id: element.student_id, scode: element.scd, classes: "btn btn-success rounded", values: 1, text: "P" };
//           console.log(dataNew);
//           setbutton(dataNew);
//         }

//       });

//   }, [])

//   const attendanceSubmit = (e) => {
//     e.preventDefault();
//     axios.post(`${props.baseURL}/attendanceAdded`, {
//       attendnaceData:dataNew,
//       id:state.subject,
//       date:state.date, 
//       startTime:state.startTime, 
//       endTime:state.endTime,
//       lessonPlan:state.lessonPlan,
//     })
//       .then((response) => {
//         let data = response.data[0];
//         swal(data.msg, "", data.icon);
//         navigate("/attendance");
//       });
//   }
//   const updateAttendance = (index)=>{
//     let data = [...button];
//         if(data[index]['values'] == 1){
//           data[index]['classes'] = "btn btn-danger rounded";
//         data[index]['values'] = 0;
//         data[index]['text'] = "A";
//         }else{
//           data[index]['classes'] = "btn btn-success rounded";
//         data[index]['values'] = 1;
//         data[index]['text'] = "P";
//         }
//         setbutton(data);
//   }
//  // console.log(button);
//   return (
//     <div className="card">
//       <div className="card-header font-weight-bold">
//         <center><span style={{ color: "black", fontSize: "14pt", fontFamily: "Cambria", textAlign: "center" }}>Department of {subjectDetails['dept']}</span></center>        <center>Semester:&nbsp;&nbsp;{subjectDetails['sem']}</center>        <center>Subject:&nbsp;&nbsp;{subjectDetails['sname']}</center>
//         <center>Date:&nbsp;&nbsp;{state.date}</center>
//       </div>
//       <div className="card-body card-block" style={{ fontSize: "12px" }}>
//         <form onSubmit={attendanceSubmit}>
//           <table className="table table-bordered ">
//             <thead className="thead-dark text-center">
//               <tr className="text-uppercase">
//                 <th className="text-center">total</th>
//                 <th colSpan="3">present : <span id="presentCount">{list.length}</span> <span className="float-right mr-5">absent : <span id="absentCount">0</span> </span></th>
//               </tr>
//               <tr className="text-uppercase">
//                 <th className="text-center">Sl No</th>
//                 <th>usn</th>
//                 <th>name</th>
//                 <th className="text-center">{subjectDetails['scode']}</th>
//               </tr>
//             </thead>
//             <tbody>
//               {
//                 Array.from(list).map((details, i) => {
//                  // console.log(`${i} = ${button[i]}`)
//                   return <tr key={i}>
//                     <td>{i + 1}</td>
//                     <td>{details.usn}</td>
//                     <td>{details.name}</td>
//                     <td>
//                       {/* <button key={i} className={button[i]['classes']} value={button[i]['values']} onclick={()=>{ updateAttendance(i) }}>{button[i]['text']}</button> */}
//                     </td>
//                   </tr>
//                 })
//               }
//             </tbody>
//           </table>
//           <br />
//           <center>
//             <button className="btn btn-primary rounded">Submit</button>
//           </center>
//         </form>
//       </div>
//     </div>
//   )
// }


// above code is old

import React, { useEffect, useState } from 'react'
import axios from "axios";
import { useLocation, useNavigate } from 'react-router-dom';
import swal from 'sweetalert';

export default function Addattendance(props) {
  let navigate = useNavigate();
  const { state } = useLocation();
  const [subjectDetails, setSubjectDetails] = useState("");
  const [list, setList] = useState([]);
  const [button, setbutton] = useState([]);
  let dataNew = [{ student_id: "", scode: "", classes: "", values: "", text: "" }];

  useEffect(() => {
    axios.post(`${props.baseURL}/getsubjectdetailbyid`, {
      id: state.subject
    })

      .then((response) => {
        setSubjectDetails(response.data);
      });

    axios.post(`${props.baseURL}/getattendancelist`, {
      id: state.subject
    })
      .then((response) => {

        setList(response.data);

        for (let i = 0; i < response.data.length; i++) {
          const element = response.data[i];

          dataNew[i] = { student_id: element.student_id, scode: element.scd, classes: 1, values: 1, text: "P" };
          setbutton(dataNew);
        }

      });

  }, [])

  const attendanceSubmit = (e) => {
    e.preventDefault();
    // console.log(button);
    axios.post(`${props.baseURL}/attendanceAdded`, {
      attendnaceData: button,
      id: state.subject,
      date: state.date,
      startTime: state.startTime,
      endTime: state.endTime,
      lessonPlan: state.lessonPlan,
    })
      .then((response) => {
        let data = response.data[0];
        swal(data.msg, "", data.icon);
        navigate("/attendance");
      });
  }

  const updateAttendance = (index) => {
    let data = [...button];
    if (data[index]['values'] == 1) {
      data[index]['classes'] = "btn btn-danger rounded";
      data[index]['values'] = 0;
      data[index]['text'] = "A";
    } else {
      data[index]['classes'] = "btn btn-success rounded";
      data[index]['values'] = 1;
      data[index]['text'] = "P";
    }
    setbutton(data);
  }
  // console.log(button);
  const color1 = ['red', 'black', 'orange', 'purple', 'pink'];
  const [state1, setState1] = useState({
    title: 'Present',
    vlv: 1,
    clr: 'Blue'
  });
  const handleColor = (e) => {
    const btn = e.target;
    e.preventDefault();
    console.log(state1.title);
    if (parseInt(e.target.value) === 1) {
      console.log(state1.vlv);
      // e.target.style.backgroundColor = "red";
      e.target.innerText = "Absent";
      e.target.value = 0;
      e.target.className="btn btn-danger rounded";

      // setState1({
      //   title:"Absent",
      //   vlv:0,
      //   clr:'red'
      // })
    }
    else {

      // e.target.style.backgroundColor = "Blue";
      e.target.value = 1;
      e.target.innerText = "Present";
      e.target.className="btn btn-success rounded";
      //state1.title = "Absent";

      // setState1({
      //   title: "Present",
      //   vlv:1,
      //   clr:'Blue'
      // })

    }
    button[parseInt(e.target.getAttribute('abp'))].classes = parseInt(e.target.value);

    // console.log(button);
    // e.target.value=0
    //console.log(e.target);
    // setState1((state1) => ({

    //   color: 'red',
    // })



  }

  const formdat = (e) => {
    e.preventDefault();
    //const fd = new FormData(e.target.data);

  }
  const onc = (list) => {
    console.log(list);
  }
  return (
    <div className="card">
      <div className="card-header font-weight-bold">
        <center><span style={{ color: "black", fontSize: "14pt", fontFamily: "Cambria", textAlign: "center" }}>Department of {subjectDetails['dept']}</span></center>        <center>Semester:&nbsp;&nbsp;{subjectDetails['sem']}</center>        <center>Subject:&nbsp;&nbsp;{subjectDetails['sname']}</center>
        <center>Date:&nbsp;&nbsp;{state.date}</center>
      </div>
      <div className="card-body card-block" style={{ fontSize: "12px" }}>
        <form onSubmit={attendanceSubmit}>
          <table className="table table-bordered ">
            <thead className="thead-dark text-center">
              <tr className="text-uppercase">
                <th className="text-center">total</th>
                <th colSpan="3">present : <span id="presentCount">{list.length}</span> <span className="float-right mr-5">absent : <span id="absentCount">0</span> </span></th>
              </tr>
              <tr className="text-uppercase">
                <th className="text-center">Sl No</th>
                <th>usn</th>
                <th>name</th>
                <th className="text-center">{subjectDetails['scode']}</th>
              </tr>
            </thead>
            <tbody>
              {
                Array.from(list).map((details, i) => {
                  // console.log(`${i} = ${button[i]}`)

                  return <tr key={i}>
                    <td>{i}</td>
                    <td>{details.usn}</td>
                    <td>{details.name}</td>
                    <td>
                      {/*<button key={i} className={button[i]['classes']} value={button[i]['values']} onclick={()=>{ updateAttendance(i) }}>{button[i]['text']}</button > */}
                        < button abp={i} className="btn btn-success rounded" value="1" onClick={handleColor} >Present</button>
                  </td>
                  </tr>
                })
              }
          </tbody>
        </table>
        <br />
        <center>
          <button className="btn btn-primary rounded">Submit</button>
        </center>
      </form>
    </div>
    </div >
  )
}