const express = require('express');
const router = express.Router();
const {
    createGroup,
    getGroups,
    getGroupById,
    joinGroup,
    leaveGroup,
    deleteGroup,
    renameGroup,
} = require('../controllers/groupController');
const { protect } = require('../middleware/authMiddleware');

router.get('/',               protect, getGroups);
router.post('/',              protect, createGroup);
router.get('/:id',            protect, getGroupById);
router.put('/:id/rename',     protect, renameGroup);
router.post('/:id/join',      protect, joinGroup);
router.post('/:id/leave',     protect, leaveGroup);
router.delete('/:id',         protect, deleteGroup);

module.exports = router;
