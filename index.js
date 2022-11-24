const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5001;
const app = express();
//middleware
app.use(cors());0
app.use(express.json());
app.get('/', async(req, res)=>{
    res.send('doctors portal server is running');
})
app.listen(port, ()=> console.log(`ReSaleBike is running on ${port}`))
