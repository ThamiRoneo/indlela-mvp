const NetInfo = {
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
  isConnected: true,
};

module.exports = NetInfo;
module.exports.default = NetInfo;
