const express = require('express');  
const router = express.Router();

// Example route
router.get('/users', (req, res) => {
    res.json([{ name: 'Alice' }, { name: 'Bob' }]);
});

module.exports = router;

