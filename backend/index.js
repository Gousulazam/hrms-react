const mysql = require('mysql');
const mysql2 = require('mysql2');
const QueryBuilder = require('node-querybuilder');
const express = require('express');
const fileupload = require("express-fileupload");
const bodyparser = require('body-parser');
const cors = require('cors');
var app = express();
//Configuring express server
app.use(cors());
app.use(fileupload());
app.use(express.static("files"));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

//MySQL details
var mysqlConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'semes',
    multipleStatements: true
});

const pool = mysql2.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'semes',
    multipleStatements: true
});

const settings = {
    "host": "localhost",
    "user": "root",
    "password": "",
    "database": "semes",
    "pool_size": 50
};

const pool1 = new QueryBuilder(settings, 'mysql', 'pool');

const runQuery = async (query) => {
    let db = await pool1.get_connection();
    let run = db.query(query)
    await db.release();
    return run;
}

mysqlConnection.connect((err) => {
    if (!err)
        console.log('Connection Established Successfully');
    else
        console.log('Connection Failed!' + JSON.stringify(err, undefined, 2));
});
const promisePool = pool.promise();
//Establish the server connection
//PORT ENVIRONMENT VARIABLE
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Listening on port ${port}..`));

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

const getHeadWisePaidAmount = async (cid, feesId, feeType) => {
    let feeDetails = await promisePool.query(`SELECT sum(paid_amt) AS paidAmount FROM fee_transactions WHERE cid='${cid}' AND fee_id='${feesId}' AND fee_type='${feeType}'`);
    if (feeDetails[0][0]['paidAmount'] == null) {
        return 0;
    }
    return feeDetails[0][0]['paidAmount'];
}

let getTransactionId = async (cid, did) => {
    let transcationTableId = await promisePool.query("SELECT MAX(id)+1 AS maxId FROM `fee_transactions` ORDER BY id DESC");
    return `${cid + did + "T" + transcationTableId[0][0]['maxId']}`;
};

app.post('/checkuser', async (req, res) => {
    let data = req.body;
    let rows = await runQuery(`SELECT id,title,name,cid,did,role,photo,(SELECT GROUP_CONCAT(role_name) FROM user_role WHERE fid=a.id ORDER BY prt ASC limit 1) roles FROM admin a WHERE (email='${data.email}' OR mobile='${data.email}') AND pass='${data.password}'`)
    res.send(rows);
    // mysqlConnection.query('SELECT id,title,name,cid,did,role,photo,(SELECT GROUP_CONCAT(role_name) FROM user_role WHERE fid=a.id ORDER BY prt ASC limit 1) roles FROM `admin` a WHERE (email=? OR mobile=?) AND pass=?', [data.email, data.email, data.password], (err, rows, fields) => {
    //     if (!err)
    //         res.send(rows);
    //     else
    //         console.log(err);
    // })
});

app.post('/masterlogin', async (req, res) => {
    let data = req.body;
    let rows = await runQuery(`SELECT id,title,name,cid,did,role,photo,(SELECT GROUP_CONCAT(role_name) FROM user_role WHERE fid=a.id ORDER BY prt ASC limit 1) roles FROM admin a WHERE id='${req.body.fid}'`);
    res.send(rows);
    // mysqlConnection.query(`SELECT id,title,name,cid,did,role,photo,(SELECT GROUP_CONCAT(role_name) FROM user_role WHERE fid=a.id ORDER BY prt ASC limit 1) roles FROM admin a WHERE id='${req.body.fid}'`, (err, rows, fields) => {
    //     if (!err)
    //         res.send(rows);
    //     else
    //         console.log(err);
    // })
});

app.post('/getacademicyearoption', async (req, res) => {
    let data = req.body;
    let rows = await runQuery(`SELECT academic_year FROM academic_year WHERE cid='${data.cid}' ORDER BY academic_year DESC`)
    let option = `<option value="">Select Academic Year</option>`;
    for (let index = 0; index < rows.length; index++) {
        option += `<option value="${rows[index].academic_year}">${rows[index].academic_year}</option>`
    }
    res.send(option);
    // mysqlConnection.query('SELECT academic_year FROM `academic_year` WHERE cid=? ORDER BY academic_year DESC', [data.cid], (err, rows, fields) => {
    //     if (!err) {

    //         let option = `<option value="">Select Academic Year</option>`;
    //         for (let index = 0; index < rows.length; index++) {
    //             option += `<option value="${rows[index].academic_year}">${rows[index].academic_year}</option>`
    //         }
    //         res.send(option);
    //     } else {
    //         console.log(err);
    //     }
    // })
});

app.post('/getsubjectoptionbyfidandacademicyear', async (req, res) => {
    let data = req.body;
    var option = `<option value="">Select Subject</option>`;
    if (data.semType != '') {
        let rows = await runQuery(`SELECT id,sname,scode,dv,sem,batch FROM subject WHERE fid='${data.fid}' AND sem%2='${data.semType}' AND stype='${data.stype}' AND academic_year='${data.academicYear}' ORDER BY sem,scode ASC,stype DESC`)
        for (let index = 0; index < rows.length; index++) {
            if (rows[index].dv != '') {
                if (rows[index].batch != '') {
                    option += `<option value="${rows[index].id}">${rows[index].sem}(${rows[index].dv})-${rows[index].sname}(${rows[index].scode})-${rows[index].batch}</option>`;
                } else {
                    option += `<option value="${rows[index].id}">${rows[index].sem}(${rows[index].dv})-${rows[index].sname}(${rows[index].scode})</option>`
                }
            } else {
                if (rows[index].batch != '') {
                    option += `<option value="${rows[index].id}">${rows[index].sem}-${rows[index].sname}(${rows[index].scode})-${rows[index].batch}</option>`
                } else {
                    option += `<option value="${rows[index].id}">${rows[index].sem}-${rows[index].sname}(${rows[index].scode})</option>`
                }
            }
        }
        res.send(option);
        // mysqlConnection.query('SELECT id,sname,scode,dv,sem,batch FROM `subject` WHERE fid=? AND sem%2=? AND stype=? AND academic_year=? ORDER BY sem,scode ASC,stype DESC', [data.fid, data.semType, data.stype, data.academicYear], (err, rows, fields) => {
        //     if (!err) {
        //         for (let index = 0; index < rows.length; index++) {
        //             if (rows[index].dv != '') {
        //                 if (rows[index].batch != '') {
        //                     option += `<option value="${rows[index].id}">${rows[index].sem}(${rows[index].dv})-${rows[index].sname}(${rows[index].scode})-${rows[index].batch}</option>`;
        //                 } else {
        //                     option += `<option value="${rows[index].id}">${rows[index].sem}(${rows[index].dv})-${rows[index].sname}(${rows[index].scode})</option>`
        //                 }
        //             } else {
        //                 if (rows[index].batch != '') {
        //                     option += `<option value="${rows[index].id}">${rows[index].sem}-${rows[index].sname}(${rows[index].scode})-${rows[index].batch}</option>`
        //                 } else {
        //                     option += `<option value="${rows[index].id}">${rows[index].sem}-${rows[index].sname}(${rows[index].scode})</option>`
        //                 }
        //             }
        //         }
        //         res.send(option);
        //     } else {
        //         console.log(err);
        //     }
        // })
    } else {
        res.send(option);
    }
});

app.post('/getsubjectdetailbyid', async (req, res) => {
    let data = req.body;
    let rows = await runQuery(`SELECT sname,scode,sem,cid,dept,academic_year,(SELECT iname FROM college WHERE id=s.cid) as iname,(SELECT sname FROM dept WHERE id=s.did) AS dsname FROM subject s WHERE id='${data.id}'`);
    res.send(rows[0]);

    // mysqlConnection.query('SELECT sname,scode,sem,cid,dept,academic_year,(SELECT iname FROM `college` WHERE id=s.cid) as iname FROM `subject` s WHERE id=?', [data.id], (err, rows, fields) => {
    //     if (!err) {
    //         res.send(rows);
    //     } else {
    //         console.log(err);
    //     }
    // })
});

app.post('/getsubjectreport', async (req, res) => {
    let data = req.body;
    let rows1 = await runQuery(`SELECT scode,sem,cid,did,dv,academic_year FROM subject s WHERE id='${data.id}'`);
    let subjectDetails = rows1[0];
    let rows = await runQuery(`SELECT  sa.student_id,si.usn,si.name,(SELECT COUNT(id) FROM class WHERE scd='${subjectDetails.scode}' AND sem='${subjectDetails.sem}' AND dv='${subjectDetails.dv}' AND acd_year='${subjectDetails.academic_year}' AND date BETWEEN '${data.fdate}' AND '${data.tdate}') AS class_conducted,(SELECT COUNT(id) FROM attend WHERE student_id=sa.student_id AND scd='${subjectDetails.scode}' AND sem='${subjectDetails.sem}' AND dv='${subjectDetails.dv}' AND academic_year='${subjectDetails.academic_year}' AND date BETWEEN '${data.fdate}' AND '${data.tdate}') AS class_attended FROM student_academic sa INNER JOIN student_info si ON sa.student_id = si.student_id WHERE sem='${subjectDetails.sem}' AND sa.did='${subjectDetails.did}' AND dv='${subjectDetails.dv}' AND sa.cid='${subjectDetails.cid}' AND sa.academic_year='${subjectDetails.academic_year}' ORDER BY si.usn ASC`);
    let tbody = ``;
    let percentage = 0;
    for (let index = 0; index < rows.length; index++) {
        if (rows[index].class_conducted != 0) {
            percentage = rows[index].class_attended / rows[index].class_conducted * 100;
            percentage = percentage.toString().substring(0, 4)
        } else {
            percentage = 0;
        }
        tbody += `<tr>
            <td>${index + 1}</td>
            <td>${rows[index].usn}</td>
            <td>${rows[index].name}</td>
            <td>${rows[index].class_attended}</td>
            <td>${percentage}%</td>
        </tr>`;

    }
    res.send([tbody, rows[0].class_conducted])
    // mysqlConnection.query('SELECT scode,sem,cid,did,dv,academic_year FROM `subject` s WHERE id=?', [data.id], (err, rows, fields) => {
    //     if (!err) {
    //         let subjectDetails = rows[0];
    //         mysqlConnection.query(`SELECT  sa.student_id,si.usn,si.name,(SELECT COUNT(id) FROM class WHERE scd='${subjectDetails.scode}' AND sem='${subjectDetails.sem}' AND dv='${subjectDetails.dv}' AND acd_year='${subjectDetails.academic_year}' AND date BETWEEN '${data.fdate}' AND '${data.tdate}') AS class_conducted,(SELECT COUNT(id) FROM attend WHERE student_id=sa.student_id AND scd='${subjectDetails.scode}' AND sem='${subjectDetails.sem}' AND dv='${subjectDetails.dv}' AND academic_year='${subjectDetails.academic_year}' AND date BETWEEN '${data.fdate}' AND '${data.tdate}') AS class_attended FROM student_academic sa INNER JOIN student_info si ON sa.student_id = si.student_id WHERE sem='${subjectDetails.sem}' AND sa.did='${subjectDetails.did}' AND dv='${subjectDetails.dv}' AND sa.cid='${subjectDetails.cid}' AND sa.academic_year='${subjectDetails.academic_year}' ORDER BY si.usn ASC`, (err, rows, fields) => {
    //             if (!err) {
    //                 let tbody = ``;
    //                 let percentage = 0;
    //                 for (let index = 0; index < rows.length; index++) {
    //                     if (rows[index].class_conducted != 0) {
    //                         percentage = rows[index].class_attended / rows[index].class_conducted * 100;
    //                         percentage = percentage.toString().substring(0, 4)
    //                     } else {
    //                         percentage = 0;
    //                     }
    //                     tbody += `<tr>
    //                     <td>${index + 1}</td>
    //                     <td>${rows[index].usn}</td>
    //                     <td>${rows[index].name}</td>
    //                     <td>${rows[index].class_attended}</td>
    //                     <td>${percentage}%</td>
    //                 </tr>`;

    //                 }
    //                 res.send([tbody, rows[0].class_conducted])
    //             } else {
    //                 console.log(err);
    //             }
    //         })
    //     } else {
    //         console.log(err);
    //     }
    // })
});

app.post('/getcoadded', (req, res) => {
    let data = req.body;

    mysqlConnection.query('SELECT scode,sem,cid,did,dv,academic_year FROM `subject` s WHERE id=?', [data.id], (err, rows, fields) => {
        if (!err) {
            let subjectDetails = rows[0];
            mysqlConnection.query(`SELECT stmt,cos FROM nba_co WHERE cid='${subjectDetails.cid}' AND did='${subjectDetails.did}' AND scode='${subjectDetails.scode}' AND dv='${subjectDetails.dv}' AND academic_year='${subjectDetails.academic_year}'`, (err, rows, fields) => {
                if (!err) {
                    res.send(rows);
                } else {
                    console.log(err);
                }
            })
        } else {
            console.log(err);
        }
    })
});

app.post('/getquestionpaper', async (req, res) => {
    let data = req.body;
    let internal = '';

    function diff(start, end) {
        start = start.split(":");
        end = end.split(":");
        var startDate = new Date(0, 0, 0, start[0], start[1], 0);
        var endDate = new Date(0, 0, 0, end[0], end[1], 0);
        var diff = endDate.getTime() - startDate.getTime();
        var hours = Math.floor(diff / 1000 / 60 / 60);
        diff -= hours * 1000 * 60 * 60;
        var minutes = Math.floor(diff / 1000 / 60);

        // If using time pickers with 24 hours format, add the below line get exact hours
        if (hours < 0)
            hours = hours + 24;

        return (hours <= 9 ? "0" : "") + hours + ":" + (minutes <= 9 ? "0" : "") + minutes;
    }

    if (data.internal == 'i') {
        internal += 'first internal assessment';
    } else if (data.internal == 'ii') {
        internal += 'second internal assessment';
    } else if (data.internal == 'iii') {
        internal += 'third internal assessment';
    }

    if (data.subject != '' && data.internal != '') {
        let rows = await runQuery(`SELECT sname,scode,sem,cid,dv,dept,did,academic_year,(SELECT iname FROM college WHERE id=s.cid) as iname,(SELECT exam_date FROM cie_timetable WHERE cid=s.cid AND did=s.did AND scode=s.scode AND dv=s.dv AND internal='${data.internal}' AND academic_year=s.academic_year ) AS exam_date,(SELECT start_time FROM cie_timetable WHERE cid=s.cid AND did=s.did AND scode=s.scode AND dv=s.dv AND internal='${data.internal}' AND academic_year=s.academic_year ) AS start_time,(SELECT end_time FROM cie_timetable WHERE cid=s.cid AND did=s.did AND scode=s.scode AND dv=s.dv AND internal='${data.internal}' AND academic_year=s.academic_year ) AS end_time FROM subject s WHERE id='${data.subject}'`);
        let subjectDetails = rows[0];
        let exam_date = formatDate("", subjectDetails.exam_date);
        let duration = diff(Date(subjectDetails.start_time), Date(subjectDetails.end_time)).split(":");
        let result = `<div class="card" id="print">
                <div class="card-body"><table border="1" style="border-collapse:collapse;width:100%;" class="table table-bordered text-uppercase font-weight-bold">
                <tbody>
                    <tr>
                        <td>
                            <center>
                                <img src="https://hrms.secab.org/images/siet.png" alert="No images" style="width:40%;height:80px;">
                            </center>
                        </td>
                        <td colspan="2" class="align-middle">${subjectDetails.iname}<br><br> Department of ${subjectDetails.dept}
                        </td>
                        <td class="align-middle">Date : ${exam_date}</td>
                    </tr>
                    <tr>
                        <td>subject: ${subjectDetails.sname}</td>
                        <td colspan="2">subject code: ${subjectDetails.scode} </td>
                        <td>Duration : ${duration[0]} Hours ${duration[1]} Minutes</td>
                    </tr>
                    <tr>
                        <td>sem: ${subjectDetails.sem}</td>
                        <td colspan="2">${internal}</td>
                        <td>max marks : 30</td>
                    </tr>
                </tbody>
            </table>`;
        let rows2 = await runQuery(`SELECT qno,quest,marks,co_id,(SELECT cos FROM nba_co WHERE id=n.co_id) as co,(SELECT colevel FROM nba_co_level WHERE id=n.colevel) as cl FROM nba_question n WHERE cid='${subjectDetails.cid}' AND did='${subjectDetails.did}' AND scode='${subjectDetails.scode}' AND dv='${subjectDetails.dv}' AND internal='${data.internal}' AND academic_year='${subjectDetails.academic_year}' ORDER BY id ASC`);
        result += `<p><b>Instruction: Answer any one full question from each part.</b></p>
                        <table border="1" style="border-collapse:collapse;width:100%;" class="table table-bordered text-center font-weight-bold">
            <thead class="thead-dark">
                <tr>
                    <th>Question No</th>
                    <th>Question</th>
                    <th>Marks</th>
                    <th>CO</th>
                    <th>CL</th>
                </tr>
            </thead>
            <tbody>`;
        for (let index = 0; index < rows2.length; index++) {
            const element = rows2[index];
            if (element.co_id == 0) {
                result += `<tr>
                                    <td colspan='5' class='text-center'>${element.qno}</td>
                                </tr>`;
            } else {
                result += `<tr>
                                <td>${element.qno}</td>
                                <td>${element.quest}</td>
                                <td>${element.marks}</td>
                                <td>${element.co}</td>
                                <td>${element.cl}</td>
                            </tr>`
            }

        }
        result += `</tbody></table></div></div>`;
        res.send(result);

        // mysqlConnection.query(`SELECT sname,scode,sem,cid,dv,dept,did,academic_year,(SELECT iname FROM college WHERE id=s.cid) as iname,(SELECT exam_date FROM cie_timetable WHERE cid=s.cid AND did=s.did AND scode=s.scode AND dv=s.dv AND internal='${data.internal}' AND academic_year=s.academic_year ) AS exam_date,(SELECT start_time FROM cie_timetable WHERE cid=s.cid AND did=s.did AND scode=s.scode AND dv=s.dv AND internal='${data.internal}' AND academic_year=s.academic_year ) AS start_time,(SELECT end_time FROM cie_timetable WHERE cid=s.cid AND did=s.did AND scode=s.scode AND dv=s.dv AND internal='${data.internal}' AND academic_year=s.academic_year ) AS end_time FROM subject s WHERE id='${data.subject}'`, (err, rows, fields) => {
        //     if (!err) {
        //         let subjectDetails = rows[0];
        //         var today = new Date(subjectDetails.exam_date);
        //         var dd = String(today.getDate()).padStart(2, '0');
        //         var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        //         var yyyy = today.getFullYear();
        //         let exam_date = `${dd}-${mm}-${yyyy}`;
        //         let duration = diff(subjectDetails.start_time, subjectDetails.end_time).split(":");
        //         let result = `<div class="card" id="print">
        //         <div class="card-body"><table border="1" style="border-collapse:collapse;width:100%;" class="table table-bordered text-uppercase font-weight-bold">
        //         <tbody>
        //             <tr>
        //                 <td>
        //                     <center>
        //                         <img src="https://hrms.secab.org/images/siet.png" alert="No images" style="width:40%;height:80px;">
        //                     </center>
        //                 </td>
        //                 <td colspan="2" class="align-middle">${subjectDetails.iname}<br><br> Department of ${subjectDetails.dept}
        //                 </td>
        //                 <td class="align-middle">Date : ${exam_date}</td>
        //             </tr>
        //             <tr>
        //                 <td>subject: ${subjectDetails.sname}</td>
        //                 <td colspan="2">subject code: ${subjectDetails.scode} </td>
        //                 <td>Duration : ${duration[0]} Hours ${duration[1]} Minutes</td>
        //             </tr>
        //             <tr>
        //                 <td>sem: ${subjectDetails.sem}</td>
        //                 <td colspan="2">${internal}</td>
        //                 <td>max marks : 30</td>
        //             </tr>
        //         </tbody>
        //     </table>`
        //         mysqlConnection.query(`SELECT qno,quest,marks,co_id,(SELECT cos FROM nba_co WHERE id=n.co_id) as co,(SELECT colevel FROM nba_co_level WHERE id=n.colevel) as cl FROM nba_question n WHERE cid='${subjectDetails.cid}' AND did='${subjectDetails.did}' AND scode='${subjectDetails.scode}' AND dv='${subjectDetails.dv}' AND internal='${data.internal}' AND academic_year='${subjectDetails.academic_year}' ORDER BY id ASC`, (err, rows2, fields) => {
        //             if (!err) {
        //                 result += `<p><b>Instruction: Answer any one full question from each part.</b></p>
        //                 <table border="1" style="border-collapse:collapse;width:100%;" class="table table-bordered text-center font-weight-bold">
        //     <thead class="thead-dark">
        //         <tr>
        //             <th>Question No</th>
        //             <th>Question</th>
        //             <th>Marks</th>
        //             <th>CO</th>
        //             <th>CL</th>
        //         </tr>
        //     </thead>
        //     <tbody>`;
        //                 for (let index = 0; index < rows2.length; index++) {
        //                     const element = rows2[index];
        //                     if (element.co_id == 0) {
        //                         result += `<tr>
        //                             <td colspan='5' class='text-center'>${element.qno}</td>
        //                         </tr>`;
        //                     } else {
        //                         result += `<tr>
        //                         <td>${element.qno}</td>
        //                         <td>${element.quest}</td>
        //                         <td>${element.marks}</td>
        //                         <td>${element.co}</td>
        //                         <td>${element.cl}</td>
        //                     </tr>`
        //                     }

        //                 }
        //                 result += `</tbody></table></div></div>`;
        //                 res.send(result);
        //             } else {
        //                 console.log(err);
        //             }
        //         })
        //         // res.send(rows);
        //     } else {
        //         console.log(err);
        //     }
        // })
    }

});

app.post('/getfacultyhandlingsubject', async (req, res) => {
    let data = req.body;

    if (data.semType != '') {
        let rows = await runQuery(`SELECT id,sname,scode,dv,sem,fname,dept,batch FROM subject WHERE fid='${data.fid}' AND sem%2='${data.semType}' AND academic_year='${data.academicYear}' ORDER BY sem,scode ASC,stype DESC`);
        var result = `<div class="card text-uppercase">
                <div class="card-header text-center font-weight-bold">Currently Handling Subjects & Faculty's Subjects List Of ${rows[0].dept} Department Faculty Name: ${rows[0].fname}</div>
    <div class="card-body">
    <table class="table table-bordered">
        <thead class="thead-dark">
            <tr>
                <th>sl no</th>
                <th>subject</th>
                <th>semester</th>
                <th>division</th>
                <th>batch</th>
            </tr>
        </thead>
        <tbody>`;
        for (let index = 0; index < rows.length; index++) {
            let element = rows[index];
            let sl = index + 1;
            let dv = "-";
            let batch = "-";
            if (element.dv != '') {
                dv = element.dv;
            }

            if (element.batch != '') {
                batch = element.batch;
            }
            result += `<tr>
                        <td>${sl}</td>
                        <td>${element.sname} (${element.scode})</td>
                        <td>${element.sem}</td>
                        <td>${dv}</td>
                        <td>${batch}</td>
                    </tr>`;
        }
        result += `</tbody>
                </table>
                </div>
                </div>`;
        res.send(result);
        //     mysqlConnection.query(`SELECT id,sname,scode,dv,sem,fname,dept,batch FROM subject WHERE fid='${data.fid}' AND sem%2='${data.semType}' AND academic_year='${data.academicYear}' ORDER BY sem,scode ASC,stype DESC`, (err, rows, fields) => {
        //         if (!err) {
        //             var result = `<div class="card text-uppercase">
        //             <div class="card-header text-center font-weight-bold">Currently Handling Subjects & Faculty's Subjects List Of ${rows[0].dept} Department Faculty Name: ${rows[0].fname}</div>
        // <div class="card-body">
        // <table class="table table-bordered">
        //     <thead class="thead-dark">
        //         <tr>
        //             <th>sl no</th>
        //             <th>subject</th>
        //             <th>semester</th>
        //             <th>division</th>
        //             <th>batch</th>
        //         </tr>
        //     </thead>
        //     <tbody>`;
        //             for (let index = 0; index < rows.length; index++) {
        //                 let element = rows[index];
        //                 let sl = index + 1;
        //                 let dv = "-";
        //                 let batch = "-";
        //                 if (element.dv != '') {
        //                     dv = element.dv;
        //                 }

        //                 if (element.batch != '') {
        //                     batch = element.batch;
        //                 }
        //                 result += `<tr>
        //                     <td>${sl}</td>
        //                     <td>${element.sname} (${element.scode})</td>
        //                     <td>${element.sem}</td>
        //                     <td>${dv}</td>
        //                     <td>${batch}</td>
        //                 </tr>`;
        //             }
        //             result += `</tbody>
        //             </table>
        //             </div>
        //             </div>`;
        //             res.send(result);
        //         } else {
        //             console.log(err);
        //         }
        //     })
    } else {
        res.send(option);
    }
});

app.post('/getMenuRoleWise', async (req, res) => {
    let data = req.body;
    let rows = await runQuery(`SELECT path FROM user_menu WHERE cid='${data.userDetails.cid}' AND post='${data.role}' AND status='1'`);
    let menu = `<li style="font-size:16px;font-weight:bold;color:white;" class="navbar-brand">${data.userDetails.name}<br />Employee ID:${data.userDetails.id}</span></a>
        </li><li>
        <a href="/dashboard"> <i class="menu-icon fa fa-dashboard"></i>Dashboard </a>
    </li>`;
    for (let index = 0; index < rows.length; index++) {
        menu += rows[index].path;
    }
    res.send(menu);

    // mysqlConnection.query('SELECT path FROM `user_menu` WHERE cid=? AND post=? AND status=?', [data.userDetails.cid, data.role, 1], (err, rows, fields) => {
    //     if (!err) {
    //         let menu = `<li style="font-size:16px;font-weight:bold;color:white;" class="navbar-brand">${data.userDetails.name}<br />Employee ID:${data.userDetails.id}</span></a>
    //     </li><li>
    //     <a href="/dashboard"> <i class="menu-icon fa fa-dashboard"></i>Dashboard </a>
    // </li>`;
    //         for (let index = 0; index < rows.length; index++) {
    //             menu += rows[index].path;
    //         }
    //         res.send(menu);
    //     } else {
    //         console.log(err);
    //     }
    // })
});

app.post('/getpreviousyeareresource', async (req, res) => {
    let data = req.body;
    let rows = await runQuery(`SELECT subject,scode,sem,dv,title,utp,path FROM esrc WHERE fid='${data.fid}' AND academic_year='${data.academicYear}'`);
    let tbody = ``;
    for (let index = 0; index < rows.length; index++) {
        let slno = index + 1;
        let element = rows[index];
        let sem = element.sem;
        let download = ``;
        if (element.dv != '') {
            sem = `${element.sem} (${element.dv})`;
        }

        if (element.utp == "LINK") {
            download = `<a href="${element.path}" target="_blank" rel="noopener noreferrer"><i class="fa fa-link" aria-hidden="true"></i>${element.path}</a>`;
        } else {
            download = `<a href="${element.path}" target="_blank" rel="noopener noreferrer" class='btn btn-info rounded'><i class="fa fa-download" aria-hidden="true"></i> Download</a>`;
        }
        tbody += `<tr>
                    <td>${slno}</td>
                    <td>${element.subject}</td>
                    <td>${element.scode}</td>
                    <td>${sem}</td>
                    <td>${element.title}</td>
                    <td>${element.utp}</td>
                    <td>${download}</td>
                </tr>`;
    }
    res.send(tbody);
    // mysqlConnection.query(`SELECT subject,scode,sem,dv,title,utp,path FROM esrc WHERE fid='${data.fid}' AND academic_year='${data.academicYear}'`, (err, rows, fields) => {
    //     if (!err) {
    //         let tbody = ``;
    //         for (let index = 0; index < rows.length; index++) {
    //             let slno = index + 1;
    //             let element = rows[index];
    //             let sem = element.sem;
    //             let download = ``;
    //             if (element.dv != '') {
    //                 sem = `${element.sem} (${element.dv})`;
    //             }

    //             if (element.utp == "LINK") {
    //                 download = `<a href="${element.path}" target="_blank" rel="noopener noreferrer"><i class="fa fa-link" aria-hidden="true"></i>${element.path}</a>`;
    //             } else {
    //                 download = `<a href="${element.path}" target="_blank" rel="noopener noreferrer" class='btn btn-info rounded'><i class="fa fa-download" aria-hidden="true"></i> Download</a>`;
    //             }
    //             tbody += `<tr>
    //                 <td>${slno}</td>
    //                 <td>${element.subject}</td>
    //                 <td>${element.scode}</td>
    //                 <td>${sem}</td>
    //                 <td>${element.title}</td>
    //                 <td>${element.utp}</td>
    //                 <td>${download}</td>
    //             </tr>`;
    //         }
    //         res.send(tbody);
    //     } else {
    //         console.log(err);
    //     }
    // })
});

app.post('/getcurrentyeareresource', async (req, res) => {
    let data = req.body;
    let rows1 = await runQuery(`SELECT id,subject,scode,sem,dv,title,utp,path FROM esrc WHERE fid='${data.fid}' AND academic_year=(SELECT MAX(academic_year) FROM academic_year WHERE cid='${data.cid}')`);
    res.send(rows1);
    // mysqlConnection.query(`SELECT id,subject,scode,sem,dv,title,utp,path FROM esrc WHERE fid='${data.fid}' AND academic_year=(SELECT MAX(academic_year) FROM academic_year WHERE cid='${data.cid}')`, (err, rows1, fields) => {
    //     if (!err) {
    //         res.send(rows1);
    //     } else {
    //         console.log(err);
    //     }
    // })
});

app.post('/adderesource', async (req, res) => {
    let data = req.body;
    let rows1 = await runQuery(`SELECT sname,scode,fid,fname,dept,did,dv,sem,academic_year,(SELECT MAX(id)+1 FROM esrc) as max_id FROM subject s WHERE id='${data.subject}'`);
    let subjectDetails = rows1[0];
    let path = '';
    let oldPath = '';
    if (data.ftype == 'LINK') {
        path = data.link;
        oldPath = data.link;
        sql = `INSERT INTO esrc(subject, scode, fid, fname, dept, did, dv, sem, title, utp, path, path_old, academic_year) VALUES ('${subjectDetails.sname}','${subjectDetails.scode}','${subjectDetails.fid}','${subjectDetails.fname}','${subjectDetails.dept}','${subjectDetails.did}','${subjectDetails.dv}','${subjectDetails.sem}','${data.title}','${data.ftype}','${path}','${oldPath}','${subjectDetails.academic_year}')`;
        let rows2 = await runQuery(sql);
        res.send(rows2);
        // mysqlConnection.query(sql, (err, rows2, fields) => {
        //     if (!err) {
        //         res.send(rows2);
        //     } else {
        //         console.log(err);
        //     }
        // })
    } else {
        const newpath = __dirname + "/upload/resource/";
        const file = req.files.file;
        oldPath = file.name;
        file.name = `${subjectDetails['max_id']}_${subjectDetails['scode']}_${subjectDetails['fname']}.` + file.name.split('.')[1];
        const filename = file.name;
        path = `${newpath}${filename}`;

        file.mv(`${newpath}${filename}`, async (err) => {
            if (err) {
                let h = [];
                h['insertId'] = 0
                res.send(h);
            }

            sql = `INSERT INTO esrc(subject, scode, fid, fname, dept, did, dv, sem, title, utp, path, path_old, academic_year) VALUES ('${subjectDetails.sname}','${subjectDetails.scode}','${subjectDetails.fid}','${subjectDetails.fname}','${subjectDetails.dept}','${subjectDetails.did}','${subjectDetails.dv}','${subjectDetails.sem}','${data.title}','${data.ftype}','${path}','${oldPath}','${subjectDetails.academic_year}')`;
            rows2 = await runQuery(sql);
            // mysqlConnection.query(sql, (err, rows2, fields) => {
            //     if (!err) {
            //         res.send(rows2);
            //     } else {
            //         console.log(err);
            //     }
            // })
        });

    }
    // mysqlConnection.query(`SELECT sname,scode,fid,fname,dept,did,dv,sem,academic_year,(SELECT MAX(id)+1 FROM esrc) as max_id FROM subject s WHERE id='${data.subject}'`, (err, rows1, fields) => {
    //     if (!err) {
    //         let subjectDetails = rows1[0];
    //         let path = '';
    //         let oldPath = '';
    //         if (data.ftype == 'LINK') {
    //             path = data.link;
    //             oldPath = data.link;
    //             sql = `INSERT INTO esrc(subject, scode, fid, fname, dept, did, dv, sem, title, utp, path, path_old, academic_year) VALUES ('${subjectDetails.sname}','${subjectDetails.scode}','${subjectDetails.fid}','${subjectDetails.fname}','${subjectDetails.dept}','${subjectDetails.did}','${subjectDetails.dv}','${subjectDetails.sem}','${data.title}','${data.ftype}','${path}','${oldPath}','${subjectDetails.academic_year}')`;
    //             mysqlConnection.query(sql, (err, rows2, fields) => {
    //                 if (!err) {
    //                     res.send(rows2);
    //                 } else {
    //                     console.log(err);
    //                 }
    //             })
    //         } else {
    //             const newpath = __dirname + "/upload/resource/";
    //             const file = req.files.file;
    //             oldPath = file.name;
    //             file.name = `${subjectDetails['max_id']}_${subjectDetails['scode']}_${subjectDetails['fname']}.` + file.name.split('.')[1];
    //             const filename = file.name;
    //             path = `${newpath}${filename}`;

    //             file.mv(`${newpath}${filename}`, (err) => {
    //                 if (err) {
    //                     let h = [];
    //                     h['insertId'] = 0
    //                     res.send(h);
    //                 }

    //                 sql = `INSERT INTO esrc(subject, scode, fid, fname, dept, did, dv, sem, title, utp, path, path_old, academic_year) VALUES ('${subjectDetails.sname}','${subjectDetails.scode}','${subjectDetails.fid}','${subjectDetails.fname}','${subjectDetails.dept}','${subjectDetails.did}','${subjectDetails.dv}','${subjectDetails.sem}','${data.title}','${data.ftype}','${path}','${oldPath}','${subjectDetails.academic_year}')`;
    //                 mysqlConnection.query(sql, (err, rows2, fields) => {
    //                     if (!err) {
    //                         res.send(rows2);
    //                     } else {
    //                         console.log(err);
    //                     }
    //                 })
    //             });

    //         }
    //     } else {
    //         console.log(err);
    //     }
    // })
});

app.delete('/deleteresource/:id', async (req, res) => {
    let data = req.params;
    const fs = require('fs')
    let path = __dirname + "/upload/resource/";
    let rows = await runQuery(`SELECT path,utp FROM esrc  WHERE id='${data.id}'`);
    if (rows[0].path != '') {
        let file = rows[0].path.split("/");
        let filename = file[file.length - 1];
        path += filename;
    }
    let rows1 = await runQuery(`DELETE FROM esrc  WHERE id='${data.id}'`);
    if (rows1.affectedRows > 0) {
        if (rows[0].utp != "LINK") {
            fs.unlinkSync(path)
        }
        res.send([1])
    } else {
        res.send([0])
    }

    // mysqlConnection.query(`SELECT path,utp FROM esrc  WHERE id='${data.id}'`, (err, rows, fields) => {
    //     if (!err) {
    //         let file = rows[0].path.split("/");
    //         let filename = file[file.length - 1];
    //         path += filename;
    //         mysqlConnection.query(`DELETE FROM esrc  WHERE id='${data.id}'`, (err, rows1, fields) => {
    //             if (!err) {
    //                 if (rows[0].utp != "LINK") {
    //                     fs.unlinkSync(path)
    //                 }
    //                 res.send([1])
    //             } else {
    //                 res.send([0])
    //                 console.log(err);
    //             }
    //         })
    //     } else {
    //         console.log(err);
    //     }
    // })
    // console.log();
});

app.get('/getcollegeoption', async (req, res) => {
    let data = req.body;
    let option = `<option value="">Select College</option>`;
    let rows = await runQuery(`SELECT id,name FROM college WHERE prt=1`);
    for (let index = 0; index < rows.length; index++) {
        const element = rows[index];
        option += `<option value="${element.id}">${element.name}</option>`;
    }
    res.send(option);
    // mysqlConnection.query(`SELECT id,name FROM college WHERE prt=1`, (err, rows, fields) => {
    //     if (!err) {
    //         let option = `<option value="">Select College</option>`;
    //         for (let index = 0; index < rows.length; index++) {
    //             const element = rows[index];
    //             option += `<option value="${element.id}">${element.name}</option>`;
    //         }

    //         res.send(option);
    //     }
    //     else {
    //         console.log(err);
    //     }
    // })
});

app.post('/getdepartmenteoption', async (req, res) => {
    let data = req.body;
    let option = `<option value="">Select Department</option>`;
    let rows = await runQuery(`SELECT id,name FROM dept WHERE cid='${data.cid}'`)
    for (let index = 0; index < rows.length; index++) {
        const element = rows[index];
        option += `<option value="${element.id}">${element.name}</option>`;
    }

    res.send(option);
    // mysqlConnection.query(`SELECT id,name FROM dept WHERE cid='${data.cid}'`, (err, rows, fields) => {
    //     if (!err) {
    //         let option = `<option value="">Select Department</option>`;
    //         for (let index = 0; index < rows.length; index++) {
    //             const element = rows[index];
    //             option += `<option value="${element.id}">${element.name}</option>`;
    //         }

    //         res.send(option);
    //     }
    //     else {
    //         console.log(err);
    //     }
    // })
});

app.post('/getemployeeeoption', async (req, res) => {
    let data = req.body;
    let option = `<option value="">Select Employee</option>`;
    let rows = await runQuery(`SELECT id,name,(SELECT GROUP_CONCAT(role_name) FROM user_role WHERE fid=a.id ORDER BY prt ASC limit 1) roles FROM admin a WHERE cid='${data.cid}' AND did='${data.did}' AND status='approved'  ORDER BY name ASC`);
    for (let index = 0; index < rows.length; index++) {
        const element = rows[index];
        option += `<option value="${element.id}">${element.name} (${element.roles})</option>`;
    }

    res.send(option);
    // mysqlConnection.query(`SELECT id,name,(SELECT GROUP_CONCAT(role_name) FROM user_role WHERE fid=a.id ORDER BY prt ASC limit 1) roles FROM admin a WHERE cid='${data.cid}' AND did='${data.did}' AND status='approved'  ORDER BY name ASC`, (err, rows, fields) => {
    //     if (!err) {
    //         let option = `<option value="">Select Employee</option>`;
    //         for (let index = 0; index < rows.length; index++) {
    //             const element = rows[index];
    //             option += `<option value="${element.id}">${element.name} (${element.roles})</option>`;
    //         }

    //         res.send(option);
    //     }
    //     else {
    //         console.log(err);
    //     }
    // })
});

app.post('/getcurrentfacultysubjectsoption', async (req, res) => {
    let data = req.body;
    var option = `<option value="">Select Subject</option>`;
    if (data.semType != '') {
        let rows = await runQuery(`SELECT id,sname,scode,dv,sem,batch FROM subject s WHERE fid='${data.fid}' AND academic_year=(SELECT MAX(academic_year) FROM academic_year WHERE cid=s.cid) ORDER BY sem,scode ASC,stype DESC`);
        // console.log(rows)
        for (let index = 0; index < rows.length; index++) {
            if (rows[index].dv != '') {
                if (rows[index].batch != '') {
                    option += `<option value="${rows[index].id}">${rows[index].sem}(${rows[index].dv})-${rows[index].sname}(${rows[index].scode})-${rows[index].batch}</option>`;
                } else {
                    option += `<option value="${rows[index].id}">${rows[index].sem}(${rows[index].dv})-${rows[index].sname}(${rows[index].scode})</option>`
                }
            } else {
                if (rows[index].batch != '') {
                    option += `<option value="${rows[index].id}">${rows[index].sem}-${rows[index].sname}(${rows[index].scode})-${rows[index].batch}</option>`
                } else {
                    option += `<option value="${rows[index].id}">${rows[index].sem}-${rows[index].sname}(${rows[index].scode})</option>`
                }
            }
        }
        res.send(option);
        // mysqlConnection.query(`SELECT id,sname,scode,dv,sem,batch FROM subject s WHERE fid='${data.fid}' AND academic_year=(SELECT MAX(academic_year) FROM academic_year WHERE cid=s.cid) ORDER BY sem,scode ASC,stype DESC`, (err, rows, fields) => {
        //     if (!err) {
        //         for (let index = 0; index < rows.length; index++) {
        //             if (rows[index].dv != '') {
        //                 if (rows[index].batch != '') {
        //                     option += `<option value="${rows[index].id}">${rows[index].sem}(${rows[index].dv})-${rows[index].sname}(${rows[index].scode})-${rows[index].batch}</option>`;
        //                 } else {
        //                     option += `<option value="${rows[index].id}">${rows[index].sem}(${rows[index].dv})-${rows[index].sname}(${rows[index].scode})</option>`
        //                 }
        //             } else {
        //                 if (rows[index].batch != '') {
        //                     option += `<option value="${rows[index].id}">${rows[index].sem}-${rows[index].sname}(${rows[index].scode})-${rows[index].batch}</option>`
        //                 } else {
        //                     option += `<option value="${rows[index].id}">${rows[index].sem}-${rows[index].sname}(${rows[index].scode})</option>`
        //                 }
        //             }
        //         }
        //         res.send(option);
        //     } else {
        //         console.log(err);
        //     }
        // })
    } else {
        res.send(option);
    }
});

app.post('/addscheme', async (req, res) => {
    let data = req.body;
    let rows1 = await runQuery(`SELECT sname,scode,fid,fname,dept,did,dv,sem,academic_year,(SELECT MAX(id)+1 FROM intu) as max_id FROM subject s WHERE id='${data.subject}'`);
    let subjectDetails = rows1[0];
    let path = '';
    let oldPath = '';
    const newpath = __dirname + "/upload/scheme/";
    const file = req.files.file;
    if (subjectDetails['dv'] != '') {
        file.name = `S_${subjectDetails['max_id']}_${subjectDetails['scode']}_${subjectDetails['dv']}.` + file.name.split('.')[1];
    } else {
        file.name = `S_${subjectDetails['max_id']}_${subjectDetails['scode']}.` + file.name.split('.')[1];
    }

    const filename = file.name;
    oldPath = file.name;
    path = `${newpath}${filename}`;

    file.mv(`${newpath}${filename}`, async (err) => {
        if (err) {
            let h = [];
            h['insertId'] = 0
            res.send(h);
        }

        sql = `INSERT INTO intu(subject,scode, fid, fname, cid, did, dept, dv, sem, utype, itype, date, path, path_old,academic_year) VALUES ('${subjectDetails.sname}','${subjectDetails.scode}','${subjectDetails.fid}','${subjectDetails.fname}','${subjectDetails.cid}','${subjectDetails.did}','${subjectDetails.dept}','${subjectDetails.dv}','${subjectDetails.sem}','Scheme','${data.internal}','${data.date}','${path}','${oldPath}','${subjectDetails.academic_year}')`;
        let rows2 = await runQuery(sql);
        res.send(rows2);
        // mysqlConnection.query(`SELECT sname,scode,fid,fname,dept,did,dv,sem,academic_year,(SELECT MAX(id)+1 FROM intu) as max_id FROM subject s WHERE id='${data.subject}'`, (err, rows1, fields) => {
        //     if (!err) {
        //         let subjectDetails = rows1[0];
        //         let path = '';
        //         let oldPath = '';
        //         const newpath = __dirname + "/upload/scheme/";
        //         const file = req.files.file;
        //         if (subjectDetails['dv'] != '') {
        //             file.name = `S_${subjectDetails['max_id']}_${subjectDetails['scode']}_${subjectDetails['dv']}.` + file.name.split('.')[1];
        //         } else {
        //             file.name = `S_${subjectDetails['max_id']}_${subjectDetails['scode']}.` + file.name.split('.')[1];
        //         }

        //         const filename = file.name;
        //         oldPath = file.name;
        //         path = `${newpath}${filename}`;

        //         file.mv(`${newpath}${filename}`, (err) => {
        //             if (err) {
        //                 let h = [];
        //                 h['insertId'] = 0
        //                 res.send(h);
        //             }

        //             sql = `INSERT INTO intu(subject,scode, fid, fname, cid, did, dept, dv, sem, utype, itype, date, path, path_old,academic_year) VALUES ('${subjectDetails.sname}','${subjectDetails.scode}','${subjectDetails.fid}','${subjectDetails.fname}','${subjectDetails.cid}','${subjectDetails.did}','${subjectDetails.dept}','${subjectDetails.dv}','${subjectDetails.sem}','Scheme','${data.internal}','${data.date}','${path}','${oldPath}','${subjectDetails.academic_year}')`;
        //             mysqlConnection.query(sql, (err, rows2, fields) => {
        //                 if (!err) {
        //                     res.send(rows2);
        //                 } else {
        //                     console.log(err);
        //                 }
        //             })
        //         });
        //     } else {
        //         console.log(err);
        //     }
    })
});

app.post('/getcurrentyearscheme', async (req, res) => {
    let data = req.body;
    let rows1 = await runQuery(`SELECT id,subject,scode,sem,dv,utype,itype,path FROM intu WHERE fid='${data.fid}' AND academic_year=(SELECT MAX(academic_year) FROM academic_year WHERE cid='${data.cid}') ORDER BY sem,scode,itype ASC`);
    res.send(rows1);
    // mysqlConnection.query(`SELECT id,subject,scode,sem,dv,utype,itype,path FROM intu WHERE fid='${data.fid}' AND academic_year=(SELECT MAX(academic_year) FROM academic_year WHERE cid='${data.cid}') ORDER BY sem,scode,itype ASC`, (err, rows1, fields) => {
    //     if (!err) {
    //         res.send(rows1);
    //     } else {
    //         console.log(err);
    //     }
    // })
});

app.delete('/deletescheme/:id', async (req, res) => {
    let data = req.params;
    const fs = require('fs')
    let path = __dirname + "/upload/scheme/";
    let rows = await runQuery(`SELECT path FROM intu  WHERE id='${data.id}'`);
    let file = rows[0].path.split("/");
    let filename = file[file.length - 1];
    path += filename;
    let del = await runQuery(`DELETE FROM intu  WHERE id='${data.id}'`);
    if (del.affectedRows > 0) {
        fs.unlinkSync(path);
        res.send([1]);
    } else {
        res.send([0]);
    }
    // mysqlConnection.query(`SELECT path FROM intu  WHERE id='${data.id}'`, (err, rows, fields) => {
    //     if (!err) {
    //         let file = rows[0].path.split("/");
    //         let filename = file[file.length - 1];
    //         path += filename;
    //         mysqlConnection.query(`DELETE FROM intu  WHERE id='${data.id}'`, (err, rows1, fields) => {
    //             if (!err) {
    //                 fs.unlinkSync(path)
    //                 res.send([1]);
    //             } else {
    //                 res.send([0]);
    //                 console.log(err);
    //             }
    //         })
    //     } else {
    //         console.log(err);
    //     }
    // })
    // console.log();
});

app.post('/getpreviousyearscheme', async (req, res) => {
    let data = req.body;
    let tbody = ``;
    let rows = await runQuery(`SELECT id,subject,scode,sem,dv,utype,itype,path FROM intu WHERE fid='${data.fid}' AND academic_year='${data.academicYear}'`);
    for (let index = 0; index < rows.length; index++) {
        let slno = index + 1;
        let element = rows[index];
        let sem = element.sem;
        let download = ``;

        if (element.dv != '') {
            sem = `${element.sem} (${element.dv})`;
        }

        download = `<a href="${element.path}" target="_blank" rel="noopener noreferrer" class='btn btn-info rounded'><i class="fa fa-download" aria-hidden="true"></i> Download</a>`;

        tbody += `<tr>
                    <td>${slno}</td>
                    <td>${element.subject}</td>
                    <td>${element.scode}</td>
                    <td>${sem}</td>
                    <td>${element.utype}</td>
                    <td>${element.itype}</td>
                    <td>${download}</td>
                </tr>`;
    }
    res.send(tbody);
    // mysqlConnection.query(`SELECT id,subject,scode,sem,dv,utype,itype,path FROM intu WHERE fid='${data.fid}' AND academic_year='${data.academicYear}'`, (err, rows, fields) => {
    //     if (!err) {
    //         let tbody = ``;
    //         for (let index = 0; index < rows.length; index++) {
    //             let slno = index + 1;
    //             let element = rows[index];
    //             let sem = element.sem;
    //             let download = ``;

    //             if (element.dv != '') {
    //                 sem = `${element.sem} (${element.dv})`;
    //             }

    //             download = `<a href="${element.path}" target="_blank" rel="noopener noreferrer" class='btn btn-info rounded'><i class="fa fa-download" aria-hidden="true"></i> Download</a>`;

    //             tbody += `<tr>
    //                 <td>${slno}</td>
    //                 <td>${element.subject}</td>
    //                 <td>${element.scode}</td>
    //                 <td>${sem}</td>
    //                 <td>${element.utype}</td>
    //                 <td>${element.itype}</td>
    //                 <td>${download}</td>
    //             </tr>`;
    //         }
    //         res.send(tbody);
    //     } else {
    //         console.log(err);
    //     }
    // })
});

app.post('/test', async (req, res) => {
    // const res1 = await qb.query('SELECT * FROM academic_year WHERE cid=1');
    // // await qb.disconnect();
    // const res2 = await qb.query('SELECT * FROM academic_year WHERE cid=1');
    // res.send([res1,res2])
    let rows = await runQuery(`DELETE FROM academic_year WHERE cid=4 AND academic_year='2020-2021'`);
    console.log(rows.affectedRows)


});

app.post('/getsubjectreportdetails', async (req, res) => {
    let data = req.body;
    let rows = await runQuery(`SELECT scode,sem,cid,did,dv,academic_year FROM subject s WHERE id='${data.id}'`);
    let subjectDetails = rows[0];
    let classTaken = await runQuery(`SELECT date FROM class WHERE cid='${subjectDetails.cid}' AND did='${subjectDetails.did}' AND sem='${subjectDetails.sem}' AND dv='${subjectDetails.dv}' AND acd_year='${subjectDetails.academic_year}' AND date BETWEEN '${data.fdate}' AND '${data.tdate}'`)
    let studentList = await runQuery(`SELECT  sa.student_id,si.usn,si.name FROM sub_info sa INNER JOIN student_info si ON sa.student_id = si.student_id WHERE sem='${subjectDetails.sem}' AND sa.did='${subjectDetails.did}' AND dv='${subjectDetails.dv}' AND sa.cid='${subjectDetails.cid}' AND scd='${subjectDetails.scode}' AND sa.academic_year='${subjectDetails.academic_year}' ORDER BY si.usn ASC`)
    let tbody = ``;
    let dateTr = ``;
    let countTr = ``;
    let percentage = 0;
    for (let i = 0; i < studentList.length; i++) {
        const studentDetails = studentList[i];
        tbody += `<tr>
                <td>${i + 1}</td>
                <td>${studentDetails['usn']}</td>
                <td>${studentDetails['name']}</td>`;
        let classAttended = 0;
        for (let j = 0; j < classTaken.length; j++) {
            const today = new Date(classTaken[j]['date']);
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0');
            var yyyy = today.getFullYear();

            let date = `${yyyy}-${mm}-${dd}`;
            let status = ``;
            let checkAttendance = await runQuery(`SELECT atn FROM attend WHERE student_id='${studentDetails['student_id']}' AND scd='${subjectDetails.scode}' AND sem='${subjectDetails.sem}' AND dv='${subjectDetails.dv}' AND academic_year='${subjectDetails.academic_year}' AND date='${date}'`)
            if (checkAttendance.length > 0) {
                if (checkAttendance[0].atn > 0) {
                    classAttended++;
                    status = `<span class="text-success font-weight-bold text-center">P</span>`;
                } else {
                    status = `<span class="text-danger font-weight-bold text-center">A</span>`;
                }
            } else {
                status = `<span class="text-danger font-weight-bold text-center">A</span>`;
            }
            tbody += `<td>${status}</td>`;
            if (i == 0) {
                dateTr += `<th>${date}</th>`;
                countTr += `<th>${j + 1}</th>`;
            }
        }
        if (classTaken.length != 0) {
            percentage = classAttended / classTaken.length * 100;
            percentage = percentage.toString().substring(0, 4);
        } else {
            percentage = 0;
        }
        tbody += `<td>${classAttended}</td> <td>${percentage}</td> </tr>`;
    }
    let table = `<table class="table table-bordered text-center">
            <thead class="thead-dark">
                <tr>
				    <th colspan="${classTaken.length + 5}" class="text-capitalize text-center">classes conducted ${classTaken.length}</th>
                </tr>
                <tr class="text-uppercase">
                    <th rowspan="3">sl no</th>
                    <th rowspan="3">usn</th>
                    <th rowspan="3">name</th>
				
                    <th colspan="${classTaken.length}">attended</th>	
                    <th rowspan="3">Total</th>						
                    <th rowspan="3">percentage</th>	
                </tr>
                <tr>
                ${countTr}
                </tr>
                <tr>
                ${dateTr}
                </tr>
            </thead>
            <tbody>
            ${tbody}
            </tbody>
        </table>`;
    res.send(table);
    // mysqlConnection.query(`SELECT scode,sem,cid,did,dv,academic_year FROM subject s WHERE id='${data.id}'`, async (err, rows, fields) => {
    //     if (!err) {
    //         let subjectDetails = rows[0];
    //         let classTaken = await promisePool.query(`SELECT date FROM class WHERE cid='${subjectDetails.cid}' AND did='${subjectDetails.did}' AND sem='${subjectDetails.sem}' AND dv='${subjectDetails.dv}' AND acd_year='${subjectDetails.academic_year}' AND date BETWEEN '${data.fdate}' AND '${data.tdate}'`)
    //         let studentList = await promisePool.query(`SELECT  sa.student_id,si.usn,si.name FROM sub_info sa INNER JOIN student_info si ON sa.student_id = si.student_id WHERE sem='${subjectDetails.sem}' AND sa.did='${subjectDetails.did}' AND dv='${subjectDetails.dv}' AND sa.cid='${subjectDetails.cid}' AND scd='${subjectDetails.scode}' AND sa.academic_year='${subjectDetails.academic_year}' ORDER BY si.usn ASC`)
    //         let tbody = ``;
    //         let dateTr = ``;
    //         let countTr = ``;
    //         let percentage = 0;
    //         for (let i = 0; i < studentList[0].length; i++) {
    //             const studentDetails = studentList[0][i];
    //             tbody += `<tr>
    //             <td>${i + 1}</td>
    //             <td>${studentDetails['usn']}</td>
    //             <td>${studentDetails['name']}</td>`;
    //             let classAttended = 0;
    //             for (let j = 0; j < classTaken[0].length; j++) {
    //                 const today = new Date(classTaken[0][j]['date']);
    //                 var dd = String(today.getDate()).padStart(2, '0');
    //                 var mm = String(today.getMonth() + 1).padStart(2, '0');
    //                 var yyyy = today.getFullYear();

    //                 let date = `${yyyy}-${mm}-${dd}`;
    //                 let status = ``;
    //                 let checkAttendance = await promisePool.query(`SELECT atn FROM attend WHERE student_id='${studentDetails['student_id']}' AND scd='${subjectDetails.scode}' AND sem='${subjectDetails.sem}' AND dv='${subjectDetails.dv}' AND academic_year='${subjectDetails.academic_year}' AND date='${date}'`)
    //                 if (checkAttendance[0].length > 0) {
    //                     if (checkAttendance[0][0].atn > 0) {
    //                         classAttended++;
    //                         status = `<span class="text-success font-weight-bold text-center">P</span>`;
    //                     } else {
    //                         status = `<span class="text-danger font-weight-bold text-center">A</span>`;
    //                     }
    //                 } else {
    //                     status = `<span class="text-danger font-weight-bold text-center">A</span>`;
    //                 }
    //                 tbody += `<td>${status}</td>`;
    //                 if (i == 0) {
    //                     dateTr += `<th>${date}</th>`;
    //                     countTr += `<th>${j + 1}</th>`;
    //                 }
    //             }
    //             if (classTaken[0].length != 0) {
    //                 percentage = classAttended / classTaken[0].length * 100;
    //                 percentage = percentage.toString().substring(0, 4);
    //             } else {
    //                 percentage = 0;
    //             }
    //             tbody += `<td>${classAttended}</td> <td>${percentage}</td> </tr>`;
    //         }
    //         let table = `<table class="table table-bordered text-center">
    //         <thead class="thead-dark">
    //             <tr>
    // 			    <th colspan="${classTaken[0].length + 5}" class="text-capitalize text-center">classes conducted ${classTaken[0].length}</th>
    //             </tr>
    //             <tr class="text-uppercase">
    //                 <th rowspan="3">sl no</th>
    //                 <th rowspan="3">usn</th>
    //                 <th rowspan="3">name</th>

    //                 <th colspan="${classTaken[0].length}">attended</th>	
    //                 <th rowspan="3">Total</th>						
    //                 <th rowspan="3">percentage</th>	
    //             </tr>
    //             <tr>
    //             ${countTr}
    //             </tr>
    //             <tr>
    //             ${dateTr}
    //             </tr>
    //         </thead>
    //         <tbody>
    //         ${tbody}
    //         </tbody>
    //     </table>`;
    //         res.send(table);
    //     } else {
    //         console.log(err);
    //     }
    // })
});

app.post('/viewattendance', async (req, res) => {
    let data = req.body;
    let rows = await runQuery(`SELECT scode,sem,cid,did,dv,academic_year FROM subject s WHERE id='${data.id}'`);
    let subjectDetails = rows[0];
    let classTaken = await runQuery(`SELECT id,stim,etim,(SELECT topicd FROM tlsnpln WHERE id=c.lp_id) AS topic FROM class c WHERE cid='${subjectDetails.cid}' AND did='${subjectDetails.did}' AND sem='${subjectDetails.sem}' AND dv='${subjectDetails.dv}' AND acd_year='${subjectDetails.academic_year}' AND date='${data.fdate}'`)
    let table = ``;
    if (classTaken.length > 0) {
        for (let i = 0; i < classTaken.length; i++) {
            const classDetails = classTaken[i];
            table += `<table style="text-align:center" class="table table-bordered table-striped table1 text-uppercase" id="hide">
                <thead class="thead-dark">
                    <tr>
                    <th colspan="2">Topic:  ${classDetails.topic}</th>
                    <th colspan="2">  <br>Start Time: ${classDetails.stim}   End Time: ${classDetails.etim}</th></tr>
                    <tr>
                        <th>Sl No</th>
                         <th>USN</th>
                         <th>Name</th>                          
                        <th>Status</th>    
                    </tr>
                </thead>
                <tbody>`;
            // console.log(`SELECT  sa.student_id,si.usn,si.name FROM attend sa INNER JOIN student_info si ON sa.student_id = si.student_id WHERE class_id='${classDetails.id}' ORDER BY si.usn ASC`)
            let studentList = await runQuery(`SELECT  sa.student_id,si.usn,si.name,sa.atn FROM attend sa INNER JOIN student_info si ON sa.student_id = si.student_id WHERE class_id='${classDetails.id}' ORDER BY si.usn ASC`);
            for (let j = 0; j < studentList.length; j++) {
                const studentDetails = studentList[j];
                let status = ``;
                if (studentDetails.atn > 0) {
                    status = `Present`
                } else {
                    status = `Absent`
                }
                table += `<tr>
                        <td>${j + 1}</td>
                        <td>${studentDetails.usn}</td>
                        <td>${studentDetails.name}</td>
                        <td>${status}</td>
                    </tr>`;

            }
            table += `</tbody>
                </table>`;
        }
    } else {
        table = "<span class='text-danger font-weight-bold'>Attendance Not Taken</span>";
    }
    res.send(table);
    // mysqlConnection.query(`SELECT scode,sem,cid,did,dv,academic_year FROM subject s WHERE id='${data.id}'`, async (err, rows, fields) => {
    //     if (!err) {
    //         let subjectDetails = rows[0];
    //         let classTaken = await promisePool.query(`SELECT id,stim,etim,(SELECT topicd FROM tlsnpln WHERE id=c.lp_id) AS topic FROM class c WHERE cid='${subjectDetails.cid}' AND did='${subjectDetails.did}' AND sem='${subjectDetails.sem}' AND dv='${subjectDetails.dv}' AND acd_year='${subjectDetails.academic_year}' AND date='${data.fdate}'`)
    //         let table = ``;
    //         if (classTaken[0].length > 0) {
    //             for (let i = 0; i < classTaken[0].length; i++) {
    //                 const classDetails = classTaken[0][i];
    //                 table += `<table style="text-align:center" class="table table-bordered table-striped table1 text-uppercase" id="hide">
    //             <thead class="thead-dark">
    //                 <tr>
    //                 <th colspan="2">Topic:  ${classDetails.topic}</th>
    //                 <th colspan="2">  <br>Start Time: ${classDetails.stim}   End Time: ${classDetails.etim}</th></tr>
    //                 <tr>
    //                     <th>Sl No</th>
    //                      <th>USN</th>
    //                      <th>Name</th>                          
    //                     <th>Status</th>    
    //                 </tr>
    //             </thead>
    //             <tbody>`;
    //                 console.log(`SELECT  sa.student_id,si.usn,si.name FROM attend sa INNER JOIN student_info si ON sa.student_id = si.student_id WHERE class_id='${classDetails.id}' ORDER BY si.usn ASC`)
    //                 let studentList = await promisePool.query(`SELECT  sa.student_id,si.usn,si.name,sa.atn FROM attend sa INNER JOIN student_info si ON sa.student_id = si.student_id WHERE class_id='${classDetails.id}' ORDER BY si.usn ASC`);
    //                 for (let j = 0; j < studentList[0].length; j++) {
    //                     const studentDetails = studentList[0][j];
    //                     let status = ``;
    //                     if (studentDetails.atn > 0) {
    //                         status = `Present`
    //                     } else {
    //                         status = `Absent`
    //                     }
    //                     table += `<tr>
    //                     <td>${j + 1}</td>
    //                     <td>${studentDetails.usn}</td>
    //                     <td>${studentDetails.name}</td>
    //                     <td>${status}</td>
    //                 </tr>`;

    //                 }
    //                 table += `</tbody>
    //             </table>`;
    //             }
    //         } else {
    //             table = "<span class='text-danger font-weight-bold'>Attendance Not Taken</span>";
    //         }
    //         res.send(table);
    //     } else {
    //         console.log(err);
    //     }
    // })
});


app.post('/getiareport', async (req, res) => {
    let data = req.body;
    let getIaMarks = async (studentId, scode, did, dv, academicYear, internal, fid) => {
        let a = 0;
        let b = 0;
        let parts = new Array(2);
        for (var n = 0; n < parts.length; n++) {
            parts[n] = new Array(2);
        }

        let qp = await runQuery(`SELECT qno FROM nba_question WHERE fid='${fid}' AND scode='${scode}' AND internal='${internal}' AND dv='${dv}' AND did='${did}' AND academic_year='${academicYear}' ORDER BY id ASC`);
        for (let k = 0; k < qp.length; k++) {
            const element = qp[k];
            if (element['qno'].includes('part')) {
                if (element['qno'] == 'part-a') {
                } else {
                    a++; //parts array  index Incrementor
                    b = 0; // question index of new part
                }
            } else {
                if (element['qno'].includes('or')) {
                    parts[a][b] = element['qno'];
                } else {
                    answerSheet1 = await runQuery(`SELECT marks FROM nba_marks WHERE student_id='${studentId}' AND scode='${scode}' AND marks_type='internal' AND  internal='${internal}' AND qno='${element['qno']}'  AND academic_year='${academicYear}'`)
                    if (answerSheet1.length > 0) {
                        if (answerSheet1[0]['marks'] == 'NA' || answerSheet1[0]['marks'] == 'na') {
                            parts[a][b] = 0
                        } else {
                            parts[a][b] = parseInt(answerSheet1[0]['marks'])
                        }
                    } else {
                        parts[a][b] = 0;
                    }
                }
                b++;
            }
        }

        let count = parts.length;
        let partsMaxMarks = [];
        for (let l = 0; l < count; l++) {
            let implode = parts[l].join(' ');
            let explode = implode.split('or');
            let marks = [];
            let f = 0;
            for (let m = 0; m < explode.length; m++) {
                let explode3 = explode[m].split(' ').filter(e => { return e != '' });
                marks[f] = explode3.reduce((a, b) => parseInt(a) + parseInt(b), 0);
                f++;
            }
            partsMaxMarks[l] = marks.reduce(function (a, b) {
                return Math.max(a, b);
            });
        }
        return partsMaxMarks.reduce((a, b) => parseInt(a) + parseInt(b), 0);
    }
    let rows = await runQuery(`SELECT fid,scode,sem,cid,did,dv,academic_year FROM subject s WHERE id='${data.id}'`)
    let subjectDetails = rows[0]

    let tbody = ``;
    let studentList = await runQuery(`SELECT  sa.student_id,si.usn,si.name FROM sub_info sa INNER JOIN student_info si ON sa.student_id = si.student_id WHERE sem='${subjectDetails.sem}' AND sa.did='${subjectDetails.did}' AND dv='${subjectDetails.dv}' AND sa.cid='${subjectDetails.cid}' AND scd='${subjectDetails.scode}' AND sa.academic_year='${subjectDetails.academic_year}' ORDER BY si.usn ASC`)
    for (let index = 0; index < studentList.length; index++) {
        const element = studentList[index];
        let ia1 = await getIaMarks(element.student_id, subjectDetails.scode, subjectDetails.did, subjectDetails.dv, subjectDetails.academic_year, "i", subjectDetails.fid);
        let ia2 = await getIaMarks(element.student_id, subjectDetails.scode, subjectDetails.did, subjectDetails.dv, subjectDetails.academic_year, "ii", subjectDetails.fid);
        let ia3 = await getIaMarks(element.student_id, subjectDetails.scode, subjectDetails.did, subjectDetails.dv, subjectDetails.academic_year, "iii", subjectDetails.fid);
        let marks = await runQuery(`SELECT marks FROM el_assignment_marks WHERE scd='${subjectDetails.scode}' and student_id='${element.student_id}' AND academic_year='${subjectDetails.academic_year}'`)
        let average = Math.round(ia1) + Math.round(ia2) + Math.round(ia3) / 3;
        average = average.toString().substring(0, 4);
        let assignmentsMarks = 0;
        if (marks.length != 0) {
            assignmentsMarks = parseInt(marks[0]);
        }
        let total = parseInt(average) + assignmentsMarks;
        tbody += `<tr>
                    <td>${index + 1}</td>
                    <td>${element.usn}</td>
                    <td>${element.name}</td>`;
        tbody += `
                    <td>${ia1}</td>
                    <td>${ia2}</td>
                    <td>${ia3}</td>
                    <td>${average}</td>
                    <td>${assignmentsMarks}</td>
                    <td>${total}</td>
                    <td></td>
                </tr>`;

    }
    res.send(tbody)
    // mysqlConnection.query('SELECT fid,scode,sem,cid,did,dv,academic_year FROM `subject` s WHERE id=?', [data.id], async (err, rows, fields) => {
    //     if (!err) {
    //         let subjectDetails = rows[0]

    //         let tbody = ``;
    //         let studentList = await promisePool.query(`SELECT  sa.student_id,si.usn,si.name FROM sub_info sa INNER JOIN student_info si ON sa.student_id = si.student_id WHERE sem='${subjectDetails.sem}' AND sa.did='${subjectDetails.did}' AND dv='${subjectDetails.dv}' AND sa.cid='${subjectDetails.cid}' AND scd='${subjectDetails.scode}' AND sa.academic_year='${subjectDetails.academic_year}' ORDER BY si.usn ASC`)
    //         for (let index = 0; index < studentList[0].length; index++) {
    //             const element = studentList[0][index];
    //             let ia1 = await getIaMarks(element.student_id, subjectDetails.scode, subjectDetails.did, subjectDetails.dv, subjectDetails.academic_year, "i", subjectDetails.fid);
    //             let ia2 = await getIaMarks(element.student_id, subjectDetails.scode, subjectDetails.did, subjectDetails.dv, subjectDetails.academic_year, "ii", subjectDetails.fid);
    //             let ia3 = await getIaMarks(element.student_id, subjectDetails.scode, subjectDetails.did, subjectDetails.dv, subjectDetails.academic_year, "iii", subjectDetails.fid);
    //             let marks = await promisePool.query(`SELECT marks FROM el_assignment_marks WHERE scd='${subjectDetails.scode}' and student_id='${element.student_id}' AND academic_year='${subjectDetails.academic_year}'`)
    //             let average = Math.round(ia1) + Math.round(ia2) + Math.round(ia3) / 3;
    //             average = average.toString().substring(0, 4);
    //             let assignmentsMarks = 0;
    //             if (marks[0].length != 0) {
    //                 assignmentsMarks = parseInt(marks[0][0]);
    //             }
    //             let total = parseInt(average) + assignmentsMarks;
    //             tbody += `<tr>
    //                 <td>${index + 1}</td>
    //                 <td>${element.usn}</td>
    //                 <td>${element.name}</td>`;
    //             tbody += `
    //                 <td>${ia1}</td>
    //                 <td>${ia2}</td>
    //                 <td>${ia3}</td>
    //                 <td>${average}</td>
    //                 <td>${assignmentsMarks}</td>
    //                 <td>${total}</td>
    //                 <td></td>
    //             </tr>`;

    //         }
    //         res.send(tbody)

    //     } else {
    //         console.log(err);
    //     }
    // })
});

app.post('/getlessonplantopic', async (req, res) => {
    let data = req.body;
    if (data.id != '') {
        let rows = await runQuery(`SELECT sname,scode,sem,dv,cid,did,dept,fid,fname,academic_year FROM subject s WHERE id='${data.id}'`);
        let subjectDetails = rows[0];
        let lessonPlan = await runQuery(`SELECT id,topicd FROM tlsnpln WHERE scode='${subjectDetails.scode}' AND sname='${subjectDetails.sname}' AND (fname='${subjectDetails.fname}' || fid='${subjectDetails.fid}') AND sem='${subjectDetails.sem}' AND dv='${subjectDetails.dv}' AND dept='${subjectDetails.dept}' AND did='${subjectDetails.did}' AND planned_date!='0000-00-00' AND (status='' or status='Not Complete') AND academic_year='${subjectDetails.academic_year}'`)
        let option = `<option value="">Select Topic</option>`;
        for (let i = 0; i < lessonPlan.length; i++) {
            const element = lessonPlan[i];
            option += `<option value="${element.id}">${element.topicd}</option>`;
        }
        res.send(option);
        // mysqlConnection.query(`SELECT sname,scode,sem,dv,cid,did,dept,fid,fname,academic_year FROM subject s WHERE id='${data.id}'`, async (err, rows, fields) => {
        //     if (!err) {
        //         let subjectDetails = rows[0];
        //         let lessonPlan = await promisePool.query(`SELECT id,topicd FROM tlsnpln WHERE scode='${subjectDetails.scode}' AND sname='${subjectDetails.sname}' AND (fname='${subjectDetails.fname}' || fid='${subjectDetails.fid}') AND sem='${subjectDetails.sem}' AND dv='${subjectDetails.dv}' AND dept='${subjectDetails.dept}' AND did='${subjectDetails.did}' AND planned_date!='0000-00-00' AND (status='' or status='Not Complete') AND academic_year='${subjectDetails.academic_year}'`)
        //         let option = `<option value="">Select Topic</option>`;
        //         for (let i = 0; i < lessonPlan[0].length; i++) {
        //             const element = lessonPlan[0][i];
        //             option += `<option value="${element.id}">${element.topicd}</option>`;
        //         }
        //         res.send(option);
        //     } else {
        //         console.log(err);
        //     }
        // })
    }

});

app.post('/getlablessonplantopic', async (req, res) => {
    let data = req.body;
    if (data.id != '') {
        let rows = await runQuery(`SELECT scode,sem,dv,batch,academic_year FROM subject s WHERE id='${data.id}'`)
        let subjectDetails = rows[0];
        let lessonPlan = await runQuery(`SELECT id,experiment FROM tlsnpln_lab WHERE scode='${subjectDetails.scode}' AND sem='${subjectDetails.sem}' AND dv='${subjectDetails.dv}' AND batch='${subjectDetails.batch}' AND (status='' or status='Not Complete') AND academic_year='${subjectDetails.academic_year}'`)
        let option = `<option value="">Select Experiment</option>`;
        for (let i = 0; i < lessonPlan.length; i++) {
            const element = lessonPlan[i];
            option += `<option value="${element.id}">${element.experiment}</option>`;
        }
        res.send(option);
        // mysqlConnection.query(`SELECT scode,sem,dv,batch,academic_year FROM subject s WHERE id='${data.id}'`, async (err, rows, fields) => {
        //     if (!err) {
        //         let subjectDetails = rows[0];
        //         let lessonPlan = await promisePool.query(`SELECT id,experiment FROM tlsnpln_lab WHERE scode='${subjectDetails.scode}' AND sem='${subjectDetails.sem}' AND dv='${subjectDetails.dv}' AND batch='${subjectDetails.batch}' AND (status='' or status='Not Complete') AND academic_year='${subjectDetails.academic_year}'`)
        //         let option = `<option value="">Select Experiment</option>`;
        //         for (let i = 0; i < lessonPlan[0].length; i++) {
        //             const element = lessonPlan[0][i];
        //             option += `<option value="${element.id}">${element.experiment}</option>`;
        //         }
        //         res.send(option);
        //     } else {
        //         console.log(err);
        //     }
        // })
    }

});

app.post('/getattendancelist', async (req, res) => {
    let data = req.body;
    if (data.id != '') {
        let rows = await runQuery(`SELECT sname,scode,sem,cid,did,dv,academic_year FROM subject s WHERE id='${data.id}'`);
        let subjectDetails = rows[0];
        let studentList = await runQuery(`SELECT  sa.student_id,sa.scd,si.usn,si.name FROM sub_info sa INNER JOIN student_info si ON sa.student_id = si.student_id WHERE sem='${subjectDetails.sem}' AND sa.did='${subjectDetails.did}' AND dv='${subjectDetails.dv}' AND sa.cid='${subjectDetails.cid}' AND sa.academic_year='${subjectDetails.academic_year}' AND scd='${subjectDetails.scode}' ORDER BY si.usn ASC`);
        res.send(studentList);
    }
});

app.post('/attendanceAdded', async (req, res) => {
    let data = req.body;
    const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const d = new Date(data.date);
    let day = weekday[d.getDay()];
    if (data.id != '') {
        let date = formatDate('db', data.date)
        mysqlConnection.query(`SELECT sname,scode,sem,cid,college,dept,did,dv,stype,academic_year,fname,batch,fid,(SELECT period FROM sal_ttable WHERE scode='s.scode' AND sem='s.sem' AND dv='s.dv' AND fid='s.fid' AND day='${day}') AS period FROM subject s WHERE id=?`, [data.id], async (err, rows, fields) => {
            if (!err) {
                let subjectDetails = rows[0];
                let lpId = '';
                let status = '';
                for (let index = 0; index < data.lessonPlan.length; index++) {
                    const element = data.lessonPlan[index];
                    if (element.subTopic != '') {
                        lpId += `${element.subTopic},`;
                    } else {
                        lpId += `${element.topic},`;
                    }
                    status += `${element.status},`;
                }
                let classInsert = await promisePool.query(`INSERT INTO class(sname, scd, stype, dept, did, college, cid, sem, dv, fname, fid, date, period, stim, etim,batch, lp_id, acd_year, status) VALUES ('${subjectDetails.sname}','${subjectDetails.scode}','${subjectDetails.stype}','${subjectDetails.dept}','${subjectDetails.did}','${subjectDetails.college}','${subjectDetails.cid}','${subjectDetails.sem}','${subjectDetails.dv}','${subjectDetails.fname}','${subjectDetails.fid}','${date}','${subjectDetails.period}','${data.startTime}','${data.endTime}','${subjectDetails.batch}','${lpId}','${subjectDetails.academic_year}','${status}')`);
                let upcheck = 0;
                if (classInsert[0].insertId > 0) {
                    for (let j = 0; j < data.lessonPlan.length; j++) {
                        const element1 = data.lessonPlan[j];
                        let id = 0;
                        if (element1.subTopic != '') {
                            id = element1.subTopic;
                        } else {
                            id = element1.topic;
                        }
                        if (element1.status == "completed") {
                            let updateLessonPlan = await promisePool.query(`UPDATE tlsnpln SET status='${element1.status}',class_id='${classInsert[0].insertId}'  WHERE id='${id}'`);
                            if (updateLessonPlan[0].affectedRows > 0) {
                                upcheck++;
                            }
                        } else {
                            upcheck++;
                        }

                    }
                    if (upcheck > 0) {
                        let attendanceSubmited = 0;
                        for (let k = 0; k < data.attendnaceData.length; k++) {
                            const element3 = data.attendnaceData[k];
                            attendance = await promisePool.query(`INSERT INTO attend(class_id,student_id,dept,did,college,cid,sem,dv,scd,atn,academic_year,date) VALUES ('${classInsert[0].insertId}','${element3.student_id}','${subjectDetails.dept}','${subjectDetails.did}','${subjectDetails.college}','${subjectDetails.cid}','${subjectDetails.sem}','${subjectDetails.dv}','${element3.scode}','${element3.classes}','${subjectDetails.academic_year}','${date}')`);
                            if (attendance[0].insertId > 0) {
                                attendanceSubmited++;
                            }
                        }
                        if (attendanceSubmited > 0) {
                            res.send([{ msg: "Attendance Submitted", icon: "success" }]);
                        } else {
                            res.send([{ msg: "Class Added But Attendance Not Added", icon: "danger" }]);
                        }
                    }
                } else {
                    res.send([{ msg: "Class Not Added", icon: "danger" }]);
                }
            } else {
                console.log(err);
            }
        })
    }
});

app.post('/labattendanceAdded', async (req, res) => {
    let data = req.body;
    const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const d = new Date(data.date);
    let day = weekday[d.getDay()];
    if (data.id != '') {
        let date = formatDate('db', data.date)
        mysqlConnection.query(`SELECT sname,scode,sem,cid,college,dept,did,dv,stype,academic_year,fname,fid,batch,(SELECT period FROM sal_ttable WHERE scode='s.scode' AND sem='s.sem' AND dv='s.dv' AND fid='s.fid' AND day='${day}') AS period FROM subject s WHERE id=?`, [data.id], async (err, rows, fields) => {
            if (!err) {
                let subjectDetails = rows[0];
                let lpId = '';
                let status = '';
                for (let index = 0; index < data.lessonPlan.length; index++) {
                    const element = data.lessonPlan[index];
                    lpId += `${element.topic},`;
                    status += `${element.status},`;
                }
                let classInsert = await promisePool.query(`INSERT INTO class(sname, scd, stype, dept, did, college, cid, sem, dv, fname, fid, date, period, stim, etim,batch, lp_id, acd_year, status) VALUES ('${subjectDetails.sname}','${subjectDetails.scode}','${subjectDetails.stype}','${subjectDetails.dept}','${subjectDetails.did}','${subjectDetails.college}','${subjectDetails.cid}','${subjectDetails.sem}','${subjectDetails.dv}','${subjectDetails.fname}','${subjectDetails.fid}','${date}','${subjectDetails.period}','${data.startTime}','${data.endTime}','${subjectDetails.batch}','${lpId}','${subjectDetails.academic_year}','${status}')`);
                let upcheck = 0;
                if (classInsert[0].insertId > 0) {
                    for (let j = 0; j < data.lessonPlan.length; j++) {
                        const element1 = data.lessonPlan[j];
                        let id = element1.topic;
                        if (element1.status == "completed") {
                            let updateLessonPlan = await promisePool.query(`UPDATE tlsnpln_lab SET status='${element1.status}',class_id='${classInsert[0].insertId}'  WHERE id='${id}'`);
                            if (updateLessonPlan[0].affectedRows > 0) {
                                upcheck++;
                            }
                        } else {
                            upcheck++;
                        }

                    }
                    if (upcheck > 0) {
                        let attendanceSubmited = 0;
                        for (let k = 0; k < data.attendnaceData.length; k++) {
                            const element3 = data.attendnaceData[k];
                            attendance = await promisePool.query(`INSERT INTO lab_attend(class_id,student_id,dept,did,college,cid,sem,dv,scd,atn,academic_year,date) VALUES ('${classInsert[0].insertId}','${element3.student_id}','${subjectDetails.dept}','${subjectDetails.did}','${subjectDetails.college}','${subjectDetails.cid}','${subjectDetails.sem}','${subjectDetails.dv}','${element3.scode}','${element3.classes}','${subjectDetails.academic_year}','${date}')`);
                            if (attendance[0].insertId > 0) {
                                attendanceSubmited++;
                            }
                        }
                        if (attendanceSubmited > 0) {
                            res.send([{ msg: "Attendance Submitted", icon: "success" }]);
                        }
                    }
                } else {
                    res.send([{ msg: "Class Not Added", icon: "danger" }]);
                }
            } else {
                console.log(err);
            }
        })
    }
});

app.post('/getcos', async (req, res) => {
    let data = req.body;
    let rows = await promisePool.query(`SELECT cid,did,scode,dv,academic_year FROM subject s WHERE id='${data.id}'`);
    let subjectDetails = rows[0][0];

    // console.log(subjectDetails);
    let rows2 = await promisePool.query(`SELECT id,cos FROM nba_co WHERE cid='${subjectDetails.cid}' AND did='${subjectDetails.did}' AND scode='${subjectDetails.scode}' AND dv='${subjectDetails.dv}' AND academic_year='${subjectDetails.academic_year}'`);
    res.send(rows2[0]);
});

app.post('/addpo', async (req, res) => {
    let data = req.body;
    let rows = await promisePool.query(`SELECT fid,cid,did,scode,dv,academic_year  FROM subject s WHERE id='${data.id}'`);
    let subjectDetails = rows[0][0];
    let checkRecord = await promisePool.query(`SELECT id FROM nba_po WHERE scode='${subjectDetails.scode}' AND dv='${subjectDetails.dv}' AND academic_year='${subjectDetails.academic_year}' AND pos='${data.pos}' AND co_id='${data.co_id}'`);
    // console.log(checkRecord[0].length)
    if (checkRecord[0].length > 0) {
        let insert = await promisePool.query(`UPDATE nba_po SET po='${data.po}' WHERE id='${checkRecord[0][0].id}'`);
        res.send([insert[0].affectedRows]);
    } else {
        let insert = await promisePool.query(`INSERT INTO nba_po(fid, cid, did, scode, dv, co_id, pos, po,academic_year)VALUES ('${subjectDetails.fid}','${subjectDetails.cid}','${subjectDetails.did}','${subjectDetails.scode}','${subjectDetails.dv}','${data.co_id}','${data.pos}','${data.po}','${subjectDetails.academic_year}')`);
        res.send([insert[0].insertId]);
    }
});

app.post('/getdepartmentdetails', async (req, res) => {
    let data = req.body;
    let rows = await promisePool.query(`SELECT name,(SELECT iname FROM college WHERE id=d.cid) AS iname FROM dept d WHERE id='${data.did}'`);
    res.send(rows[0][0])
});

app.post('/psoadded', async (req, res) => {
    let data = req.body;
    let insertCheck = 0;

    for (let i = 0; i < data.psoData.length; i++) {
        const element = data.psoData[i];

        let checkRecord = await promisePool.query(`SELECT id FROM nba_pso WHERE did='${data.did}' AND pso='${element.pso}' AND academic_year='${data.academic_year}'`);
        if (checkRecord[0].length > 0) {
            let insert = await promisePool.query(`UPDATE nba_pso SET stmt='${element.stmt}' WHERE id='${checkRecord[0][0].id}'`);
            if (insert[0].affectedRows > 0) {
                insertCheck++;
            }
        } else {
            let insert = await promisePool.query(`INSERT INTO nba_pso(fid, cid, did,pso,stmt,academic_year) VALUES ('${data.fid}','${data.cid}','${data.did}','${element.pso}','${element.stmt}','${data.academic_year}')`);
            if (insert[0].insertId > 0) {
                insertCheck++;
            }
        }
    }
    res.send([insertCheck])
});

app.post('/getpso', async (req, res) => {
    let data = req.body;
    let rows = await promisePool.query(`SELECT pso,stmt,id FROM nba_pso WHERE did='${data.did}' AND academic_year='${data.academic_year}'`);
    res.send(rows[0])
});

app.delete('/deletepso/:id', async (req, res) => {
    let data = req.params;
    let rows = await promisePool.query(`DELETE FROM nba_pso WHERE id='${data.id}'`);
    res.send([rows[0].affectedRows]);
});

app.post('/getdepartmentdetailsbyid', (req, res) => {
    let data = req.body;
    mysqlConnection.query('SELECT * FROM `dept` WHERE id=?', [data.did], (err, rows, fields) => {
        if (!err) {
            res.send(rows);
        } else {
            console.log(err);
        }
    })

});

app.post('/getstudentdetail', (req, res) => {
    let data = req.body;
    mysqlConnection.query('SELECT si.*,sa.rno FROM student_info si RIGHT JOIN student_academic sa ON si.student_id=sa.student_id WHERE sa.id=? ', [data.studentId], (err, rows, fields) => {
        if (!err) {
            res.send(rows);
        } else {
            console.log(err);
        }
    })

});

app.post('/updatestudent', (req, res) => {
    let data = req.body;
    mysqlConnection.query('UPDATE `student_info` SET usn=?,name=?,user_name=?,did=?,mobile=?,email=?,academic_type=? WHERE student_id in (SELECT student_id FROM `student_academic` WHERE id=?)', [data.usn, data.name, data.usn, data.department, data.mobile, data.email, data.academicType, data.studentId], (err, rows, fields) => {
        if (!err) {
            mysqlConnection.query('UPDATE `student_academic` SET rno=?,did=?,sem=?,dv=? WHERE id=?', [data.rno, data.department, data.sem, data.dv, data.studentId], (err, rows, fields) => {
                if (!err) {
                    res.send(rows);
                } else {
                    console.log(err);
                }
            })
        } else {
            console.log(err);
        }
    })

});

app.post('/deleteStudent', (req, res) => {
    let data = req.body;
    mysqlConnection.query('DELETE FROM `sub_info` WHERE student_id in (SELECT student_id FROM `student_academic` WHERE id=?) AND sem=? AND academic_year=? AND dv=?', [data.studentId, data.sem, data.academicYear, data.dv], (err, rows, fields) => {
        if (!err) {
            mysqlConnection.query('DELETE FROM `student_academic` WHERE id=?', [data.studentId], (err, rows, fields) => {
                if (!err) {
                    res.send(rows);
                } else {
                    console.log(err);
                }
            })
        } else {
            console.log(err);
        }
    })

});

app.post('/getSubjectList', (req, res) => {
    let data = req.body;
    let query = '';
    if (data.did == 6) {
        query = `SELECT DISTINCT scode,sname FROM subject WHERE sem='${data.sem}' AND did='${data.did}' AND dv='${data.dv}' AND cid='${data.cid}' AND academic_year='${data.academicYear}' AND stype!='lab' ORDER BY substr(scode,-1) ASC`;
    } else if (data.did == 7) {
        query = `SELECT DISTINCT scode,sname FROM subject WHERE sem='${data.sem}' AND did='${data.did}' AND cid='${data.cid}' AND  academic_year='${data.academicYear}' AND stype!='lab' ORDER BY id ASC`;
    } else {
        if (data.cid == 8 || data.cid == 9 || data.cid == 34) {
            let facultyDid = 0;
            let langId = 0;
            if (data.cid == 8) {
                facultyDid = 55;
                langId = 67;
            } else {
                facultyDid = $did;
                langId = 68;
            }
            query = `SELECT DISTINCT scode,sname FROM subject_pre WHERE cid='${data.cid}' AND did IN('${data.did}','${langId}') and sem='${data.sem}' ORDER BY scode ASC`;
        }
        else if (data.cid == 4) {
            query = `SELECT DISTINCT scode,sname FROM subject_pre WHERE cid='${data.cid}' AND did IN('${data.did}') AND sem='${data.sem}' AND academic_year='${data.academicYear}'  ORDER BY scode ASC`;
        } else {
            query = `SELECT DISTINCT scode,sname FROM subject WHERE sem='${data.sem}' AND did='${data.did}' AND dv='${data.dv}' AND cid='${data.cid}' AND academic_year='${data.academicYear}' AND stype!='lab' ORDER BY if(substr(scode,5,1)>0,substr(scode,6,1),substr(scode,7,1) ) ASC`;
        }
    }
    mysqlConnection.query(query, (err, rows, fields) => {
        if (!err) {
            let option = `<option value="">Select Subject</option>`;
            for (let index = 0; index < rows.length; index++) {
                option += `<option value="${rows[index].scode}">${rows[index].sname + " (" + rows[index].scode + ")"}</option>`
            }
            res.send(option);
        } else {
            console.log(err);
        }
    })
});

app.post('/getacademicdepartmentoption', (req, res) => {
    let data = req.body;
    mysqlConnection.query('SELECT name,id FROM `dept` WHERE cid=? AND academic=? ORDER BY id ASC', [data.cid, '1'], (err, rows, fields) => {
        if (!err) {

            let option = `<option value="">Select Department</option>`;
            for (let index = 0; index < rows.length; index++) {
                option += `<option value="${rows[index].id}">${rows[index].name}</option>`
            }
            res.send(option);
        } else {
            console.log(err);
        }
    })
});

app.post('/getquotaoption', (req, res) => {
    let data = req.body;
    mysqlConnection.query('SELECT name,v_name FROM `fee_quota` WHERE cid=? AND status=? ORDER BY id ASC', [data.cid, '1'], (err, rows, fields) => {
        if (!err) {

            let option = `<option value="">Select Quota</option>`;
            for (let index = 0; index < rows.length; index++) {
                option += `<option value="${rows[index].v_name}">${rows[index].name}</option>`
            }
            res.send(option);
        } else {
            console.log(err);
        }
    })
});

app.post('/getcategoriesoption', (req, res) => {
    let data = req.body;
    mysqlConnection.query('SELECT name FROM `fee_categories` WHERE cid=? AND status=? ORDER BY id ASC', [data.cid, '1'], (err, rows, fields) => {
        if (!err) {

            let option = `<option value="">Select Quota</option>`;
            for (let index = 0; index < rows.length; index++) {
                option += `<option value="${rows[index].name}">${rows[index].name}</option>`
            }
            res.send(option);
        } else {
            console.log(err);
        }
    })
});

app.post('/getsem', (req, res) => {
    let data = req.body;

    let option = `<option value="">Select Sem</option>`;
    for (let index = 1; index <= 10; index++) {
        option += `<option value="${index}">${index}</option>`
    }
    res.send(option);

});

app.post('/getstudentlist', (req, res) => {
    let data = req.body;
    mysqlConnection.query('SELECT sa.*,si.usn,sa.id AS sid, si.scheme,si.name as studentname,si.mobile FROM `student_academic` sa INNER JOIN `student_info` si ON sa.student_id = si.student_id WHERE sem=? AND sa.did IN(?) AND dv=? AND sa.cid=? AND sa.academic_year=? ORDER BY rno', [data.sem, data.department, data.dv, data.cid, data.academicYear], (err, rows, fields) => {
        if (!err) {
            res.send(rows);
        } else {
            console.log(err);
        }
    })

});

app.post('/getStudentList2', (req, res) => {
    let data = req.body;
    let query = '';
    if (data.did == 6) {
        query = `SELECT sa.*,si.usn,si.name,sa.id AS sid FROM student_academic sa INNER JOIN student_info si ON sa.student_id = si.student_id WHERE sem='${data.sem}' AND sa.did IN('${data.did}') AND dv='${data.dv}' AND sa.cid='${data.cid}' AND sa.academic_year='${data.academicYear}' ORDER BY rno`;
    } else {
        query = `SELECT  sa.*,si.usn,si.name,sa.id AS sid FROM student_academic sa INNER JOIN student_info si ON sa.student_id = si.student_id WHERE sem='${data.sem}' AND sa.did='${data.did}' AND dv='${data.dv}' AND sa.cid='${data.cid}' AND sa.academic_year='${data.academicYear}' ORDER BY si.usn ASC`;
    }

    mysqlConnection.query(query, (err, rows, fields) => {
        if (!err) {
            res.send(rows);
        } else {
            console.log(err);
        }
    })
});

app.post('/addSubject', (req, res) => {
    let addedCount23 = 0;
    let data = req.body;
    let studentId = data.studentId;

    for (let index = 0; index < studentId.length; index++) {
        if (studentId[index] != null) {
            mysqlConnection.query('SELECT *,(SELECT rno FROM `student_academic` WHERE student_id=si.student_id and academic_year=si.academic_year and promote=0) as rno FROM `student_info` si WHERE student_id=?', [studentId[index]], (err, rows, fields) => {
                if (!err) {
                    let studentDetails = rows[0];
                    mysqlConnection.query('INSERT INTO sub_info(student_id, usn, name, cid, did, sem, dv, scd, academic_year) VALUES (?,?,?,?,?,?,?,?,?)', [studentId[index], studentDetails.usn, studentDetails.name, data.cid, data.did, data.sem, data.dv, data.scd, data.academicYear], (err, rows, fields) => {
                        if (!err) {
                            addedCount23++;
                            console.log(addedCount23);
                        }
                    })
                }
            })
        }
    }
    console.log(addedCount23);
});

app.post('/getcollegedetailsbyid', (req, res) => {
    let data = req.body;
    mysqlConnection.query('SELECT * FROM `college` WHERE id=?', [data.cid], (err, rows, fields) => {
        if (!err) {
            res.send(rows);
        } else {
            console.log(err);
        }
    })

});

app.post('/getstudentlis', (req, res) => {
    let data = req.body;
    let query = '';
    // let table = '';
    if (data.did == 6) {
        query = `SELECT * FROM student_details WHERE cid='${data.cid}' AND sem='${data.sen}' AND status=1 AND student_id='' AND did < '6' AND academic_year='${data.academicYear}'`;
    } else {
        query = `SELECT * FROM student_details WHERE cid='${data.cid}' AND sem='${data.sem}' AND status=1 AND student_id='' AND did='${data.did}' AND academic_year='${data.academicYear}'`;
    }
    mysqlConnection.query(query, (err, rows, fields) => {
        if (!err) {
            res.send(rows);
        } else {
            console.log(err);
        }
    })

});

app.post('/getfeedepartmentoption', async (req, res) => {
    let data = req.body;
    let query = ''
    if (data.role == 'Clerk') {
        query += `SELECT name,id FROM dept WHERE cid='${data.cid}' AND academic='1' AND id='${data.did}' ORDER BY name ASC`
    } else {
        query += `SELECT name,id FROM dept WHERE cid='${data.cid}' AND academic='1' ORDER BY name ASC`
    }
    let rows = await promisePool.query(query);
    let option = `<option value="">Select Department</option><option value="All">All</option>`;
    for (let index = 0; index < rows[0].length; index++) {
        option += `<option value="${rows[0][index].id}">${rows[0][index].name}</option>`
    }
    res.send(option);
});

app.post('/getfeeyearoption', async (req, res) => {
    let data = req.body;
    let year = 0;

    if (data.cid == 1) {
        year = 4;
    } else if (data.cid == 3 || data.cid == 4 || data.cid == 5) {
        year = 3;
    } else if (data.cid == 6) {
        year = 5;
    } else if (data.cid == 8 || data.cid == 9 || data.cid == 34) {
        year = 2;
    }
    let option = `<option value="">Select Year</option><option value="All">All</option>`;
    for (let index = 1; index <= year; index++) {
        option += `<option value="${index}">${index}</option>`
    }
    res.send(option);
});

app.post('/getdepartmentfeereport', async (req, res) => {
    let data = req.body;
    let usn = '';
    let query = '';
    let body = '';
    let row = '';
    if (data.did != 'All') {
        row = await promisePool.query(`SELECT name,(SELECT iname FROM college WHERE id=d.cid) AS iname FROM dept d WHERE id='${data.did}'`);
    } else {
        row = await promisePool.query(`SELECT iname,("All") AS name FROM college WHERE id='${data.cid}'`);
    }
    let year = "All";
    if (data.year == 1) {
        year = `1st`

    } else if (data.year == 2) {
        year = `2nd`

    } else if (data.year == 3) {
        year = `3rd`

    } else if (data.year == 4) {
        year = `4th`

    } else if (data.year == 5) {
        year = `5th`

    }
    body += `<h3 align="center">${row[0][0].iname}</h3>
           <h4 class="card-title" align="center">Fee Details of ${year} Year ${row[0][0].name} Department For Academic Year ${data.academic_year}</h4>
           <table class="table table-bordered">
           <thead class="thead-dark">
           <tr>
               <th>sl no</th>
               <th>usn</th>
               <th>name</th>
               <th>category</th>
               <th>quota</th>
               <th>year</th>
               <th>fee fixed</th>
               <th>paid fee</th>
               <th>balance fee</th>
               <th>scholarship</th>
               <th>loan</th>
               <th>other</th>
               <th>percentage</th>
           </tr>
           </thead>
           <tbody>`;
    if (data.cid == 1) {
        if (data.did != 6) {
            if (data.did == 1) {
                usn = "CS";
            } else if (data.did == 2) {
                usn = "CV";
            } else if (data.did == 3) {
                usn = 'EE';
            } else if (data.did == 4) {
                usn = 'EC';
            } else if (data.did == 5) {
                usn = "ME";
            } else if (data.did == 7) {
                usn = "MBA";
            } else if (data.did == 19) { // pg department of CS Engg
                usn = "SCN";
            } else if (data.did == 84) { // pg department of E&C engg
                usn = "LDE";
            } else if (data.did == 20) { // pg department of mechanicl engg
                usn = "MMD";
            } else if (data.did == 21) { // pg department of civil engg
                usn = "CSE";
            }
        } else {
            usn = "";
        }
    }
    let feeHeads = '';
    if (data.cid == 1) {
        feeHeads = 'SUM(old_bal+uni_fee+inst_fee+tut_fee)';
    } else {
        feeHeads = 'SUM(uni_fee+tut_fee+nasa_fee+libry_fee)';
    }

    if (data.did == "All" && data.year == "All") {
        query = `SELECT usn,year,(SELECT name FROM fee_quota WHERE id=f.quota) AS quota,(SELECT name FROM fee_categories WHERE id=f.cat) AS category,(SELECT ${feeHeads} FROM fee_details WHERE cid=f.cid AND id=f.id) AS fee_fixed,(SELECT sum(paid_amt) FROM fee_transactions WHERE cid=f.cid AND fee_id=f.id AND fee_type NOT IN('0','-1')) AS paid_fee,(SELECT name FROM student_info WHERE student_id=f.student_id) AS name ,(SELECT amt FROM std_fund WHERE usn=f.usn AND type='Scholarship') as Scholarship,(SELECT amt FROM std_fund WHERE usn=f.usn AND type='Loan') as Loan,(SELECT amt FROM std_fund WHERE usn=f.usn AND type='Other') as Other FROM fee_details f  WHERE cid='${data.cid}' AND acd_year='${data.academic_year}' AND fee_drpot='0' ORDER BY year,usn ASC`
    } else if (data.did == "All" && data.year != "") {
        query = `SELECT usn,year,(SELECT name FROM fee_quota WHERE id=f.quota) AS quota,(SELECT name FROM fee_categories WHERE id=f.cat) AS category,(SELECT ${feeHeads} FROM fee_details WHERE cid=f.cid AND id=f.id) AS fee_fixed,(SELECT sum(paid_amt) FROM fee_transactions WHERE cid=f.cid AND fee_id=f.id AND fee_type NOT IN('0','-1')) AS paid_fee,(SELECT name FROM student_info WHERE student_id=f.student_id) AS name ,(SELECT amt FROM std_fund WHERE usn=f.usn AND type='Scholarship') as Scholarship,(SELECT amt FROM std_fund WHERE usn=f.usn AND type='Loan') as Loan,(SELECT amt FROM std_fund WHERE usn=f.usn AND type='Other') as Other FROM fee_details f  WHERE cid='${data.cid}' AND year='${data.year}' AND acd_year='${data.academic_year}' AND fee_drpot='0' ORDER BY year,usn ASC`
    } else if (data.year == "All" && data.did != "") {
        query = `SELECT usn,year,(SELECT name FROM fee_quota WHERE id=f.quota) AS quota,(SELECT name FROM fee_categories WHERE id=f.cat) AS category,(SELECT ${feeHeads} FROM fee_details WHERE cid=f.cid AND id=f.id) AS fee_fixed,(SELECT sum(paid_amt) FROM fee_transactions WHERE cid=f.cid AND fee_id=f.id AND fee_type NOT IN('0','-1')) AS paid_fee,(SELECT name FROM student_info WHERE student_id=f.student_id) AS name ,(SELECT amt FROM std_fund WHERE usn=f.usn AND type='Scholarship') as Scholarship,(SELECT amt FROM std_fund WHERE usn=f.usn AND type='Loan') as Loan,(SELECT amt FROM std_fund WHERE usn=f.usn AND type='Other') as Other FROM fee_details f  WHERE cid='${data.cid}' AND did='${data.did}' AND acd_year='${data.academic_year}' AND fee_drpot='0' ORDER BY year,usn ASC`
    } else if (data.year != "" && data.did != "") {
        query = `SELECT usn,year,(SELECT name FROM fee_quota WHERE id=f.quota) AS quota,(SELECT name FROM fee_categories WHERE id=f.cat) AS category,(SELECT ${feeHeads} FROM fee_details WHERE cid=f.cid AND id=f.id) AS fee_fixed,(SELECT sum(paid_amt) FROM fee_transactions WHERE cid=f.cid AND fee_id=f.id AND fee_type NOT IN('0','-1')) AS paid_fee,(SELECT name FROM student_info WHERE student_id=f.student_id) AS name ,(SELECT amt FROM std_fund WHERE usn=f.usn AND type='Scholarship') as Scholarship,(SELECT amt FROM std_fund WHERE usn=f.usn AND type='Loan') as Loan,(SELECT amt FROM std_fund WHERE usn=f.usn AND type='Other') as Other FROM fee_details f  WHERE cid='${data.cid}' AND did='${data.did}' AND year='${data.year}' AND acd_year='${data.academic_year}' AND fee_drpot='0' ORDER BY year,usn ASC`
    }

    let feeDetails = await promisePool.query(query);
    let gfee_fixed = 0;
    let gpaid_fee = 0;
    let gScholarship = 0;
    let gLoan = 0;
    let gOther = 0;
    for (let i = 0; i < feeDetails[0].length; i++) {
        const element = feeDetails[0][i];
        let fee_fixed = element.fee_fixed;
        if (fee_fixed == null) {
            fee_fixed = 0;
        }
        gfee_fixed += fee_fixed;
        let paid_fee = element.paid_fee;
        if (paid_fee == null) {
            paid_fee = 0;
        }
        gpaid_fee += paid_fee;
        let Scholarship = element.Scholarship;
        if (Scholarship == null) {
            Scholarship = 0;
        }
        gScholarship += Scholarship;
        let Loan = element.Loan;
        if (Loan == null) {
            Loan = 0;
        }
        gLoan += Loan;
        let Other = element.Other;
        if (Other == null) {
            Other = 0;
        }
        gOther += Other;
        let balance = fee_fixed - paid_fee;
        let percentage = (paid_fee / fee_fixed) * 100;
        percentage = percentage.toString().substring(0, 4);
        body += `<tr>
            <td>${i + 1}</td>
            <td>${element.usn}</td>
            <td>${element.name}</td>
            <td>${element.category}</td>
            <td>${element.quota}</td>
            <td>${element.year}</td>
            <td>${numberWithCommas(fee_fixed)}</td>
            <td>${numberWithCommas(paid_fee)}</td>
            <td>${numberWithCommas(balance)}</td>
            <td>${numberWithCommas(Scholarship)}</td>
            <td>${numberWithCommas(Loan)}</td>
            <td>${numberWithCommas(Other)}</td>
            <td>${percentage}%</td>
        </tr>`;

    }
    let gpercentage = (gpaid_fee / gfee_fixed) * 100;
    gpercentage = gpercentage.toString().substring(0, 4);
    body += `
    <tr>
        <th colspan="6" class="text-center">Total</th>
        <th>${numberWithCommas(gfee_fixed)} <br> ${wordify(gfee_fixed)}</th>
        <th>${numberWithCommas(gpaid_fee)} <br> ${wordify(gpaid_fee)}</th>
        <th>${numberWithCommas(gfee_fixed - gpaid_fee)} <br> ${wordify(gfee_fixed - gpaid_fee)}</th>
        <th>${numberWithCommas(gScholarship)}</th>
        <th>${numberWithCommas(gLoan)}</th>
        <th>${numberWithCommas(gOther)}</th>
        <th>${gpercentage}%</th>
    </tr>
    </tbody>
    </table>`;
    res.send(body)
});

app.post('/getconsolidatedepartmentdetails', async (req, res) => {
    let data = req.body;
    let departments = await promisePool.query(`SELECT id,name,(SELECT iname FROM college WHERE id=d.cid) AS iname FROM dept d WHERE cid='${data.cid}' AND academic=1 ORDER BY id`);
    let feeHeads = '';
    if (data.cid == 1) {
        feeHeads = 'SUM(old_bal+uni_fee+inst_fee+tut_fee)';
    } else {
        feeHeads = 'SUM(uni_fee+tut_fee+nasa_fee+libry_fee)';
    }

    let body = `<h3 align="center">${departments[0][0].iname}</h3>
    <h4 align="center">Fees Details For Academic Year ${data.academic_year}</h4>
    <table class="table table-bordered table-striped" border="1" style="width:100%;border-collapse:collapse;">
                    <thead class="thead-dark">
                        <tr>
                            <th>Sl No</th>
                            <th>Department</th>
                            <th>Fee Fixed</th>
                            <th>Fee Paid</th>
                            <th>Balance</th>
                        </tr>
                    </thead>
                    <tbody>`;
    let gfee_fixed = 0;
    let gpaid_fee = 0;
    for (let i = 0; i < departments[0].length; i++) {
        const element = departments[0][i];
        let departmentFeeDetails = await promisePool.query(`SELECT ${feeHeads} AS fee_fixed,
                        (SELECT SUM(paid_amt) FROM fee_transactions WHERE acd_year=f.acd_year AND did=f.did AND fee_type NOT IN('0','-1')) AS paid_amt
                        FROM fee_details  f WHERE acd_year='${data.academic_year}' AND did='${element.id}'`)
        let fee_fixed = departmentFeeDetails[0][0].fee_fixed;
        if (fee_fixed == null) {
            fee_fixed = 0;
        }
        gfee_fixed += fee_fixed;
        let paid_fee = departmentFeeDetails[0][0].paid_amt;
        if (paid_fee == null) {
            paid_fee = 0;
        }
        gpaid_fee += paid_fee;
        let balance = fee_fixed - paid_fee;
        body += `<tr>
                            <td>${i + 1}</td>
                            <td>${element.name}</td>
                            <td>${numberWithCommas(fee_fixed)}</td>
                            <td>${numberWithCommas(paid_fee)}</td>
                            <td>${numberWithCommas(balance)}</td>
                        </tr>`;
    }
    body += `<tr style="font-weight:bold;">
            <td colspan="2" style="text-align:center;">Total</td>
            <td>${numberWithCommas(gfee_fixed)} <br> ${wordify(gfee_fixed)}</td>
            <td>${numberWithCommas(gpaid_fee)} <br> ${wordify(gpaid_fee)}</td>
            <td>${numberWithCommas(gfee_fixed - gpaid_fee)} <br> ${wordify(gfee_fixed - gpaid_fee)}</td>
            </tr>
        </tbody>
        </table>`;

    res.send(body)

});

app.post('/departmentconsolidate', async (req, res) => {
    let data = req.body;
    let departments = await promisePool.query(`SELECT id,name,(SELECT iname FROM college WHERE id=d.cid) AS iname FROM dept d WHERE cid='${data.cid}' AND academic=1 ORDER BY id`);
    let feeHeads = '';
    let title = '';
    let fdate = formatDate('', data.fromDate);
    let tdate = formatDate('', data.toDate);
    let currentPaid = '';
    if (data.cid == 1) {
        feeHeads = 'SUM(old_bal+uni_fee+inst_fee+tut_fee)';
    } else {
        feeHeads = 'SUM(uni_fee+tut_fee+nasa_fee+libry_fee)';
    }

    if (data.type == 'daily') {
        title = `Fee Collection on ${fdate}`;
    } else if (data.type == 'monthly') {
        let split = fdate.split('-');
        let month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        let i = parseInt(split[1].replace(/^0+/, '')) - 1;
        title = `Fee Collection of ${month[i]}-${split[2]}`;
    } else if (data.type == 'custom') {
        title = `Fee Collection From ${fdate} To ${tdate}`;
    }

    let body = `<h3 align="center">${departments[0][0].iname}</h3>
    <h4 align="center">${title}</h4>
    <table class="table table-bordered table-striped" border="1" style="width:100%;border-collapse:collapse;">
                    <thead class="thead-dark">
                        <tr>
                            <th>Sl No</th>
                            <th>Department</th>
                            <th>Fee Fixed</th>
                            <th>Current Fee Paid</th>
                            <th>Previous Fee Paid</th>
                            <th>Balance</th>
                        </tr>
                    </thead>
                    <tbody>`;
    let gfee_fixed = 0;
    let gpaid_fee = 0;
    let gcurrent_fee = 0;
    for (let i = 0; i < departments[0].length; i++) {
        const element = departments[0][i];
        let departmentFeeDetails = await promisePool.query(`SELECT ${feeHeads} AS fee_fixed,
                        (SELECT SUM(paid_amt) FROM fee_transactions WHERE acd_year=f.acd_year AND did=f.did AND fee_type NOT IN('0','-1')) AS paid_amt
                        FROM fee_details  f WHERE acd_year='${data.academic_year}' AND did='${element.id}'`);

        if (data.type == 'daily') {
            currentPaid = await promisePool.query(`SELECT SUM(paid_amt) AS feePaid  FROM fee_transactions WHERE cid='${data.cid}' AND did='${element.id}' AND acd_year='${data.academic_year}' AND fee_type NOT IN('0','-1') AND paid_date='${data.fromDate}'`);
        } else if (data.type == 'monthly') {
            currentPaid = await promisePool.query(`SELECT SUM(paid_amt) AS feePaid  FROM fee_transactions WHERE cid='${data.cid}' AND did='${element.id}' AND acd_year='${data.academic_year}' AND fee_type NOT IN('0','-1') AND MONTH(paid_date)=MONTH('${data.fromDate}') AND YEAR(paid_date)=YEAR('${data.fromDate}')`);
        } else if (data.type == 'custom') {
            currentPaid = await promisePool.query(`SELECT SUM(paid_amt) AS feePaid  FROM fee_transactions WHERE cid='${data.cid}' AND did='${element.id}' AND acd_year='${data.academic_year}' AND fee_type NOT IN('0','-1') AND paid_date BETWEEN '${data.fromDate}' AND '${data.toDate}'`);
        }

        let fee_fixed = departmentFeeDetails[0][0].fee_fixed;
        if (fee_fixed == null) {
            fee_fixed = 0;
        }
        gfee_fixed += fee_fixed;
        let paid_fee = departmentFeeDetails[0][0].paid_amt;
        if (paid_fee == null) {
            paid_fee = 0;
        }
        gpaid_fee += paid_fee;
        console.log(currentPaid[0])
        let currentPaid1 = currentPaid[0][0].feePaid;
        if (currentPaid1 == null) {
            currentPaid1 = 0;
        }
        gcurrent_fee += currentPaid1;
        let balance = fee_fixed - currentPaid1 - paid_fee;
        body += `<tr>
                            <td>${i + 1}</td>
                            <td>${element.name}</td>
                            <td>${numberWithCommas(fee_fixed)}</td>
                            <td>${numberWithCommas(currentPaid1)}</td>
                            <td>${numberWithCommas(paid_fee)}</td>
                            <td>${numberWithCommas(balance)}</td>
                        </tr>`;
    }
    let gbalanace = gfee_fixed - gcurrent_fee - gpaid_fee;
    body += `<tr style="font-weight:bold;">
            <td colspan="2" style="text-align:center;">Total</td>
            <td>${numberWithCommas(gfee_fixed)} <br> ${wordify(gfee_fixed)}</td>
            <td>${numberWithCommas(gcurrent_fee)} <br> ${wordify(gcurrent_fee)}</td>
            <td>${numberWithCommas(gpaid_fee)} <br> ${wordify(gpaid_fee)}</td>
            <td>${numberWithCommas(gbalanace)} <br> ${wordify(gbalanace)}</td>
            </tr>
        </tbody>
        </table>`;

    res.send(body)

});

app.post('/feecollectiondetails', async (req, res) => {
    let data = req.body;
    let body = ``;
    let title = ``;
    let query = ``;
    let colspan = ``;
    let fdate = formatDate('', data.fromDate);
    let tdate = formatDate('', data.toDate);
    if (data.did == "All") {
        if (data.type == 'daily') {
            title = `Fee Collection on ${fdate} of academic year ${data.academic_year}`;
            query = `SELECT DISTINCT trans_id FROM fee_transactions WHERE cid='${data.cid}' AND fee_type NOT IN('0','-1')  AND paid_date='${data.fromDate}' AND acd_year='${data.academic_year}'`;
            colspan = 5;
        } else if (data.type == 'monthly') {
            let split = fdate.split('-');
            let month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            let i = parseInt(split[1].replace(/^0+/, '')) - 1;
            title = `Fee Collection of ${month[i]}-${split[2]} of academic year ${data.academic_year}`;
            colspan = 5;
            query = `SELECT DISTINCT trans_id FROM fee_transactions WHERE cid='${data.cid}' AND fee_type NOT IN('0','-1')  AND MONTH(paid_date)=MONTH('${data.fromDate}') AND YEAR(paid_date)=YEAR('${data.fromDate}') AND acd_year='${data.academic_year}'`;
        } else if (data.type == 'custom') {
            title = `Fee Collection From ${fdate} To ${tdate} of academic year ${data.academic_year}`;
            query = `SELECT DISTINCT trans_id FROM fee_transactions WHERE cid='${data.cid}' AND fee_type NOT IN('0','-1')  AND paid_date BETWEEN '${data.fromDate}' AND '${data.toDate}' AND acd_year='${data.academic_year}'`;
            colspan = 6;
        }
    } else {
        if (data.type == 'daily') {
            title = `Fee Collection on ${fdate} of academic year ${data.academic_year}`;
            query = `SELECT DISTINCT trans_id FROM fee_transactions WHERE cid='${data.cid}' AND  did='${data.did}' AND fee_type NOT IN('0','-1')  AND paid_date='${data.fromDate}' AND acd_year='${data.academic_year}'`;
            colspan = 5;
        } else if (data.type == 'monthly') {
            let split = fdate.split('-');
            let month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            let i = parseInt(split[1].replace(/^0+/, '')) - 1;
            title = `Fee Collection of ${month[i]}-${split[2]} of academic year ${data.academic_year}`;
            colspan = 5;
            query = `SELECT DISTINCT trans_id FROM fee_transactions WHERE cid='${data.cid}' AND  did='${data.did}' AND fee_type NOT IN('0','-1')  AND MONTH(paid_date)=MONTH('${data.fromDate}') AND YEAR(paid_date)=YEAR('${data.fromDate}') AND acd_year='${data.academic_year}'`;
        } else if (data.type == 'custom') {
            title = `Fee Collection From ${fdate} To ${tdate} of academic year ${data.academic_year}`;
            query = `SELECT DISTINCT trans_id FROM fee_transactions WHERE cid='${data.cid}' AND  did='${data.did}' AND fee_type NOT IN('0','-1')  AND paid_date BETWEEN '${data.fromDate}' AND '${data.toDate}' AND acd_year='${data.academic_year}'`;
            colspan = 6;
        }
    }
    let collegeDetails = await promisePool.query(`SELECT iname FROM college WHERE id='${data.cid}'`);
    let transactionList = await promisePool.query(query);
    body += `<h1 align="center" class="text-uppercase">${collegeDetails[0][0].iname}</h1>
    <h2 align="center" class="text-uppercase">${title}</h2>
    <table class="table table-bordered">
    <thead class="thead-dark">
    <tr>
        <th>sl no</th>
        <th>usn</th>
        <th>name</th>
        <th>department</th>`;
    if (data.type == 'custom') {
        body += `<th>date</th>`;
    }
    body += `<th>scroll</th>
        <th>paid amount</th>
    </tr>
    </thead>
    <tbody>`;
    let gtotal = 0;
    for (let i = 0; i < transactionList[0].length; i++) {
        const element = transactionList[0][i];
        let transctionDetails = await promisePool.query(`SELECT (SELECT name FROM student_info WHERE student_id=f.student_id) AS name,(SELECT name FROM dept WHERE id=f.did) as dept,SUM(paid_amt) AS paid_amt,usn,scr_no,did,paid_date FROM fee_transactions f WHERE trans_id='${element.trans_id}'`);
        body += `<tr>
            <td>${i + 1}</td>
            <td>${transctionDetails[0][0].usn}</td>
            <td>${transctionDetails[0][0].name}</td>
            <td>${transctionDetails[0][0].dept}</td>`;
        if (data.type == 'custom') {
            body += `<td>${formatDate("", transctionDetails[0][0].paid_date)}</td>`;
        }
        body += `<td>${transctionDetails[0][0].scr_no}</td>
            <td>${numberWithCommas(transctionDetails[0][0].paid_amt)}</td>
        </tr>`;
        gtotal += transctionDetails[0][0].paid_amt;
    }
    body += `<tr class="font-weight-bold">
    <td class="text-center" colspan="${colspan}" >Total</td>
    <td class="text-center" >${numberWithCommas(gtotal)}</td>
    </tr> 
    </tbody>
    </table>`;
    res.send(body);
});

app.post('/getpayfeedetails', async (req, res) => {
    let data = req.body;
    let feeHeads = '';
    if (data.cid == 1) {
        feeHeads = 'SUM(old_bal+uni_fee+inst_fee+tut_fee)';
    } else {
        feeHeads = 'SUM(uni_fee+tut_fee+nasa_fee+libry_fee)';
    }

    let feeDetails = await promisePool.query(`SELECT ${feeHeads} AS fee_fixed,paid_fee,year,usn,student_id,id,(SELECT name FROM student_info WHERE student_id=f.student_id LIMIT 1) AS name FROM fee_details f WHERE student_id=(SELECT student_id FROM student_info WHERE cid='${data.cid}' AND usn='${data.usn}' LIMIT 1) AND verify='1' AND fee_drpot='0' GROUP BY year`);
    res.send(feeDetails[0]);
});

app.post('/payfees', async (req, res) => {
    let data = req.body;
    let feeHeads = ``;

    let getStudentFeeDetails = async (id) => {
        let feeDetails = await promisePool.query(`SELECT id,student_id,usn,cid,did,year,acd_year,uni_fee,tut_fee,bal FROM fee_details WHERE id='${id}' ORDER BY id DESC`);
        return feeDetails[0][0];
    };

    let student_feeDetails = await getStudentFeeDetails(data.feeId);
    let universityFeePaid = await getHeadWisePaidAmount(student_feeDetails.cid, student_feeDetails.id, student_feeDetails.cid == 1 ? 1 : 7);
    let universityFeeBalance = parseFloat(student_feeDetails['uni_fee'] - universityFeePaid);
    let tuitionFeePaid = await getHeadWisePaidAmount(student_feeDetails.cid, student_feeDetails.id, student_feeDetails.cid == 1 ? 3 : 8);
    let tuitionFeeBalance = parseFloat(student_feeDetails['tut_fee'] - tuitionFeePaid);
    let remainingPaidAmount = 0;
    let paidAmount = parseFloat(data.paidAmt);


    if (student_feeDetails.cid == 1) {
        feeHeads = 'SUM(old_bal+uni_fee+inst_fee+tut_fee)';
    } else {
        feeHeads = 'SUM(uni_fee+tut_fee+nasa_fee+libry_fee)';
    }

    // let check = await promisePool.query(`SELECT id FROM fee_transactions WHERE fee_id='${student_feeDetails['id']}' AND acd_year='${student_feeDetails['acd_year']}' AND delete_sts=1`);

    // if (check[0].length > 0) {
    let query = `INSERT INTO fee_transactions(trans_id, fee_id, student_id, usn, cid, did, year,acd_year,scr_no, paid_date,uid,fee_type,paid_amt,bal)VALUES ('${await getTransactionId(student_feeDetails.cid, student_feeDetails.did)}','${student_feeDetails.id}','${student_feeDetails.student_id}','${student_feeDetails.usn}','${student_feeDetails.cid}','${student_feeDetails.did}','${student_feeDetails.year}','${student_feeDetails.acd_year}','${data.scrollNo}','${formatDate('db', data.pdate)}','${data.id}'`;
    let query2 = ``;

    if (universityFeeBalance > 0) {
        query2 += `,'1'`;
        if (paidAmount > universityFeeBalance) {
            let details = await getStudentFeeDetails(data.feeId);
            let bal = details.bal - universityFeeBalance;
            query2 += `,'${universityFeeBalance}',${bal})`;
            remainingPaidAmount = paidAmount - universityFeeBalance;
            let isInsert = await promisePool.query(`${query + query2}`);
            if (isInsert[0].insertId > 0) {
                let feeDetails = await promisePool.query(`SELECT sum(paid_amt) AS paidAmount,(SELECT ${feeHeads} FROM fee_details WHERE id='${student_feeDetails.id}') AS fee_fixed FROM fee_transactions WHERE cid='${student_feeDetails.cid}' AND fee_id='${student_feeDetails.id}' AND fee_type NOT IN(0,-1)`);
                if (feeDetails[0][0].paidAmount == null) {
                    feeDetails[0][0].paidAmount = 0;
                }
                let balance = feeDetails[0][0].fee_fixed - feeDetails[0][0].paidAmount;

                let uquery = ``;

                if (balance == 0) {
                    uquery = `UPDATE fee_details SET paid_fee='${feeDetails[0][0].paidAmount}',bal='${balance}',fee_clear=1 WHERE id='${student_feeDetails.id}'`;
                } else {
                    uquery = `UPDATE fee_details SET paid_fee='${feeDetails[0][0].paidAmount}',bal='${balance}' WHERE id='${student_feeDetails.id}'`;
                }

                let update = await promisePool.query(uquery);
                if (update[0].affectedRows) {
                    // res.send(["Record Added","success"]);
                    if (remainingPaidAmount > 0) {
                        if (tuitionFeeBalance > 0) {
                            query2 = ``;
                            query2 += `,'3'`;
                            if (remainingPaidAmount > tuitionFeeBalance) {
                                let details = await getStudentFeeDetails(data.feeId);
                                let bal = details.bal - tuitionFeeBalance;
                                query2 += `,'${tuitionFeeBalance}',${bal})`;
                                let isInsert = await promisePool.query(`${query + query2}`);
                                if (isInsert[0].insertId > 0) {
                                    let feeDetails = await promisePool.query(`SELECT sum(paid_amt) AS paidAmount,(SELECT ${feeHeads} FROM fee_details WHERE id='${student_feeDetails.id}') AS fee_fixed FROM fee_transactions WHERE cid='${student_feeDetails.cid}' AND fee_id='${student_feeDetails.id}' AND fee_type NOT IN(0,-1)`);
                                    if (feeDetails[0][0].paidAmount == null) {
                                        feeDetails[0][0].paidAmount = 0;
                                    }
                                    let balance = feeDetails[0][0].fee_fixed - feeDetails[0][0].paidAmount;

                                    let uquery = ``;

                                    if (balance == 0) {
                                        uquery = `UPDATE fee_details SET paid_fee='${feeDetails[0][0].paidAmount}',bal='${balance}',fee_clear=1 WHERE id='${student_feeDetails.id}'`;
                                    } else {
                                        uquery = `UPDATE fee_details SET paid_fee='${feeDetails[0][0].paidAmount}',bal='${balance}' WHERE id='${student_feeDetails.id}'`;
                                    }

                                    let update = await promisePool.query(uquery);
                                    if (update[0].affectedRows) {
                                        res.send(["Record Added", "success"]);
                                    } else {
                                        res.send(["Record Added But Balance Fee and Paid Fee Not Updated", "warning"]);
                                    }
                                } else {
                                    res.send("Record Not Added", "", "error");
                                }
                            } else {
                                let details = await getStudentFeeDetails(data.feeId);
                                let bal = details.bal - remainingPaidAmount;
                                query2 += `,'${remainingPaidAmount}',${bal})`;

                                let isInsert = await promisePool.query(`${query + query2}`);
                                if (isInsert[0].insertId > 0) {
                                    let feeDetails = await promisePool.query(`SELECT sum(paid_amt) AS paidAmount,(SELECT ${feeHeads} FROM fee_details WHERE id='${student_feeDetails.id}') AS fee_fixed FROM fee_transactions WHERE cid='${student_feeDetails.cid}' AND fee_id='${student_feeDetails.id}' AND fee_type NOT IN(0,-1)`);
                                    if (feeDetails[0][0].paidAmount == null) {
                                        feeDetails[0][0].paidAmount = 0;
                                    }
                                    let balance = feeDetails[0][0].fee_fixed - feeDetails[0][0].paidAmount;

                                    let uquery = ``;

                                    if (balance == 0) {
                                        uquery = `UPDATE fee_details SET paid_fee='${feeDetails[0][0].paidAmount}',bal='${balance}',fee_clear=1 WHERE id='${student_feeDetails.id}'`;
                                    } else {
                                        uquery = `UPDATE fee_details SET paid_fee='${feeDetails[0][0].paidAmount}',bal='${balance}' WHERE id='${student_feeDetails.id}'`;
                                    }

                                    let update = await promisePool.query(uquery);
                                    if (update[0].affectedRows) {
                                        res.send(["Record Added", "success"]);
                                    } else {
                                        res.send(["Record Added But Balance Fee and Paid Fee Not Updated", "warning"]);
                                    }
                                } else {
                                    res.send("Record Not Added", "", "error");
                                }
                            }
                        }
                    }
                } else {
                    res.send(["Record Added But Balance Fee and Paid Fee Not Updated", "warning"]);
                }
            } else {
                res.send("Record Not Added", "", "error");
            }

        } else {
            let details = await getStudentFeeDetails(data.feeId);
            let bal = details.bal - paidAmount;
            query2 += `,'${paidAmount}',${bal})`;

            let isInsert = await promisePool.query(`${query + query2}`);
            if (isInsert[0].insertId > 0) {
                let feeDetails = await promisePool.query(`SELECT sum(paid_amt) AS paidAmount,(SELECT ${feeHeads} FROM fee_details WHERE id='${student_feeDetails.id}') AS fee_fixed FROM fee_transactions WHERE cid='${student_feeDetails.cid}' AND fee_id='${student_feeDetails.id}' AND fee_type NOT IN(0,-1)`);
                if (feeDetails[0][0].paidAmount == null) {
                    feeDetails[0][0].paidAmount = 0;
                }
                let balance = feeDetails[0][0].fee_fixed - feeDetails[0][0].paidAmount;

                let uquery = ``;

                if (balance == 0) {
                    uquery = `UPDATE fee_details SET paid_fee='${feeDetails[0][0].paidAmount}',bal='${balance}',fee_clear=1 WHERE id='${student_feeDetails.id}'`;
                } else {
                    uquery = `UPDATE fee_details SET paid_fee='${feeDetails[0][0].paidAmount}',bal='${balance}' WHERE id='${student_feeDetails.id}'`;
                }

                let update = await promisePool.query(uquery);
                if (update[0].affectedRows) {
                    res.send(["Record Added", "success"]);
                } else {
                    res.send(["Record Added But Balance Fee and Paid Fee Not Updated", "warning"]);
                }
            } else {
                res.send("Record Not Added", "", "error");
            }

        }
    } else if (tuitionFeeBalance > 0) {
        query2 += `,'3'`;
        if (paidAmount > tuitionFeeBalance) {
            let details = await getStudentFeeDetails(data.feeId);
            let bal = details.bal - tuitionFeeBalance;
            query2 += `,'${tuitionFeeBalance}',${bal})`;
            remainingPaidAmount = paidAmount - universityFeeBalance;
            let isInsert = await promisePool.query(`${query + query2}`);
            if (isInsert[0].insertId > 0) {
                let feeDetails = await promisePool.query(`SELECT sum(paid_amt) AS paidAmount,(SELECT ${feeHeads} FROM fee_details WHERE id='${student_feeDetails.id}') AS fee_fixed FROM fee_transactions WHERE cid='${student_feeDetails.cid}' AND fee_id='${student_feeDetails.id}' AND fee_type NOT IN(0,-1)`);
                if (feeDetails[0][0].paidAmount == null) {
                    feeDetails[0][0].paidAmount = 0;
                }
                let balance = feeDetails[0][0].fee_fixed - feeDetails[0][0].paidAmount;

                let uquery = ``;

                if (balance == 0) {
                    uquery = `UPDATE fee_details SET paid_fee='${feeDetails[0][0].paidAmount}',bal='${balance}',fee_clear=1 WHERE id='${student_feeDetails.id}'`;
                } else {
                    uquery = `UPDATE fee_details SET paid_fee='${feeDetails[0][0].paidAmount}',bal='${balance}' WHERE id='${student_feeDetails.id}'`;
                }

                let update = await promisePool.query(uquery);
                if (update[0].affectedRows) {
                    res.send(["Record Added", "success"]);
                } else {
                    res.send(["Record Added But Balance Fee and Paid Fee Not Updated", "warning"]);
                }
            } else {
                res.send("Record Not Added", "", "error");
            }
        } else {
            let details = await getStudentFeeDetails(data.feeId);
            let bal = details.bal - paidAmount;
            query2 += `,'${paidAmount}',${bal})`;

            let isInsert = await promisePool.query(`${query + query2}`);
            if (isInsert[0].insertId > 0) {
                let feeDetails = await promisePool.query(`SELECT sum(paid_amt) AS paidAmount,(SELECT ${feeHeads} FROM fee_details WHERE id='${student_feeDetails.id}') AS fee_fixed FROM fee_transactions WHERE cid='${student_feeDetails.cid}' AND fee_id='${student_feeDetails.id}' AND fee_type NOT IN(0,-1)`);
                if (feeDetails[0][0].paidAmount == null) {
                    feeDetails[0][0].paidAmount = 0;
                }
                let balance = feeDetails[0][0].fee_fixed - feeDetails[0][0].paidAmount;

                let uquery = ``;

                if (balance == 0) {
                    uquery = `UPDATE fee_details SET paid_fee='${feeDetails[0][0].paidAmount}',bal='${balance}',fee_clear=1 WHERE id='${student_feeDetails.id}'`;
                } else {
                    uquery = `UPDATE fee_details SET paid_fee='${feeDetails[0][0].paidAmount}',bal='${balance}' WHERE id='${student_feeDetails.id}'`;
                }

                let update = await promisePool.query(uquery);
                if (update[0].affectedRows) {
                    res.send(["Record Added", "success"]);
                } else {
                    res.send(["Record Added But Balance Fee and Paid Fee Not Updated", "warning"]);
                }
            } else {
                res.send("Record Not Added", "", "error");
            }

        }
    }
    // } else {
    //     res.send([`Please Clear The Delete Transcation`, "warning"]);
    // }

});

app.post('/getfeetransactions', async (req, res) => {
    let data = req.body;
    let feeDetails = await promisePool.query(`SELECT student_id,trans_id,usn,paid_date,paid_amt,bal,scr_no,year,(SELECT name FROM fee_type WHERE id=f.fee_type) AS fee_type,(SELECT name FROM student_info WHERE student_id=f.student_id LIMIT 1) AS name FROM fee_transactions f WHERE fee_id='${data.feeId}'  AND fee_type NOT IN('0','-1') `);
    res.send(feeDetails[0]);
});

app.post('/getconsolidatefeesdetails', async (req, res) => {
    let data = req.body;
    const printTransactionYearWise = (transaction) => {
        let totalPaidAmt = 0;
        let bal = 0;
        let table = `
        <table style="border-collapse:collapse;width:100%;" border="1" class="mt-4 table table-bordered table-striped">
    <thead class="thead-dark">
        <tr>
            <th>Sl No</th>
            <th>USN</th>
			<th>Transaction id</th>
            <th>Fee Type</th>
            <th>Paid Date</th>
            <th>Scroll No</th>
            <th>Paid Amount</th>
            <th>Balance</th>
        </tr>
    </thead>
    <tbody>`;
        if (transaction[0].length == 0) {
            table += `<tr><td style="text-align:center" colspan="9">No Data Found</td></tr>`
        } else {

            for (let j = 0; j < transaction[0].length; j++) {
                const element = transaction[0][j];
                totalPaidAmt += parseFloat(element.paid_amt);
                bal = element.bal;
                table += `
            <tr>
                <td>${j + 1}</td>
                <td>${element.usn}</td>
                <td>${element.trans_id}</td>
                <td>${element.fee_type}</td>
                <td>${formatDate("", element.paid_date)}</td>
                <td>${element.scr_no}</td>
                <td>${numberWithCommas(element.paid_amt)}</td>
                <td>${numberWithCommas(element.bal)}</td>
            </tr>
            `;
            }
        }

        table += `
    <tr>
        <td colspan="6" class="text-center">Total</td>
        <td>${numberWithCommas(totalPaidAmt)}</td>
        <td>${numberWithCommas(bal)}</td>
    </tr>
    </tbody>
    </table>`;
        return table;
    }

    let studentDetails = await promisePool.query(`SELECT student_id,usn,name,(SELECT iname FROM college WHERE id=s.cid) AS iname,(SELECT type FROM student_details WHERE student_id=s.student_id) AS type,(SELECT academic_year FROM student_details WHERE student_id=s.student_id) AS ad_year FROM student_info s WHERE cid='${data.cid}' AND (usn='${data.usn}' OR student_id='${data.usn}')`);
    let feeDetails = await promisePool.query(`SELECT * FROM fee_details f WHERE student_id=(SELECT student_id FROM student_info WHERE usn='${data.usn}' OR student_id='${data.usn}' LIMIT 1)`);
    let year1Transaction = await promisePool.query(`SELECT student_id,trans_id,usn,paid_date,paid_amt,bal,scr_no,year,(SELECT name FROM fee_type WHERE id=f.fee_type) AS fee_type FROM fee_transactions f WHERE student_id=(SELECT student_id FROM student_info WHERE usn='${data.usn}' OR student_id='${data.usn}' LIMIT 1) AND year=1  AND fee_type NOT IN('0','-1') `);
    let year2Transaction = await promisePool.query(`SELECT student_id,trans_id,usn,paid_date,paid_amt,bal,scr_no,year,(SELECT name FROM fee_type WHERE id=f.fee_type) AS fee_type FROM fee_transactions f WHERE student_id=(SELECT student_id FROM student_info WHERE usn='${data.usn}' OR student_id='${data.usn}' LIMIT 1) AND year=2  AND fee_type NOT IN('0','-1') `);
    let year3Transaction = await promisePool.query(`SELECT student_id,trans_id,usn,paid_date,paid_amt,bal,scr_no,year,(SELECT name FROM fee_type WHERE id=f.fee_type) AS fee_type FROM fee_transactions f WHERE student_id=(SELECT student_id FROM student_info WHERE usn='${data.usn}' OR student_id='${data.usn}' LIMIT 1) AND year=3  AND fee_type NOT IN('0','-1') `);
    let year4Transaction = await promisePool.query(`SELECT student_id,trans_id,usn,paid_date,paid_amt,bal,scr_no,year,(SELECT name FROM fee_type WHERE id=f.fee_type) AS fee_type FROM fee_transactions f WHERE student_id=(SELECT student_id FROM student_info WHERE usn='${data.usn}' OR student_id='${data.usn}' LIMIT 1) AND year=4  AND fee_type NOT IN('0','-1') `);
    let year5Transaction = await promisePool.query(`SELECT student_id,trans_id,usn,paid_date,paid_amt,bal,scr_no,year,(SELECT name FROM fee_type WHERE id=f.fee_type) AS fee_type FROM fee_transactions f WHERE student_id=(SELECT student_id FROM student_info WHERE usn='${data.usn}' OR student_id='${data.usn}' LIMIT 1) AND year=3  AND fee_type NOT IN('0','-1') `);

    let body = `<div class="card font-weight-bold text-uppercase">
    <div class="card-body">
    <h2 style="text-align: center;" class="mb-3">${studentDetails[0][0].iname}</h2>
    <div class="row">
            <div class="col-sm-3 font-weight-bold">Name: ${studentDetails[0][0].name}</div>
            <div class="col-sm-2 font-weight-bold">USN: ${studentDetails[0][0].usn}</div>
            <div class="col-sm-3 font-weight-bold">Student Id: ${studentDetails[0][0].student_id}</div>
            <div class="col-sm-2 font-weight-bold">Admission Year: ${studentDetails[0][0].ad_year} </div>
            <div class="col-sm-2 font-weight-bold">Student Type: ${studentDetails[0][0].type}</div>

            <h4 class="mt-3" style="text-align:center;">Fee Fixation From 1<sup>st</sup> to ${data.cid == 1 ? '4<sup>th</sup>' : '5<sup>th</sup>'} Year</h4>
            <table class="table table-bordered table-striped" style="border-collapse:collapse;width:100%;" border="1">
                <thead class="thead-dark">
                    <tr>
                        <th rowspan="2">Year</th>
                        <th rowspan="2">Academic Year</th>
                        <th style="text-align: center;" colspan="5">Fee Fixed</th>
                        <th style="text-align: center;" colspan="5">Paid Fee</th>
                        <th style="text-align: center;" colspan="5">Balance</th>
                    </tr>
                    <tr>
                        <th>University</th>
                        <th>Tuition</th>
                        ${data.cid == 1 ? '<th>Institute</th>' : '<th>Nasa</th>'}
                        ${data.cid == 1 ? '<th>Old Balance</th>' : '<th>Library</th>'}
                        <th>Total</th>
                        
                        <th>University</th>
                        <th>Tuition</th>
                        ${data.cid == 1 ? '<th>Institute</th>' : '<th>Nasa</th>'}
                        ${data.cid == 1 ? '<th>Old Balance</th>' : '<th>Library</th>'}
                        <th>Total</th>
                        
                        <th>University</th>
                        <th>Tuition</th>
                        ${data.cid == 1 ? '<th>Institute</th>' : '<th>Nasa</th>'}
                        ${data.cid == 1 ? '<th>Old Balance</th>' : '<th>Library</th>'}
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>`;
    let gFeeFixed = 0;
    let gFeePaid = 0;
    let gBalance = 0;
    for (let i = 0; i < feeDetails[0].length; i++) {
        const element = feeDetails[0][i];
        let universityFeePaid = 0;
        let instituteFeePaid = 0;
        let tuitionFeePaid = 0;
        let oldBalanceFeePaid = 0;
        let totalFeeFixed = 0;
        let totalFeePaid = 0;
        let nasaFeePaid = 0;
        let libryFeePaid = 0;

        let balance = 0;
        if (element.cid == 1) {
            universityFeePaid = await getHeadWisePaidAmount(element.cid, element.id, 1);
            instituteFeePaid = await getHeadWisePaidAmount(element.cid, element.id, 2);
            tuitionFeePaid = await getHeadWisePaidAmount(element.cid, element.id, 3);
            oldBalanceFeePaid = await getHeadWisePaidAmount(element.cid, element.id, 6);
            totalFeeFixed = element.uni_fee + element.inst_fee + element.tut_fee + element.old_bal;
            gFeeFixed += totalFeeFixed
            totalFeePaid = universityFeePaid + instituteFeePaid + tuitionFeePaid + oldBalanceFeePaid;
            gFeePaid += totalFeePaid
            balance = totalFeeFixed - totalFeePaid;
            gBalance += balance
        } else if (element.cid == 6) {
            universityFeePaid = await getHeadWisePaidAmount(element.cid, element.id, 7);
            tuitionFeePaid = await getHeadWisePaidAmount(element.cid, element.id, 8);
            nasaFeePaid = await getHeadWisePaidAmount(element.cid, element.id, 9);
            libryFeePaid = await getHeadWisePaidAmount(element.cid, element.id, 10);
            totalFeeFixed = element.uni_fee + element.nasa_fee + element.tut_fee + element.libry_fee;
            gFeeFixed += totalFeeFixed
            totalFeePaid = universityFeePaid + nasaFeePaid + tuitionFeePaid + libryFeePaid;
            gFeePaid += totalFeePaid
            balance = totalFeeFixed - totalFeePaid;
            gBalance += balance
        }
        body += `<tr>
                        <td>${element.year}</td>
                        <td>${element.acd_year}</td>
                        <td>${numberWithCommas(element.uni_fee)}</td>
                        <td>${numberWithCommas(element.tut_fee)}</td>
                        <td>${element.cid == 1 ? numberWithCommas(element.inst_fee) : numberWithCommas(element.nasa_fee)}</td>
                        <td>${element.cid == 1 ? numberWithCommas(element.old_bal) : numberWithCommas(element.libry_fee)}</td>
                        <td>${numberWithCommas(totalFeeFixed)}</td>
                        <td>${numberWithCommas(universityFeePaid)}</td>
                        <td>${numberWithCommas(tuitionFeePaid)}</td>
                        <td>${element.cid == 1 ? numberWithCommas(instituteFeePaid) : numberWithCommas(nasaFeePaid)}</td>
                        <td>${element.cid == 1 ? numberWithCommas(oldBalanceFeePaid) : numberWithCommas(libryFeePaid)}</td>
                        <td>${numberWithCommas(totalFeePaid)}</td>
                        <td>${numberWithCommas(element.uni_fee - universityFeePaid)}</td>
                        <td>${numberWithCommas(element.tut_fee - tuitionFeePaid)}</td>
                        <td>${element.cid == 1 ? numberWithCommas(element.inst_fee - instituteFeePaid) : numberWithCommas(element.nasa_fee - nasaFeePaid)}</td>
                        <td>${element.cid == 1 ? numberWithCommas(element.old_bal - oldBalanceFeePaid) : numberWithCommas(element.libry_fee - libryFeePaid)}</td>
                        <td>${numberWithCommas(balance)}</td>
                    </tr>
                    `;
    }
    body += `
    <tr>
        <td colspan='6' class='text-center'>Grand Total Fee Fixed</td>
        <td>${numberWithCommas(gFeeFixed)}</td>
        <td colspan='4' class='text-center'>Grand Total Paid</td>
        <td>${numberWithCommas(gFeePaid)}</td>
        <td colspan='4' class='text-center'>Grand Total Balance</td>
        <td>${numberWithCommas(gBalance)}</td>
    </tr>
    </tbody>
    </table>
    <h4 style="text-align:center;">1st Year Fee Transactions</h4>
    ${printTransactionYearWise(year1Transaction)}
    <h4 style="text-align:center;">2nd Year Fee Transactions</h4>
    ${printTransactionYearWise(year2Transaction)}
    <h4 style="text-align:center;">3rd Year Fee Transactions</h4>
    ${printTransactionYearWise(year3Transaction)}
    <h4 style="text-align:center;">4th Year Fee Transactions</h4>
    ${printTransactionYearWise(year4Transaction)}
    </div>
    </div>
    </div>`;
    res.send(body);
});

app.post('/getfeetranscationsfordelete', async (req, res) => {
    let data = req.body;
    let transactions = await promisePool.query(`SELECT DISTINCT(trans_id),SUM(paid_amt) AS pait_amt,bal,paid_date,scr_no,id,usn,student_id,delete_sts,(SELECT name FROM student_info WHERE student_id=f.student_id limit 1) AS name FROM fee_transactions f WHERE student_id=(SELECT student_id FROM student_info WHERE usn='${data.usn}' OR student_id='${data.usn}' LIMIT 1) AND acd_year='${data.academicYear}' AND fee_type NOT IN('0','-1') GROUP BY trans_id`);
    res.send(transactions[0]);
});

app.post('/deletestudenttranscationstatus', async (req, res) => {
    let data = req.body;
    let transactions = await promisePool.query(`SELECT (SELECT name FROM student_info WHERE student_id=f.student_id) AS name,SUM(paid_amt) AS paid_amt,usn,trans_id,paid_date,scr_no,admin1,admin2 FROM fee_transactions f WHERE cid='${data.cid}' AND delete_sts=1 GROUP BY trans_id;`);
    let table = `<table class="table table-bordered">
    <thead class="thead-dark">
    <tr>
        <th>sl no</th>
        <th>usn</th>
        <th>name</th>
        <th>transaction id</th>
        <th>paid date</th>
        <th>scroll no</th>
        <th>paid amount</th>`;
    if (data.cid == 1) {
        table += `<th>Registrar</th>
            <th>VP Admin</th>`;
    } else {
        table += `<th>HOD</th>`;
    }
    table += `</tr>
    </thead>
    <tbody>`;
    for (let i = 0; i < transactions[0].length; i++) {
        const element = transactions[0][i];
        let admin1Status = ``;
        let admin2Status = ``;

        if (element.admin1 == '') {
            admin1Status = `<span class='text-warning font-weight-bold'>Pending</span>`;
        } else if (element.admin1.toString().toLowerCase() != 'rejected') {
            admin1Status = `<span class='text-success font-weight-bold'>Approved</span>`;
        } else {
            admin1Status = `<span class='text-danger font-weight-bold'>Rejected</span>`;
        }

        if (element.admin2 == '') {
            admin2Status = `<span class='text-warning font-weight-bold'>Pending</span>`;
        } else if (element.admin2.toString().toLowerCase() != 'rejected') {
            admin2Status = `<span class='text-success font-weight-bold'>Approved</span>`;
        } else {
            admin2Status = `<span class='text-danger font-weight-bold'>Rejected</span>`;
        }
        table += `<tr>
            <td>${i + 1}</td>
            <td>${element.usn}</td>
            <td>${element.name}</td>
            <td>${element.trans_id}</td>
            <td>${formatDate('db', element.paid_date)}</td>
            <td>${element.scr_no}</td>
            <td>${numberWithCommas(element.paid_amt)}</td>`
        if (data.cid == 1) {
            table += `<td>${admin1Status}</td>
                <td>${admin2Status}</td>`;
        } else {
            table += `<td>${admin1Status}</td>`;
        }
        table += `</tr>`;

    }
    table += `</tbody>
    </table>`;
    res.send(table);
});

app.post('/adddeletetranscation', async (req, res) => {
    let data = req.body;
    let transactions = await promisePool.query(`SELECT trans_id FROM fee_transactions f WHERE id='${data.id}'`);
    let update = await promisePool.query(`UPDATE fee_transactions SET delete_sts=1  WHERE trans_id='${transactions[0][0].trans_id}'`);
    if (update[0].affectedRows > 0) {
        res.send(["Record Submitted For Approval", "success"]);
    } else {
        res.send(["Record Not Submitted", "error"]);
    }

});

app.post('/approvedeletetransaction', async (req, res) => {
    let data = req.body;
    let approvalDetails = await promisePool.query(`SELECT admin,(SELECT name FROM admin WHERE id=f.fid) AS name FROM fee_approvals f WHERE cid='${data.cid}' AND fid='${data.fid}' AND type='editTransction'`);

    let query = '';
    if (data.cid == 1) {
        if (approvalDetails[0][0].admin == 1) {
            query = `SELECT DISTINCT(trans_id),SUM(paid_amt) AS pait_amt,bal,paid_date,scr_no,id,usn,student_id,delete_sts,id,(SELECT name FROM student_info WHERE student_id=f.student_id limit 1) AS name,admin1,admin2 FROM fee_transactions f WHERE delete_sts=1 AND fee_type NOT IN('0','-1') AND admin1='' AND admin1!='rejected' GROUP BY trans_id`;
        } else if (approvalDetails[0][0].admin == 2) {
            query = `SELECT DISTINCT(trans_id),SUM(paid_amt) AS pait_amt,bal,paid_date,scr_no,id,usn,student_id,delete_sts,id,(SELECT name FROM student_info WHERE student_id=f.student_id limit 1) AS name,admin1,admin2 FROM fee_transactions f WHERE delete_sts=1 AND fee_type NOT IN('0','-1') AND admin1!='' AND admin1!='rejected' AND admin2='' AND admin2!='rejected' GROUP BY trans_id`;
        }
    } else if (data.cid == 6) {
        query = `SELECT DISTINCT(trans_id),SUM(paid_amt) AS pait_amt,bal,paid_date,scr_no,id,usn,student_id,delete_sts,id,(SELECT name FROM student_info WHERE student_id=f.student_id limit 1) AS name,admin1,admin2 FROM fee_transactions f WHERE delete_sts=1 AND fee_type NOT IN('0','-1') AND admin1='' AND admin1!='rejected' GROUP BY trans_id`;
    }
    let transactions = await promisePool.query(query);
    res.send([transactions[0], approvalDetails[0][0]]);
});

app.post('/deletetranscationupdate', async (req, res) => {
    let data = req.body;
    let query = '';
    let feeFixed = 0;
    if (data.cid == 1) {
        if (data.admin == 1) {
            query = `UPDATE fee_transactions SET admin1='${data.sign}' WHERE trans_id='${data.trans_id}'`
            let transactions = await promisePool.query(query);
            if (transactions[0].affectedRows > 0) {
                if (data.sign == 'rejected') {
                    res.send(["Rejected", "success"]);
                } else {
                    res.send(["Approved", "success"]);
                }
            } else {
                res.send(["Not Approved", "error"]);
            }
        } else if (data.admin == 2) {
            let transaction2 = await promisePool.query(`UPDATE fee_transactions SET admin2='${data.sign}' WHERE trans_id='${data.trans_id}'`);
            if (transaction2[0].affectedRows > 0) {
                if (data.sign == 'rejected') {
                    res.send(["Rejected", "success"]);
                } else {
                    let trDetails = await promisePool.query(`SELECT SUM(paid_amt) AS pait_amt,fee_id FROM fee_transactions f WHERE trans_id='${data.trans_id}'`);
                    let feeDetails = await promisePool.query(`SELECT old_bal,paid_fee,bal,id,uni_fee,tut_fee,inst_fee,othr_fee,nasa_fee,libry_fee FROM fee_details WHERE id='${trDetails[0][0].fee_id}'`);
                    if (data.cid == 1) {
                        feeFixed = feeDetails[0][0].old_bal + feeDetails[0][0].uni_fee + feeDetails[0][0].inst_fee + feeDetails[0][0].tut_fee;
                    } else {
                        feeFixed = feeDetails[0][0].uni_fee + feeDetails[0][0].tut_fee + feeDetails[0][0].nasa_fee + feeDetails[0][0].libry_fee;
                    }
                    let paid_amt = feeDetails[0][0].paid_fee - trDetails[0][0].pait_amt;
                    let bal_amt = feeDetails[0][0].bal + trDetails[0][0].pait_amt;
                    let transaction2 = await promisePool.query(`UPDATE fee_details SET paid_fee='${paid_amt}',bal='${bal_amt}' WHERE id='${feeDetails[0][0].id}'`);
                    if (transaction2[0].affectedRows > 0) {
                        let transaction3 = await promisePool.query(`DELETE FROM  fee_transactions WHERE trans_id='${data.trans_id}'`);
                        if (transaction3[0].affectedRows > 0) {
                            let getAllTransactions = await promisePool.query(`SELECT paid_amt,id  FROM fee_transactions f WHERE fee_id='${feeDetails[0][0].id}' AND fee_type NOT IN('0','-1') ORDER BY id ASC`);
                            if (getAllTransactions[0].length > 0) {
                                let insert = 0;
                                for (let i = 0; i < getAllTransactions[0].length; i++) {
                                    const element = getAllTransactions[0][i];
                                    let bal = feeFixed - element.paid_amt;
                                    feeFixed -= element.paid_amt;
                                    let transaction4 = await promisePool.query(`UPDATE  fee_transactions set bal='${bal}' WHERE id='${element.id}'`);
                                    if (transaction4[0].affectedRows > 0) {
                                        insert++;
                                    }
                                }
                                if (insert > 0) {
                                    if (data.sign == 'rejected') {
                                        res.send(["Rejected", "success"]);
                                    } else {
                                        res.send(["Approved", "success"]);
                                    }
                                } else {
                                    res.send(["Delete Transactions Approved And  paid fee and balance fee updated AND fee transction deleted but all transaction balance not updated", "error"]);
                                }
                            } else {
                                if (data.sign == 'rejected') {
                                    res.send(["Rejected", "success"]);
                                } else {
                                    res.send(["Approved", "success"]);
                                }
                            }
                        } else {
                            res.send(["Delete Transactions Approved And  paid fee and balance fee updated but fee transction not deleted", "error"]);
                        }
                    } else {
                        res.send(["Delete Transactions Approved but paid fee and balance fee not update", "error"]);
                    }
                }
            } else {
                res.send(["Not Approved", "error"]);
            }
        }
    } else if (data.cid == 6) {
        if (data.admin == 1) {
            let transaction2 = await promisePool.query(`UPDATE fee_transactions SET admin1='${data.sign}' WHERE trans_id='${data.trans_id}'`);
            if (transaction2[0].affectedRows > 0) {
                if (data.sign == 'rejected') {
                    res.send(["Rejected", "success"]);
                } else {
                    let trDetails = await promisePool.query(`SELECT SUM(paid_amt) AS pait_amt,fee_id FROM fee_transactions f WHERE trans_id='${data.trans_id}'`);
                    let feeDetails = await promisePool.query(`SELECT paid_fee,bal,id,uni_fee,tut_fee,inst_fee,othr_fee,nasa_fee,libry_fee FROM fee_details WHERE id='${trDetails[0][0].fee_id}'`);
                    if (data.cid == 1) {
                        feeFixed = feeDetails[0][0].old_bal + feeDetails[0][0].uni_fee + feeDetails[0][0].inst_fee + feeDetails[0][0].tut_fee;
                    } else {
                        feeFixed = feeDetails[0][0].uni_fee + feeDetails[0][0].tut_fee + feeDetails[0][0].nasa_fee + feeDetails[0][0].libry_fee;
                    }
                    let paid_amt = feeDetails[0][0].paid_fee - trDetails[0][0].pait_amt;
                    let bal_amt = feeDetails[0][0].bal + trDetails[0][0].pait_amt;
                    let transaction2 = await promisePool.query(`UPDATE fee_details SET paid_fee='${paid_amt}',bal='${bal_amt}' WHERE id='${feeDetails[0][0].id}'`);
                    if (transaction2[0].affectedRows > 0) {
                        let transaction3 = await promisePool.query(`DELETE FROM  fee_transactions WHERE trans_id='${data.trans_id}'`);
                        if (transaction3[0].affectedRows > 0) {
                            let getAllTransactions = await promisePool.query(`SELECT paid_amt,id  FROM fee_transactions f WHERE fee_id='${feeDetails[0][0].id}' AND fee_type NOT IN('0','-1') ORDER BY id ASC`);
                            let insert = 0;
                            for (let i = 0; i < getAllTransactions[0].length; i++) {
                                const element = getAllTransactions[0][i];
                                feeFixed -= paid_amt;
                                bal = feeFixed - paid_amt;
                                let transaction4 = await promisePool.query(`UPDATE  fee_transactions set bal='${bal}' WHERE id='${element.id}'`);
                                if (transaction4[0].affectedRows > 0) {
                                    insert++;
                                }
                            }
                            if (insert > 0) {
                                if (data.sign == 'rejected') {
                                    res.send(["Rejected", "success"]);
                                } else {
                                    res.send(["Approved", "success"]);
                                }
                            } else {
                                res.send(["Delete Transactions Approved And  paid fee and balance fee updated AND fee transction deleted but all transaction balance not updated", "error"]);
                            }
                        } else {
                            res.send(["Delete Transactions Approved And  paid fee and balance fee updated but fee transction not deleted", "error"]);
                        }
                    } else {
                        res.send(["Delete Transactions Approved but paid fee and balance fee not update", "error"]);
                    }
                }
            } else {
                res.send(["Not Approved", "error"]);
            }
        }
    }


});

app.post('/getfeedetailsfordelete', async (req, res) => {
    let data = req.body;
    let feeHeads = '';
    if (data.cid == 1) {
        feeHeads = 'SUM(old_bal+uni_fee+inst_fee+tut_fee)';
    } else {
        feeHeads = 'SUM(uni_fee+tut_fee+nasa_fee+libry_fee)';
    }
    let transactions = await promisePool.query(`SELECT ${feeHeads} AS fee_fixed,(SELECT name FROM student_info WHERE student_id=f.student_id limit 1) AS name,year,acd_year,paid_fee,id FROM fee_details f WHERE student_id=(SELECT student_id FROM student_info WHERE usn='${data.usn}' OR student_id='${data.usn}' LIMIT 1) AND acd_year='${data.academicYear}'`);
    res.send(transactions[0]);
});

app.post('/addfeedetailsdeletetranscation', async (req, res) => {
    let data = req.body;
    let feeHeads = '';

    if (data.cid == 1) {
        feeHeads = 'SUM(old_bal+uni_fee+inst_fee+tut_fee)';
    } else {
        feeHeads = 'SUM(uni_fee+tut_fee+nasa_fee+libry_fee)';
    }

    if (data.paidFee == 0) {
        let deletes = await promisePool.query(`DELETE FROM fee_details WHERE id='${data.id}'`);
        if (deletes[0].affectedRows > 0) {
            res.send(["Record Deleted", "success"]);
        } else {
            res.send(["Record Not Added", "error"]);
        }
    } else {
        let feeDetails = await promisePool.query(`SELECT ${feeHeads} AS fee_fixed,(SELECT sum(paid_amt)  FROM fee_transactions WHERE cid=f.cid AND fee_id=f.id AND fee_type NOT IN('0','-1')) AS paid_fee,student_id,usn,cid,did,year,acd_year,id FROM fee_details f WHERE id='${data.id}'`);
        let details = feeDetails[0][0];
        //in delete student data storing fixation in balance
        let query = `INSERT INTO fee_transactions(trans_id, fee_id, student_id, usn, cid, did, year, acd_year, fee_type, scr_no, paid_date, paid_amt,remark, bal, uid, delete_sts) 
        VALUES ('${await getTransactionId(details.cid, details.did)}','${details.id}','${details.student_id}','${details.usn}','${details.cid}','${details.did}','${details.year}','${details.acd_year}','-1','Delete Student','${formatDate('db', Date())}','${details.paid_fee}','${data.remarks}','${details.fee_fixed}','${data.uid}','2')`;
        let isInsert = await promisePool.query(query);
        if (isInsert[0].insertId > 0) {
            res.send(["Record Submitted For Approval", "success"]);
        } else {
            res.send(["Record Not Added", "error"]);
        }
    }
});

app.post('/getstudentdeletestatus', async (req, res) => {
    let data = req.body;
    let iname = '';
    let deleteStudentDetailsTransactions = await promisePool.query(`SELECT student_id,usn,year,acd_year,bal,paid_amt,remark,admin1,admin2,(SELECT iname FROM college WHERE id=f.cid ) AS iname,(SELECT name FROM student_info WHERE student_id=f.student_id LIMIT 1) AS name FROM fee_transactions f WHERE cid='${data.cid}' AND delete_sts=2`)
    if (deleteStudentDetailsTransactions[0].length > 0) {
        iname = deleteStudentDetailsTransactions[0][0].iname;
    }
    let table = `<h2 class="mt-2 mb-4">${iname}</h2>
    <table class="table table-bordered dataTable">
        <thead class="thead-dark">
            <tr>
                <th>sl no</th>
                <th>usn</th>
                <th>name</th>
                <th>year</th>
                <th>academic year</th>
                <th>fee fixed</th>
                <th>paid fee</th>
                <th>balance</th>
                <th>remark</th>`;
    if (data.cid == 1) {
        table += '<th>Registrar</th><th>VP Admin</th>';
    } else {
        table += '<th>HOD</th>';
    }
    table += `</tr></thead><tbody>`;
    for (let i = 0; i < deleteStudentDetailsTransactions[0].length; i++) {
        const element = deleteStudentDetailsTransactions[0][i];
        let admin1 = '';
        let admin2 = '';

        if (element.admin1 == '') {
            admin1 = `<span class='text-warning'>Pending</span>`;
        } else if (element.admin1.toLowerCase() == 'rejected') {
            admin1 = `<span class='text-danger'>Rejected</span>`;
        } else {
            admin1 = `<span class='text-success'>Approved</span>`;
        }

        if (element.admin2 == '') {
            admin2 = `<span class='text-warning'>Pending</span>`;
        } else if (element.admin2.toLowerCase() == 'rejected') {
            admin2 = `<span class='text-danger'>Rejected</span>`;
        } else {
            admin2 = `<span class='text-success'>Approved</span>`;
        }

        table += `<tr>
            <td>${i + 1}</td>
            <td>${element.usn}</td>
            <td>${element.name}</td>
            <td>${element.year}</td>
            <td>${element.acd_year}</td>
            <td>${numberWithCommas(element.bal)}</td>
            <td>${numberWithCommas(element.paid_amt)}</td>
            <td>${numberWithCommas(element.bal - element.paid_amt)}</td>
            <td>${element.remark}</td>`;
        if (data.cid == 1) {
            table += `<td>${admin1}</td><td>${admin2}</th>`;
        } else {
            table += `<td>${admin1}</td>`;
        }
        table += `</tr>`;

    }
    table += `</tbody></table>`;
    res.send(table)
});

app.post('/approvedeletestudentfeedetails', async (req, res) => {
    let data = req.body;
    let approvalDetails = await promisePool.query(`SELECT admin,(SELECT iname FROM college WHERE id=f.cid) AS iname FROM fee_approvals f WHERE cid='${data.cid}' AND fid='${data.fid}' AND type='feeFixationChange'`);

    let query = '';
    if (data.cid == 1) {
        if (approvalDetails[0][0].admin == 1) {
            query = `SELECT id,usn,year,acd_year,bal,paid_amt,remark,(SELECT name FROM student_info WHERE student_id=f.student_id LIMIT 1) AS name FROM fee_transactions f WHERE delete_sts=2 AND admin1='' AND admin1!='rejected'`;
        } else if (approvalDetails[0][0].admin == 2) {
            query = `SELECT id,usn,year,acd_year,bal,paid_amt,remark,(SELECT name FROM student_info WHERE student_id=f.student_id LIMIT 1) AS name FROM fee_transactions f WHERE delete_sts=2 AND admin1!='' AND admin1!='rejected' AND admin2='' AND admin2!='rejected'`;
        }
    } else if (data.cid == 6) {
        query = `SELECT id,usn,year,acd_year,bal,paid_amt,remark,(SELECT name FROM student_info WHERE student_id=f.student_id LIMIT 1) AS name FROM fee_transactions f WHERE delete_sts=2 AND admin1='' AND admin1!='rejected'`;
    }

    let transactions = await promisePool.query(query);
    res.send([transactions[0], approvalDetails[0][0]]);
});

app.post('/deletefeedetailsupdate', async (req, res) => {
    let data = req.body;
    let query = '';
    if (data.cid == 1) {
        if (data.admin == 1) {
            query = `UPDATE fee_transactions SET admin1='${data.sign}' WHERE id='${data.id}'`
            let transactions = await promisePool.query(query);
            if (transactions[0].affectedRows > 0) {
                if (data.sign == 'rejected') {
                    res.send(["Rejected", "success"]);
                } else {
                    res.send(["Approved", "success"]);
                }
            } else {
                res.send(["Not Approved", "error"]);
            }
        } else if (data.admin == 2) {
            let transaction2 = await promisePool.query(`UPDATE fee_transactions SET admin2='${data.sign}' WHERE id='${data.id}'`);
            let deleteTrDtls = await promisePool.query(`SELECT fee_id FROM fee_transactions  WHERE id='${data.id}'`);
            if (transaction2[0].affectedRows > 0) {
                if (data.sign == 'rejected') {
                    res.send(["Rejected", "success"]);
                } else {
                    let deleteTrns = await promisePool.query(`DELETE FROM fee_transactions  WHERE fee_id='${deleteTrDtls[0][0].fee_id}' AND delete_sts!=2`);
                    if (deleteTrns[0].affectedRows > 0) {
                        let deleteFeeDtls = await promisePool.query(`DELETE FROM fee_details  WHERE id='${deleteTrDtls[0][0].fee_id}'`);
                        if (deleteFeeDtls[0].affectedRows > 0) {
                            res.send(["Approved", "success"]);
                        } else {
                            res.send(["Transction Approved and fee transaction Deleted but fee details not deleted", "error"])
                        }
                    } else {
                        res.send(["Transction Approved But fee transaction and fee details not deleted", "error"])
                    }
                }
            } else {
                res.send(["Not Approved", "error"]);
            }
        }
    } else if (data.cid == 6) {
        if (data.admin == 1) {
            let transaction2 = await promisePool.query(`UPDATE fee_transactions SET admin1='${data.sign}' WHERE id='${data.id}'`);
            if (transaction2[0].affectedRows > 0) {
                if (data.sign == 'rejected') {
                    res.send(["Rejected", "success"]);
                } else {
                    let deleteTrns = await promisePool.query(`DELETE FROM fee_transactions  WHERE fee_id='${data.id}' AND delete_sts!=2`);
                    if (deleteTrns[0].affectedRows > 0) {
                        let deleteFeeDtls = await promisePool.query(`DELETE FROM fee_details  WHERE id='${data.id}'`);
                        if (deleteFeeDtls[0].affectedRows > 0) {
                            res.send(["Approved", "success"]);
                        } else {
                            res.send(["Transction Approved and fee transaction Deleted but fee details not deleted", "error"])
                        }
                    } else {
                        res.send(["Transction Approved But fee transaction and fee details not deleted", "error"])
                    }
                }
            } else {
                res.send(["Not Approved", "error"]);
            }
        }
    }


});

app.post('/getfeedetailsforeditfixation', async (req, res) => {
    let data = req.body;
    let feeHeads = '';
    let heads = ``;
    if (data.cid == 1) {
        feeHeads = 'SUM(old_bal+uni_fee+inst_fee+tut_fee)';
        heads = `old_bal,uni_fee,inst_fee,tut_fee`;
    } else {
        feeHeads = 'SUM(uni_fee+tut_fee+nasa_fee+libry_fee)';
        heads = `uni_fee,tut_fee,nasa_fee,libry_fee`;
    }
    let transactions = await promisePool.query(`SELECT ${feeHeads} AS fee_fixed,${heads},(SELECT name FROM student_info WHERE student_id=f.student_id limit 1) AS name,year,acd_year,paid_fee,id,usn,student_id FROM fee_details f WHERE student_id=(SELECT student_id FROM student_info WHERE usn='${data.usn}' OR student_id='${data.usn}' LIMIT 1) AND acd_year='${data.academicYear}'`);
    res.send(transactions[0][0]);
});

app.post('/addfeedetailsedittranscation', async (req, res) => {
    let data = req.body;
    let feeDetails = await promisePool.query(`SELECT id,student_id,usn,cid,did,year,acd_year,paid_fee FROM fee_details WHERE id='${data.id}'`);
    let paidAmount = `${data.uni_fee}|${data.tut_fee}`;
    let totalFee = parseInt(data.uni_fee) + parseInt(data.tut_fee);
    let query = `INSERT INTO fee_transactions(trans_id,fee_id,student_id,usn,cid,did,year,acd_year,fee_type,scr_no,paid_date,paid_amt,remark,bal,uid) VALUES ('${await getTransactionId(feeDetails[0][0].cid, feeDetails[0][0].did)}','${feeDetails[0][0].id}','${feeDetails[0][0].student_id}','${feeDetails[0][0].usn}','${feeDetails[0][0].cid}','${feeDetails[0][0].did}','${feeDetails[0][0].year}','${feeDetails[0][0].acd_year}','0','Fee Changed','${formatDate('db', Date())}','${paidAmount}','${data.remarks}','${totalFee}','${data.uid}')`;
    let isInsert = await promisePool.query(query);
    if (isInsert[0].insertId > 0) {
        res.send(["Record Submitted For Approval", "success"]);
    } else {
        res.send(["Record Not Added", "error"]);
    }
});

app.post('/getstudenteditfeestatus', async (req, res) => {
    let data = req.body;
    let iname = '';
    let feeHeads = '';
    if (data.cid == 1) {
        feeHeads = 'SUM(old_bal+uni_fee+inst_fee+tut_fee)';
    } else {
        feeHeads = 'SUM(uni_fee+tut_fee+nasa_fee+libry_fee)';
    }
    let deleteStudentDetailsTransactions = await promisePool.query(`SELECT student_id,usn,year,acd_year,bal,remark,admin1,admin2,(SELECT iname FROM college WHERE id=f.cid ) AS iname,(SELECT name FROM student_info WHERE student_id=f.student_id LIMIT 1) AS name,(SELECT ${feeHeads} FROM fee_details WHERE id=f.fee_id) AS fee_fixed FROM fee_transactions f WHERE cid='${data.cid}' AND fee_type=0`);
    if (deleteStudentDetailsTransactions[0].length > 0) {
        iname = deleteStudentDetailsTransactions[0][0].iname;
    }
    let table = `<h2 class="mt-2 mb-4">${iname}</h2>
    <table class="table table-bordered dataTable">
        <thead class="thead-dark">
            <tr>
                <th>sl no</th>
                <th>usn</th>
                <th>name</th>
                <th>year</th>
                <th>academic year</th>
                <th>old fee fixed</th>
                <th>new fee fixed</th>
                <th>remark</th>`;
    if (data.cid == 1) {
        table += '<th>Registrar</th><th>VP Admin</th>';
    } else {
        table += '<th>HOD</th>';
    }
    table += `</tr></thead><tbody>`;
    for (let i = 0; i < deleteStudentDetailsTransactions[0].length; i++) {
        const element = deleteStudentDetailsTransactions[0][i];
        let admin1 = '';
        let admin2 = '';

        if (element.admin1 == '') {
            admin1 = `<span class='text-warning'>Pending</span>`;
        } else if (element.admin1.toLowerCase() == 'rejected') {
            admin1 = `<span class='text-danger'>Rejected</span>`;
        } else {
            admin1 = `<span class='text-success'>Approved</span>`;
        }

        if (element.admin2 == '') {
            admin2 = `<span class='text-warning'>Pending</span>`;
        } else if (element.admin2.toLowerCase() == 'rejected') {
            admin2 = `<span class='text-danger'>Rejected</span>`;
        } else {
            admin2 = `<span class='text-success'>Approved</span>`;
        }

        table += `<tr>
            <td>${i + 1}</td>
            <td>${element.usn}</td>
            <td>${element.name}</td>
            <td>${element.year}</td>
            <td>${element.acd_year}</td>
            <td>${numberWithCommas(element.fee_fixed)}</td>
            <td>${numberWithCommas(element.bal)}</td>
            <td>${element.remark}</td>`;
        if (data.cid == 1) {
            table += `<td>${admin1}</td><td>${admin2}</th>`;
        } else {
            table += `<td>${admin1}</td>`;
        }
        table += `</tr>`;

    }
    table += `</tbody></table>`;
    res.send(table)
});

app.post('/approveeditstudentfeedetails', async (req, res) => {
    let data = req.body;

    let feeHeads = '';
    if (data.cid == 1) {
        feeHeads = 'SUM(old_bal+uni_fee+inst_fee+tut_fee)';
    } else {
        feeHeads = 'SUM(uni_fee+tut_fee+nasa_fee+libry_fee)';
    }

    let approvalDetails = await promisePool.query(`SELECT admin,(SELECT iname FROM college WHERE id=f.cid) AS iname FROM fee_approvals f WHERE cid='${data.cid}' AND fid='${data.fid}' AND type='feeFixationChange'`);

    let query = '';
    if (data.cid == 1) {
        if (approvalDetails[0][0].admin == 1) {
            query = `SELECT id,usn,year,acd_year,bal,paid_amt,remark,(SELECT ${feeHeads} FROM fee_details WHERE id=f.fee_id) AS fee_fixed,(SELECT name FROM student_info WHERE student_id=f.student_id LIMIT 1) AS name FROM fee_transactions f WHERE fee_type=0 AND admin1='' AND admin1!='rejected'`;
        } else if (approvalDetails[0][0].admin == 2) {
            query = `SELECT id,usn,year,acd_year,bal,paid_amt,remark,admin1,(SELECT ${feeHeads} FROM fee_details WHERE id=f.fee_id) AS fee_fixed,(SELECT name FROM student_info WHERE student_id=f.student_id LIMIT 1) AS name FROM fee_transactions f WHERE fee_type=0 AND admin1!='' AND admin1!='rejected' AND admin2='' AND admin2!='rejected'`;
        }
    } else if (data.cid == 6) {
        query = `SELECT id,usn,year,acd_year,bal,paid_amt,remark,(SELECT ${feeHeads} FROM fee_details WHERE id=f.fee_id) AS fee_fixed,(SELECT name FROM student_info WHERE student_id=f.student_id LIMIT 1) AS name FROM fee_transactions f WHERE fee_type=0 AND admin1='' AND admin1!='rejected'`;
    }

    let transactions = await promisePool.query(query);
    res.send([transactions[0], approvalDetails[0][0]]);
});

app.post('/editfeedetailsupdate', async (req, res) => {
    let data = req.body;
    let query = '';
    let feeHeads = '';
    if (data.cid == 1) {
        feeHeads = 'SUM(old_bal+uni_fee+inst_fee+tut_fee)';
    } else {
        feeHeads = 'SUM(uni_fee+tut_fee+nasa_fee+libry_fee)';
    }
    if (data.cid == 1) {
        if (data.admin == 1) {
            query = `UPDATE fee_transactions SET admin1='${data.sign}' WHERE id='${data.id}'`
            let transactions = await promisePool.query(query);
            if (transactions[0].affectedRows > 0) {
                if (data.sign == 'rejected') {
                    res.send(["Rejected", "success"]);
                } else {
                    res.send(["Approved", "success"]);
                }
            } else {
                res.send(["Not Approved", "error"]);
            }
        } else if (data.admin == 2) {
            let transaction2 = await promisePool.query(`UPDATE fee_transactions SET admin2='${data.sign}' WHERE id='${data.id}'`);

            if (transaction2[0].affectedRows > 0) {
                if (data.sign == 'rejected') {
                    res.send(["Rejected", "success"]);
                } else {
                    let oldFeeDetails = await promisePool.query(`SELECT * FROM fee_details WHERE id=(SELECT fee_id FROM fee_transactions WHERE id='${data.id}')`);
                    let changeFeeDetails = await promisePool.query(`SELECT * FROM fee_transactions WHERE id='${data.id}'`);
                    let old_fee_fixed = '';

                    if (data.cid == 1) {
                        old_fee_fixed = oldFeeDetails[0][0].old_bal + oldFeeDetails[0][0].uni_fee + oldFeeDetails[0][0].inst_fee + oldFeeDetails[0][0].tut_fee;
                    } else {
                        old_fee_fixed = oldFeeDetails[0][0].uni_fee + oldFeeDetails[0][0].tut_fee + oldFeeDetails[0][0].nasa_fee + oldFeeDetails[0][0].libry_fee;
                    }

                    let headWiseChangedFeeAmount = changeFeeDetails[0][0]['paid_amt'].split("|");
                    let uni_fee = parseFloat(headWiseChangedFeeAmount[0]);
                    let tut_fee = parseFloat(headWiseChangedFeeAmount[1]);
                    let new_fee_fixed = uni_fee + tut_fee;
                    let balance = new_fee_fixed;
                    let totalPaidAmont = 0;
                    let oldTransactions = await promisePool.query(`SELECT id,paid_amt,bal,fee_id FROM fee_transactions f WHERE  fee_id = '${oldFeeDetails[0][0].id}'  AND fee_type NOT IN('0','-1') `);
                    let trUpdate = 0;
                    for (let i = 0; i < oldTransactions[0].length; i++) {
                        const element = oldTransactions[0][i];
                        balance -= parseFloat(element.paid_amt);
                        totalPaidAmont += parseFloat(element.paid_amt);
                        let updateTr1 = await promisePool.query(`UPDATE fee_transactions SET old_bal='${element.bal}',bal='${balance}',remark='old fee fixed ${old_fee_fixed} AND new fee fixed ${new_fee_fixed}' WHERE id='${element.id}'`);
                        if (updateTr1[0].affectedRows > 0) {
                            let updateTr2 = await promisePool.query(`UPDATE fee_details SET paid_fee='${totalPaidAmont}',bal='${balance}'  WHERE id='${element.fee_id}'`)
                            if (updateTr2[0].affectedRows > 0) {
                                trUpdate++;
                            }
                        }
                    }
                    if (trUpdate > 0) {
                        let updateTr3 = await promisePool.query(`UPDATE fee_details SET uni_fee='${uni_fee}',tut_fee='${tut_fee}'  WHERE id='${oldFeeDetails[0][0].id}'`);
                        if (updateTr3[0].affectedRows > 0) {
                            res.send(["Approved", "success"]);
                        } else {
                            res.send(["Transction Approved and old transaction balance updated but fee fixation not changed", "error"])
                        }
                    } else {
                        res.send(["Transction Approved but old transaction balance not update and fee fixation not changed", "error"])
                    }
                }
            } else {
                res.send(["Not Approved", "error"]);
            }
        }
    } else if (data.cid == 6) {
        if (data.admin == 1) {
            let transaction2 = await promisePool.query(`UPDATE fee_transactions SET admin1='${data.sign}' WHERE id='${data.id}'`);

            if (transaction2[0].affectedRows > 0) {
                if (data.sign == 'rejected') {
                    res.send(["Rejected", "success"]);
                } else {
                    let oldFeeDetails = await promisePool.query(`SELECT * FROM fee_details WHERE id=(SELECT fee_id FROM fee_transactions WHERE id='${data.id}')`);
                    let changeFeeDetails = await promisePool.query(`SELECT * FROM fee_transactions WHERE id='${data.id}'`);
                    let old_fee_fixed = '';

                    if (data.cid == 1) {
                        old_fee_fixed = oldFeeDetails[0][0].old_bal + oldFeeDetails[0][0].uni_fee + oldFeeDetails[0][0].inst_fee + oldFeeDetails[0][0].tut_fee;
                    } else {
                        old_fee_fixed = oldFeeDetails[0][0].uni_fee + oldFeeDetails[0][0].tut_fee + oldFeeDetails[0][0].nasa_fee + oldFeeDetails[0][0].libry_fee;
                    }

                    let headWiseChangedFeeAmount = changeFeeDetails[0][0]['paid_amt'].split("|");
                    let uni_fee = parseFloat(headWiseChangedFeeAmount[0]);
                    let tut_fee = parseFloat(headWiseChangedFeeAmount[1]);
                    let new_fee_fixed = uni_fee + tut_fee;
                    let balance = new_fee_fixed;
                    let totalPaidAmont = 0;
                    let oldTransactions = await promisePool.query(`SELECT id,paid_amt,bal,fee_id FROM fee_transactions f WHERE student_id=(SELECT student_id FROM student_info WHERE usn='${data.usn}' OR student_id='${data.usn}' LIMIT 1) AND fee_id = '${oldFeeDetails[0][0].id}'  AND fee_type NOT IN('0','-1') `);
                    let trUpdate = 0;

                    for (let i = 0; i < oldTransactions[0].length; i++) {
                        const element = oldTransactions[0][i];
                        balance -= element.paid_amt;
                        totalPaidAmont += element.paid_amt;
                        let updateTr1 = await promisePool.query(`UPDATE fee_transactions SET old_bal='${element.bal}',bal='${balance}' remark='old fee fixed ${old_fee_fixed} AND new fee fixed ${new_fee_fixed}' WHERE id='${element.id}'`);
                        if (updateTr1[0].affectedRows > 0) {
                            let updateTr2 = await promisePool.query(`UPDATE fee_transactions SET paid_fee='${totalPaidAmont}',bal='${balance}'  WHERE id='${element.fee_id}'`)
                            if (updateTr2[0].affectedRows > 0) {
                                trUpdate++;
                            }
                        }
                    }
                    if (trUpdate > 0) {
                        let updateTr3 = await promisePool.query(`UPDATE fee_transactions SET uni_fee='${uni_fee}',tut_fee='${tut_fee}'  WHERE id='${oldFeeDetails[0][0].id}'`);
                        if (updateTr3[0].affectedRows > 0) {
                            res.send(["Approved", "success"]);
                        } else {
                            res.send(["Transction Approved and old transaction balance updated but fee fixation not changed", "error"])
                        }
                    } else {
                        res.send(["Transction Approved but old transaction balance not update and fee fixation not changed", "error"])
                    }
                }
            } else {
                res.send(["Not Approved", "error"]);
            }
        }
    }


});

app.post('/getstudentfeelist', async (req, res) => {
    let data = req.body;
    let query = '';
    let feeHeads = '';

    if (data.cid == 1) {
        feeHeads = 'SUM(old_bal+uni_fee+inst_fee+tut_fee)';
    } else {
        feeHeads = 'SUM(uni_fee+tut_fee+nasa_fee+libry_fee)';
    }
    if (data.did == 'All' && data.year == 'All') {
        query = `SELECT  si.usn,si.name,si.student_id,${feeHeads} AS fee_fixed,sa.paid_fee,sa.id,(SELECT iname FROM college WHERE id=sa.cid) AS iname FROM fee_details sa INNER JOIN student_info si ON sa.student_id = si.student_id WHERE sa.cid='${data.cid}' AND sa.acd_year='${data.academicYear}' GROUP BY sa.student_id ORDER BY si.usn ASC`;
    } else if (data.did != '' && data.year == 'All') {
        query = `SELECT  si.usn,si.name,si.student_id,${feeHeads} AS fee_fixed,sa.paid_fee,sa.id,(SELECT iname FROM college WHERE id=sa.cid) AS iname FROM fee_details sa INNER JOIN student_info si ON sa.student_id = si.student_id WHERE sa.cid='${data.cid}' AND  sa.did='${data.did}' AND sa.acd_year='${data.academicYear}' GROUP BY sa.student_id ORDER BY si.usn ASC`;
    } else if (data.did == 'All' && data.year != '') {
        query = `SELECT  si.usn,si.name,si.student_id,${feeHeads} AS fee_fixed,sa.paid_fee,sa.id,(SELECT iname FROM college WHERE id=sa.cid) AS iname FROM fee_details sa INNER JOIN student_info si ON sa.student_id = si.student_id WHERE sa.cid='${data.cid}' AND  sa.year='${data.year}' AND sa.acd_year='${data.academicYear}' GROUP BY sa.student_id ORDER BY si.usn ASC`;
    } else if (data.did != '' && data.year != '') {
        query = `SELECT  si.usn,si.name,si.student_id,${feeHeads} AS fee_fixed,sa.paid_fee,sa.id,(SELECT iname FROM college WHERE id=sa.cid) AS iname FROM fee_details sa INNER JOIN student_info si ON sa.student_id = si.student_id WHERE sa.cid='${data.cid}' AND sa.did='${data.did}' AND  sa.year='${data.year}' AND sa.acd_year='${data.academicYear}' GROUP BY sa.student_id ORDER BY si.usn ASC`;
    }

    // console.log(query)

    let studentList = await promisePool.query(query);
    res.send(studentList[0]);
});

app.post('/getiamarksentry', async (req, res) => {
    let data = req.body;
    let rows = await promisePool.query(`SELECT scode,sem,dv,cid,did,dv,academic_year,fid FROM subject s WHERE id='${data.id}'`);
    let subjectDetails = rows[0][0];
    let list = await promisePool.query(`SELECT  sa.student_id,si.usn,si.name FROM sub_info sa INNER JOIN student_info si ON sa.student_id = si.student_id WHERE scd='${subjectDetails.scode}' AND sem='${subjectDetails.sem}' AND sa.did='${subjectDetails.did}' AND dv='${subjectDetails.dv}' AND sa.cid='${subjectDetails.cid}' AND sa.academic_year='${subjectDetails.academic_year}' ORDER BY si.usn ASC`);
    let qpDetails = await promisePool.query(`SELECT qno,marks,(SELECT cos FROM nba_co WHERE id=n.co_id) as cos FROM nba_question n WHERE cid='${subjectDetails.cid}' AND did='${subjectDetails.did}' AND scode='${subjectDetails.scode}' AND sem='${subjectDetails.sem}' AND dv='${subjectDetails.dv}' AND academic_year='${subjectDetails.academic_year}' AND internal='${data.internal}' AND qno NOT IN('part-a','part-B','or')`);
    res.send([list[0], qpDetails[0]]);
});

app.post('/addiamarks', async (req, res) => {
    let data = req.body;
    let insert = {
        fid: data.fid,
        student_id: data.student_id,
        scode: data.scode,
        marks_type: data.marksType,
        max_marks: data.max_marks,
        qno: data.qno,
        marks: data.marks,
        internal: data.internal,
        cid: data.cid,
        did: data.did,
        sem: data.sem,
        dv: data.dv,
        academic_year: data.academicYear,
        admin: data.uid,
    }
    let checkRecord = await db.query(`SELECT id FROM nba_marks WHERE cid='${insert.cid}' AND scode='${insert.scode}' AND dv='${insert.dv}' AND internal='${insert.internal}' AND qno='${insert.qno}' AND academic_year='${insert.academic_year}'`);
    if (checkRecord.length == 0) {
        let isInsert = await db.insert('nba_marks', insert);
        res.send([isInsert.insertId]);
    } else {
        let isInsert = await db.update('nba_marks', insert, { id: checkRecord.id });
        res.send([isInsert.affectedRows]);
    }
});