const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

//Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.7f5wlkw.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {

    try {
        const serviceCollection = client.db("serviceReview").collection("services");
        const reviewCollection = client.db("serviceReview").collection("reviews");
        const blogCollection = client.db("serviceReview").collection("blog");

        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });

        app.get('/limit_services', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.limit(3).toArray();
            res.send(services);
        });

        app.get('/blog', async (req, res) => {
            const query = {};
            const cursor = blogCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        });

        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(req.params);
            const query = { tracking_serial: id };
            const cursor = reviewCollection.find(query);
            const filteredReview = await cursor.toArray();
            res.send(filteredReview);
        });

        app.get('/reviews', async (req, res) => {
            const decoded = req.decoded;

            let query = {};
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }

            const cursor = reviewCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.post('/services', async (req, res) => {
            const service = req.body;
            console.log(service);
            const result = await serviceCollection.insertOne(service);
            res.send(result);
        });

        app.post('/reviews', async (req, res) => {
            const service = req.body;
            const result = await reviewCollection.insertOne(service);
            res.send(result);
        });

        app.patch('/review/:id', async (req, res) => {
            const id = req.params.id;
            const review_text = req.body.rtr_review;
            console.log(review_text);
            const query = { _id: ObjectId(id) };
            const updateReview = {
                $set: {
                    review_text: review_text
                }
            }
            const result = await reviewCollection.updateOne(query, updateReview);
            res.send(result);
        })

        app.delete('/review/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        })
    }
    finally {

    }


}

run().catch(err => console.log(err));


app.get('/', (req, res) => {
    res.send("SERVICE REVIEW SITE IS RUNNING");
});

app.listen(port, () => {
    console.log(`Server is active on port ${port}`);
})