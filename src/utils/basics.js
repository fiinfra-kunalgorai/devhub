export function exists(val) {
	return val !== undefined && val !== null;
}

export function isArray(val) {
    return exists(val) && Array.isArray(val);
}

export function isObject(val) {
    return exists(val) && Object.prototype.toString.call(val) === '[object Object]';
}

export function isString(val) {
    return exists(val) && typeof val === 'string';
}

export function isReactComponent(val) {
	return exists(val) && isObject(val) && (val['$$typeof'] ||'').toString() === 'Symbol(react.element)';
}

export function deepClone(val) {
    if (!isObject(val)) {
        throw Error(`${val} is not an object`);
    } else {
        return JSON.parse(JSON.stringify(val)); // To do: Find better way to clone objects.
    }
}