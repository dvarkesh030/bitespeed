"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require('express');
var mysql = require('mysql');
var app = express();
var port = 3000;
app.get('/', function (req, res) {
    res.send('hello there its working');
    console.log(req.query);
});
app.listen(port, function () {
    console.log('connected Successfully on port ${port}');
});
app.use(express.urlencoded(({ extended: false })));
app.use(express.json()); // to support JSON-encoded bodies
app.post('/identify', function (req, res) {
    var pool = mysql.createPool({
        host: "localhost",
        user: "root",
        password: "",
        database: "bitespeed",
        connectionLimit: 50,
        multipleStatements: true
    });
    pool.getConnection(function (err, conn) {
        if (err) {
            console.log('error');
            res.send(err).statusCode = 400;
        }
        else {
            conn.query('select count(*) as c from contacts where email=? and phoneNumber=?', [req.body.email, req.body.phoneNumber], function (err, rows) {
                if (err) {
                    conn.release();
                    return res.send({
                        status: false,
                        statusCode: 400
                    });
                }
                var Qdata = rows[0];
                if (Qdata == undefined) {
                    conn.release();
                    return res.send({
                        queryhasnodata: "no data by query of count email and phonenumber",
                    });
                }
                else {
                    conn.query('insert into contacts(phoneNumber,email,linkPrecedence,createdAt,updatedAt) values(?,?,\'primary\',current_date(),current_date()) ', [req.body.phonenumber, req.body.email]);
                    conn.query('select count(*) from contacts where email=? ', [req.body.email]);
                    var QMailidCount = rows[0];
                    if (QMailidCount == undefined) {
                        conn.release();
                        return res.send({
                            queryhasnodata: "no data by query of Q Mail id Count",
                        });
                    }
                    conn.query('select count(*) from contacts where phonenumber=? ', [req.body.phonenumber]);
                    var QphonenumberidCount = rows[0];
                    if (QphonenumberidCount == undefined) {
                        conn.release();
                        return res.send({
                            queryhasnodata: "no data by query of Q phonenumber id Count",
                        });
                    }
                    else {
                        conn.query(' update contacts set linkPrecedence=\'secondary\' where email=? ', [req.body.email]);
                        conn.query(' update contacts set linkPrecedence=\'secondary\' where phonenumber=? ', [req.body.phonenumber]);
                        conn.query('update contacts set linkPrecedence=\'primary\' where id in(select id from contacts order by createdAt limit 1) ');
                    }
                }
                conn.query('select id as primaryid,email as primaryemail,phonenumber as primaryphn from contacts order by createdAt limit 1 ', function (err, rows) {
                    var primarycontact = rows[0].primaryid;
                    var primaryemail = rows[0].primaryemail;
                    var primaryphn = rows[0].primaryphn;
                });
                conn.query('select email as secondaryemails from contacts where email=? or phonenumber=? order by createdAt desc ', [req.body.phonenumber, req.body.email], function (err, rows) {
                    var secondaryEmails = [];
                    for (var i = 0; i < rows.length; i++) {
                        secondaryEmails.push(rows[i].secondaryemails);
                    }
                });
                conn.query('select phonenumber as secondarynumbers from contacts where email=? or phonenumber=? order by createdAt desc  ', [req.body.phonenumber, req.body.email], function (err, rows) {
                    var secondaryNums = [];
                    for (var i = 0; i < rows.length; i++) {
                        secondaryNums.push(rows[i].secondarynumbers);
                    }
                });
                conn.query('select email ,phonenumber ,id from contacts where email=? or phonenumber=? order by createdAt desc  ', [req.body.email, req.body.phonenumber], function (err, rows) {
                    var ids = []; // Create an empty array to store IDs
                    for (var i = 0; i < rows.length; i++) {
                        ids.push(rows[i].id); // Extract IDs using a loop
                    }
                    var emails = []; // Create an empty array to store IDs
                    for (var i = 0; i < rows.length; i++) {
                        emails.push(rows[i].email); // Extract IDs using a loop
                    }
                    var phns = []; // Create an empty array to store IDs
                    for (var i = 0; i < rows.length; i++) {
                        if (rows[i].phonenumber != null) {
                            phns.push(rows[i].phonenumber); // Extract IDs using a loop
                        }
                    }
                    // Extract IDs from each row
                    res.send(JSON.stringify({
                        "contact": {
                            "primaryContatctId": ids[0],
                            "emails": emails, // first element being email of primary contact 
                            "phoneNumbers": phns, // first element being phoneNumber of primary contact
                            "secondaryContactIds": ids // Array of all Contact IDs that are "secondary" to the primary contact
                        }
                    }));
                });
                conn.release();
            });
        }
    });
});
