const mysql = require('mysql');
const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');
var app = express();
//Configuring express server
app.use(bodyparser.json());
app.use(cors());

//MySQL details
var mysqlConnection = mysql.createConnection({
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

app.post('/getMenuRoleWise', (req, res) => {
    let data = req.body;
    mysqlConnection.query('SELECT path FROM `user_menu` WHERE cid=? AND post=?', [data.userDetails.cid, data.role], (err, rows, fields) => {
        if (!err){
            let menu = `<li style="font-size:16px;font-weight:bold;color:white;" class="navbar-brand">${data.userDetails.name}<br />Employee ID:${data.userDetails.id}</span></a>
        </li><li>
        <a href="/dashboard"> <i class="menu-icon fa fa-dashboard"></i>Dashboard </a>
    </li>`;
            for (let index = 0; index < rows.length; index++) {
                menu+=rows[index].path;
            }
            res.send(menu);
        }else{
            console.log(err);
        }
    })
});