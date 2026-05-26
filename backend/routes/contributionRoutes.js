const express = require('express');
const router = express.Router();
const {
    makeContribution,
    getMyContributions,
    getGroupContributions,
    updateContributionStatus,
} = require('../controllers/contributionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/',                         protect, makeContribution);
router.get('/my',                        protect, getMyContributions);
router.get('/group/:groupId',            protect, getGroupContributions);
router.patch('/:id/status',              protect, updateContributionStatus);

module.exports = router;
