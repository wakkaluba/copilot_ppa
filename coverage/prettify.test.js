describe('Prettify', () => {
    let container;

    beforeEach(() => {
        // Set up our document body
        document.body.innerHTML = `
            <div id="container">
                <pre class="prettyprint">
                    function example() {
                        const x = 1;
                        return x + 2;
                    }
                </pre>
                <pre class="prettyprint lang-js">
                    class Person {
                        constructor(name) {
                            this.name = name;
                        }
                    }
                </pre>
                <pre class="prettyprint lang-css">
                    .example {
                        color: red;
                    }
                </pre>
            </div>
        `;

        container = document.getElementById('container');

        // Re-run the initialization code
        require('./prettify.js');
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.resetModules();
    });

    test('initializes with default language mode', () => {
        prettyPrint();
        const defaultElement = container.querySelector('pre:first-child');
        expect(defaultElement.classList.contains('prettyprinted')).toBe(true);
        expect(defaultElement.innerHTML).toContain('pln'); // Plain text class
        expect(defaultElement.innerHTML).toContain('kwd'); // Keyword class
    });

    test('handles JavaScript code correctly', () => {
        prettyPrint();
        const jsElement = container.querySelector('pre.lang-js');
        expect(jsElement.classList.contains('prettyprinted')).toBe(true);
        expect(jsElement.innerHTML).toContain('kwd'); // 'class' keyword
        expect(jsElement.innerHTML).toContain('typ'); // 'Person' type
        expect(jsElement.innerHTML).toContain('pln'); // Plain identifier 'name'
    });

    test('handles CSS code correctly', () => {
        prettyPrint();
        const cssElement = container.querySelector('pre.lang-css');
        expect(cssElement.classList.contains('prettyprinted')).toBe(true);
        expect(cssElement.innerHTML).toContain('pun'); // Punctuation for braces
        expect(cssElement.innerHTML).toContain('kwd'); // Property name
        expect(cssElement.innerHTML).toContain('str') || // Color value might be string
        expect(cssElement.innerHTML).toContain('lit'); // or literal
    });

    test('respects line numbers when PR.linenums is true', () => {
        window.PR.linenums = true;
        prettyPrint();
        const elements = container.querySelectorAll('pre');
        elements.forEach(element => {
            expect(element.querySelector('ol.linenums')).toBeTruthy();
        });
    });

    test('handles empty code blocks', () => {
        const emptyBlock = document.createElement('pre');
        emptyBlock.className = 'prettyprint';
        container.appendChild(emptyBlock);

        prettyPrint();
        expect(emptyBlock.classList.contains('prettyprinted')).toBe(true);
    });

    test('processes multiple code blocks independently', () => {
        prettyPrint();
        const elements = container.querySelectorAll('pre');
        const processedCount = Array.from(elements).filter(el =>
            el.classList.contains('prettyprinted')
        ).length;
        expect(processedCount).toBe(elements.length);
    });

    test('preserves custom classes', () => {
        const element = container.querySelector('pre:first-child');
        element.classList.add('custom-class');
        prettyPrint();
        expect(element.classList.contains('custom-class')).toBe(true);
        expect(element.classList.contains('prettyprinted')).toBe(true);
    });

    test('handles malformed code gracefully', () => {
        const malformedBlock = document.createElement('pre');
        malformedBlock.className = 'prettyprint';
        malformedBlock.textContent = 'function { invalid code';
        container.appendChild(malformedBlock);

        prettyPrint();
        expect(malformedBlock.classList.contains('prettyprinted')).toBe(true);
        expect(() => prettyPrint()).not.toThrow();
    });
});
