const fs = require('fs');
const path = require('path');

const ConfigLoader = ({
  errors = 'throw',
  logger = console,
  removeRead = true,
  defaultReturn = null,
  readOptions = 'utf8',
  forceJson = false,
  requireEnabled = true,
  errorCallback = null
} = {}) => {
  const retr = {};

  const validErrors = Object.freeze(['throw', 'warn', 'silent']);
  retr.validErrors = validErrors;
  if (!validErrors.includes(errors)) {
    throw new Error('Invalid errors option');
  }

  const reportError = (err) => {
    if (typeof errorCallback === 'function') { errorCallback(err); }
    if (errors === 'throw') {
      throw new Error(err);
    } else if (errors === 'warn') {
      logger.warn(err);
      return defaultReturn;
    } else if (errors === 'silent') {
      return defaultReturn;
      // Do nothing
    }
  };

  const getConfigFromFile = (file) => {
    return new Promise(async (resolve, reject) => {
      let data = null;
      try {
        if (requireEnabled) {
          data = require(file);
          data = JSON.parse(JSON.stringify(data));
  
          return resolve(data);
        } else {
          return fs.readFile(file, readOptions, (err, data) => {
            if (err) {
              return reject(err);
            } else {
              return resolve(data);
            }
          });
        }
      } catch (err) {
        if (forceJson) {
          return reject(reportError(['ConfigLoader::getConfigFromFile() JSON.parse() Error', err]));
        }

        return fs.readFile(file, readOptions, (err, data) => {
          if (err) {
            return reject(err);
          } else {
            return resolve(data);
          }
        });
      } finally {
        if (removeRead) {
          try {
            fs.unlinkSync(file);
          } catch (err) {
            reportError(err);
          }
        }
      }
    });
  };

  const getConfigFromFileSync = (file) => {
    try {
      let data = null;
      try {
        if (requireEnabled) {
          data = require(file);
          data = JSON.parse(JSON.stringify(data));

          return data;
        } else {
          return fs.readFileSync(file, readOptions);
        }
      } catch (err) {
        if (forceJson) {
          return reportError(['ConfigLoader::getConfigFromFileSync() JSON.parse() Error', err]);
        }
        data = fs.readFileSync(file, readOptions);

        return data;
      } finally {
        if (removeRead) {
          fs.unlink(file, (err) => {
            if (err) { reportError(err); }
          });
        }
      }
    } catch (err) {
      return reportError(['ConfigLoader::getConfigFromFileSync()', err])
    }
  }

  retr.readConfigSync = (filename) => {
    if (typeof filename === 'string') {
      return getConfigFromFileSync(path.join(process.cwd(), filename));
    }

    return reportError('ConfigLoader::readConfigSync() Must specify a filename');
  };

  retr.readConfigFromArray = (fileList) => {
    return new Promise((resolve, reject) => {
      try {
        const fileConfigPromises = fileList.map((file) => {
          return getConfigFromFile(path.join(process.cwd(), file));
        });

        return Promise.allSettled(fileConfigPromises).then((finishedPromises) => {
          let returnConfigs = [];
          finishedPromises.forEach((promise) => {
            if (promise.status === 'rejected') {
              returnConfigs.push(defaultReturn);
              return reportError(promise.reason);
            } else if (promise.status === 'fulfilled') {
              returnConfigs.push(promise.value);
            }
          });

          return resolve(returnConfigs);
        });
      } catch (err) {
        return reject(reportError(['ConfigLoader::readConfigFromArray() Unhandled Error', err]));
      }
    });
  };

  retr.readConfigFromHashMap = (fileHashMap) => {
    return new Promise((resolve, reject) => {
      try {
        const fileConfigPromises = [];
        
        Object.keys(fileHashMap ?? {}).forEach((fileKey) => {
          if (typeof fileHashMap[fileKey] !== 'string') {
            return fileConfigPromises.push({
                key: fileKey,
                status: 'rejected',
                reason: `ConfigLoader::readConfigFromHashMap() fileHashMap values must be string for key: '${fileKey}'`
            });
          }

          const configPromise = getConfigFromFile(path.join(process.cwd(), fileHashMap[fileKey])).then((value) => ({
            key: fileKey,
            status: 'fulfilled',
            value
          })).catch((err) => ({
            key: fileKey,
            status: 'rejected',
            reason: err
          }))

          fileConfigPromises.push(configPromise);
        });

        return Promise.allSettled(fileConfigPromises).then((finishedPromises) => {
          let returnConfigs = {};
          finishedPromises.forEach((promise) => {
            const promiseKey = promise?.value?.key ?? promise?.reason?.key;
            returnConfigs[promiseKey] = null;
            if (promise.status === 'rejected') {
              returnConfigs[promiseKey] = defaultReturn;
              return reportError(promise.reason);
            } else if (promise.status === 'fulfilled') {
              returnConfigs[promiseKey] = promise?.value?.value;
            }
          });

          return resolve(returnConfigs);
        });
      } catch (err) {
        return reject(reportError(['ConfigLoader::readConfigFromHashMap() Unhandled Error', err]));
      }
    });
  };

  retr.readConfig = (props) => {
    return new Promise((resolve, reject) => {
      try {
        if (typeof props === 'string') {
          return getConfigFromFile(props);
        }

        const { files } = props;
        if (!files) {
          return reportError('ConfigLoader::readConfig() Must specify files');
        }

        if (!(typeof files === 'object' || Array.isArray(files))) {
          return reportError('ConfigLoader::readConfig() files must be an array or object');
        }

        if (Array.isArray(files)) {
          return retr.readConfigFromArray(files).then((configs) => {
            return resolve(configs);
          }).catch((err) => { 
            return reject(reportError(err));
          });
        }

        if (typeof files === 'object' && !Array.isArray(files)) {
          return retr.readConfigFromHashMap(files).then((configs) => {
            return resolve(configs);
          }).catch((err) => { 
            return reject(reportError(err));
          });
        }
        
        return reject(reportError(`ConfigLoader::readConfig() Unsupported loader type: '${typeof props}'`));
      } catch (err) {
        return reject(reportError(['ConfigLoader::readConfig() Unhandled Error', err]));
      }
    });
  };

  return retr;
};

module.exports = ConfigLoader;
