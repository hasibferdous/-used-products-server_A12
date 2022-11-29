const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();
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




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ambheuq.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
console.log(uri)

function verifyJWT(req, res, next) {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })

}




async function run(){
    try{
        
        const ProductCollection = client.db('resaleProduct').collection('products')
        const bookingsCollection = client.db('resaleProduct').collection('bookings')
        const sellersCollection = client.db('resaleProduct').collection('sellers')
        const usersCollection = client.db('resaleProduct').collection('users')

        const addedProductsCollection = client.db('resaleProduct').collection('addedproducts');

        app.get('/products', async(req, res)=>{
            const query ={};
            const options = await ProductCollection.find(query).toArray();
            res.send(options);
        });
        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            console.log(booking);
             const query = {
                
                email: booking.email,
                phone: booking.phone,
            }

             const alreadyBooked = await bookingsCollection.find(query).toArray();

             if (alreadyBooked.length) {
                 const message = `You already have  booked it.`
                 return res.send({ acknowledged: false, message })
             }

            const result = await bookingsCollection.insertOne(booking);
            res.send(result);
        });
        
        app.get('/bookings'  , async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const bookings = await bookingsCollection.find(query).toArray();
            res.send(bookings);
        });  


        app.post('/users', async(req, res) =>{
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });
        app.post('/sellers', async(req, res) =>{
            const seller = req.body;
            const result = await sellersCollection.insertOne(seller);
            res.send(result);
        });

        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
                return res.send({ accessToken: token });
            }
            res.status(403).send({ accessToken: '' })
        });

        app.get('/bookings', verifyJWT, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;

            if (email !== decodedEmail) {
                return res.status(403).send({ message: 'forbidden access' });
            }

            const query = { email: email };
            const bookings = await bookingsCollection.find(query).toArray();
            res.send(bookings);
        });



        app.get('/users', async (req, res) => {
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        });
        app.get('/sellers', async (req, res) => {
            const query = {};
            const sellers = await sellersCollection.find(query).toArray();
            res.send(sellers);
        });



        app.put('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        });

        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' });
        });

        app.get('/users/buyer/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isBuyer: user?.role === 'buyer' });
        });

        app.get('/sellers/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const seller = await sellersCollection.findOne(query);
            res.send({ isSeller: seller?.role === 'seller' });
        });





        app.get('/addedproducts', async (req, res) => {
            const query = {};
            const addedproducts = await addedProductsCollection.find(query).toArray();
            res.send(addedproducts);
        })

        app.post('/addedproducts', async (req, res) => {
            const addedproduct = req.body;
            const result = await addedProductsCollection.insertOne(addedproduct);
            res.send(result);
        });



        app.delete('/addedproducts/:id', verifyAdmin, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await addedProductsCollection.deleteOne(filter);
            res.send(result);
        })









    }










 



 










    
    finally {

    }
}
run().catch(console.log);













app.get('/', async(req, res)=>{
    res.send('doctors portal server is running');
})
app.listen(port, ()=> console.log(`ReSaleBike is running on ${port}`))
