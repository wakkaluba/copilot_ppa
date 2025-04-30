describe('Block Navigation', () => {
    let container;
    let missingCoverageElements;
    let fileSearch;

    beforeEach(() => {
        // Set up our document body
        document.body.innerHTML = `
            <div id="container">
                <input id="fileSearch" type="text" />
                <div class="coverage">
                    <div class="cbranch-no">Uncovered branch 1</div>
                    <div class="cstat-no">Uncovered statement 1</div>
                    <div class="fstat-no">Uncovered function 1</div>
                    <table>
                        <tr>
                            <td class="pct low">Low coverage row</td>
                        </tr>
                    </table>
                </div>
            </div>
        `;

        container = document.getElementById('container');
        fileSearch = document.getElementById('fileSearch');

        // Re-run the initialization code
        require('./block-navigation.js');

        // Get all the elements that should be navigable
        missingCoverageElements = document.querySelectorAll(
            'td.pct.low, :not(.cbranch-no):not(.cstat-no):not(.fstat-no) > .cbranch-no,' +
            ':not(.cbranch-no):not(.cstat-no):not(.fstat-no) > .cstat-no,' +
            ':not(.cbranch-no):not(.cstat-no):not(.fstat-no) > .fstat-no'
        );
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.resetModules();
    });

    test('initializes with correct selectors', () => {
        expect(missingCoverageElements.length).toBe(4);
    });

    test('highlights and scrolls to element on navigation', () => {
        const scrollIntoViewMock = jest.fn();
        Element.prototype.scrollIntoView = scrollIntoViewMock;

        // Trigger navigation with 'n' key
        const event = new KeyboardEvent('keydown', { which: 78 });
        window.dispatchEvent(event);

        expect(missingCoverageElements[0].classList.contains('highlighted')).toBe(true);
        expect(scrollIntoViewMock).toHaveBeenCalledWith({
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
        });
    });

    test('cycles through elements in correct order', () => {
        // Navigate forward through all elements
        for (let i = 0; i < missingCoverageElements.length; i++) {
            const event = new KeyboardEvent('keydown', { which: 78 }); // 'n' key
            window.dispatchEvent(event);
            expect(missingCoverageElements[i].classList.contains('highlighted')).toBe(true);
        }

        // One more should cycle back to start
        const event = new KeyboardEvent('keydown', { which: 78 });
        window.dispatchEvent(event);
        expect(missingCoverageElements[0].classList.contains('highlighted')).toBe(true);
    });

    test('navigates backwards correctly', () => {
        // First go forward a couple times
        window.dispatchEvent(new KeyboardEvent('keydown', { which: 78 }));
        window.dispatchEvent(new KeyboardEvent('keydown', { which: 78 }));

        // Then go back
        const event = new KeyboardEvent('keydown', { which: 75 }); // 'k' key
        window.dispatchEvent(event);

        expect(missingCoverageElements[0].classList.contains('highlighted')).toBe(true);
    });

    test('ignores navigation when search is focused', () => {
        fileSearch.focus();

        const event = new KeyboardEvent('keydown', { which: 78 });
        window.dispatchEvent(event);

        // No elements should be highlighted
        missingCoverageElements.forEach(element => {
            expect(element.classList.contains('highlighted')).toBe(false);
        });
    });

    test('responds to all navigation keys', () => {
        const navigationKeys = [
            { key: 78, direction: 'next' },    // 'n'
            { key: 74, direction: 'next' },    // 'j'
            { key: 66, direction: 'previous' }, // 'b'
            { key: 75, direction: 'previous' }, // 'k'
            { key: 80, direction: 'previous' }  // 'p'
        ];

        navigationKeys.forEach(({ key, direction }) => {
            const event = new KeyboardEvent('keydown', { which: key });
            window.dispatchEvent(event);

            if (direction === 'next') {
                expect(missingCoverageElements[0].classList.contains('highlighted')).toBe(true);
            } else {
                expect(missingCoverageElements[missingCoverageElements.length - 1].classList.contains('highlighted')).toBe(true);
            }
        });
    });
});
