describe('Sorter', () => {
    let container;

    beforeEach(() => {
        // Set up our document body with a sortable table
        document.body.innerHTML = `
            <div id="container">
                <table id="coverage-table">
                    <thead>
                        <tr>
                            <th data-col="file" data-type="string">File</th>
                            <th data-col="pic" data-type="number">Coverage</th>
                            <th data-col="lines" data-type="number">Lines</th>
                            <th data-col="date" data-type="date">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>file1.js</td>
                            <td>80%</td>
                            <td>100</td>
                            <td>2025-04-30</td>
                        </tr>
                        <tr>
                            <td>file2.js</td>
                            <td>90%</td>
                            <td>50</td>
                            <td>2025-04-29</td>
                        </tr>
                        <tr>
                            <td>file3.js</td>
                            <td>70%</td>
                            <td>200</td>
                            <td>2025-05-01</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;

        container = document.getElementById('container');

        // Re-run the initialization code
        require('./sorter.js');
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.resetModules();
    });

    test('initializes with default sort direction', () => {
        const table = document.getElementById('coverage-table');
        const headers = table.getElementsByTagName('th');

        // Initially no sort indicators should be present
        Array.from(headers).forEach(header => {
            expect(header.classList.contains('ascending')).toBe(false);
            expect(header.classList.contains('descending')).toBe(false);
        });
    });

    test('sorts string column correctly', () => {
        const fileHeader = document.querySelector('th[data-col="file"]');
        fileHeader.click();

        const cells = Array.from(document.querySelectorAll('td:first-child'));
        const values = cells.map(cell => cell.textContent);

        // First click should sort ascending
        expect(values).toEqual(['file1.js', 'file2.js', 'file3.js']);

        // Second click should sort descending
        fileHeader.click();
        const newValues = Array.from(document.querySelectorAll('td:first-child')).map(cell => cell.textContent);
        expect(newValues).toEqual(['file3.js', 'file2.js', 'file1.js']);
    });

    test('sorts numeric column correctly', () => {
        const linesHeader = document.querySelector('th[data-col="lines"]');
        linesHeader.click();

        const cells = Array.from(document.querySelectorAll('td:nth-child(3)'));
        const values = cells.map(cell => parseInt(cell.textContent));

        // First click should sort ascending
        expect(values).toEqual([50, 100, 200]);

        // Second click should sort descending
        linesHeader.click();
        const newValues = Array.from(document.querySelectorAll('td:nth-child(3)')).map(cell => parseInt(cell.textContent));
        expect(newValues).toEqual([200, 100, 50]);
    });

    test('sorts date column correctly', () => {
        const dateHeader = document.querySelector('th[data-col="date"]');
        dateHeader.click();

        const cells = Array.from(document.querySelectorAll('td:nth-child(4)'));
        const values = cells.map(cell => cell.textContent);

        // First click should sort ascending
        expect(values).toEqual(['2025-04-29', '2025-04-30', '2025-05-01']);

        // Second click should sort descending
        dateHeader.click();
        const newValues = Array.from(document.querySelectorAll('td:nth-child(4)')).map(cell => cell.textContent);
        expect(newValues).toEqual(['2025-05-01', '2025-04-30', '2025-04-29']);
    });

    test('handles percentage values correctly', () => {
        const coverageHeader = document.querySelector('th[data-col="pic"]');
        coverageHeader.click();

        const cells = Array.from(document.querySelectorAll('td:nth-child(2)'));
        const values = cells.map(cell => cell.textContent);

        // First click should sort ascending
        expect(values).toEqual(['70%', '80%', '90%']);

        // Second click should sort descending
        coverageHeader.click();
        const newValues = Array.from(document.querySelectorAll('td:nth-child(2)')).map(cell => cell.textContent);
        expect(newValues).toEqual(['90%', '80%', '70%']);
    });

    test('maintains sort state between sorts', () => {
        const fileHeader = document.querySelector('th[data-col="file"]');
        const linesHeader = document.querySelector('th[data-col="lines"]');

        fileHeader.click();
        expect(fileHeader.classList.contains('ascending')).toBe(true);

        linesHeader.click();
        expect(fileHeader.classList.contains('ascending')).toBe(false);
        expect(linesHeader.classList.contains('ascending')).toBe(true);
    });

    test('handles empty cells gracefully', () => {
        // Add a row with empty cells
        const tbody = document.querySelector('tbody');
        const tr = document.createElement('tr');
        tr.innerHTML = '<td></td><td></td><td></td><td></td>';
        tbody.appendChild(tr);

        const headers = document.querySelectorAll('th');
        headers.forEach(header => {
            expect(() => header.click()).not.toThrow();
        });
    });

    test('handles invalid date values gracefully', () => {
        // Add a row with invalid date
        const tbody = document.querySelector('tbody');
        const tr = document.createElement('tr');
        tr.innerHTML = '<td>file4.js</td><td>85%</td><td>150</td><td>invalid-date</td>';
        tbody.appendChild(tr);

        const dateHeader = document.querySelector('th[data-col="date"]');
        expect(() => dateHeader.click()).not.toThrow();
    });
});
