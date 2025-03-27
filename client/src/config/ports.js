const getPort = (env = process.env.NODE_ENV) => {
  const ports = {
    development: process.env.REACT_APP_PORT || 3000,
    test: process.env.REACT_APP_TEST_PORT || 3001,
    production: process.env.REACT_APP_PORT || 3000
  };

  return ports[env] || ports.development;
};

const getBackendPort = (env = process.env.NODE_ENV) => {
  const ports = {
    development: process.env.REACT_APP_BACKEND_PORT || 5000,
    test: process.env.REACT_APP_BACKEND_TEST_PORT || 5001,
    production: process.env.REACT_APP_BACKEND_PORT || 5000
  };

  return ports[env] || ports.development;
};

export { getPort, getBackendPort }; 