const express = require('express');
const { Customer, Reservation } = require('./models');

const router = express.Router();

// GET /  Display list of all customers
router.get('/', async (req, res) => {
  if (req.query.search) {
    const customers = await Customer.search(req.query.search);
    res.render('customer_list.html', { customers });
  } else {
    const customers = await Customer.all();
    res.render('customer_list.html', { customers });
  }
});

// GET /best/  Display list of top 10 customers
router.get('/best/', async (req, res) => {
  const customers = await Customer.best();
  res.render('best_customer_list.html', { customers });
});

// GET /add/  Display form for adding new customer
router.get('/add/', async (req, res) => {
  res.render('customer_new_form.html');
});

// POST /add/  Submit new customer, redirect to that customer's page
router.post('/add/', async (req, res) => {
  try {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const phone = req.body.phone;
    const notes = req.body.notes;

    const customer = new Customer({ firstName, lastName, phone, notes });
    await customer.save();

    return res.redirect(`/${customer.id}/`);
  } catch (e) {
    return res.status(500).send(`Can't add customer: ${e}`);
  }
});

// GET /:customerId/  Display individual customer's details
router.get('/:customerId/', async (req, res) => {
  try {
    const customer = await Customer.get(req.params.customerId);
    console.log('customer', customer);
    const reservations = await customer.getReservations();
    console.log('res', reservations);
    return res.render('customer_detail.html', { customer, reservations });
  } catch (e) {
    return res.status(500).send(`Can't get customer: ${e}`);
  }
});

// GET /:customerIf/edit/  Display form to edit individual customer's details
router.get('/:customerId/edit/', async (req, res) => {
  try {
    const customer = await Customer.get(req.params.customerId);
    res.render('customer_edit_form.html', { customer });
  } catch (e) {
    return res.status(500).send(`Can't get customer: ${e}`);
  }
});

// POST /:customerId/edit/  Edit individual customer, redirect to that customer's page
router.post('/:customerId/edit/', async (req, res) => {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const phone = req.body.phone;
  const notes = req.body.notes;

  try {
    const customer = new Customer({ firstName, lastName, phone, notes });
    await customer.save();

    return res.redirect(`/${customer.id}/`);
  } catch (e) {
    return res.status(500).send(`Can't edit customer: ${e}`);
  }
});

// POST /:customerId/add-reservation/  Create new reservation and redirect to customer's page (the customer's page includes the 'create new reservation' form)
router.post('/:customerId/add-reservation/', async (req, res) => {
  const customerId = req.params.customerId;
  const startAt = new Date(req.body.startAt);
  const numGuests = req.body.numGuests;
  const notes = req.body.notes;

  try {
    const reservation = new Reservation({
      customerId,
      startAt,
      numGuests,
      notes
    });
    reservation.save();

    return res.redirect(`/${customerId}/`);
  } catch (e) {
    return res.status(500).send(`Can't create reservation: ${e}`);
  }
});

module.exports = router;
