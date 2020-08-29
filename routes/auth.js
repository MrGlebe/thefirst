const { Router } = require('express');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgrid = require('nodemailer-sendgrid-transport');
const User = require('../models/user');
const keys = require('../keys');
const regEmail = require('../emails/registration');
const resetEmail = require('../emails/reset');
const crypto = require('crypto');
const {
    registerValidators,
    authValidators
    } = require('../utils/validators');
const {validationResult} = require('express-validator');

const router = Router();

const transporter = nodemailer.createTransport(sendgrid({
    auth: { api_key: keys.SEND_GRID_API_KEY }
}));

router.get('/login', async (req, res) => {
   res.render('auth/login', {
       title: 'Авторизация',
       isLogin: true,
       regError: req.flash('regError'),
       loginError: req.flash('loginError'),
       message: req.flash('message')
   })
});

router.get('/logout', async (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login#login');
    });
});

router.post('/login', authValidators, async (req, res) => {
    try {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {

            req.flash('loginError', errors.array()[0].msg);
            return res.status(422).redirect('/auth/login#login');

        }

        const {email} = req.body;

        req.session.user = await User.findOne({ email });
        req.session.isAuthenticated = true;
        await req.session.save((err) => {

            if (err) {
                throw err;

            }

            res.redirect('/');

        });

    } catch (e) {
        console.log(e)
    }
});

router.post('/register', registerValidators, async (req, res) => {
   try {
       const {email, password, name} = req.body;

       const errors = validationResult(req);

       if (!errors.isEmpty()) {

           req.flash('regError', errors.array()[0].msg);
           return res.status(422).redirect('/auth/login#register');

       }

       const hashPassword = await bcrypt.hash(password, 10);
       const user = new User({email, name, password: hashPassword, cart: {items: []}
       });
       await user.save();
       req.flash('message','Вы успешно зарегистрировались');
       res.redirect('/auth/login#login ');
       await transporter.sendMail(regEmail(email, name));

   } catch(e) {
       console.log(e);
   }
});

router.get('/reset', async(req, res) => {
    res.render('auth/reset', {
        title: 'Забыли пароль?',
        error: req.flash('error'),
    });
});

router.post('/reset', (req, res) => {
    try {
        crypto.randomBytes(32, async (err, buffer) => {
            if (err) {
                req.flash('error','Ошибка генерации ключа');
                return res.redirect('/auth/reset');
            }

            const token = buffer.toString('hex');
            const candidate = await User.findOne({email: req.body.email});

            if (candidate) {

                candidate.resetToken = token;
                candidate.resetTokenExp = Date.now() + 3600 * 1000;
                await candidate.save();
                req.flash('message','На ваш емейл отправлено письмо для сброса пароля');
                res.redirect('/auth/login');
                await transporter.sendMail(resetEmail(candidate.email, token));

            } else {
                req.flash('error','Такого е-мейла нет');
                return res.redirect('/auth/reset');
            }

        })
    } catch(e) {
        console.log(e);
    }
});

router.get('/password/:token', async (req, res) => {

    console.log(req.params.token);

    if (!req.params.token) {
        return res.redirect('/auth/login');
    }

    try {
        const user = await User.findOne({
            resetToken: req.params.token,
            resetTokenExp: {$gt: Date.now()}
        });

        if (!user) {
            console.log('No such User');
            return res.redirect('/auth/login');
        } else {
            res.render('auth/password', {
               title: 'Восстановить доступ',
               error: req.flash('error') ,
               userId: user._id.toString(),
               token: req.params.token
            });
        }

    } catch(e) {
        console.log(e);
    }

});

router.post('/password', async (req, res) => {

    try {

        const user = await User.findOne({
            _id: req.body.userId,
            resetToken: req.body.token,
            resetTokenExp: {$gt: Date.now()}
        });

        if (user) {

            user.password = await bcrypt.hash(req.body.password, 10);
            user.resetToken = undefined;
            user.resetTokenExp = undefined;
            await user.save();
            req.flash('message','Пароль изменен успешно');
            res.redirect('/auth/login');

        } else {
            req.flash('loginError','Время жизни токена истекло');
            res.redirect('/auth/login');
        }

    } catch(e) {
        console.log(e);
    }

});

module.exports = router;