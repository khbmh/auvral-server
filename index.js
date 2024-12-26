require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 4000;

const app = express();

app.use(cors());
app.use(express.json());

const username = process.env.USER;
const password = process.env.PASS;

// MongoDB connection URL
const uri = `mongodb+srv://${username}:${password}@cluster0.pzdjl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const artifactsCollection = client
      .db('artifactsDB')
      .collection('artifacts');
    const likedCollection = client
      .db('artifactsDB')
      .collection('LikedArtifacts');

    // GET all artifacts
    app.get('/artifacts', async (req, res) => {
      try {
        const cursor = artifactsCollection.find();
        const result = await cursor.toArray();
        res.send(result);
      } catch (error) {
        console.error('Error fetching artifacts:', error);
        res
          .status(500)
          .send({ error: 'An error occurred while fetching artifacts.' });
      }
    });

    // GET a single artifact by ID
    app.get('/artifacts/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await artifactsCollection.findOne(query);
        res.send(result);
      } catch (error) {
        console.error('Error fetching artifact by ID:', error);
        res
          .status(500)
          .send({ error: 'An error occurred while fetching the artifact.' });
      }
    });

    // POST a new artifact
    app.post('/artifacts', async (req, res) => {
      try {
        const newArtifact = req.body;
        const result = await artifactsCollection.insertOne(newArtifact);
        res.send(result);
      } catch (error) {
        console.error('Error inserting artifact:', error);
        res
          .status(500)
          .send({ error: 'An error occurred while inserting the artifact.' });
      }
    });

    // PUT (update) a artifact by ID
    app.put('/artifacts/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const options = { upsert: true };
        const updatedArtifact = { $set: req.body };
        const result = await artifactsCollection.updateOne(
          filter,
          updatedArtifact,
          options,
        );
        res.send(result);
      } catch (error) {
        console.error('Error updating artifact:', error);
        res
          .status(500)
          .send({ error: 'An error occurred while updating the artifact.' });
      }
    });

    // DELETE a artifact by ID
    app.delete('/artifacts/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await artifactsCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.error('Error deleting artifact:', error);
        res
          .status(500)
          .send({ error: 'An error occurred while deleting the artifact.' });
      }
    });

    // GET all liked artifact
    app.get('/likedArtifacts', async (req, res) => {
      try {
        const cursor = likedCollection.find();
        const result = await cursor.toArray();
        res.send(result);
      } catch (error) {
        console.error('Error fetching artifact applications:', error);
        res.status(500).send({
          error: 'An error occurred while fetching artifact applications.',
        });
      }
    });

    // GET all liked artifacts by artId
    app.get('/likedArtifacts/artId/:id', async (req, res) => {
      try {
        const id = req.params.id; // Extract 'id' from the URL
        const query = { artId: id }; // Query to find all artifacts with the given artId
        const result = await likedCollection.find(query).toArray(); // Use find() to get all matching artifacts
        if (result.length > 0) {
          res.send(result); // Return all matching artifacts
        } else {
          res.status(404).send({ error: 'No artifacts found with this artId' });
        }
      } catch (error) {
        console.error('Error fetching artifacts by artId:', error);
        res
          .status(500)
          .send({ error: 'An error occurred while fetching the artifacts.' });
      }
    });

    // GET all liked artifacts by likedByEmail
    app.get('/likedArtifacts/email/:id', async (req, res) => {
      try {
        const id = req.params.id; // Extract 'id' from the URL
        const query = { likedByEmail: id }; // Query to find all artifacts with the given likedByEmail
        const result = await likedCollection.find(query).toArray(); // Use find() to get all matching artifacts
        if (result.length > 0) {
          res.send(result); // Return all matching artifacts
        } else {
          res
            .status(404)
            .send({ error: 'No liked artifacts found with this email' }); // Updated error message
        }
      } catch (error) {
        console.error('Error fetching artifacts by likedByEmail:', error); // Updated error log
        res
          .status(500)
          .send({ error: 'An error occurred while fetching the artifacts.' });
      }
    });

    // POST a new liked artifact
    app.post('/likedArtifacts', async (req, res) => {
      try {
        const newArtifact = req.body;
        const result = await likedCollection.insertOne(newArtifact);
        res.send(result);
      } catch (error) {
        console.error('Error inserting artifact application:', error);
        res.status(500).send({
          error: 'An error occurred while inserting the artifact application.',
        });
      }
    });

    // DELETE a liked artifact by ID
    app.delete('/likedArtifacts/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await likedCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.error('Error deleting artifact application:', error);
        res.status(500).send({
          error: 'An error occurred while deleting the artifact application.',
        });
      }
    });
  } finally {
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('hello world');
});

// Vercel automatically assigns a port, so you don't need to specify a port in your code
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
