const keys = require('../keys');
module.exports = function(email, name) {
  return {
      to: email,
      from: keys.EMAIL_FROM,
      subject: 'Аккаунт создан',
      html: `<h1>Добро пожаловать, ${name}<h1>
            <p>Ваша регистрация прошла успешно. Ваш е-мейл: ${email}</p>
            <hr />
            <br />
            <a href="${keys. BASE_URL}">Магазин курсов</a>`
  }
};