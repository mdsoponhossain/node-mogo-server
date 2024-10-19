const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const http = require('node:http');


const uri = "mongodb://localhost:27017";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const database = client.db('SOPON_DB_NODEJS');
        const postCollection = database.collection('postCollections')


        const server = http.createServer(async (req, res) => {
            const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
            const pathName = parsedUrl.pathname;
            // console.log(parsedUrl, "the request");
            let bodyData = '';
            req.on('data', async (data) => {
                bodyData += data.toString();
            })
            if (pathName === "/post" && req.method === "GET") {
                const result = await postCollection.find().toArray();
                res.writeHead(200, { "Content-Type": "Application/json" });
                res.end(JSON.stringify(result))
            }
            // find a data from db:
            else if (pathName.startsWith("/post") && req.method === "GET") {
                const searchPostId = pathName.split('/')[2]
                const result = await postCollection.findOne({ _id: new ObjectId(searchPostId) });
                res.writeHead(200, { "Content-Type": "Application/json" });
                res.end(JSON.stringify(result))
            }
            // insert a post:
            else if (pathName === "/post" && req.method === "POST") {
                req.on('end', async () => {
                    const result = await postCollection.insertOne(JSON.parse(bodyData));
                    res.writeHead(200, { 'Content-Type': 'Application/json' });
                    res.end(JSON.stringify(result));
                })
            }
            // update a post:
            else if (pathName.startsWith("/post") && req.method === "PATCH") {
                const searchPostId = pathName.split('/')[2]
                req.on('end', async () => {
                    const result = await postCollection.updateOne({_id: searchPostId},{$set:JSON.parse(bodyData)},{ upsert: true });
                    res.writeHead(200, { 'Content-Type': 'Application/json' });
                    res.end(JSON.stringify(result));
                })
            }
            // Delete:
            else if (pathName.startsWith("/post") && req.method === "DELETE") {
                const searchPostId = pathName.split('/')[2]
                req.on('end', async () => {
                    const result = await postCollection.deleteOne({_id: new ObjectId(searchPostId)});
                    res.writeHead(200, { 'Content-Type': 'Application/json' });
                    res.end(JSON.stringify(result));
                })
            }
            else {
                res.end('Not Found...')
            }
        });



        // Listening the server:
        server.listen(3000, () => console.log('The server is running on the port 3000'))


        // Send a ping to confirm a successful connection
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (err) {
        console.log(err)
    }
}
run().catch(console.dir);
