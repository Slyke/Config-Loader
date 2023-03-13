import fs from 'fs';
import SyncLoaderTest from '../src/index.js';

const testFiles = [
  {
    path: './myFile1.js',
    data: `module.exports = {
  isJson: true,
  DoesNotNeedJsonQuotes: true,
  "optionalQuotes": "Also true"
  // Also allows for comments
}`
  },
  {
    path: './myFile2.json',
    data: `{
  "someValue": 1234
}`
  },
  {
    path: './myFile3.txt',
    data: `IS_JSON: false
Can do whatever: also true`
  }
];

const cleanupTestFiles = () => {
  testFiles.forEach((file) => {
    try {
      fs.unlinkSync(file.path);
    } catch (err) {
      // Do nothing
      return
    }

    console.log(`Prep:  - Deleted file: ${file.path}`);
  });

  return;
};

const prepareTestFiles = () => {
  cleanupTestFiles();
  testFiles.forEach((file) => {
    try {
      fs.writeFileSync(file.path, file.data, { flag: 'wx' });
    } catch (err) {
      console.warn(`Error writing file: '${file.path}'`, err);
    }

    console.log(`Prep:  - Created file: ${file.path}`);
  });

  return;
};

prepareTestFiles();

// Testing Sync
const syncLoaderTest = SyncLoaderTest();
const syncLoaderTestNoDelete = SyncLoaderTest({ removeRead: false });
const myJsConfig = syncLoaderTestNoDelete.readConfigSync(testFiles[0].path);
const myJsonConfig = syncLoaderTest.readConfigSync(testFiles[1].path);
const myTextConfig = syncLoaderTest.readConfigSync(testFiles[2].path);
console.log('');
console.log('Running Sync load tests');

if (myJsConfig.isJson !== true) {
  throw new Error('Test failed. myJsConfig.isJson !== true');
} else {
  console.log('Test: myJsConfig.isJson === true');
}

if (myJsonConfig.someValue !== 1234) {
  throw new Error('Test failed. myJsonConfig.someValue !== true');
} else {
  console.log('Test: myJsonConfig.someValue === 1234');
}

if (myTextConfig !== testFiles[2].data) {
  throw new Error('Test failed. myTextConfig data does not match testFiles[2].data');
} else {
  console.log('Test: myTextConfig data matches testFiles[2].data');
}

fs.accessSync(testFiles[0].path, fs.F_OK)
console.log(`Test: File '${testFiles[0].path}' still exists`);

try {
  fs.accessSync(testFiles[1].path, fs.F_OK);
  throw new Error(`Test failed. File '${testFiles[1].path}' still exists`);
} catch (err) {
  console.log(`Test: File '${testFiles[1].path}' was deleted`);
}

try {
  fs.accessSync(testFiles[2].path, fs.F_OK);
  throw new Error(`Test failed. File '${testFiles[2].path}' still exists`);
} catch (err) {
  console.log(`Test: File '${testFiles[2].path}' was deleted`);
}

console.log('Sync load tests passed');
console.log('');

cleanupTestFiles();
prepareTestFiles();

console.log('');
console.log('Running array load tests');

let forceJsonErrorCallbackWasCalled = false;

const arrayLoaderTest = SyncLoaderTest();
const arrayLoaderTestForceJson = SyncLoaderTest({ forceJson: true, errorCallback: (err) => { forceJsonErrorCallbackWasCalled = true }, errors: 'silent' });
const arrayLoaderTestNoDelete = SyncLoaderTest({ removeRead: false });

const myConfigsKeepFile = await arrayLoaderTestNoDelete.readConfig({
  files: [
    testFiles[0].path,
    testFiles[1].path,
    testFiles[2].path
  ]
});

if (myConfigsKeepFile[0].isJson !== true) {
  throw new Error('Test failed. myConfigsKeepFile[0].isJson !== true');
} else {
  console.log('Test: myConfigsKeepFile[0].isJson === true');
}

if (myConfigsKeepFile[1].someValue !== 1234) {
  throw new Error('Test failed. myConfigsKeepFile[1].someValue !== 1234');
} else {
  console.log('Test: myConfigsKeepFile[1].someValue === 1234');
}

if (myConfigsKeepFile[2] !== testFiles[2].data) {
  throw new Error('Test failed. myConfigsKeepFile[2] text data does not match testFiles[2].data');
} else {
  console.log('Test: myConfigsKeepFile[2] data matches testFiles[2].data');
}

fs.accessSync(testFiles[0].path, fs.F_OK)
console.log(`Test: File '${testFiles[0].path}' still exists`);

fs.accessSync(testFiles[1].path, fs.F_OK)
console.log(`Test: File '${testFiles[1].path}' still exists`);

fs.accessSync(testFiles[2].path, fs.F_OK)
console.log(`Test: File '${testFiles[2].path}' still exists`);

prepareTestFiles();

const myConfigsDeleteFile = await arrayLoaderTest.readConfig({
  files: [
    testFiles[0].path,
    testFiles[1].path,
    testFiles[2].path
  ]
});

if (myConfigsDeleteFile[0].isJson !== true) {
  throw new Error('Test failed. myConfigsDeleteFile[0].isJson !== true');
} else {
  console.log('Test: myConfigsDeleteFile[0].isJson === true');
}

if (myConfigsDeleteFile[1].someValue !== 1234) {
  throw new Error('Test failed. myConfigsDeleteFile[1].someValue !== 1234');
} else {
  console.log('Test: myConfigsDeleteFile[1].someValue === 1234');
}

if (myConfigsDeleteFile[2] !== testFiles[2].data) {
  throw new Error('Test failed. myConfigsDeleteFile[2] text data does not match testFiles[2].data');
} else {
  console.log('Test: myConfigsDeleteFile[2] data matches testFiles[2].data');
}

try {
  fs.accessSync(testFiles[0].path, fs.F_OK);
  throw new Error(`Test failed. File '${testFiles[0].path}' still exists`);
} catch (err) {
  console.log(`Test: File '${testFiles[0].path}' was deleted`);
}

try {
  fs.accessSync(testFiles[1].path, fs.F_OK);
  throw new Error(`Test failed. File '${testFiles[1].path}' still exists`);
} catch (err) {
  console.log(`Test: File '${testFiles[1].path}' was deleted`);
}

try {
  fs.accessSync(testFiles[2].path, fs.F_OK);
  throw new Error(`Test failed. File '${testFiles[2].path}' still exists`);
} catch (err) {
  console.log(`Test: File '${testFiles[2].path}' was deleted`);
}

prepareTestFiles();

// Force JSON
const myConfigsForceJson = await arrayLoaderTestForceJson.readConfig({
  files: [
    testFiles[0].path,
    testFiles[1].path
  ]
});

if (myConfigsForceJson[0].isJson !== true) {
  throw new Error('Test failed. myConfigsForceJson[0].isJson !== true');
} else {
  console.log('Test: myConfigsForceJson[0].isJson === true');
}

if (myConfigsForceJson[1].someValue !== 1234) {
  throw new Error('Test failed. myConfigsForceJson[1].someValue !== 1234');
} else {
  console.log('Test: myConfigsForceJson[1].someValue === 1234');
}

try {
  fs.accessSync(testFiles[0].path, fs.F_OK);
  throw new Error(`Test failed. File '${testFiles[0].path}' still exists`);
} catch (err) {
  console.log(`Test: File '${testFiles[0].path}' was deleted`);
}

try {
  fs.accessSync(testFiles[1].path, fs.F_OK);
  throw new Error(`Test failed. File '${testFiles[1].path}' still exists`);
} catch (err) {
  console.log(`Test: File '${testFiles[1].path}' was deleted`);
}

if (forceJsonErrorCallbackWasCalled === true) {
  throw new Error('Test failed. forceJsonErrorCallbackWasCalled === true and no errors should have occured yet');
} else {
  console.log('Test: forceJsonErrorCallbackWasCalled !== true');
}
try {
  const myConfigsForceJsonNotJson = await arrayLoaderTestForceJson.readConfig({
    files: [
      testFiles[2].path
    ]
  });

  throw new Error('Test failed. myConfigsForceJsonNotJson[0] loaded when it should not have');
} catch (err) {
  console.log('Test: myConfigsForceJsonNotJson[0] did not load');
}

if (forceJsonErrorCallbackWasCalled !== true) {
  throw new Error('Test failed. forceJsonErrorCallbackWasCalled !== true');
} else {
  console.log('Test: forceJsonErrorCallbackWasCalled === true');
}

try {
  fs.accessSync(testFiles[2].path, fs.F_OK);
  throw new Error(`Test failed. File '${testFiles[2].path}' still exists`);
} catch (err) {
  console.log(`Test: File '${testFiles[2].path}' was deleted`);
}

console.log('Array load tests passed');
console.log('');

cleanupTestFiles();
prepareTestFiles();

console.log('');
console.log('Running hashmap load tests');

forceJsonErrorCallbackWasCalled = false;

const hashMapLoaderTest = SyncLoaderTest();
const hashMapLoaderTestForceJson = SyncLoaderTest({ forceJson: true, errorCallback: (err) => { forceJsonErrorCallbackWasCalled = true }, errors: 'silent' });
const hashMapLoaderTestNoDelete = SyncLoaderTest({ removeRead: false });

const hashMapMyConfigsKeepFile = await hashMapLoaderTestNoDelete.readConfig({
  files: {
    file1: testFiles[0].path,
    file2: testFiles[1].path,
    file3: testFiles[2].path
  }
});

if (hashMapMyConfigsKeepFile['file1'].isJson !== true) {
  throw new Error('Test failed. hashMapMyConfigsKeepFile["file1"].isJson !== true');
} else {
  console.log('Test: hashMapMyConfigsKeepFile["file1"].isJson === true');
}

if (hashMapMyConfigsKeepFile['file2'].someValue !== 1234) {
  throw new Error('Test failed. hashMapMyConfigsKeepFile["file2"].someValue !== 1234');
} else {
  console.log('Test: hashMapMyConfigsKeepFile["file2"].someValue === 1234');
}

if (hashMapMyConfigsKeepFile['file3'] !== testFiles[2].data) {
  throw new Error('Test failed. hashMapMyConfigsKeepFile["file3"] text data does not match testFiles[2].data');
} else {
  console.log('Test: hashMapMyConfigsKeepFile["file3"] data matches testFiles[2].data');
}

try {
  fs.accessSync(testFiles[0].path, fs.F_OK);
  throw new Error(`Test failed. File '${testFiles[0].path}' still exists`);
} catch (err) {
  console.log(`Test: File '${testFiles[0].path}' was deleted`);
}

try {
  fs.accessSync(testFiles[1].path, fs.F_OK);
  throw new Error(`Test failed. File '${testFiles[1].path}' still exists`);
} catch (err) {
  console.log(`Test: File '${testFiles[1].path}' was deleted`);
}

try {
  fs.accessSync(testFiles[2].path, fs.F_OK);
  throw new Error(`Test failed. File '${testFiles[2].path}' still exists`);
} catch (err) {
  console.log(`Test: File '${testFiles[2].path}' was deleted`);
}

prepareTestFiles();

// Force JSON
const hashMapMyConfigsForceJson = await hashMapLoaderTestForceJson.readConfig({
  files: {
    file1: testFiles[0].path,
    file2: testFiles[1].path
  }
});

if (hashMapMyConfigsForceJson['file1'].isJson !== true) {
  throw new Error('Test failed. hashMapMyConfigsForceJson["file1"].isJson !== true');
} else {
  console.log('Test: hashMapMyConfigsForceJson["file1"].isJson === true');
}

if (hashMapMyConfigsForceJson['file2'].someValue !== 1234) {
  throw new Error('Test failed. hashMapMyConfigsForceJson["file2"].someValue !== 1234');
} else {
  console.log('Test: hashMapMyConfigsForceJson["file2"].someValue === 1234');
}

try {
  fs.accessSync(testFiles[0].path, fs.F_OK);
  throw new Error(`Test failed. File '${testFiles[0].path}' still exists`);
} catch (err) {
  console.log(`Test: File '${testFiles[0].path}' was deleted`);
}

try {
  fs.accessSync(testFiles[1].path, fs.F_OK);
  throw new Error(`Test failed. File '${testFiles[1].path}' still exists`);
} catch (err) {
  console.log(`Test: File '${testFiles[1].path}' was deleted`);
}

if (forceJsonErrorCallbackWasCalled === true) {
  throw new Error('Test failed. forceJsonErrorCallbackWasCalled === true and no errors should have occured yet');
} else {
  console.log('Test: forceJsonErrorCallbackWasCalled !== true');
}
try {
  const myConfigsForceJsonNotJson = await hashMapLoaderTestForceJson.readConfig({
    files: [
      testFiles[2].path
    ]
  });

  throw new Error('Test failed. myConfigsForceJsonNotJson[0] loaded when it should not have');
} catch (err) {
  console.log('Test: myConfigsForceJsonNotJson[0] did not load');
}

if (forceJsonErrorCallbackWasCalled !== true) {
  throw new Error('Test failed. forceJsonErrorCallbackWasCalled !== true');
} else {
  console.log('Test: forceJsonErrorCallbackWasCalled === true');
}

try {
  fs.accessSync(testFiles[2].path, fs.F_OK);
  throw new Error(`Test failed. File '${testFiles[2].path}' still exists`);
} catch (err) {
  console.log(`Test: File '${testFiles[2].path}' was deleted`);
}

cleanupTestFiles();