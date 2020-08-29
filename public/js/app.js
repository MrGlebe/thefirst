window.addEventListener('load', () => {

    const toCurrency = () => {
        const formatter = new Intl.NumberFormat('ru-RU', {
            currency: 'rub',
            style: 'currency'
        });

        document.querySelectorAll('.price').forEach(
            node => {
                node.textContent = formatter.format(parseInt(node.textContent, 10));
            });
    };

    toCurrency();

    const toDate = (date) => {
         return new Intl.DateTimeFormat('ru-RU', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }).format(new Date(date));
    };

    document.querySelectorAll('.date').forEach((node) => {
            node.textContent = toDate(node.textContent);
        });


    const $cart = document.querySelector('#cart');

    if ($cart) {
        $cart.addEventListener('click', (e) => {
            if (e.target.classList.contains('cart-delete')) {

                const id = e.target.dataset.id;
                const csrf = e.target.dataset.csrf;

                fetch('/cart/remove/' + id, {
                   method: 'delete',
                    headers: {
                       'X-XSRF-TOKEN': csrf
                    }
                }).then(res => res.json())
                  .then(cartJson => {
                    const cart = JSON.parse(cartJson);

                        if (cart.courses.length) {
                            const html = cart.courses.map( course => {
                                const {id, img, title, price, value} = course;
                                return `
                                    <tr>
                                        <td><img src="${img}" style="width:100px; height:auto" alt="${title}"></td>
                        
                                        <td><a href="/courses/${id}" class="cart-item-cont">${title}</a></td>
                        
                                        <td class="center price"><span class="cart-item-price">${price}</span></td>
                        
                                        <td class="center"><span class="cart-item-val">${value}</span></td>
                        
                                        <td><button class="btn btn-primary cart-delete" data-csrf="${csrf}" data-id="${id}">Удалить</button></td>
                                    </tr>
                                `
                            });

                            $cart.querySelector('tbody').innerHTML = html.join('');
                            document.querySelector('#cart_total').textContent = cart.totalValue;
                            document.querySelector('#cart_total_price').innerHTML = cart.totalPrice;

                        } else {
                            $cart.innerHTML = ('<p>Корзина пуста</p>');
                            document.querySelector('#cart_values').style = "display:none";
                            document.querySelector('.send-order').style = "display:none"
                        }
                    })
                    .then(() => {
                        toCurrency();
                    });
                 }
            });
        }

    // Вкладки Вход Регистрация
    const tabs = document.querySelectorAll('.tabs');
    M.Tabs.init(tabs);

    });