const keys = require('../keys');

module.exports = function(email, token) {
  return {
      to: email,
      from: keys.EMAIL_FROM,
      subject: 'Восстановление доступа',
      html: `<h1>Вы забыли пароль<h1>
            <p>Если нет, проигнорируйте это письмо</p>
            <hr />
            <p>Перейдите по ссылке:</p>
            <p><a href="${keys.BASE_URL}/auth/password/${token}"></p>
            <br />
            <a href="${keys. BASE_URL}">Магазин курсов</a>`
  }
};