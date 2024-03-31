
import express from 'express';
const app = express();
const port = 3000;
app.get('/', (req, res)=> {
    res.send('hello there its working');
    console.log(req.query);
});
app.listen(port,()=>{
    console.log('connected Successfully on port ${port}')
});
