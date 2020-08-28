var mongoose = require('mongoose');
var campSchema = new mongoose.Schema({
    name: String,
    url: String,
    description: String,
    author: String,
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
});

module.exports = mongoose.model('Camp', campSchema);