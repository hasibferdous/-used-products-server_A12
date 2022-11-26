const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5001;

const app = express();
//middleware
app.use(cors());0
app.use(express.json());

const categories = require('./data/categories.json');

const products = require('./data/products.json');

app.get('/categories', (req, res) =>{
    res.send(categories);
})

app.get('/category/:id', (req, res) =>{
    const id = req.params.id;
    const CategoryProducts = products.filter( n => n.category_id === id);
    res.send(CategoryProducts);
})

app.get('/products/:id', (req, res) =>{
    const id = req.params.id;
    const selectedProducts = products.find( n => n._id === id);
    //console.log(selectedProducts);
    res.send(selectedProducts);
})















app.get('/', async(req, res)=>{
    res.send('doctors portal server is running');
})
app.listen(port, ()=> console.log(`ReSaleBike is running on ${port}`))
