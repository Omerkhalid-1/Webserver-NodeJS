const { format } = require('date-fns');
const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');
const { v4: uuid } = require('uuid');

const logEvents = async (message, logName) => {
    // Validate inputs to prevent undefined errors
    if (!message || typeof message !== 'string') {
        console.error('logEvents: message must be a non-empty string');
        return;
    }
    
    if (!logName || typeof logName !== 'string') {
        console.warn('logEvents: logName is undefined, using default');
        logName = 'req'; // Default fallback
    }
    
    // Ensure logName has .log extension
    if (!logName.endsWith('.log')) {
        logName += '.log';
    }
    
    const dateTime = format(new Date(), 'yyyy-MM-dd\tHH:mm:ss');
    const logItem = `${dateTime}\t${uuid()}\t${message}\n`;
    console.log(logItem);
    
    try {
        const logsDir = path.join(__dirname,'..', 'logs');
        
        // Check if logs directory exists
        if (!fs.existsSync(path.join(__dirname, '..', 'logs'))) {
            await fsPromises.mkdir(logsDir, { recursive: true });
        }
        
        // Append the log item to the log file
        const logFilePath = path.join(logsDir, logName);
        await fsPromises.appendFile(logFilePath, logItem);
        
    } catch (err) {
        console.error('Failed to write log:', err);
    }
};

const logger = (req, res, next) => {
    logEvents(`${req.method}\t${req.header.origin}\t${req.url}`, 'reqLog.txt');
    //console.log(`${req.method} ${req.path}`);
    next();
}

module.exports = {logger, logEvents};



// Testing// done 

// Database - postgres // done 

// Authentication, JWT, cookies, session. // done 
  
// Sequelize orm // done 

// Redis 
// Validation -- library validation.js, zod ( react )  // done



