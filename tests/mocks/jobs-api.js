const viewJobFeed = jest.fn(() => Promise.resolve({ data: [], error: null }));
const viewJobDetails = jest.fn(() => Promise.resolve({ data: null, error: null }));
const submitApplication = jest.fn(() => Promise.resolve({ error: null }));

module.exports = { viewJobFeed, viewJobDetails, submitApplication };
module.exports.default = { viewJobFeed, viewJobDetails, submitApplication };
