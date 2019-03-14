export function stubObject<T extends object>(instance: T, methods?: string[] | object): T {
  const stubbedObject = Object.assign({} as T, instance);
  const objectMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(instance));
  const excludedMethods: string[] = [
    '__defineGetter__',
    '__defineSetter__',
    'hasOwnProperty',
    '__lookupGetter__',
    '__lookupSetter__',
    'propertyIsEnumerable',
    'toString',
    'valueOf',
    '__proto__',
    'toLocaleString',
    'isPrototypeOf',
  ];

  Object.keys(instance)
    .filter((m) => typeof instance[m] === 'function')
    .forEach((m) => objectMethods.push(m));

  objectMethods.filter((m) => excludedMethods.indexOf(m) === -1)
    .forEach((m) => stubbedObject[m] = instance[m]);

  if (Array.isArray(methods)) {
    methods.forEach((m) => stubbedObject[m] = jest.fn());
  } else if (typeof methods === 'object') {
    Object.keys(methods)
      .forEach((m) => stubbedObject[m] = methods[m]);
  } else {
    objectMethods.filter((m) => typeof instance[m] === 'function' && m !== 'constructor')
      .forEach((m) => stubbedObject[m] = jest.fn());
  }

  return stubbedObject;
}

export function stubInterface<T extends object>(methods: object = {}): T {
  const instance: T = stubObject<T>({} as T, methods);

  const proxy = new Proxy(instance, {
    get: (target, name, receiver) => {
      if (!target[name]) {
        target[name] = jest.fn();
      }
      return target[name];
    },
  });

  return proxy;
}
