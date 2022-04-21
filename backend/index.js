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

app.post('/getsubjectdetailbyid', async (req, res) => {
    let data = req.body;
    let rows = await promisePool.query(`SELECT sname,scode,sem,cid,dept,academic_year,(SELECT iname FROM college WHERE id=s.cid) as iname FROM subject s WHERE id='${data.id}'`);
    res.send(rows[0]);

    // mysqlConnection.query('SELECT sname,scode,sem,cid,dept,academic_year,(SELECT iname FROM `college` WHERE id=s.cid) as iname FROM `subject` s WHERE id=?', [data.id], (err, rows, fields) => {
    //     if (!err) {
    //         res.send(rows);
    //     } else {
    //         console.log(err);
    //     }
    // })
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
    mysqlConnection.query(`SELECT id,name,(SELECT GROUP_CONCAT(role_name) FROM user_role WHERE fid=a.id ORDER BY prt ASC limit 1) roles FROM admin a WHERE cid='${data.cid}' AND did='${data.did}' AND status='approved'  ORDER BY name ASC`, (err, rows, fields) => {
        if (!err) {
            let option = `<option value="">Select Employee</option>`;
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

app.post('/test', async (req, res) => {
    let classTaken = await promisePool.query(`SELECT academic_year FROM academic_year`)
    res.send(classTaken[0]);
    // formatDate('db',"2022-04-19");
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

                    let date = `${yyyy}-${mm}-${dd}`;
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

app.post('/viewattendance', (req, res) => {
    let data = req.body;

    mysqlConnection.query(`SELECT scode,sem,cid,did,dv,academic_year FROM subject s WHERE id='${data.id}'`, async (err, rows, fields) => {
        if (!err) {
            let subjectDetails = rows[0];
            let classTaken = await promisePool.query(`SELECT id,stim,etim,(SELECT topicd FROM tlsnpln WHERE id=c.lp_id) AS topic FROM class c WHERE cid='${subjectDetails.cid}' AND did='${subjectDetails.did}' AND sem='${subjectDetails.sem}' AND dv='${subjectDetails.dv}' AND acd_year='${subjectDetails.academic_year}' AND date='${data.fdate}'`)
            let table = ``;
            if (classTaken[0].length > 0) {
                for (let i = 0; i < classTaken[0].length; i++) {
                    const classDetails = classTaken[0][i];
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
                    console.log(`SELECT  sa.student_id,si.usn,si.name FROM attend sa INNER JOIN student_info si ON sa.student_id = si.student_id WHERE class_id='${classDetails.id}' ORDER BY si.usn ASC`)
                    let studentList = await promisePool.query(`SELECT  sa.student_id,si.usn,si.name,sa.atn FROM attend sa INNER JOIN student_info si ON sa.student_id = si.student_id WHERE class_id='${classDetails.id}' ORDER BY si.usn ASC`);
                    for (let j = 0; j < studentList[0].length; j++) {
                        const studentDetails = studentList[0][j];
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
        } else {
            console.log(err);
        }
    })
});


app.post('/getiareport', (req, res) => {
    let data = req.body;
    let getIaMarks = async (studentId, scode, did, dv, academicYear, internal, fid) => {
        let a = 0;
        let b = 0;
        let parts = new Array(2);
        for (var n = 0; n < parts.length; n++) {
            parts[n] = new Array(2);
        }

        let qp = await promisePool.query(`SELECT qno FROM nba_question WHERE fid='${fid}' AND scode='${scode}' AND internal='${internal}' AND dv='${dv}' AND did='${did}' AND academic_year='${academicYear}' ORDER BY id ASC`);
        for (let k = 0; k < qp[0].length; k++) {
            const element = qp[0][k];
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
                    answerSheet1 = await promisePool.query(`SELECT marks FROM nba_marks WHERE student_id='${studentId}' AND scode='${scode}' AND marks_type='internal' AND  internal='${internal}' AND qno='${element['qno']}'  AND academic_year='${academicYear}'`)
                    if (answerSheet1[0].length > 0) {
                        if (answerSheet1[0][0]['marks'] == 'NA' || answerSheet1[0][0]['marks'] == 'na') {
                            parts[a][b] = 0
                        } else {
                            parts[a][b] = parseInt(answerSheet1[0][0]['marks'])
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
    mysqlConnection.query('SELECT fid,scode,sem,cid,did,dv,academic_year FROM `subject` s WHERE id=?', [data.id], async (err, rows, fields) => {
        if (!err) {
            let subjectDetails = rows[0]

            let tbody = ``;
            let studentList = await promisePool.query(`SELECT  sa.student_id,si.usn,si.name FROM sub_info sa INNER JOIN student_info si ON sa.student_id = si.student_id WHERE sem='${subjectDetails.sem}' AND sa.did='${subjectDetails.did}' AND dv='${subjectDetails.dv}' AND sa.cid='${subjectDetails.cid}' AND scd='${subjectDetails.scode}' AND sa.academic_year='${subjectDetails.academic_year}' ORDER BY si.usn ASC`)
            for (let index = 0; index < studentList[0].length; index++) {
                const element = studentList[0][index];
                let ia1 = await getIaMarks(element.student_id, subjectDetails.scode, subjectDetails.did, subjectDetails.dv, subjectDetails.academic_year, "i", subjectDetails.fid);
                let ia2 = await getIaMarks(element.student_id, subjectDetails.scode, subjectDetails.did, subjectDetails.dv, subjectDetails.academic_year, "ii", subjectDetails.fid);
                let ia3 = await getIaMarks(element.student_id, subjectDetails.scode, subjectDetails.did, subjectDetails.dv, subjectDetails.academic_year, "iii", subjectDetails.fid);
                let marks = await promisePool.query(`SELECT marks FROM el_assignment_marks WHERE scd='${subjectDetails.scode}' and student_id='${element.student_id}' AND academic_year='${subjectDetails.academic_year}'`)
                let average = Math.round(ia1) + Math.round(ia2) + Math.round(ia3) / 3;
                average = average.toString().substring(0, 4);
                let assignmentsMarks = 0;
                if (marks[0].length != 0) {
                    assignmentsMarks = parseInt(marks[0][0]);
                }
                let total = average + assignmentsMarks;
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

        } else {
            console.log(err);
        }
    })
});

app.post('/getlessonplantopic', async (req, res) => {
    let data = req.body;
    if (data.id != '') {
        mysqlConnection.query(`SELECT sname,scode,sem,dv,cid,did,dept,fid,fname,academic_year FROM subject s WHERE id='${data.id}'`, async (err, rows, fields) => {
            if (!err) {
                let subjectDetails = rows[0];
                let lessonPlan = await promisePool.query(`SELECT id,topicd FROM tlsnpln WHERE scode='${subjectDetails.scode}' AND sname='${subjectDetails.sname}' AND (fname='${subjectDetails.fname}' || fid='${subjectDetails.fid}') AND sem='${subjectDetails.sem}' AND dv='${subjectDetails.dv}' AND dept='${subjectDetails.dept}' AND did='${subjectDetails.did}' AND planned_date!='0000-00-00' AND (status='' or status='Not Complete') AND academic_year='${subjectDetails.academic_year}'`)
                let option = `<option value="">Select Topic</option>`;
                for (let i = 0; i < lessonPlan[0].length; i++) {
                    const element = lessonPlan[0][i];
                    option += `<option value="${element.id}">${element.topicd}</option>`;
                }
                res.send(option);
            } else {
                console.log(err);
            }
        })
    }

});

app.post('/getlablessonplantopic', async (req, res) => {
    let data = req.body;
    if (data.id != '') {
        mysqlConnection.query(`SELECT scode,sem,dv,batch,academic_year FROM subject s WHERE id='${data.id}'`, async (err, rows, fields) => {
            if (!err) {
                let subjectDetails = rows[0];
                let lessonPlan = await promisePool.query(`SELECT id,experiment FROM tlsnpln_lab WHERE scode='${subjectDetails.scode}' AND sem='${subjectDetails.sem}' AND dv='${subjectDetails.dv}' AND batch='${subjectDetails.batch}' AND (status='' or status='Not Complete') AND academic_year='${subjectDetails.academic_year}'`)
                let option = `<option value="">Select Experiment</option>`;
                for (let i = 0; i < lessonPlan[0].length; i++) {
                    const element = lessonPlan[0][i];
                    option += `<option value="${element.id}">${element.experiment}</option>`;
                }
                res.send(option);
            } else {
                console.log(err);
            }
        })
    }

});

app.post('/getattendancelist', async (req, res) => {
    let data = req.body;
    if (data.id != '') {
        let rows = await promisePool.query(`SELECT sname,scode,sem,cid,did,dv,academic_year FROM subject s WHERE id='${data.id}'`);
        let subjectDetails = rows[0][0];
        let studentList = await promisePool.query(`SELECT  sa.student_id,sa.scd,si.usn,si.name FROM sub_info sa INNER JOIN student_info si ON sa.student_id = si.student_id WHERE sem='${subjectDetails.sem}' AND sa.did='${subjectDetails.did}' AND dv='${subjectDetails.dv}' AND sa.cid='${subjectDetails.cid}' AND sa.academic_year='${subjectDetails.academic_year}' AND scd='${subjectDetails.scode}' ORDER BY si.usn ASC`);
        res.send(studentList[0]);
    }
});

app.post('/attendanceAdded', async (req, res) => {
    let data = req.body;
    const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const d = new Date(data.date);
    let day = weekday[d.getDay()];
    if (data.id != '') {
        let date = formatDate('db', data.date)
        mysqlConnection.query(`SELECT sname,scode,sem,cid,college,dept,did,dv,stype,academic_year,fname,fid,(SELECT period FROM sal_ttable WHERE scode='s.scode' AND sem='s.sem' AND dv='s.dv' AND fid='s.fid' AND day='${day}') AS period FROM subject s WHERE id=?`, [data.id], async (err, rows, fields) => {
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
                            attendance = await promisePool.query(`INSERT INTO attend(class_id,student_id,dept,did,college,cid,sem,dv,scd,atn,academic_year,date) VALUES ('${classInsert[0].insertId}','${element3.student_id}','${subjectDetails.dept}','${subjectDetails.did}','${subjectDetails.college}','${subjectDetails.cid}','${subjectDetails.sem}','${subjectDetails.dv}','${element3.scode}','${element3.values}','${subjectDetails.academic_year}','${date}')`);
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

app.post('/labattendanceAdded', async (req, res) => {
    let data = req.body;
    const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const d = new Date(data.date);
    let day = weekday[d.getDay()];
    if (data.id != '') {
        let date = formatDate('db', data.date)
        mysqlConnection.query(`SELECT sname,scode,sem,cid,college,dept,did,dv,stype,academic_year,fname,fid,(SELECT period FROM sal_ttable WHERE scode='s.scode' AND sem='s.sem' AND dv='s.dv' AND fid='s.fid' AND day='${day}') AS period FROM subject s WHERE id=?`, [data.id], async (err, rows, fields) => {
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
                            attendance = await promisePool.query(`INSERT INTO lab_attend(class_id,student_id,dept,did,college,cid,sem,dv,scd,atn,academic_year,date) VALUES ('${classInsert[0].insertId}','${element3.student_id}','${subjectDetails.dept}','${subjectDetails.did}','${subjectDetails.college}','${subjectDetails.cid}','${subjectDetails.sem}','${subjectDetails.dv}','${element3.scode}','${element3.values}','${subjectDetails.academic_year}','${date}')`);
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
            if(insert[0].affectedRows > 0){
                insertCheck++;
            }
        } else {
            let insert = await promisePool.query(`INSERT INTO nba_pso(fid, cid, did,pso,stmt,academic_year) VALUES ('${data.fid}','${data.cid}','${data.did}','${element.pso}','${element.stmt}','${data.academic_year}')`);
            if(insert[0].insertId > 0){
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

app.delete('/deletepso/:id', async(req, res) => {
    let data = req.params;
    let rows = await promisePool.query(`DELETE FROM nba_pso WHERE id='${data.id}'`);
    res.send([rows[0].affectedRows]);
});