const cron = require('node-cron');
const checkMissedPayments = require('./checkMissedPayments');

// Run every day at 12:00 AM
cron.schedule('0 0 * * *', async () => {
    try{
        console.log('Running daily missed payment check...');

        await checkMissedPayments();

        console.log('Missed payments updated successfully');
    } catch (error) {
        console.error('Cron Job Error:', error.message);
    }
});