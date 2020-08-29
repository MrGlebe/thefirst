const {Router} = require('express');
const Order = require('../models/order');
const auth = require('../middleware/auth');

const router = new Router();

router.get('/', auth, async (req, res) => {
    try {

        const orders = await Order.find({'user.userId': req.user._id})
                .populate('user.userId').lean();

        const ordersArray = orders.map((order) => {

                return {
                    ...order,
                    totalPrice: order.courses.reduce((total, item) => {
                        return total + item.count * item.course.price;
                    }, 0),
                    totalCount: order.courses.reduce((total, item) => {
                        return total + item.count;
                    }, 0)

                };
            }
        );


        res.render('orders', {
            isOrder: true,
            title: 'Заказы',
            orders: ordersArray
        });
    } catch(e) {
        console.log(e);
    }


});

router.post('/', auth, async (req, res) => {

    try {
        const user = await req.user
            .populate('cart.items.courseId')
            .execPopulate();

        const courses = user.cart.items.map(item => ({
            count: item.count,
            course: {...item.courseId._doc}
        }));

        const order = new Order({
            user: {
                name: req.user.name,
                userId: req.user
            },
            courses
        });

        await order.save();
        await req.user.clearCart();

        res.redirect('/orders');

        } catch(e) {
            console.log(e);
        }
    });

module.exports = router;