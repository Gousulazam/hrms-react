const mysql = require('mysql');
const mysql2 = require('mysql2');
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

app.post('/checkuser', (req, res) => {
    let data = req.body;
    mysqlConnection.query('SELECT id,title,name,cid,did,role,photo,(SELECT GROUP_CONCAT(role_name) FROM user_role WHERE fid=a.id ORDER BY prt ASC limit 1) roles FROM `admin` a WHERE (email=? OR mobile=?) AND pass=?', [data.email, data.email, data.password], (err, rows, fields) => {
        if (!err)
            res.send(rows);
        else
            console.log(err);
    })
});

app.post('/masterlogin', (req, res) => {
    let data = req.body;
    mysqlConnection.query(`SELECT id,title,name,cid,did,role,photo,(SELECT GROUP_CONCAT(role_name) FROM user_role WHERE fid=a.id ORDER BY prt ASC limit 1) roles FROM admin a WHERE id='${req.body.fid}'`, (err, rows, fields) => {
        if (!err)
            res.send(rows);
        else
            console.log(err);
    })
});

app.post('/getacademicyearoption', (req, res) => {
    let data = req.body;
    mysqlConnection.query('SELECT academic_year FROM `academic_year` WHERE cid=? ORDER BY academic_year DESC', [data.cid], (err, rows, fields) => {
        if (!err) {

            let option = `<option value="">Select Academic Year</option>`;
            for (let index = 0; index < rows.length; index++) {
                option += `<option value="${rows[index].academic_year}">${rows[index].academic_year}</option>`
            }
            res.send(option);
        } else {
            console.log(err);
        }
    })
});

app.post('/getsubjectoptionbyfidandacademicyear', (req, res) => {
    let data = req.body;
    var option = `<option value="">Select Subject</option>`;
    if (data.semType != '') {
        mysqlConnection.query('SELECT id,sname,scode,dv,sem,batch FROM `subject` WHERE fid=? AND sem%2=? AND stype=? AND academic_year=? ORDER BY sem,scode ASC,stype DESC', [data.fid, data.semType, data.stype, data.academicYear], (err, rows, fields) => {
            if (!err) {
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
            } else {
                console.log(err);
            }
        })
    } else {
        res.send(option);
    }
});

app.post('/getsubjectdetailbyid', (req, res) => {
    let data = req.body;
    mysqlConnection.query('SELECT sname,scode,sem,cid,dept,academic_year,(SELECT iname FROM `college` WHERE id=s.cid) as iname FROM `subject` s WHERE id=?', [data.id], (err, rows, fields) => {
        if (!err) {
            res.send(rows);
        } else {
            console.log(err);
        }
    })
});

app.post('/getsubjectreport', (req, res) => {
    let data = req.body;

    mysqlConnection.query('SELECT scode,sem,cid,did,dv,academic_year FROM `subject` s WHERE id=?', [data.id], (err, rows, fields) => {
        if (!err) {
            let subjectDetails = rows[0];
            mysqlConnection.query(`SELECT  sa.student_id,si.usn,si.name,(SELECT COUNT(id) FROM class WHERE scd='${subjectDetails.scode}' AND sem='${subjectDetails.sem}' AND dv='${subjectDetails.dv}' AND acd_year='${subjectDetails.academic_year}' AND date BETWEEN '${data.fdate}' AND '${data.tdate}') AS class_conducted,(SELECT COUNT(id) FROM attend WHERE student_id=sa.student_id AND scd='${subjectDetails.scode}' AND sem='${subjectDetails.sem}' AND dv='${subjectDetails.dv}' AND academic_year='${subjectDetails.academic_year}' AND date BETWEEN '${data.fdate}' AND '${data.tdate}') AS class_attended FROM student_academic sa INNER JOIN student_info si ON sa.student_id = si.student_id WHERE sem='${subjectDetails.sem}' AND sa.did='${subjectDetails.did}' AND dv='${subjectDetails.dv}' AND sa.cid='${subjectDetails.cid}' AND sa.academic_year='${subjectDetails.academic_year}' ORDER BY si.usn ASC`, (err, rows, fields) => {
                if (!err) {
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
                } else {
                    console.log(err);
                }
            })
        } else {
            console.log(err);
        }
    })
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

app.post('/getquestionpaper', (req, res) => {
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
        mysqlConnection.query(`SELECT sname,scode,sem,cid,dv,dept,did,academic_year,(SELECT iname FROM college WHERE id=s.cid) as iname,(SELECT exam_date FROM cie_timetable WHERE cid=s.cid AND did=s.did AND scode=s.scode AND dv=s.dv AND internal='${data.internal}' AND academic_year=s.academic_year ) AS exam_date,(SELECT start_time FROM cie_timetable WHERE cid=s.cid AND did=s.did AND scode=s.scode AND dv=s.dv AND internal='${data.internal}' AND academic_year=s.academic_year ) AS start_time,(SELECT end_time FROM cie_timetable WHERE cid=s.cid AND did=s.did AND scode=s.scode AND dv=s.dv AND internal='${data.internal}' AND academic_year=s.academic_year ) AS end_time FROM subject s WHERE id='${data.subject}'`, (err, rows, fields) => {
            if (!err) {
                let subjectDetails = rows[0];
                var today = new Date(subjectDetails.exam_date);
                var dd = String(today.getDate()).padStart(2, '0');
                var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
                var yyyy = today.getFullYear();
                let exam_date = `${dd}-${mm}-${yyyy}`;
                let duration = diff(subjectDetails.start_time, subjectDetails.end_time).split(":");
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
            </table>`
                mysqlConnection.query(`SELECT qno,quest,marks,co_id,(SELECT cos FROM nba_co WHERE id=n.co_id) as co,(SELECT colevel FROM nba_co_level WHERE id=n.colevel) as cl FROM nba_question n WHERE cid='${subjectDetails.cid}' AND did='${subjectDetails.did}' AND scode='${subjectDetails.scode}' AND dv='${subjectDetails.dv}' AND internal='${data.internal}' AND academic_year='${subjectDetails.academic_year}' ORDER BY id ASC`, (err, rows2, fields) => {
                    if (!err) {
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
                    } else {
                        console.log(err);
                    }
                })
                // res.send(rows);
            } else {
                console.log(err);
            }
        })
    }

});

app.post('/getfacultyhandlingsubject', (req, res) => {
    let data = req.body;

    if (data.semType != '') {
        mysqlConnection.query(`SELECT id,sname,scode,dv,sem,fname,dept,batch FROM subject WHERE fid='${data.fid}' AND sem%2='${data.semType}' AND academic_year='${data.academicYear}' ORDER BY sem,scode ASC,stype DESC`, (err, rows, fields) => {
            if (!err) {
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
            } else {
                console.log(err);
            }
        })
    } else {
        res.send(option);
    }
});

app.post('/getMenuRoleWise', (req, res) => {
    let data = req.body;
    mysqlConnection.query('SELECT path FROM `user_menu` WHERE cid=? AND post=? AND status=?', [data.userDetails.cid, data.role, 1], (err, rows, fields) => {
        if (!err) {
            let menu = `<li style="font-size:16px;font-weight:bold;color:white;" class="navbar-brand">${data.userDetails.name}<br />Employee ID:${data.userDetails.id}</span></a>
        </li><li>
        <a href="/dashboard"> <i class="menu-icon fa fa-dashboard"></i>Dashboard </a>
    </li>`;
            for (let index = 0; index < rows.length; index++) {
                menu += rows[index].path;
            }
            res.send(menu);
        } else {
            console.log(err);
        }
    })
});

app.post('/getpreviousyeareresource', (req, res) => {
    let data = req.body;
    mysqlConnection.query(`SELECT subject,scode,sem,dv,title,utp,path FROM esrc WHERE fid='${data.fid}' AND academic_year='${data.academicYear}'`, (err, rows, fields) => {
        if (!err) {
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
        } else {
            console.log(err);
        }
    })
});

app.post('/getcurrentyeareresource', (req, res) => {
    let data = req.body;
    mysqlConnection.query(`SELECT id,subject,scode,sem,dv,title,utp,path FROM esrc WHERE fid='${data.fid}' AND academic_year=(SELECT MAX(academic_year) FROM academic_year WHERE cid='${data.cid}')`, (err, rows1, fields) => {
        if (!err) {
            res.send(rows1);
        } else {
            console.log(err);
        }
    })
});

app.post('/adderesource', (req, res) => {
    let data = req.body;
    mysqlConnection.query(`SELECT sname,scode,fid,fname,dept,did,dv,sem,academic_year,(SELECT MAX(id)+1 FROM esrc) as max_id FROM subject s WHERE id='${data.subject}'`, (err, rows1, fields) => {
        if (!err) {
            let subjectDetails = rows1[0];
            let path = '';
            let oldPath = '';
            if (data.ftype == 'LINK') {
                path = data.link;
                oldPath = data.link;
                sql = `INSERT INTO esrc(subject, scode, fid, fname, dept, did, dv, sem, title, utp, path, path_old, academic_year) VALUES ('${subjectDetails.sname}','${subjectDetails.scode}','${subjectDetails.fid}','${subjectDetails.fname}','${subjectDetails.dept}','${subjectDetails.did}','${subjectDetails.dv}','${subjectDetails.sem}','${data.title}','${data.ftype}','${path}','${oldPath}','${subjectDetails.academic_year}')`;
                mysqlConnection.query(sql, (err, rows2, fields) => {
                    if (!err) {
                        res.send(rows2);
                    } else {
                        console.log(err);
                    }
                })
            } else {
                const newpath = __dirname + "/upload/resource/";
                const file = req.files.file;
                oldPath = file.name;
                file.name = `${subjectDetails['max_id']}_${subjectDetails['scode']}_${subjectDetails['fname']}.` + file.name.split('.')[1];
                const filename = file.name;
                path = `${newpath}${filename}`;

                file.mv(`${newpath}${filename}`, (err) => {
                    if (err) {
                        let h = [];
                        h['insertId'] = 0
                        res.send(h);
                    }

                    sql = `INSERT INTO esrc(subject, scode, fid, fname, dept, did, dv, sem, title, utp, path, path_old, academic_year) VALUES ('${subjectDetails.sname}','${subjectDetails.scode}','${subjectDetails.fid}','${subjectDetails.fname}','${subjectDetails.dept}','${subjectDetails.did}','${subjectDetails.dv}','${subjectDetails.sem}','${data.title}','${data.ftype}','${path}','${oldPath}','${subjectDetails.academic_year}')`;
                    mysqlConnection.query(sql, (err, rows2, fields) => {
                        if (!err) {
                            res.send(rows2);
                        } else {
                            console.log(err);
                        }
                    })
                });

            }
        } else {
            console.log(err);
        }
    })
});

app.delete('/deleteresource/:id', (req, res) => {
    let data = req.params;
    const fs = require('fs')
    let path = __dirname + "/upload/resource/";
    mysqlConnection.query(`SELECT path,utp FROM esrc  WHERE id='${data.id}'`, (err, rows, fields) => {
        if (!err) {
            let file = rows[0].path.split("/");
            let filename = file[file.length - 1];
            path += filename;
            mysqlConnection.query(`DELETE FROM esrc  WHERE id='${data.id}'`, (err, rows1, fields) => {
                if (!err) {
                    if (rows[0].utp != "LINK") {
                        fs.unlinkSync(path)
                    }
                    res.send([1])
                } else {
                    res.send([0])
                    console.log(err);
                }
            })
        } else {
            console.log(err);
        }
    })
    // console.log();
});

app.get('/getcollegeoption', (req, res) => {
    let data = req.body;
    mysqlConnection.query(`SELECT id,name FROM college WHERE prt=1`, (err, rows, fields) => {
        if (!err) {
            let option = `<option value="">Select College</option>`;
            for (let index = 0; index < rows.length; index++) {
                const element = rows[index];
                option += `<option value="${element.id}">${element.name}</option>`;
            }

            res.send(option);
        }
        else {
            console.log(err);
        }
    })
});

app.post('/getdepartmenteoption', (req, res) => {
    let data = req.body;
    mysqlConnection.query(`SELECT id,name FROM dept WHERE cid='${data.cid}'`, (err, rows, fields) => {
        if (!err) {
            let option = `<option value="">Select Department</option>`;
            for (let index = 0; index < rows.length; index++) {
                const element = rows[index];
                option += `<option value="${element.id}">${element.name}</option>`;
            }

            res.send(option);
        }
        else {
            console.log(err);
        }
    })
});

app.post('/getemployeeeoption', (req, res) => {
    let data = req.body;
    mysqlConnection.query(`SELECT id,name,(SELECT GROUP_CONCAT(role_name) FROM user_role WHERE fid=a.id ORDER BY prt ASC limit 1) roles FROM admin a WHERE cid='${data.cid}' AND did='${data.did}' AND status='approved'`, (err, rows, fields) => {
        if (!err) {
            let option = `<option value="">Select Department</option>`;
            for (let index = 0; index < rows.length; index++) {
                const element = rows[index];
                option += `<option value="${element.id}">${element.name} (${element.roles})</option>`;
            }

            res.send(option);
        }
        else {
            console.log(err);
        }
    })
});

app.post('/getcurrentfacultysubjectsoption', (req, res) => {
    let data = req.body;
    var option = `<option value="">Select Subject</option>`;
    if (data.semType != '') {
        mysqlConnection.query(`SELECT id,sname,scode,dv,sem,batch FROM subject s WHERE fid='${data.fid}' AND academic_year=(SELECT MAX(academic_year) FROM academic_year WHERE cid=s.cid) ORDER BY sem,scode ASC,stype DESC`, (err, rows, fields) => {
            if (!err) {
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
            } else {
                console.log(err);
            }
        })
    } else {
        res.send(option);
    }
});

app.post('/addscheme', (req, res) => {
    let data = req.body;
    mysqlConnection.query(`SELECT sname,scode,fid,fname,dept,did,dv,sem,academic_year,(SELECT MAX(id)+1 FROM intu) as max_id FROM subject s WHERE id='${data.subject}'`, (err, rows1, fields) => {
        if (!err) {
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

            file.mv(`${newpath}${filename}`, (err) => {
                if (err) {
                    let h = [];
                    h['insertId'] = 0
                    res.send(h);
                }

                sql = `INSERT INTO intu(subject,scode, fid, fname, cid, did, dept, dv, sem, utype, itype, date, path, path_old,academic_year) VALUES ('${subjectDetails.sname}','${subjectDetails.scode}','${subjectDetails.fid}','${subjectDetails.fname}','${subjectDetails.cid}','${subjectDetails.did}','${subjectDetails.dept}','${subjectDetails.dv}','${subjectDetails.sem}','Scheme','${data.internal}','${data.date}','${path}','${oldPath}','${subjectDetails.academic_year}')`;
                mysqlConnection.query(sql, (err, rows2, fields) => {
                    if (!err) {
                        res.send(rows2);
                    } else {
                        console.log(err);
                    }
                })
            });
        } else {
            console.log(err);
        }
    })
});

app.post('/getcurrentyearscheme', (req, res) => {
    let data = req.body;
    mysqlConnection.query(`SELECT id,subject,scode,sem,dv,utype,itype,path FROM intu WHERE fid='${data.fid}' AND academic_year=(SELECT MAX(academic_year) FROM academic_year WHERE cid='${data.cid}') ORDER BY sem,scode,itype ASC`, (err, rows1, fields) => {
        if (!err) {
            res.send(rows1);
        } else {
            console.log(err);
        }
    })
});

app.delete('/deletescheme/:id', (req, res) => {
    let data = req.params;
    const fs = require('fs')
    let path = __dirname + "/upload/scheme/";
    mysqlConnection.query(`SELECT path FROM intu  WHERE id='${data.id}'`, (err, rows, fields) => {
        if (!err) {
            let file = rows[0].path.split("/");
            let filename = file[file.length - 1];
            path += filename;
            mysqlConnection.query(`DELETE FROM intu  WHERE id='${data.id}'`, (err, rows1, fields) => {
                if (!err) {
                    fs.unlinkSync(path)
                    res.send([1]);
                } else {
                    res.send([0]);
                    console.log(err);
                }
            })
        } else {
            console.log(err);
        }
    })
    // console.log();
});

app.post('/getpreviousyearscheme', (req, res) => {
    let data = req.body;
    mysqlConnection.query(`SELECT id,subject,scode,sem,dv,utype,itype,path FROM intu WHERE fid='${data.fid}' AND academic_year='${data.academicYear}'`, (err, rows, fields) => {
        if (!err) {
            let tbody = ``;
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
        } else {
            console.log(err);
        }
    })
});

app.get('/test', async (req, res) => {
    let data = req.body;
    let rows = await promisePool.query(`SELECT * FROM academic_year`);
    res.send(rows[0]);
});

app.post('/getsubjectreportdetails', (req, res) => {
    let data = req.body;

    mysqlConnection.query(`SELECT scode,sem,cid,did,dv,academic_year FROM subject s WHERE id='${data.id}'`, async (err, rows, fields) => {
        if (!err) {
            let subjectDetails = rows[0];
            let classTaken = await promisePool.query(`SELECT date FROM class WHERE cid='${subjectDetails.cid}' AND did='${subjectDetails.did}' AND sem='${subjectDetails.sem}' AND dv='${subjectDetails.dv}' AND acd_year='${subjectDetails.academic_year}' AND date BETWEEN '${data.fdate}' AND '${data.tdate}'`)
            let studentList = await promisePool.query(`SELECT  sa.student_id,si.usn,si.name FROM sub_info sa INNER JOIN student_info si ON sa.student_id = si.student_id WHERE sem='${subjectDetails.sem}' AND sa.did='${subjectDetails.did}' AND dv='${subjectDetails.dv}' AND sa.cid='${subjectDetails.cid}' AND scd='${subjectDetails.scode}' AND sa.academic_year='${subjectDetails.academic_year}' ORDER BY si.usn ASC`)
            let tbody = ``;
            let dateTr = ``;
            let countTr = ``;
            let percentage = 0;
            for (let i = 0; i < studentList[0].length; i++) {
                const studentDetails = studentList[0][i];
                tbody += `<tr>
                <td>${i + 1}</td>
                <td>${studentDetails['usn']}</td>
                <td>${studentDetails['name']}</td>`;
                let classAttended = 0;
                for (let j = 0; j < classTaken[0].length; j++) {
                    const today = new Date(classTaken[0][j]['date']);
                    var dd = String(today.getDate()).padStart(2, '0');
                    var mm = String(today.getMonth() + 1).padStart(2, '0'); 
                    var yyyy = today.getFullYear();

                    let date =`${yyyy}-${mm}-${dd}`;
                    let status = ``;
                    let checkAttendance = await promisePool.query(`SELECT atn FROM attend WHERE student_id='${studentDetails['student_id']}' AND scd='${subjectDetails.scode}' AND sem='${subjectDetails.sem}' AND dv='${subjectDetails.dv}' AND academic_year='${subjectDetails.academic_year}' AND date='${date}'`)
                    if (checkAttendance[0].length > 0) {
                        if (checkAttendance[0][0].atn > 0) {
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
                if (classTaken[0].length != 0) {
                    percentage = classAttended / classTaken[0].length * 100;
                    percentage = percentage.toString().substring(0, 4);
                } else {
                    percentage = 0;
                }
                tbody += `<td>${classAttended}</td> <td>${percentage}</td> </tr>`;
            }
            let table = `<table class="table table-bordered text-center">
            <thead class="thead-dark">
                <tr>
				    <th colspan="${classTaken[0].length + 5}" class="text-capitalize text-center">classes conducted ${classTaken[0].length}</th>
                </tr>
                <tr class="text-uppercase">
                    <th rowspan="3">sl no</th>
                    <th rowspan="3">usn</th>
                    <th rowspan="3">name</th>
				
                    <th colspan="${classTaken[0].length}">attended</th>	
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
        } else {
            console.log(err);
        }
    })
});