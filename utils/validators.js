const { body } = require('express-validator');
const User = require('../models/user');
const bcrypt = require('bcryptjs');


exports.registerValidators = [

    body('name')
        .isLength({min: 3, max: 20})
        .withMessage('Длина имени от 3 до 20 символов')
        .trim(),

    body('email')
        .isEmail()
        .withMessage('Не корреткный Емейл')
        .custom(async (value, {req}) => {
            try {
                const user = await User.findOne({email: value});
                if (user) {
                    return Promise.reject('Такой емейл уже занят');
                }
            } catch(e) {
              console.log(e);
            }
        })
        .normalizeEmail(),

    body('password','Пароль минимум 6 символов, буквы и цифры')
        .isLength({min:6, max:20})
        .isAlphanumeric(),

    body('confirm')
        .custom((value, {req}) => {
            if (value !== req.body.password) {
                throw new Error('Пароли должны совпадать')
            }
            return true;
        })
];

exports.authValidators = [
    body('email')
        .isEmail()
        .withMessage('Не корреткный Емейл')
        .normalizeEmail()
        .custom(async (value, {req}) => {

        try {
            const user = await User.findOne({email: value});

            if (!user) {
                return Promise.reject('Юзера с таким Емейл нет');
            }

            const isPassCorrect = await bcrypt.compare(req.body.password, user.password);

            if (!isPassCorrect) {

                    return Promise.reject('Не верыный пароль');
                }
            } catch(e) {
                console.log(e);
            }
        })
];

exports.courseValidators = [
    body('title')
        .isLength({min: 3, max: 30})
        .withMessage('Минимальная длина названия 3 символа')
        .trim(),
    body('price')
        .isNumeric().withMessage('Введите корректную цену'),
    body('img','Введите корректный Url картинки').isURL()
];