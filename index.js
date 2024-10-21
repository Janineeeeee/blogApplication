const express = require("express");
const mongoose = require("mongoose");
const multer = require('multer')

const cors = require("cors");

const userRoutes = require("./routes/user");
const postRoutes = require("./routes/post");

require('dotenv').config();

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const corsOptions = {
	origin: ['http://localhost:3000', 'https://swiftink.onrender.com', 'https://swift-ink.vercel.app/'],
	credentials: true,
	optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

mongoose.connect(process.env.MONGO_STRING);
mongoose.connection.once('open', () => console.log('Now connected to MongoDB Atlas.'))


app.use("/users", userRoutes);
app.use("/posts", postRoutes);



if(require.main === module){
	app.listen(process.env.PORT || 4000, () => {
		console.log(`API is now online on port ${process.env.PORT || 4000 }`)
	});
}

module.exports = {app, mongoose};