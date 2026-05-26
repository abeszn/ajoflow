const Contribution = require('../models/Contribution');
const Group = require('../models/Group');

const getDashboardStats = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const [myContributions, myGroups] = await Promise.all([
            Contribution.find({ member: userId })
                .populate('group', 'groupName frequency contributionAmount')
                .sort({ createdAt: -1 }),
            Group.find({ members: userId })
                .select('groupName frequency contributionAmount members admin')
                .populate('admin', 'name'),
        ]);

        const paid    = myContributions.filter((c) => c.status === 'paid');
        const pending = myContributions.filter((c) => c.status === 'pending');
        const missed  = myContributions.filter((c) => c.status === 'missed');

        const sum = (arr) => arr.reduce((s, c) => s + c.amount, 0);

        res.json({
            stats: {
                totalSaved:    sum(paid),
                groupsJoined:  myGroups.length,
                totalContributions: myContributions.length,
                missedCount:   missed.length,
                pendingCount:  pending.length,
                paidAmount:    sum(paid),
                pendingAmount: sum(pending),
                missedAmount:  sum(missed),
            },
            recentContributions: myContributions.slice(0, 6),
            groups: myGroups,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getDashboardStats };
