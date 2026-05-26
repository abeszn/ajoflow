const Contribution = require('../models/Contribution');

const checkMissedPayments = async () => {
    try {
        
        const today = new Date();

        const result = await Contribution.updateMany(
            {
                dueDate: { $lt: today },
                status: 'pending'
            },
            {
                status: 'missed'
            }
        );

        console.log(`${result.modifiedCount} missed payments updated`);

    } catch (error) {
        console.error(error.message);
    }
};

module.exports = checkMissedPayments;