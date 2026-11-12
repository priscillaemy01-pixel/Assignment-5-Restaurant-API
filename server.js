const express = require('express');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const requestDetails = [
    `Timestamp: ${timestamp}`,
    `Method: ${req.method}`,
    `URL: ${req.originalUrl}`,
  ];

  if (req.method === 'POST' || req.method === 'PUT') {
    requestDetails.push(`Body: ${JSON.stringify(req.body)}`);
  }

  console.log(requestDetails.join(' | '));
  next();
});

const menuItems = [
  {
    id: 1,
    name: 'Margherita',
    description: 'Tomato sauce, mozzarella, and fresh basil.',
    category: 'entree',
    ingredients: ['tomato sauce', 'mozzarella', 'fresh basil'],
    price: 12.99,
    available: true,
  },
  {
    id: 2,
    name: 'Pepperoni',
    description: 'Tomato sauce, mozzarella, and pepperoni.',
    category: 'entree',
    ingredients: ['tomato sauce', 'mozzarella', 'pepperoni'],
    price: 14.99,
    available: true,
  },
  {
    id: 3,
    name: 'Hawaiian',
    description: 'Tomato sauce, mozzarella, ham, and pineapple.',
    category: 'entree',
    ingredients: ['tomato sauce', 'mozzarella', 'ham', 'pineapple'],
    price: 15.49,
    available: true,
  },
  {
    id: 4,
    name: 'Veggie Supreme',
    description: 'Tomato sauce, mozzarella, peppers, onions, and olives.',
    category: 'entree',
    ingredients: ['tomato sauce', 'mozzarella', 'peppers', 'onions', 'olives'],
    price: 14.49,
    available: true,
  },
];
let nextId = menuItems.length + 1;

const categories = ['appetizer', 'entree', 'dessert', 'beverage'];

const menuItemValidation = [
  body('name')
    .isString()
    .withMessage('Name must be a string.')
    .bail()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Name must be at least 3 characters long.'),
  body('description')
    .isString()
    .withMessage('Description must be a string.')
    .bail()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters long.'),
  body('category')
    .isString()
    .withMessage('Category must be a string.')
    .bail()
    .isIn(categories)
    .withMessage(`Category must be one of: ${categories.join(', ')}.`),
  body('price')
    .custom((value) => typeof value === 'number')
    .withMessage('Price must be a number.')
    .bail()
    .isFloat({ gt: 0 })
    .withMessage('Price must be greater than 0.'),
  body('ingredients')
    .isArray({ min: 1 })
    .withMessage('Ingredients must be an array with at least one ingredient.'),
  body('ingredients.*')
    .isString()
    .withMessage('Each ingredient must be a string.')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Ingredients cannot be empty.'),
  body('available')
    .custom((value) => value === undefined || typeof value === 'boolean')
    .withMessage('Available must be a boolean.'),
];

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

app.get('/api/menu', (req, res) => {
  res.status(200).json(menuItems);
});

app.get('/api/menu/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: 'Menu item ID must be a positive integer.' });
  }

  const menuItem = menuItems.find((item) => item.id === id);
  if (!menuItem) {
    return res.status(404).json({ error: 'Menu item not found.' });
  }

  res.status(200).json(menuItem);
});

app.post('/api/menu', menuItemValidation, handleValidationErrors, (req, res) => {
  const menuItem = { ...req.body, available: req.body.available ?? true, id: nextId };
  nextId += 1;
  menuItems.push(menuItem);

  res.status(201).json(menuItem);
});

app.put('/api/menu/:id', menuItemValidation, handleValidationErrors, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: 'Menu item ID must be a positive integer.' });
  }

  const index = menuItems.findIndex((item) => item.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Menu item not found.' });
  }

  const updatedItem = { ...req.body, available: req.body.available ?? true, id };
  menuItems[index] = updatedItem;
  res.status(200).json(updatedItem);
});

app.delete('/api/menu/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: 'Menu item ID must be a positive integer.' });
  }

  const index = menuItems.findIndex((item) => item.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Menu item not found.' });
  }

  const [deletedItem] = menuItems.splice(index, 1);
  res.status(200).json(deletedItem);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
