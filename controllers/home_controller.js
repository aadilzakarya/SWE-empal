const Post = require("../models/post");
const User = require("../models/user");
module.exports.home = async function(req, res){
    try{
        // Populate the user of each post
        let posts = await Post.find({})
            .sort('-createdAt')
            .populate('user')
            .populate({
                path: 'comments',
                populate: {
                    path: 'user',
                },
                options: {
                    sort: {'createdAt': -1}
                }
            });
        let users = await User.find({});
        let curr_user;
        if(req.user){
            curr_user = await User.findById(req.user._id);

            // Populate the necessary fields of curr_user
            curr_user = await User.populate(curr_user, [
                {
                    path: 'friends',
                },
                {
                    path: 'chatRooms',
                    populate: {
                        path: 'user'
                    }
                }
            ]);
        }

        return res.render('home', {
            title: "Connecti | Home Page",
            posts: posts,
            all_users: users,
            current_user: curr_user
        });
    } catch(err) {
        console.log('Error occurred in home controller:', err);
        return res.status(500).send('Internal Server Error');
    }
}
