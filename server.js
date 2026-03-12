const app=require('./app');
require('dotenv').config();
const port=process.env.PORT;
const db=require('./Config/db');

db();
app.listen(port,()=>{
    console.log(`Server Running Successfuly On Port ${port}`);
})