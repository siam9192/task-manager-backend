const express = require('express')
const cors = require('cors')
const port = 5000 || process.env.PORT 
const app = express();
require('dotenv').config()
app.use(cors())
app.use(express.json())


app.get('/',(req,res)=>{
    res.send('Task manager server working')
})

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri =`mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.katjfem.mongodb.net/?retryWrites=true&w=majority`;

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
    const database = client.db('Task-Manager');
    const taskCollection = database.collection('All-Tasks')
     // get,add,update,delete task
     app.get('/api/v1/all-tasks/:email',async(req,res)=>{
        const email = req.params.email;
        if(email){
            const result = await taskCollection.find({email}).toArray();
        res.send(result);
        }
       })
       app.post('/api/v1/task-add',async(req,res)=>{
        const task = req.body;
        console.log(task)
        const result = await taskCollection.insertOne(task);
        res.send(result)
      
       })
       app.put('/api/v1/task-update',async(req,res)=>{
        const task = req.body;
        const id = task.id;

        const filter = {
          _id: new ObjectId(id)
        }
        const options = {
          $upsert: true
        }
        
        const updatedDoc = {
          $set: {
            title:task.title,
            description: task.description,
            deadline: task.deadline,
            priority: task.priority,
            status: task.status,
            email:task.email
          }
        }
       
       const result = await taskCollection.updateOne(filter,updatedDoc,options)
       res.send(result) 
       })

       app.patch('/api/v1/task/update-status',async(req,res)=>{
        const id = req.body.id;
        const status = req.body.status;
        const updatedDoc = {
          $set:{
            status
          }
        }
        const filter = {
          _id : new ObjectId(id)
        }
       const result = await taskCollection.updateOne(filter,updatedDoc);
       res.send(result)
       })
      app.delete('/api/v1/task-delete/:id',async(req,res)=>{
        const id = req.params.id;
       const query = new ObjectId (id)
       const result = await taskCollection.deleteOne(query);
       res.send(result)
       console.log(result)
      })
  } finally {
   
  }
}
run().catch(console.dir);


app.listen(port)