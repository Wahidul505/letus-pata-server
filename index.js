const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();
var jwt = require('jsonwebtoken');
const { decode } = require('jsonwebtoken');

// middleware 
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.m11ot.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const dishCollection = client.db('LetusPata').collection('dishes');
        const orderCollection = client.db('LetusPata').collection('orders');

        app.get('/dish', async (req, res) => {
            const category = req.query.category.toLowerCase();
            const query = { category: category }
            const cursor = dishCollection.find(query);
            const dishes = await cursor.toArray();
            res.send(dishes);
        });

        app.get('/dish/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const dish = await dishCollection.findOne(query);
            res.send(dish);
        })

        app.post('/dish', async (req, res) => {
            const dish = req.body;
            const result = dishCollection.insertOne(dish);
            res.send(result);
        });

        app.post('/order', async (req, res) => {
            const dish = req.body;
            const result = await orderCollection.insertOne(dish);
            res.send(result);
        });

        app.get('/order', async (req, res) => {
            const userInfo = req.headers.authorization.split(' ');
            const [email, token] = userInfo;
            console.log(email, token)
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
            if (decoded === email) {
                const query = {email: email};
                const cursor = orderCollection.find(query);
                const orders = await cursor.toArray();
                res.send(orders);
            }
            else{
                res.send({error: 'UnAuthorize Access'})
            }
        });

        app.delete('/order/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.send(result);
        });

        app.post('/access', (req, res) => {
            const email = req.body.email;
            const token = jwt.sign(email, process.env.ACCESS_TOKEN);
            res.send({ token: token });
        })
    }
    finally { }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Server is Working');
});

// app.post('/trying', )

app.listen(port, () => console.log('listening to,', port));