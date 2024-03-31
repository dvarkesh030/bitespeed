"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mysql_1 = __importDefault(require("mysql"));
const app = (0, express_1.default)();
const port = 3000;
app.get('/', (req, res) => {
    res.send('hello there its working');
    console.log(req.query);
});
app.listen(port, () => {
    console.log('connected Successfully on port ${port}');
});
app.use(express_1.default.urlencoded(({ extended: false })));
app.use(express_1.default.json()); // to support JSON-encoded bodies
app.post('/identify', (req, res) => {
    var pool = mysql_1.default.createPool({
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
                    if (Qdata.c == 0) {
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
                    }
                    else if (Qdata.c == 1) {
                        conn.query('update contacts set linkPrecedence=\'secondary\' where id in (select id from contacts where email=?)', [req.body.email]);
                        var QMaildata = rows[0];
                        if (QMaildata == undefined) {
                            conn.release();
                            return res.send({
                                queryhasnodata: "no data by query of select ids with email",
                            });
                        }
                    }
                    else if (Qdata.c > 1) {
                        conn.query('update contacts set linkPrecedence=\'secondary\' where id in (select id from contacts where email=?)', [req.body.email]);
                        var QMaildata = rows[0];
                        if (QMaildata == undefined) {
                            conn.release();
                            return res.send({
                                queryhasnodata: "no data by query of select ids with email",
                            });
                        }
                    }
                }
                res.send({
                    "contact": {
                        "primaryContatctId": 1,
                        "emails": [], // first element being email of primary contact 
                        "phoneNumbers": [], // first element being phoneNumber of primary contact
                        "secondaryContactIds": [] // Array of all Contact IDs that are "secondary" to the primary contact
                    },
                    "count": Qdata.c
                });
                conn.release();
            });
        }
    });
});
