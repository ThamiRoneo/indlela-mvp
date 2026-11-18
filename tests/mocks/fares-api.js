const viewFares = jest.fn(() => Promise.resolve({ data: [], error: null }));
const reportFare = jest.fn(() => Promise.resolve({ error: null }));
const getCachedFares = jest.fn(() => Promise.resolve(null));
const viewFareAlerts = jest.fn(() => Promise.resolve({ data: [], error: null }));

module.exports = { viewFares, reportFare, getCachedFares, viewFareAlerts };
module.exports.default = { viewFares, reportFare, getCachedFares, viewFareAlerts };
