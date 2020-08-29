const {Router} = require('express');
const Course = require('../models/course');
const router = Router();
const auth = require('../middleware/auth');

function mapCartItems(userCart) {

    let totalValue = 0;
    let totalPrice = 0;

    const courses =  userCart.map((item) => {

        totalValue += +item.count;
        totalPrice += item.count * item.courseId.price;

        return {
            id: item.courseId._id,
            value: item.count,
            title: item.courseId.title,
            img: item.courseId.img,
            price: item.courseId.price
        };
    });

    return {
      courses,
      totalValue,
      totalPrice
    };
}

router.get('/', auth, async (req, res) => {
   const user = await req.user
       .populate('cart.items.courseId')
       .execPopulate();

   res.render('cart', {
       title: 'Корзина',
       isCart: true,
       cart: mapCartItems(user.cart.items)
       })
   });

router.post('/add', auth, async (req, res) => {
    const course = await Course.findById(req.body.id);
    await req.user.addToCart(course);
    res.redirect('/cart');
});

router.delete('/remove/:id', auth, async (req, res) => {
    await req.user.removeFromCart(req.params.id);
    const user = await req.user.populate('cart.items.courseId').execPopulate();

    const cart = JSON.stringify(mapCartItems(user.cart.items));
    res.status(200).json(cart);

});


module.exports = router;