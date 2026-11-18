const viewJobFeed = jest.fn(() => Promise.resolve({ data: [], error: null }));
const viewJobDetails = jest.fn(() => Promise.resolve({ data: null, error: null }));
const submitApplication = jest.fn(() => Promise.resolve({ error: null }));
const cacheJobs = jest.fn(() => Promise.resolve());
const getCachedJobs = jest.fn(() => Promise.resolve(null));

module.exports = { viewJobFeed, viewJobDetails, submitApplication, cacheJobs, getCachedJobs };
module.exports.default = { viewJobFeed, viewJobDetails, submitApplication, cacheJobs, getCachedJobs };
