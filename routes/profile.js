const {Router} = require('express');
const auth = require('../middleware/auth');
const User = require('../models/user');
const router = Router();

router.get('/', auth, async (req, res) => {
    res.render('profile', {
        title: 'Профиль',
        isProfile:true,
        user: req.user.toObject()
    })
});

router.post('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        const toChange = {};

        if (req.body.name) {
            toChange.name = req.body.name;
        }

        if (req.file) {
            toChange.avatarUrl = `images/${req.file.filename}`;
        }

        console.log(req.file);

        Object.assign( user, toChange);
        await user.save();

        res.redirect('/profile');

    } catch(e) {
        console.log(e);
    }
});

module.exports = router;
