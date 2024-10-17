const Post = require("../models/Post");
const User = require("../models/User");

module.exports.addPost = (req, res) => {
  
    if (req.user.isAdmin) {
        return res.status(403).send({ message: 'Admins are not allowed to create posts.' });
    }

    let newPost = new Post({
        images: req.body.images,
        userId: req.user.id,
        title: req.body.title,
        content: req.body.content
    });

    Post.findOne({ title: req.body.title })
        .then(existingPost => {
            if (existingPost) {
                return res.status(409).send({ message: 'Post Already Exists' });
            } else {
                return newPost.save()
                    .then(post => res.status(201).send({
                        success: true,
                        message: 'Posted Successfully',
                        post: post
                    }))
                    .catch(error => {
                        return res.status(500).send({ error: 'An error occurred while saving the post' });
                    });
            }
        })
        .catch(error => {
            return res.status(500).send({ error: 'An error occurred while checking for existing posts' });
        });
};


module.exports.getAllPost = (req, res) => {
	return Post.find({})
	.then(posts => {
		if (posts.length > 0) {
			return res.status(200).send(posts);
		} else {
			return res.status(404).send({ message: 'No posts found' });
		}
	})
	.catch(error => {
		return res.status(500).send({ error: 'An error occurred while retrieving posts' });
	});
};

module.exports.getOwnPost = (req, res) => {
    Post.find({ userId: req.user.id })
        .then(posts => {
            if (posts.length > 0) {
                return res.status(200).send({ posts });
            } else {
                return res.status(200).send({ message: 'No post found.' });
            }
        })
        .catch(err => {
            console.error(err);
            return res.status(500).send({ error: 'Error finding post.' });
        });
};

module.exports.updatePost = (req, res) => {
    let updatedPost = {
        images: req.body.images,
        title: req.body.title,
        content: req.body.content
    };

    return Post.findByIdAndUpdate(req.params.postId, updatedPost, { new: true })
        .then(post => {
            if (!post) {
                return res.status(404).send({ message: 'Post not found' });
            }
            return res.status(200).send({
                success: true,
                message: 'Post updated successfully',
                post: post
            });
        })
        .catch(error => {
            return res.status(500).send({ error: 'Error in updating the post' });
        });
};

module.exports.deletePost = (req, res) => {
    const postId = req.params.postId;
    const userId = req.user.id;

    Post.findById(postId)
        .then(post => {
            if (!post) {
                return res.status(404).send({ message: 'Post not found' });
            }

            console.log('User ID:', userId);
            console.log('Post User ID:', post.userId);

            if (req.user.isAdmin) {
                return Post.findByIdAndDelete(postId)
                    .then(deletedPost => {
                        return res.status(200).send({
                            message: 'Post deleted successfully',
                            post: deletedPost
                        });
                    });
            }

            if (post.userId && userId && post.userId.toString() === userId.toString()) {
                return Post.findByIdAndDelete(postId)
                    .then(deletedPost => {
                        return res.status(200).send({
                            message: 'Your post has been deleted successfully',
                            post: deletedPost
                        });
                    });
            }

            return res.status(403).send({ message: 'Not authorized to delete this post' });
        })
        .catch(error => {
            return res.status(500).send({ error: 'An error occurred while deleting the post' });
        });
};

module.exports.addComment = (req, res) => {
    if (req.user.isAdmin) return res.status(403).send({ message: 'Action Forbidden' });

    Post.findById(req.params.postId)
        .then(post => {
            if (!post) return res.status(404).send({ error: 'Post not found' });

            return User.findById(req.user.id)
                .then(user => {
                    if (!user) return res.status(404).send({ error: 'User not found' });
                    console.log(user)

                    post.comments.push({
                        userId: user._id,
                        comment: req.body.comment,
                    });

                    return post.save().then(updatedPost => {
                        const newComment = updatedPost.comments[updatedPost.comments.length - 1];
                        const responseComment = {
                            commentId: newComment._id,
                            userId: newComment.userId,
                            username: user.username,
                            comment: newComment.comment,
                        };

                        return res.status(200).send({
                            message: 'Comment added successfully',
                            comment: responseComment, // Return the new comment directly
                        });
                    });
                });
        })
        .catch(error => {
            console.error(error);
            return res.status(500).send({ error: 'Error adding comment' });
        });
};

module.exports.viewComments = (req, res) => {
    if (!req.user) {
        return res.status(401).send({ message: 'Unauthorized' });
    }

    Post.findById(req.params.postId)
        .then(post => {
            if (!post) {
                return res.status(404).send({ message: 'Post not found' });
            }

            const commentPromises = post.comments.map(comment => 
                User.findById(comment.userId).then(user => ({
                    commentId: comment._id,
                    userId: comment.userId,
                    comment: comment.comment,
                    username: user ? user.username : 'Unknown', 
                }))
            );

            return Promise.all(commentPromises).then(commentsWithUsernames => {
                return res.status(200).send({ comments: commentsWithUsernames });
            });
        })
        .catch(error => {
            console.error(error); 
            return res.status(500).send({ error: 'Error retrieving comments' });
        });
};



module.exports.removeComment = (req, res) => {
    const postId = req.params.postId;
    const commentId = req.params.commentId;
    const userId = req.user.id;

    return Post.findById(postId)
        .then(post => {
            if (!post) {
                return res.status(404).send({ message: 'Post not found' });
            }

            if (req.user.isAdmin) {
                post.comments = post.comments.filter(comment => comment._id.toString() !== commentId);
                return post.save()
                    .then(updatedPost => res.status(200).send({ comments: updatedPost.comments }));
            } else {
                const commentIndex = post.comments.findIndex(comment => 
                    comment._id.toString() === commentId && comment.userId === userId
                );
                if (commentIndex === -1) {
                    return res.status(403).send({ message: 'Action Forbidden: You can only remove your own comments' });
                }

                post.comments.splice(commentIndex, 1);
                return post.save()
                    .then(updatedPost => res.status(200).send({ comments: updatedPost.comments }));
            }
        })
        .catch(error => res.status(500).send({ error: 'Error removing comment' }));
};





