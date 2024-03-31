
import express from 'express';
import { Request,Response } from 'express';
import mysql from 'mysql';



const app = express();
const port = 3000;
app.get('/', (req:Request , res:Response)=> {
    res.send('hello there its working');
    console.log(req.query);
});
app.listen(port,()=>{
    console.log('connected Successfully on port ${port}')
});
app.use(express.urlencoded(({ extended: false })));
app.use(express.json()); // to support JSON-encoded bodies

app.post('/identify',(req:Request , res:Response)=>{
    var pool = mysql.createPool({
        host:"localhost",
        user : "root",
        password:"",
        database: "bitespeed",
        connectionLimit:50,
        multipleStatements:true
    });
    pool.getConnection(function (err:any,conn:any){
        if(err){
            console.log('error');
            res.send(err).statusCode=400;
        }else{
            conn.query('select count(*) as c from contacts where email=? and phoneNumber=?',[req.body.email,req.body.phoneNumber],function(err:any,rows:any){
                if(err){
                    conn.release();
                    return res.send({
                        status:false,
                        statusCode:400
                    });
                }
                var Qdata = rows[0];
                if(Qdata == undefined){
                    conn.release();
                    return res.send({
                        queryhasnodata:"no data by query of count email and phonenumber",
                    });
                }else{
                    if(Qdata.c==0){
                        conn.query('select count(*) from contacts where email=? ',[req.body.email]);
                        var QMailidCount = rows[0];
                        if(QMailidCount == undefined){
                            conn.release();
                            return res.send({
                                queryhasnodata:"no data by query of Q Mail id Count",
                            });
                        }
                        conn.query('select count(*) from contacts where phonenumber=? ',[req.body.phonenumber]);
                        var QphonenumberidCount = rows[0];
                        if(QphonenumberidCount == undefined){
                            conn.release();
                            return res.send({
                                queryhasnodata:"no data by query of Q phonenumber id Count",
                            });
                        
                        }

                    }else if(Qdata.c==1){
                        conn.query('update contacts set linkPrecedence=\'secondary\' where id in (select id from contacts where email=?)',[req.body.email]);
                        var QMaildata = rows[0];
                        if(QMaildata == undefined){
                            conn.release();
                            return res.send({
                                queryhasnodata:"no data by query of select ids with email",
                            });
                        }
                    }else if(Qdata.c>1) {
                        conn.query('update contacts set linkPrecedence=\'secondary\' where id in (select id from contacts where email=?)',[req.body.email]);
                        var QMaildata = rows[0];
                        if(QMaildata == undefined){
                            conn.release();
                            return res.send({
                                queryhasnodata:"no data by query of select ids with email",
                            });
                        }
                    }
                }
                res.send({
                    "contact":{
		    	        "primaryContatctId": 1,
			            "emails": [], // first element being email of primary contact 
			            "phoneNumbers": [], // first element being phoneNumber of primary contact
			            "secondaryContactIds": [] // Array of all Contact IDs that are "secondary" to the primary contact
		        },
                "count":Qdata.c
                });
                conn.release();
            });
        }
    });
} );