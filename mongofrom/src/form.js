const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.set('view engine', 'ejs');
// post method //
const pr = (bodyParser.urlencoded({ extended: false }));
const mongo = require('mongodb');

const mongoclient = mongo.MongoClient;
// link urk mongodb //
const url = "mongodb://127.0.0.1:27017/";
// // ******  multer *****// 


const multer  = require('multer');
const path = require("path");
const mainpath = path.join(__dirname,"../uploads");
app.use(express.static(mainpath));

let imgfilename = '';
app.use(express.static(mainpath));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      return cb(null,mainpath)
    },
    filename: function (req, file, cb) {
        imgfilename = Date.now()+file.originalname
      return cb(null,imgfilename);
    }
  })
  
  const upload = multer({ storage: storage })
// const upload = multer({ dest:"./uploads/"})

//  ***************multer end***********************//

const client = new mongoclient(url);
async function data() {
    try {
        await client.connect();
        console.log("Connect");
        const db = client.db("form");
        const collection = db.collection("form");
        const userdata = await collection.find({}).toArray();
        let user = '';
        // console.log(user);

        // insert data //

        app.get('/crud', (req, res) => {
            res.render('mongo', {
                data: userdata,
                user: user
            });
        });
        app.post('/savedata', upload.single("image"), async (req, res) => {
            console.log("Savedata calling..");
            id = req.body.id;
            console.log(imgfilename)

            if (id != '') {
                userdata.forEach((i) => {
                    if (i.id == id) {
                        i.name = req.body.name;
                       i.age = req.body.age;
                       i.image = imgfilename
                    }
                });
                console.log(userdata);
                let r = await collection.updateOne({ id: id }, { $set: { name: req.body.name, age: req.body.age } });
            } else {
                let data = {
                    id: (userdata.length + 1).toString(),
                    name: req.body.name,
                    age: req.body.age,
                    image: imgfilename
                }
                console.log(data);
                userdata.push(data);
                let r = await collection.insertOne(data);
                console.log(r);
            }                   
            user = '';
            res.redirect('/crud');
        });
        //  delete data //
        app.get('/del/:id', async (req, res) => {
            let id = req.params.id;
            let c = await collection.deleteOne({ id: id });
            let n = await collection.find({}).toArray();
            user ='';   
            res.render('mongo',{
                    data: n,
                    user: user
        });
        });

        // edit data //

        app.get('/edit/:id', (req, res) => {
            let id = req.params.id;
            user  = userdata.find((i) => {
                return i.id == id;
            });
            res.render('mongo', {
                data: userdata,
                user: user
            });
            req.redirect('/crud'); 
        });

      } catch (err) {
        console.log(err);
     }
   }
   data();
       app.get('/', (req, res) => {
       console.log("hello");

     });

       app.listen(3001, "127.0.0.1", () => {
       console.log("server is running");
     });