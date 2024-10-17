const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
	images:{
        type: String,
        default: ''
    },
	userId: { 
		type: String,
	    required: [true, 'User ID is Required']
	},
	title: {
		type: String,
		required: [true, 'Title is required']
	},
	content: {
		type: String,
		required: [true, 'Content is required']
	},
	createdOn: {
		type: Date,
		default: Date.now
	},
	comments: [
		{
			userId: {
	            type: String,
	    		required: [true, 'User ID is Required']
    		},
	        comment: {
	            type: String,
	            required: [true, 'Comment is Required']
	        },
	        createdOn: { 
				type: Date,
				default: Date.now
			}
	    }
    ]
});

module.exports = mongoose.model('Post', postSchema);