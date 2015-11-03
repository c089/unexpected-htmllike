
import Unexpected from 'unexpected';
import MagicPenPrism from 'magicpen-prism';

import Painter from '../painter';

const expect = Unexpected
    .clone()
    .use(MagicPenPrism);


function duplicate(object, count) {
    const result = [];
    for(let i = count - 1; i >= 0; --i) {
        result.push(object);
    }
    return result;
}

describe('Painter', () => {

    let pen;

    beforeEach(() => {
        pen = expect.output.clone();
    });

    it('outputs a single empty element', () => {

        Painter(pen, {
            type: 'ELEMENT',
            name: 'div'
        }, expect.inspect);

        expect(pen.toString(), 'to equal',
        '<div />');
    });

    it('outputs a single empty element with string attributes', () => {

        Painter(pen, {
            type: 'ELEMENT',
            name: 'div',
            attributes: [
                { name: 'id', value: 'abc' },
                { name: 'className', value: 'foo' }
            ]
        }, expect.inspect);

        expect(pen.toString(), 'to equal',
            '<div id="abc" className="foo" />');
    });

    it('outputs a single empty element with object attributes', () => {

        Painter(pen, {
            type: 'ELEMENT',
            name: 'div',
            attributes: [
                { name: 'id', value: 'abc' },
                { name: 'style', value: { width: 100, height: 200 } }
            ]
        }, expect.inspect);

        expect(pen.toString(), 'to equal',
            '<div id="abc" style={{ width: 100, height: 200 }} />');
    });

    it('outputs many attributes over separate lines', () => {

        Painter(pen, {
            type: 'ELEMENT',
            name: 'div',
            attributes: [
                { name: 'id', value: 'abc' },
                { name: 'className', value: 'foo bah gah blah cheese' },
                { name: 'another', value: 'big long attribute value' },
                { name: 'style', value: { width: 100, height: 200 } },
                { name: 'role', value: 'button-with-a-long-name' }
            ]
        }, expect.inspect);

        expect(pen.toString(), 'to equal',
            '<div id="abc" className="foo bah gah blah cheese" another="big long attribute value"\n' +
            '   style={{ width: 100, height: 200 }} role="button-with-a-long-name"\n' +
            '/>');
    });

    it('outputs a changed attribute', () => {

        Painter(pen, {
            type: 'ELEMENT',
            name: 'div',
            attributes: [
                { name: 'id', value: 'abc', diff: { type: 'changed', expectedValue: '123' } }
            ]
        }, expect.inspect, expect.diff);

        expect(pen.toString(), 'to equal',
            '<div id="abc" // should be id="123"\n' +
            '              // -abc\n' +
            '              // +123\n' +
            '/>');
    });

    it('outputs a different attribute type', () => {

        Painter(pen, {
            type: 'ELEMENT',
            name: 'div',
            attributes: [
                { name: 'id', value: '123', diff: { type: 'changed', expectedValue: 123 } }
            ]
        }, expect.inspect);

        expect(pen.toString(), 'to equal',
            '<div id="123" // should be id={123}\n' +
            '/>');
    });


    it('outputs a different boolean attribute', () => {

        Painter(pen, {
            type: 'ELEMENT',
            name: 'div',
            attributes: [
                { name: 'disabled', value: true, diff: { type: 'changed', expectedValue: false } }
            ]
        }, expect.inspect);

        expect(pen.toString(), 'to equal',
            '<div disabled={true} // should be disabled={false}\n' +
            '/>');
    });


    it('outputs a changed attribute with an object diff', () => {

        Painter(pen, {
            type: 'ELEMENT',
            name: 'div',
            attributes: [
                { name: 'id', value: { abc: 123, def: 'ghi' }, diff: { type: 'changed', expectedValue: { abc: 123, def: 'ghij'} } }
            ]
        }, expect.inspect, expect.diff);

        expect(pen.toString(), 'to equal',
            "<div id={{ abc: 123, def: 'ghi' }} // should be id={{ abc: 123, def: 'ghij' }}\n" +
            '                                   // {\n' +
            '                                   //   abc: 123,\n' +
            "                                   //   def: 'ghi' // should equal 'ghij'\n" +
            '                                   //              // -ghi\n' +
            '                                   //              // +ghij\n' +
            '                                   // }\n' +
            '/>');
    });

    it('outputs a missing attribute', () => {

        Painter(pen, {
            type: 'ELEMENT',
            name: 'div',
            attributes: [
                { name: 'id', diff: { type: 'missing', expectedValue: '123' } }
            ]
        }, expect.inspect, expect.diff);

        expect(pen.toString(), 'to equal',
            '<div // missing id="123"\n' +
            '/>');

    });

    it('outputs an extra attribte', () => {

        Painter(pen, {
            type: 'ELEMENT',
            name: 'div',
            attributes: [
                { name: 'id', value:'abc', diff: { type: 'extra' } }
            ]
        }, expect.inspect, expect.diff);

        expect(pen.toString(), 'to equal',
            '<div id="abc" // id should be removed\n' +
            '/>');
    });

    it('outputs an inspected object attribute over multiple lines', () => {

        Painter(pen, {
            type: 'ELEMENT',
            name: 'div',
            attributes: [
                {
                    name: 'id',
                    diff: {
                        type: 'missing',
                        expectedValue: {
                            test: 'one two three four five',
                            foo: 'bar lah cheese',
                            testing: 'is fun with long text',
                            id: 42
                        }
                    }
                }
            ]
        }, expect.inspect, expect.diff);

        expect(pen.toString(), 'to equal',
            '<div // missing id={{\n' +
            "     //   test: 'one two three four five',\n" +
            "     //   foo: 'bar lah cheese',\n" +
            "     //   testing: 'is fun with long text',\n" +
            '     //   id: 42\n' +
            '     // }}\n' +
            '/>');
    });

    it('forces the children onto multiple lines when attributes are on multiple lines', () => {

        Painter(pen, {
            type: 'ELEMENT',
            name: 'div',
            attributes: [
                {
                    name: 'id',
                    diff: {
                        type: 'missing',
                        expectedValue: {
                            test: 'one two three four five',
                            foo: 'bar lah cheese',
                            testing: 'is fun with long text',
                            id: 42
                        }
                    }
                }
            ],
            children: [ { type: 'CONTENT', value: 'some text' }]
        }, expect.inspect, expect.diff);

        expect(pen.toString(), 'to equal',
            '<div // missing id={{\n' +
            "     //   test: 'one two three four five',\n" +
            "     //   foo: 'bar lah cheese',\n" +
            "     //   testing: 'is fun with long text',\n" +
            '     //   id: 42\n' +
            '     // }}\n' +
            '>\n' +
            '  some text\n' +
            '</div>');
    });

    it('outputs a single child element', () => {

        Painter(pen, {
            type: 'ELEMENT',
            name: 'div',
            children: [
                { type: 'ELEMENT',
                  name: 'span'
                }
            ]
        }, expect.inspect, expect.diff);

        expect(pen.toString(), 'to equal',
            '<div><span /></div>');

    });


    it('outputs many children split onto separate lines', () => {

        Painter(pen, {
            type: 'ELEMENT',
            name: 'div',
            children: duplicate(
                { type: 'ELEMENT',
                    name: 'span'
                }, 12)
        }, expect.inspect, expect.diff);

        expect(pen.toString(), 'to equal',
            '<div>\n' +
            '  <span />\n' +
            '  <span />\n' +
            '  <span />\n' +
            '  <span />\n' +
            '  <span />\n' +
            '  <span />\n' +
            '  <span />\n' +
            '  <span />\n' +
            '  <span />\n' +
            '  <span />\n' +
            '  <span />\n' +
            '  <span />\n' +
            '</div>');
    });

    it('outputs children with changes on separate lines', () => {

        Painter(pen, {
            type: 'ELEMENT',
            name: 'div',
            children: [
                {
                    type: 'ELEMENT',
                    name: 'span',
                    attributes: [
                        { name: 'id', value: 'abc', diff: { type: 'changed', expectedValue: 'abcd' } }
                    ]
                }
            ]
        }, expect.inspect, expect.diff);

        expect(pen.toString(), 'to equal',
        '<div>\n' +
        '  <span id="abc" // should be id="abcd"\n' +
        '                 // -abc\n' +
        '                 // +abcd\n' +
        '  />\n' +
        '</div>');
    });

    it('outputs children with single line changes on separate lines', () => {

        Painter(pen, {
            type: 'ELEMENT',
            name: 'div',
            children: [
                {
                    type: 'ELEMENT',
                    name: 'span',
                    attributes: [
                        { name: 'id', diff: { type: 'missing', expectedValue: 'abcd' } }
                    ]
                }
            ]
        }, expect.inspect, expect.diff);

        expect(pen.toString(), 'to equal',
            '<div>\n' +
            '  <span // missing id="abcd"\n' +
            '  />\n' +
            '</div>');
    });

    it('outputs text content', () => {

        Painter(pen, {
            type: 'ELEMENT',
            name: 'div',
            children: [
                {
                    type: 'CONTENT',
                    value: 'abc'
                }
            ]
        }, expect.inspect, expect.diff);

        expect(pen.toString(), 'to equal',
            '<div>abc</div>');

    });

    it('outputs numeric content', () => {

        Painter(pen, {
            type: 'ELEMENT',
            name: 'div',
            children: [
                {
                    type: 'CONTENT',
                    value: 42
                }
            ]
        }, expect.inspect, expect.diff);

        expect(pen.toString(), 'to equal',
            '<div>42</div>');

    });

    it('outputs children with text content on separate lines', () => {

        Painter(pen, {
            type: 'ELEMENT',
            name: 'div',
            children: duplicate({
                type: 'ELEMENT',
                name: 'span',
                attributes: [{ name: 'className', value: 'foo' }],
                children: [{ type: 'CONTENT', value: 'text content' }]
            }, 3)
        }, expect.inspect, expect.diff);

        expect(pen.toString(), 'to equal',
            '<div>\n' +
            '  <span className="foo">text content</span>\n' +
            '  <span className="foo">text content</span>\n' +
            '  <span className="foo">text content</span>\n' +
            '</div>');

    });

    it('outputs deep nested children', () => {

        Painter(pen, {
            type: 'ELEMENT',
            name: 'div',
            children: duplicate({
                type: 'ELEMENT',
                name: 'span',
                attributes: [{ name: 'className', value: 'foo' }],
                children: [
                    { type: 'ELEMENT', name: 'strong', children: [ { type: 'CONTENT', value: 'text content' }] }
                ]
            }, 3)
        }, expect.inspect, expect.diff);

        expect(pen.toString(), 'to equal',
            '<div>\n' +
            '  <span className="foo"><strong>text content</strong></span>\n' +
            '  <span className="foo"><strong>text content</strong></span>\n' +
            '  <span className="foo"><strong>text content</strong></span>\n' +
            '</div>');
    });

    it('outputs a changed text content', () => {

        Painter(pen, {
            type: 'ELEMENT',
            name: 'div',
            children: [
                {
                    type: 'CONTENT',
                    value: 'abc',
                    diff: {
                        type: 'changed',
                        expectedValue: 'abcd'
                    }
                }
            ]
        }, expect.inspect, expect.diff);

        expect(pen.toString(), 'to equal',
            '<div>\n' +
            '  -abc\n' +
            '  +abcd\n' +
            '</div>');

    });

    it('outputs a changed type content', () => {

        Painter(pen, {
            type: 'ELEMENT',
            name: 'div',
            children: [
                {
                    type: 'CONTENT',
                    value: '123',
                    diff: {
                        type: 'changed',
                        expectedValue: 123
                    }
                }
            ]
        }, expect.inspect, expect.diff);

        expect(pen.toString(), 'to equal',
            '<div>\n' +
            '  123 // mismatched type -string\n' +
            '      //                 +number\n' +
            '</div>');

    });

    it('outputs a missing child', () => {

        Painter(pen, {
            type: 'ELEMENT',
            name: 'div',
            children: [
                {
                    type: 'ELEMENT',
                    name: 'span',
                    attributes: [ { name: 'className', value: 'foo' } ],
                    diff: {
                        type: 'missing'
                    }
                }
            ]
        }, expect.inspect, expect.diff);

        expect(pen.toString(), 'to equal',
        '<div>\n' +
        '  // missing <span className="foo" />\n' +
        '</div>');
    });

    it('outputs a missing child in the middle of list of children', () => {

        Painter(pen, {
            type: 'ELEMENT',
            name: 'div',
            children: [
                {
                    type: 'ELEMENT',
                    name: 'span',
                    attributes: [ { name: 'className', value: 'foo' } ]
                },
                {
                    type: 'ELEMENT',
                    name: 'span',
                    attributes: [ { name: 'className', value: 'foo' } ],
                    diff: {
                        type: 'missing'
                    }
                },
                {
                    type: 'ELEMENT',
                    name: 'span',
                    attributes: [ { name: 'className', value: 'foo' } ]
                }
            ]
        }, expect.inspect, expect.diff);

        expect(pen.toString(), 'to equal',
            '<div>\n' +
            '  <span className="foo" />\n' +
            '  // missing <span className="foo" />\n' +
            '  <span className="foo" />\n' +
            '</div>');
    });

    it('outputs an extra element', () => {

        Painter(pen, {
            type: 'ELEMENT',
            name: 'div',
            children: [
                {
                    type: 'ELEMENT',
                    name: 'span',
                    attributes: [ { name: 'className', value: 'foo' } ],
                    diff: {
                        type: 'extra'
                    }
                }
            ]
        }, expect.inspect, expect.diff);

        expect(pen.toString(), 'to equal',
            '<div>\n' +
            '  <span className="foo" /> // should be removed\n' +
            '</div>');
    });

    it('outputs an extra element over multiple lines', () => {

        Painter(pen, {
            type: 'ELEMENT',
            name: 'div',
            children: [
                {
                    type: 'ELEMENT',
                    name: 'span',
                    attributes: [
                        { name: 'className', value: 'foo' },
                        { name: 'data-className1', value: 'foo' },
                        { name: 'data-className2', value: 'foo' },
                        { name: 'data-className3', value: 'foo' },
                        { name: 'data-className4', value: 'foo' }
                    ],
                    diff: {
                        type: 'extra'
                    }
                }
            ]
        }, expect.inspect, expect.diff);

        expect(pen.toString(), 'to equal',
            '<div>\n' +
            '  <span className="foo" data-className1="foo" data-className2="foo" // should be removed\n' +
            '     data-className3="foo" data-className4="foo"                    //\n' +
            '  />                                                                //\n' +
            '</div>');
    });

    it('outputs an extra element in the middle of the children', () => {

        Painter(pen, {
            type: 'ELEMENT',
            name: 'div',
            children: [
                {
                    type: 'ELEMENT',
                    name: 'span',
                    attributes: [ { name: 'className', value: 'foo' } ]
                },
                {
                    type: 'ELEMENT',
                    name: 'span',
                    attributes: [ { name: 'className', value: 'foo' } ],
                    diff: {
                        type: 'extra'
                    }
                },
                {
                    type: 'ELEMENT',
                    name: 'span',
                    attributes: [ { name: 'className', value: 'foo' } ]
                }
            ]
        }, expect.inspect, expect.diff);

        expect(pen.toString(), 'to equal',
            '<div>\n' +
            '  <span className="foo" />\n' +
            '  <span className="foo" /> // should be removed\n' +
            '  <span className="foo" />\n' +
            '</div>');
    });

    it('outputs a removed text element', () => {

        Painter(pen, {
            type: 'ELEMENT',
            name: 'div',
            children: [
                {
                    type: 'CONTENT',
                    value: 'some text',
                    diff: {
                        type: 'extra'
                    }
                }
            ]
        }, expect.inspect, expect.diff);

        expect(pen.toString(), 'to equal',
            '<div>\n' +
            '  some text // should be removed\n' +
            '</div>');
    });

    it('outputs a removed text element over multiple lines', () => {

        Painter(pen, {
            type: 'ELEMENT',
            name: 'div',
            children: [
                {
                    type: 'CONTENT',
                    value: 'some text\nsome more text',
                    diff: {
                        type: 'extra'
                    }
                }
            ]
        }, expect.inspect, expect.diff);

        expect(pen.toString(), 'to equal',
            '<div>\n' +
            '  some text      // should be removed\n' +
            '  some more text //\n' +
            '</div>');
    });

    it('outputs a missing text element', () => {

        Painter(pen, {
            type: 'ELEMENT',
            name: 'div',
            children: [
                {
                    type: 'CONTENT',
                    value: 'some text',
                    diff: {
                        type: 'missing'
                    }
                }
            ]
        }, expect.inspect, expect.diff);

        expect(pen.toString(), 'to equal',
            '<div>\n' +
            '  // missing some text\n' +
            '</div>');
    });

    it('outputs a missing text element over multiple lines', () => {

        Painter(pen, {
            type: 'ELEMENT',
            name: 'div',
            children: [
                {
                    type: 'CONTENT',
                    value: 'some text\nsome more text',
                    diff: {
                        type: 'missing'
                    }
                }
            ]
        }, expect.inspect, expect.diff);

        expect(pen.toString(), 'to equal',
            '<div>\n' +
            '  // missing some text\n' +
            '  //         some more text\n' +
            '</div>');
    });


    it('outputs an extra wrapper', () => {

        Painter(pen, {
            type: 'ELEMENT',
            name: 'div',
            diff: {
                type: 'wrapper'
            },
            children: [
                {
                    type: 'ELEMENT',
                    name: 'span',
                    children: [ { type: 'CONTENT', value: 'some text' } ]
                }
            ]
        }, expect.inspect, expect.diff);

        expect(pen.toString(), 'to equal',
            '<div> // wrapper should be removed\n' +
            '  <span>some text</span>\n' +
            '</div> // wrapper should be removed');
    });

    it('outputs two levels of extra wrappers', () => {

        Painter(pen, {
            type: 'ELEMENT',
            name: 'div',
            diff: {
                type: 'wrapper'
            },
            children: [
                {
                    type: 'ELEMENT',
                    name: 'span',
                    diff: {
                        type: 'wrapper'
                    },
                    children: [{
                        type: 'ELEMENT', name: 'span', children: [{ type: 'CONTENT', value: 'some text' }]
                    } ]
                }
            ]
        }, expect.inspect, expect.diff);

        expect(pen.toString(), 'to equal',
            '<div> // wrapper should be removed\n' +
            '  <span> // wrapper should be removed\n' +
            '    <span>some text</span>\n' +
            '  </span> // wrapper should be removed\n' +
            '</div> // wrapper should be removed');
    });

    it('outputs a wrapper on separate line when the wrapper is not a diff', () => {

        Painter(pen, {
            type: 'WRAPPERELEMENT',
            name: 'div',
            attributes: [{ name: 'className', value: 'foo' }],
            children: [
                {
                    type: 'ELEMENT',
                    name: 'span',
                    children: [ { type: 'CONTENT', value: 'some text' } ]
                }
            ]
        }, expect.inspect, expect.diff);

        expect(pen.toString(), 'to equal',
            '<div className="foo">\n' +
            '  <span>some text</span>\n' +
            '</div>');
    });

    it('outputs a wrapper greyed out when the wrapper is not a diff', () => {

        Painter(pen, {
            type: 'WRAPPERELEMENT',
            name: 'div',
            attributes: [{ name: 'className', value: 'foo' }],
            children: [
                {
                    type: 'ELEMENT',
                    name: 'span',
                    children: [ { type: 'CONTENT', value: 'some text' } ]
                }
            ]
        }, expect.inspect, expect.diff);

        expect(pen, 'to equal',
            expect.output.clone().prismPunctuation('<div className="foo">')
                    .nl().indentLines().i()
                    .block(function () {
                        this.prismPunctuation('<')
                            .prismTag('span')
                            .prismPunctuation('>')
                            .block('some text')
                            .prismPunctuation('</')
                            .prismTag('span')
                            .prismPunctuation('>');
                    })
            .nl().prismPunctuation('</div>')
        );
    });

    it('outputs a different named element without attributes or children', () => {

        Painter(pen, {
            type: 'ELEMENT',
            name: 'div',
            diff: {
                type: 'differentElement',
                expectedName: 'span'
            }
        }, expect.inspect, expect.diff);

        expect(pen.toString(), 'to equal',
            '<div // should be <span\n' +
            '/>');
    });

    it('outputs a different named element without attributes', () => {

        Painter(pen, {
            type: 'ELEMENT',
            name: 'div',
            diff: {
                type: 'differentElement',
                expectedName: 'span'
            },
            children: [
                {
                    type: 'ELEMENT',
                    name: 'span',
                    children: [{
                        type: 'CONTENT', value: 'some text'
                    } ]
                }
            ]
        }, expect.inspect, expect.diff);

        expect(pen.toString(), 'to equal',
            '<div // should be <span\n' +
            '>\n' +
            '  <span>some text</span>\n' +
            '</div>');

    });

    it('outputs a different named element with attributes', () => {

        Painter(pen, {
            type: 'ELEMENT',
            name: 'div',
            attributes: [
                { name: 'className', value: 'foo' },
                { name: 'id', value: 'abc123' }
            ],
            diff: {
                type: 'differentElement',
                expectedName: 'span'
            },
            children: [
                {
                    type: 'ELEMENT',
                    name: 'span',
                    children: [{
                        type: 'CONTENT', value: 'some text'
                    } ]
                }
            ]
        }, expect.inspect, expect.diff);

        expect(pen.toString(), 'to equal',
            '<div // should be <span\n' +
            '   className="foo" id="abc123">\n' +
            '  <span>some text</span>\n' +
            '</div>');
    });

    it('outputs a different named element with children but without attributes', () => {

        Painter(pen, {
            type: 'ELEMENT',
            name: 'div',
            attributes: [],
            diff: {
                type: 'differentElement',
                expectedName: 'span'
            },
            children: [
                { type: 'CONTENT', value: 'some text' }
            ]
        }, expect.inspect, expect.diff);

        expect(pen.toString(), 'to equal',
            '<div // should be <span\n' +
            '>\n' +
            '  some text\n' +
            '</div>');
    });

    it('outputs a different named element with attributes in the middle of children', () => {

        Painter(pen, {
        type: 'ELEMENT',
        name: 'body',
            children: [
                { type: 'ELEMENT', name: 'span', children: [ { type: 'CONTENT', value: 'some text' } ] },
                {
                    type: 'ELEMENT',
                    name: 'div',
                    attributes: [
                        { name: 'className', value: 'foo' },
                        { name: 'id', value: 'abc123' }
                    ],
                    diff: {
                        type: 'differentElement',
                        expectedName: 'span'
                    },
                    children: [
                        {
                            type: 'ELEMENT',
                            name: 'span',
                            children: [{
                                type: 'CONTENT', value: 'some text'
                            } ]
                        }
                    ]
                },
                { type: 'ELEMENT', name: 'span', children: [ { type: 'CONTENT', value: 'some text' } ] }
            ]
    }, expect.inspect, expect.diff);

        expect(pen.toString(), 'to equal',
            '<body>\n' +
            '  <span>some text</span>\n' +
            '  <div // should be <span\n' +
            '     className="foo" id="abc123">\n' +
            '    <span>some text</span>\n' +
            '  </div>\n' +
            '  <span>some text</span>\n' +
            '</body>');
    });

    it('outputs a single line contentElementMismatch diff', () => {
        Painter(pen, {
            type: 'CONTENT',
            value: 'some content',
            diff: {
                type: 'contentElementMismatch',
                expected: {
                    type: 'ELEMENT',
                    name: 'div',
                    attributes: [{ name: 'className', value: 'foo' }],
                    children: [
                        { type: 'CONTENT', value: 'some text' }
                    ]
                }
            }
        }, expect.inspect, expect.diff);

        expect(pen.toString(), 'to equal',
        'some content // should be <div className="foo">some text</div>');

    });

    it('outputs a multi-line contentElementMismatch diff', () => {
        Painter(pen, {
            type: 'CONTENT',
            value: 'some content',
            diff: {
                type: 'contentElementMismatch',
                expected: {
                    type: 'ELEMENT',
                    name: 'div',
                    attributes: [{ name: 'className', value: 'foo' }],
                    children: [
                        { type: 'ELEMENT', name: 'some-long-element-name', children: [
                            { type: 'ELEMENT', name: 'child-element', children: [
                                { type: 'CONTENT', value: 'some text' }
                            ] }
                        ] }
                    ]
                }
            }
        }, expect.inspect, expect.diff);

        expect(pen.toString(), 'to equal',
            'some content // should be <div className="foo">\n' +
            '             //             <some-long-element-name><child-element>some text</child-element></some-long-element-name>\n' +
            '             //           </div>');

    });

    it('forces a linebreak before a contentElementMismatch', () => {

        Painter(pen, {
            type: 'ELEMENT',
                name: 'div',
            attributes: [],
            children: [
            {
                type: 'CONTENT',
                value: 'two',
                diff: {
                    type: 'contentElementMismatch',
                    expected: {
                        type: 'ELEMENT',
                        name: 'child',
                        attributes: [],
                        children: [
                            {
                                type: 'CONTENT',
                                value: 'aa'
                            }
                        ]
                    }
                }
            }
        ]
        }, expect.inspect, expect.diff);

        expect(pen.toString(), 'to equal',
        '<div>\n' +
        '  two // should be <child>aa</child>\n' +
        '</div>');
    });

    it('outputs a single line elementContentMismatch diff', () => {

        Painter(pen, {
            type: 'ELEMENT',
            name: 'div',
            attributes: [
                { name: 'className', value: 'foo' }
            ],
            diff: {
                type: 'elementContentMismatch',
                expected: {
                    type: 'CONTENT',
                    value: 'some content'
                }
            },
            children: [
                { type: 'CONTENT', value: 'some text' }
            ]
        }, expect.inspect, expect.diff);

        expect(pen.toString(), 'to equal',
            '<div className="foo">some text</div> // should be \'some content\'');
    });

    it('outputs a multi-line elementContentMismatch diff', () => {

        Painter(pen, {
            type: 'ELEMENT',
            name: 'div',
            attributes: [
                { name: 'className', value: 'foo' }
            ],
            children: [
                {
                    type: 'ELEMENT',
                    name: 'some-long-element-name',
                    attributes: [{ name: 'className', value: 'very long list of classes' }],
                    children: [
                        { type: 'ELEMENT', name: 'child-element', children: [{ type: 'CONTENT', value: 'some content' }] }
                    ]
                }
            ],
            diff: {
                type: 'elementContentMismatch',
                expected: {
                    type: 'CONTENT',
                    value: 'some content'
                }
            }
        }, expect.inspect, expect.diff);

        expect(pen.toString(), 'to equal',
            '<div className="foo">                                            // should be \'some content\'\n' +
            '  <some-long-element-name className="very long list of classes"> //\n' +
            '    <child-element>some content</child-element>                  //\n' +
            '  </some-long-element-name>                                      //\n' +
            '</div>                                                           //');
    });

    it('outputs an element/content mismatch diff, and forces a line break before', () => {
        Painter(pen, {
            type: 'ELEMENT',
            name: 'div',
            attributes: [ { name: 'id', value: 'foo' } ],
            children: [
            {
                type: 'ELEMENT',
                name: 'span',
                attributes: [ { name: 'id', value: 'childfoo' }
                ],
                children: [ { type: 'CONTENT', value: 'one' }
                ]
            },
            {
                type: 'ELEMENT',
                name: 'span',
                attributes: [],
                children: [ { type: 'CONTENT', value: 'two' }
                ],
                diff: {
                    type: 'elementContentMismatch',
                    expected: { type: 'CONTENT', value: 'some text' }
                }
            }
        ]
        }, expect.inspect, expect.diff);

        expect(pen.toString(), 'to equal',
        '<div id="foo">\n' +
        '  <span id="childfoo">one</span>\n' +
        '  <span>two</span> // should be \'some text\'\n' +
        '</div>');

    });
});
