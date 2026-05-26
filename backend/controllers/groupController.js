const Group = require('../models/Group');
const Contribution = require('../models/Contribution');

const createGroup = async (req, res, next) => {
    try {
        const { groupName, contributionAmount, frequency } = req.body;

        if (!groupName?.trim()) {
            return res.status(400).json({ message: 'Group name is required' });
        }
        if (!contributionAmount || Number(contributionAmount) <= 0) {
            return res.status(400).json({ message: 'A valid contribution amount is required' });
        }
        if (!['daily', 'weekly', 'monthly'].includes(frequency)) {
            return res.status(400).json({ message: 'Frequency must be daily, weekly, or monthly' });
        }

        const group = await Group.create({
            groupName: groupName.trim(),
            contributionAmount: Number(contributionAmount),
            frequency,
            admin: req.user._id,
            members: [req.user._id],
        });

        const populated = await group.populate([
            { path: 'admin', select: 'name email' },
            { path: 'members', select: 'name email' },
        ]);

        res.status(201).json(populated);
    } catch (error) {
        next(error);
    }
};

const getGroups = async (req, res, next) => {
    try {
        const groups = await Group.find()
            .populate('admin', 'name email')
            .populate('members', 'name email')
            .sort({ createdAt: -1 });

        res.json(groups);
    } catch (error) {
        next(error);
    }
};

const getGroupById = async (req, res, next) => {
    try {
        const group = await Group.findById(req.params.id)
            .populate('admin', 'name email phone')
            .populate('members', 'name email phone');

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const contributions = await Contribution.find({ group: group._id })
            .populate('member', 'name email')
            .sort({ createdAt: -1 });

        res.json({ ...group.toObject(), contributions });
    } catch (error) {
        next(error);
    }
};

const joinGroup = async (req, res, next) => {
    try {
        const group = await Group.findById(req.params.id);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const alreadyMember = group.members.some(
            (m) => m.toString() === req.user._id.toString()
        );
        if (alreadyMember) {
            return res.status(400).json({ message: 'You are already a member of this group' });
        }

        group.members.push(req.user._id);
        await group.save();

        const populated = await group.populate([
            { path: 'admin', select: 'name email' },
            { path: 'members', select: 'name email' },
        ]);

        res.json({ message: 'Joined group successfully', group: populated });
    } catch (error) {
        next(error);
    }
};

const leaveGroup = async (req, res, next) => {
    try {
        const group = await Group.findById(req.params.id);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        if (group.admin.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Group admin cannot leave — delete the group instead' });
        }

        const isMember = group.members.some(
            (m) => m.toString() === req.user._id.toString()
        );
        if (!isMember) {
            return res.status(400).json({ message: 'You are not a member of this group' });
        }

        group.members = group.members.filter(
            (m) => m.toString() !== req.user._id.toString()
        );
        await group.save();

        res.json({ message: 'Left group successfully' });
    } catch (error) {
        next(error);
    }
};

const deleteGroup = async (req, res, next) => {
    try {
        const group = await Group.findById(req.params.id);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        if (group.admin.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only the group admin can delete this group' });
        }

        await Contribution.deleteMany({ group: group._id });
        await group.deleteOne();

        res.json({ message: 'Group deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = { createGroup, getGroups, getGroupById, joinGroup, leaveGroup, deleteGroup };
