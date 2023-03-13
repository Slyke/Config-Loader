# Multi-File Loader

A simple versatile Multi-file loader for ease of use or replacing environment variables.

## Installation:

```
npm install multi-file-loader
```

## Usage:

See example config files below for sources

### Simple

#### Simple default sync usage
```
const { readConfig } = require('multi-file-loader')();
const myJsonConfig = readConfigSync('./myFile.json');
const myTextConfig = readConfigSync('./myFile.txt');

console.log(myJsonConfig.isJson); // Outputs true
console.log(myTextConfig); // contents of the text file.
```

#### Simple default usage
```
const { readConfig } = require('multi-file-loader')();
const myJsonConfig = await readConfig('./myFile.json');
const myTextConfig = await readConfig('./myFile.txt');

console.log(myJsonConfig.isJson); // Outputs true
console.log(myTextConfig); // Outputs contents of the myFile.txt file.
```

### Advanced

#### Default behaviour can be modified by changing the parameters during instantiation:
```
// These are the default settings
const options = {
  errors: 'throw',
  logger: console,
  removeRead: true,
  defaultReturn: null,
  readOptions: 'utf8',
  forceJson: false,
  requireEnabled: true,
  errorCallback: null
};

// Then one of these 2 patterns:
const { readConfig } = require('multi-file-loader')(options);
// or
const MyConfig = require('multi-file-loader');
const { readConfig } = MyConfig(options);
```

Option definitions:
* `errors`: One of: 'throw', 'warn' or 'silent'.
* `logger`: The logger that should be called when errors is 'warn'
* `removeRead`: Deletes the file once read. Useful for when files are mounted in Kubernetes
* `defaultReturn`: If an error occurs, and errors is set to 'warn' or 'silent', this value will be returned.
* `readOptions`: Options for reading the file.
* `forceJson`: If true, will error if file doesn't parse to JSON and will return `defaultReturn` if `errors` is 'warn' or 'silent'. If false, will return data as is.
* `requireEnabled`: If false, will not attempt to load a file with `require()`. This may make some JSON files invalid, unless they follow strict JSON formatting rules.
* `errorCallback`: If this is a function, when any error occurs, this function will be called `errorCallback(err)` before logging or throwing.

#### Loading multiple files
Multiple files can be loaded asynchronously as arrays or objects. Files cannot be loaded synchronously.

##### Array
```
const { readConfig } = require('multi-file-loader')();
const myJsonConfig = await readConfig({ files: ['./myFile.json', './myOtherFile.json'] });

console.log(myJsonConfig[0].isJson); // Outputs true
console.log(myJsonConfig[1].someValue); // Outputs 1234
```

##### Object
```
const { readConfig } = require('multi-file-loader')();
const myConfigs = await readConfig({
  files: {
    myFile: './myFile.json',
    myOtherFile: './myOtherFile.json',
    myTextFile: './myFile.txt'
  }
});

console.log(myConfigs['myFile']?.isJson); // Outputs true
console.log(myConfigs['myOtherFile']?.someValue); // Outputs 1234
console.log(myConfigs['myTextFile']); // Outputs contents of the myFile.txt file.
```

### Example files:

myFile.json
```
{
  isJson: true,
  DoesNotNeedJsonQuotes: true,
  "optionalQuotes": "Also true"
  // Also allows for comments
}
```

myOtherFile.json
```
{
  someValue: 1234
}
```

myFile.txt
```
IS_JSON: false
Can do whatever: also true
```

## Kubernetes mounting secrets or Config-Maps as files

Check that your secret or config-map exists:

Secret:
```
kubectl get secrets -n my-namespace my-secret
```

Config-Map:
```
kubectl get configmap -n my-namespace my-configmap
```
Modify your pod or desployment's YAML, ensure that the file can be deleted after it is read (unless you set `removeRead` to false):
```
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
  namespace: my-namespace
spec:
  containers:
  - name: my-container
    image: my-image
    # Specify where the secret is mounted
    volumeMounts:
    - name: secret-volume
      mountPath: /path/to/secret.file
      readOnly: false
    - name: configmap-volume
      mountPath: /path/to/configmap.file
  volumes:
  # Specify the secret in volumes
  - name: secret-volume
    secret:
      secretName: my-secret
      # optional: true
  - name: configmap-volume
    configMap:
      name: my-configmap
      defaultMode: 432 # chmod 660.
```