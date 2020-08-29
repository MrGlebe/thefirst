const {Router} = require('express');
const Course = require('../models/course');
const router = Router();
const auth = require('../middleware/auth');
const {courseValidators} = require('../utils/validators');
const {validationResult} = require('express-validator');

function isOwner(course, req) {
    return course.userId.toString() === req.user._id.toString();
}

router.get('/', async (req, res) => {

    try {
        const coursesArr = await Course.find().populate('userId','name email')
            .select('title price img').lean();

        await res.render('courses', {
            title: 'Courses page',
            isCourses: true,
            userId: req.user ? req.user._id.toString() : null,
            coursesArr
        });
    } catch (e) {
        console.log(e);
    }

});

router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id, function (err, adventure) {
            if (err) {
                console.log(err);
                return res.redirect('/courses');
            }
        }).lean();

        if (!course) {
            return res.redirect('/courses');
        }

        await res.render('course', {
            layout: 'empty',
            title: `Курс ${course.title}`,
            course
        });
    } catch(e) {
        console.log(e);
    }

});

// Course Edit
router.get('/:id/edit', auth, async (req, res) => {

    if (!req.query.allow) {
        return res.redirect('/');
    }

    try {
        const course = await Course.findById(req.params.id).lean();

        if( !isOwner(course, req)) {
            return res.redirect('/courses');
        }

        const editError = req.query.editError ? req.query.editError : null;

        res.render('course-edit', {
            title: `Редактировать ${course.title}`,
            course,
            editError
        });

    } catch(e) {
        console.log(e);
    }
});

router.post('/edit', courseValidators, auth, async (req, res) => {

    try {

        const {id} = req.body;

        const course = await Course.findById(id);

        if (!isOwner(course, req)) {
            return res.redirect('/courses');
        }

        const errors = validationResult(req);

        if (!errors.isEmpty()) {

            const editError = errors.array()[0].msg;
            return res.redirect(`/courses/${id}/edit?allow=true&editError=${editError}`);

        }

        delete req.body.id;

        Object.assign(course, req.body);
        await course.save();
        res.redirect('/courses');

    } catch (e) {
     console.log(e);
    }
});

router.post('/remove', auth, async (req, res) => {
try {

    await Course.deleteOne({
        _id: req.body.id,
        userId: req.user._id
    });
    res.redirect('/courses');
} catch (e) {
    console.log(e);
}
});

module.exports = router;