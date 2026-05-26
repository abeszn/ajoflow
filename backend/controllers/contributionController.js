const Contribution = require('../models/Contribution');
const Group = require('../models/Group');

const makeContribution = async (req, res, next) => {
    try {
        const { groupId, amount, contributionPeriod } = req.body;

        if (!groupId || !amount || !contributionPeriod?.trim()) {
            return res.status(400).json({ message: 'groupId, amount, and contributionPeriod are required' });
        }
        if (Number(amount) <= 0) {
            return res.status(400).json({ message: 'Amount must be greater than zero' });
        }

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const isMember = group.members.some(
            (m) => m.toString() === req.user._id.toString()
        );
        if (!isMember) {
            return res.status(403).json({ message: 'You must be a member of this group to contribute' });
        }

        const existingContribution = await Contribution.findOne({
            member: req.user._id,
            group: groupId,
            contributionPeriod: contributionPeriod.trim(),
        });
        if (existingContribution) {
            return res.status(400).json({ message: 'You have already contributed for this period' });
        }

        const dueDate = new Date();
        if (group.frequency === 'daily')   dueDate.setDate(dueDate.getDate() + 1);
        if (group.frequency === 'weekly')  dueDate.setDate(dueDate.getDate() + 7);
        if (group.frequency === 'monthly') dueDate.setMonth(dueDate.getMonth() + 1);

        const contribution = await Contribution.create({
            member: req.user._id,
            group: groupId,
            amount: Number(amount),
            contributionPeriod: contributionPeriod.trim(),
            dueDate,
            status: 'pending',
        });

        await contribution.populate([
            { path: 'member', select: 'name email' },
            { path: 'group', select: 'groupName frequency' },
        ]);

        res.status(201).json(contribution);
    } catch (error) {
        next(error);
    }
};

const getMyContributions = async (req, res, next) => {
    try {
        const contributions = await Contribution.find({ member: req.user._id })
            .populate('group', 'groupName frequency contributionAmount')
            .sort({ createdAt: -1 });

        res.json(contributions);
    } catch (error) {
        next(error);
    }
};

const getGroupContributions = async (req, res, next) => {
    try {
        const group = await Group.findById(req.params.groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const contributions = await Contribution.find({ group: req.params.groupId })
            .populate('member', 'name email')
            .populate('group', 'groupName')
            .sort({ createdAt: -1 });

        res.json(contributions);
    } catch (error) {
        next(error);
    }
};

const updateContributionStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        if (!['paid', 'missed', 'pending'].includes(status)) {
            return res.status(400).json({ message: 'Status must be paid, missed, or pending' });
        }

        const contribution = await Contribution.findById(req.params.id)
            .populate('group');

        if (!contribution) {
            return res.status(404).json({ message: 'Contribution not found' });
        }

        const isGroupAdmin = contribution.group.admin.toString() === req.user._id.toString();

        if (!isGroupAdmin) {
            return res.status(403).json({ message: 'Only the group admin can update contribution status' });
        }

        contribution.status = status;
        if (status === 'paid') contribution.paidDate = new Date();

        await contribution.save();

        await contribution.populate([
            { path: 'member', select: 'name email' },
            { path: 'group', select: 'groupName' },
        ]);

        res.json(contribution);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    makeContribution,
    getMyContributions,
    getGroupContributions,
    updateContributionStatus,
};
