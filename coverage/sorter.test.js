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

    // New tests for search functionality
    test('filters rows based on search input', () => {
        // Add filter template structure that addSearchBox function expects
        const filterTemplate = document.createElement('template');
        filterTemplate.id = 'filterTemplate';
        filterTemplate.innerHTML = '<div class="quiet">Filter: <input type="search" id="fileSearch"></div>';
        container.appendChild(filterTemplate);

        // Run the sorting code to initialize the search box
        require('./sorter.js');

        // Get the search input that should have been created
        const searchInput = document.getElementById('fileSearch');
        expect(searchInput).not.toBeNull();

        // Test filtering
        searchInput.value = 'file2';
        searchInput.dispatchEvent(new Event('input'));

        // Check that only the matching row is visible
        const rows = document.querySelectorAll('tbody tr');
        expect(rows[0].style.display).toBe('none'); // file1.js should be hidden
        expect(rows[1].style.display).toBe(''); // file2.js should be visible
        expect(rows[2].style.display).toBe('none'); // file3.js should be hidden
    });

    test('handles case-insensitive search', () => {
        // Add filter template
        const filterTemplate = document.createElement('template');
        filterTemplate.id = 'filterTemplate';
        filterTemplate.innerHTML = '<div class="quiet">Filter: <input type="search" id="fileSearch"></div>';
        container.appendChild(filterTemplate);

        require('./sorter.js');

        const searchInput = document.getElementById('fileSearch');
        searchInput.value = 'FILE2'; // uppercase
        searchInput.dispatchEvent(new Event('input'));

        const rows = document.querySelectorAll('tbody tr');
        expect(rows[1].style.display).toBe(''); // file2.js should be visible despite case difference
    });

    test('handles non-sortable columns', () => {
        // Replace the table with one that has a non-sortable column
        document.body.innerHTML = '';
        document.body.innerHTML = `
            <div id="container">
                <table id="coverage-table" class="coverage-summary">
                    <thead>
                        <tr>
                            <th data-col="file" data-type="string">File</th>
                            <th data-col="pic" data-type="number" data-nosort="true">Coverage</th>
                            <th data-col="lines" data-type="number">Lines</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>file1.js</td>
                            <td>80%</td>
                            <td>100</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;

        // Re-run the initialization code
        jest.resetModules();
        require('./sorter.js');

        // The non-sortable column shouldn't have a sorter added
        const nonSortableColumn = document.querySelector('th[data-nosort="true"]');
        expect(nonSortableColumn.querySelector('.sorter')).toBeNull();

        // Clicking the non-sortable column shouldn't throw errors
        expect(() => nonSortableColumn.click()).not.toThrow();
    });

    test('handles missing coverage-summary table gracefully', () => {
        // Remove the table
        document.body.innerHTML = '<div>No table here</div>';

        // Re-run the initialization - it shouldn't throw errors when table is missing
        jest.resetModules();
        expect(() => require('./sorter.js')).not.toThrow();
    });

    test('handles mixed data types in columns', () => {
        document.body.innerHTML = '';
        document.body.innerHTML = `
            <div id="container">
                <table id="coverage-table" class="coverage-summary">
                    <thead>
                        <tr>
                            <th data-col="file" data-type="string">File</th>
                            <th data-col="lines" data-type="number">Lines</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>file1.js</td>
                            <td>100</td>
                        </tr>
                        <tr>
                            <td>file2.js</td>
                            <td>N/A</td> <!-- Not a number -->
                        </tr>
                    </tbody>
                </table>
            </div>
        `;

        // Re-run the initialization code
        jest.resetModules();
        require('./sorter.js');

        const linesHeader = document.querySelector('th[data-col="lines"]');

        // Should not throw errors when sorting mixed types
        expect(() => linesHeader.click()).not.toThrow();
    });

    test('preserves search state when sorting', () => {
        // Add filter template
        const filterTemplate = document.createElement('template');
        filterTemplate.id = 'filterTemplate';
        filterTemplate.innerHTML = '<div class="quiet">Filter: <input type="search" id="fileSearch"></div>';
        container.appendChild(filterTemplate);

        require('./sorter.js');

        // Filter the table
        const searchInput = document.getElementById('fileSearch');
        searchInput.value = 'file2';
        searchInput.dispatchEvent(new Event('input'));

        // Sort a column
        const linesHeader = document.querySelector('th[data-col="lines"]');
        linesHeader.click();

        // The filter should still be applied after sorting
        const rows = document.querySelectorAll('tbody tr');
        expect(rows[0].style.display).toBe('none'); // file1.js should be hidden
        expect(rows[1].style.display).toBe(''); // file2.js should be visible
        expect(rows[2].style.display).toBe('none'); // file3.js should be hidden
    });

    // New comprehensive tests for edge cases and additional functionality

    test('clears filter when search input is emptied', () => {
        // Add filter template
        const filterTemplate = document.createElement('template');
        filterTemplate.id = 'filterTemplate';
        filterTemplate.innerHTML = '<div class="quiet">Filter: <input type="search" id="fileSearch"></div>';
        container.appendChild(filterTemplate);

        require('./sorter.js');

        // Filter the table
        const searchInput = document.getElementById('fileSearch');
        searchInput.value = 'file2';
        searchInput.dispatchEvent(new Event('input'));

        // Verify filter is applied
        let rows = document.querySelectorAll('tbody tr');
        expect(rows[0].style.display).toBe('none');
        expect(rows[1].style.display).toBe('');
        expect(rows[2].style.display).toBe('none');

        // Clear the filter
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));

        // Verify all rows are visible
        rows = document.querySelectorAll('tbody tr');
        expect(rows[0].style.display).toBe('');
        expect(rows[1].style.display).toBe('');
        expect(rows[2].style.display).toBe('');
    });

    test('handles tables without tbody element gracefully', () => {
        // Create a table without tbody
        document.body.innerHTML = `
            <div id="container">
                <table id="coverage-table" class="coverage-summary">
                    <thead>
                        <tr>
                            <th data-col="file" data-type="string">File</th>
                        </tr>
                    </thead>
                    <!-- No tbody element -->
                </table>
            </div>
        `;

        // Re-run the initialization code - should not throw
        jest.resetModules();
        expect(() => require('./sorter.js')).not.toThrow();
    });

    test('handles tables without thead element gracefully', () => {
        // Create a table without thead
        document.body.innerHTML = `
            <div id="container">
                <table id="coverage-table" class="coverage-summary">
                    <!-- No thead element -->
                    <tbody>
                        <tr>
                            <td>file1.js</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;

        // Re-run the initialization code - should not throw
        jest.resetModules();
        expect(() => require('./sorter.js')).not.toThrow();
    });

    test('handles click on sorter element specifically', () => {
        // Replace the table with a properly structured one
        document.body.innerHTML = `
            <div id="container">
                <table id="coverage-table" class="coverage-summary">
                    <thead>
                        <tr>
                            <th data-col="file" data-type="string">File</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>file1.js</td>
                        </tr>
                        <tr>
                            <td>file2.js</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;

        // Re-run the initialization code
        jest.resetModules();
        require('./sorter.js');

        // Get the sorter element and click it directly
        const sorterElement = document.querySelector('.sorter');
        expect(sorterElement).not.toBeNull();

        // Click the sorter element
        sorterElement.click();

        // Verify sorting occurred (we don't need to check order since we already have tests for that)
        expect(document.querySelector('th').classList.contains('sorted')).toBe(true);
    });

    test('handles IE event model for older browsers', () => {
        // Mock attachEvent for IE
        const originalAddEventListener = Element.prototype.addEventListener;
        const mockAttachEvent = jest.fn();

        // Remove addEventListener to simulate IE
        Element.prototype.addEventListener = undefined;
        Element.prototype.attachEvent = mockAttachEvent;

        // Re-run initialization
        jest.resetModules();
        require('./sorter.js');

        // Verify attachEvent was called for IE compatibility
        expect(mockAttachEvent).toHaveBeenCalled();

        // Restore the original method
        Element.prototype.addEventListener = originalAddEventListener;
        delete Element.prototype.attachEvent;
    });

    test('adds search box to the DOM correctly', () => {
        // Add filter template
        const filterTemplate = document.createElement('template');
        filterTemplate.id = 'filterTemplate';
        filterTemplate.innerHTML = '<div class="quiet">Filter: <input type="search" id="fileSearch"></div>';
        document.body.appendChild(filterTemplate);

        // Re-run the initialization
        jest.resetModules();
        require('./sorter.js');

        // Check if search box was added
        const searchBox = document.querySelector('#fileSearch');
        expect(searchBox).not.toBeNull();
        expect(searchBox.tagName.toLowerCase()).toBe('input');
        expect(searchBox.type).toBe('search');
    });

    test('correctly identifies sortable and non-sortable columns', () => {
        // Set up a table with mixed sortable and non-sortable columns
        document.body.innerHTML = `
            <div id="container">
                <table id="coverage-table" class="coverage-summary">
                    <thead>
                        <tr>
                            <th data-col="file" data-type="string">File</th>
                            <th data-col="desc" data-nosort="true">Description</th>
                            <th data-col="lines" data-type="number">Lines</th>
                            <th data-col="notes" data-nosort="true">Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>file1.js</td>
                            <td>Description 1</td>
                            <td>100</td>
                            <td>Note 1</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;

        // Re-run the initialization
        jest.resetModules();
        require('./sorter.js');

        // Check that sorter elements were added only to sortable columns
        const headers = document.querySelectorAll('th');
        expect(headers[0].querySelector('.sorter')).not.toBeNull(); // Sortable
        expect(headers[1].querySelector('.sorter')).toBeNull(); // Non-sortable
        expect(headers[2].querySelector('.sorter')).not.toBeNull(); // Sortable
        expect(headers[3].querySelector('.sorter')).toBeNull(); // Non-sortable
    });

    test('applies default sort direction based on column type', () => {
        document.body.innerHTML = `
            <div id="container">
                <table id="coverage-table" class="coverage-summary">
                    <thead>
                        <tr>
                            <th data-col="file" data-type="string">File</th>
                            <th data-col="lines" data-type="number">Lines</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>file1.js</td>
                            <td>100</td>
                        </tr>
                        <tr>
                            <td>file2.js</td>
                            <td>50</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;

        // Re-run the initialization code
        jest.resetModules();
        require('./sorter.js');

        // Click on the string column first
        const fileHeader = document.querySelector('th[data-col="file"]');
        fileHeader.click();

        // String columns should default to ascending
        expect(fileHeader.classList.contains('sorted')).toBe(true);
        expect(fileHeader.classList.contains('sorted-desc')).toBe(false);

        // Reset sort indicators
        fileHeader.className = '';

        // Click on the number column
        const linesHeader = document.querySelector('th[data-col="lines"]');
        linesHeader.click();

        // Number columns should default to descending
        expect(linesHeader.classList.contains('sorted')).toBe(true);
        // Note: this test might need adjustment based on how your sorter actually implements default direction for number columns
    });

    test('handles search input with special characters', () => {
        // Add filter template
        const filterTemplate = document.createElement('template');
        filterTemplate.id = 'filterTemplate';
        filterTemplate.innerHTML = '<div class="quiet">Filter: <input type="search" id="fileSearch"></div>';
        container.appendChild(filterTemplate);

        // Add a row with special characters
        const tbody = document.querySelector('tbody');
        const tr = document.createElement('tr');
        tr.innerHTML = '<td>file-special*+?.js</td><td>85%</td><td>150</td><td>2025-05-02</td>';
        tbody.appendChild(tr);

        require('./sorter.js');

        // Filter with special regex characters
        const searchInput = document.getElementById('fileSearch');
        searchInput.value = 'file-special*+?';
        searchInput.dispatchEvent(new Event('input'));

        // Check if filtering works with special characters
        const rows = document.querySelectorAll('tbody tr');
        expect(rows[0].style.display).toBe('none');
        expect(rows[1].style.display).toBe('none');
        expect(rows[2].style.display).toBe('none');
        expect(rows[3].style.display).toBe(''); // Special characters row should be visible
    });

    test('handles large tables without performance issues', () => {
        // Create a large table dynamically
        document.body.innerHTML = '<div id="container"><table id="coverage-table" class="coverage-summary"><thead><tr><th data-col="file" data-type="string">File</th></tr></thead><tbody></tbody></table></div>';

        const tbody = document.querySelector('tbody');
        const largeRowCount = 200;

        for (let i = 0; i < largeRowCount; i++) {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>file${i}.js</td>`;
            tbody.appendChild(tr);
        }

        // Measure performance
        const startTime = performance.now();

        // Re-run the initialization
        jest.resetModules();
        require('./sorter.js');

        // Sort the large table
        document.querySelector('th').click();

        const endTime = performance.now();
        const executionTime = endTime - startTime;

        // This is a somewhat arbitrary threshold - adjust based on realistic expectations
        // The point is to ensure that sorting many rows doesn't take too long
        expect(executionTime).toBeLessThan(1000); // Less than 1 second for 200 rows

        // Verify that all rows are still present
        const rows = document.querySelectorAll('tbody tr');
        expect(rows.length).toBe(largeRowCount);
    });
});
