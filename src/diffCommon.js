
import convertToDiff from './convertToDiff';
import Weights from './Weights';

// Weightings for diff heuristics

const DefaultWeights = {
    OK: 0,                  // Only here as a convenience for tests, WEIGHT_OK is used as the constant
    NATIVE_NONNATIVE_MISMATCH: 15,
    NAME_MISMATCH: 10,
    ATTRIBUTE_MISMATCH: 2,
    ATTRIBUTE_MISSING: 2,
    ATTRIBUTE_EXTRA: 1,     // Actual contains an attribute that is not expected
    STRING_CONTENT_MISMATCH: 3,
    CONTENT_TYPE_MISMATCH: 1,
    CHILD_MISSING: 2,
    CHILD_INSERTED: 2,
    WRAPPER_REMOVED: 3,
    ALL_CHILDREN_MISSING: 8  // When the expected has children, and actual has no children
                             // This + CHILD_MISSING should be equal or greater than NAME_MISMATCH
                             // to avoid a name-changed child causing the actual rendered child to
                             // be identified as a wrapper, and the actual child as a missing child
                             // of the wrapper (see the test
                             // "doesn't wrap an element when it means there are missing children"
                             // for an example)
};

const defaultOptions = {
    diffExtraAttributes: true,
    diffRemovedAttributes: true,
    diffExtraChildren: true,
    diffMissingChildren: true,
    diffWrappers: true,
    diffExactClasses: true,
    diffExtraClasses: true,
    diffMissingClasses: true
};

const WEIGHT_OK = 0;

const checkElementWrapperResult = function (actualAdapter, actual, currentDiffResult, wrapperResult, options) {

    let diffResult = currentDiffResult;
    const wrapperWeight = options.diffWrappers ? options.weights.WRAPPER_REMOVED : WEIGHT_OK;
    if ((wrapperWeight + wrapperResult.weight.real) < diffResult.weight.real) {
        // It is (better as) a wrapper.
        diffResult = {
            diff: convertToDiff(actualAdapter, actual, { includeChildren: false }),
            weight: wrapperResult.weight.addTotal(options.weights.WRAPPER_REMOVED)
        };
        if (options.diffWrappers) {
            diffResult.diff.diff = {
                type: 'wrapper'
            };
            diffResult.weight.addReal(options.weights.WRAPPER_REMOVED);
        } else {
            diffResult.diff.type = 'WRAPPERELEMENT';
        }

        diffResult.diff.children = [wrapperResult.diff];
    }

    return diffResult;
};

const getExpectItContentErrorResult = function (actual, expected, error, options) {

    const diffResult = {
        type: 'CONTENT',
        value: actual,
        diff: {
            type: 'custom',
            assertion: expected,
            error: error
        }
    };

    const weights = new Weights();
    weights.add(options.weights.STRING_CONTENT_MISMATCH);
    return {
        diff: diffResult,
        weight: weights
    };
};

const getNativeContentResult = function (actual, expected, weights, options) {

    const diffResult = {
        type: 'CONTENT',
        value: actual
    };

    if (actual !== expected) {
        diffResult.diff = {
            type: 'changed',
            expectedValue: expected
        };
        if ('' + actual !== '' + expected) {
            weights.add(options.weights.STRING_CONTENT_MISMATCH);
        } else {
            weights.add(options.weights.CONTENT_TYPE_MISMATCH);
        }
    }

    return diffResult;
};

const getNativeNonNativeResult = function (actual, expected, weights, expectedAdapter, options) {

    weights.add(options.weights.NATIVE_NONNATIVE_MISMATCH);
    return {
        type: 'CONTENT',
        value: actual,
        diff: {
            type: 'contentElementMismatch',
            expected: convertToDiff(expectedAdapter, expected)
        }
    };
};

const getNonNativeNativeResult = function (actual, expected, weights, actualAdapter, expectedAdapter, options) {

    weights.add(options.weights.NATIVE_NONNATIVE_MISMATCH);
    const diffResult = convertToDiff(actualAdapter, actual);
    diffResult.diff = {
        type: 'elementContentMismatch',
        expected: convertToDiff(expectedAdapter, expected)
    };
    return diffResult;
};

const getElementResult = function (actualName, expectedName, weights, options) {
    const diffResult = {
        type: 'ELEMENT',
        name: actualName
    };

    if (actualName !== expectedName) {
        diffResult.diff = {
            type: 'differentElement',
            expectedName: expectedName
        };
        weights.add(options.weights.NAME_MISMATCH);
    }
    return diffResult;
};

const diffAttributes = function (actualAttributes, expectedAttributes, expect, expectItHandler, options) {

    let diffWeights = new Weights();
    const diffResult = [];

    Object.keys(actualAttributes).forEach(attrib => {

        const attribResult = { name: attrib, value: actualAttributes[attrib] };
        diffResult.push(attribResult);

        if (expectedAttributes.hasOwnProperty(attrib)) {
            const expectedAttrib = expectedAttributes[attrib];
            if (typeof expectedAttrib === 'function' && expectedAttrib._expectIt) {
                // This is an assertion in the form of expect.it(...)

                expectItHandler(expectedAttrib, actualAttributes[attrib], attribResult, diffWeights, options);

            } else if (!expect.equal(actualAttributes[attrib], expectedAttributes[attrib])) {
                diffWeights.add(options.weights.ATTRIBUTE_MISMATCH);
                attribResult.diff = {
                    type: 'changed',
                    expectedValue: expectedAttributes[attrib]
                };
            }
        } else {
            if (options.diffExtraAttributes) {
                diffWeights.addReal(options.weights.ATTRIBUTE_EXTRA);
                attribResult.diff = {
                    type: 'extra'
                };
            }

            diffWeights.addTotal(options.weights.ATTRIBUTE_EXTRA);
        }
    });

    Object.keys(expectedAttributes).forEach(attrib => {

        if (!actualAttributes.hasOwnProperty(attrib)) {
            if (options.diffRemovedAttributes) {
                diffWeights.addReal(options.weights.ATTRIBUTE_MISSING);
                const attribResult = {
                    name: attrib,
                    diff: {
                        type: 'missing',
                        expectedValue: expectedAttributes[attrib]
                    }
                };
                diffResult.push(attribResult);
            }
            diffWeights.addTotal(options.weights.ATTRIBUTE_MISSING);
        }
    });

    return {
        diff: diffResult,
        weight: diffWeights
    };
}


export default {
    defaultOptions,
    DefaultWeights,
    checkElementWrapperResult,
    getExpectItContentErrorResult,
    getNativeContentResult,
    getNativeNonNativeResult,
    getNonNativeNativeResult,
    getElementResult,
    diffAttributes,
    WEIGHT_OK
};


