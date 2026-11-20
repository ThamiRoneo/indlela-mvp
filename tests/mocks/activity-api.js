const viewActivity = jest.fn(() => Promise.resolve({ data: [], error: null }));
const viewAlerts = jest.fn(() => Promise.resolve({ data: [], error: null }));

module.exports = { viewActivity, viewAlerts };
module.exports.default = { viewActivity, viewAlerts };
