import { forwardRef, memo, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { MaterialReactTable, useMaterialReactTable, MRT_ShowHideColumnsButton } from 'material-react-table';
import { RenderCustomCell } from './DataTableCustomCell';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import IconButton from '@mui/material/IconButton';
import Slide from '@mui/material/Slide';
import Stack from '@mui/material/Stack';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import LockResetIcon from '@mui/icons-material/LockReset';
import ImageIcon from '@mui/icons-material/Image';
import HideImageIcon from '@mui/icons-material/HideImage';
import ClearIcon from '@mui/icons-material/Clear';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';

const MaterialReactDataTable = forwardRef(({
    title = "",
    isWritable = false,
    isLoading = false,
    isTabChanged = false,
    isReportExportable = false,
    showActions = false,
    showImagelinks = false,
    currentUserId = null,
    globalFilterValue = "",
    triggerDataRefresh = false,
    tableData = {},
    averageColumns = {},
    dynamicPagination = false,
    pagination = { pageIndex: 0, pageSize: 20 },
    rowCount = 0,
    setPagination = () => { },
    handleExportRows = {},
    setGlobalFilterValue = () => { },
    setTriggerDataRefresh = () => { },
    setIsDataChanged = () => { },
    handleGlobalFilter = () => { },
    handleResetPassword = () => { },
    handleImageClick = () => { },
    showFooterRow = true,
    handleUserStatusChange = () => { }
}, ref) => {
    /* DATA VARIABLES */
    const [columns, setColumns] = useState([]);
    const [data, setData] = useState([]);

    /* DATATABLE GLOBAL FILTER VARIABLES */
    const [showGlobalFilterTextField, setShowGlobalFilterTextField] = useState(false);
    const [filteredData, setFilteredData] = useState([]);
    const searchInputRef = useRef(null);
    const searchButtonRef = useRef(null);

    /* DATATABLE VARIABLES */
    const table = useMaterialReactTable({
        columns,
        data: filteredData,
        enableFacetedValues: true,
        enableColumnResizing: true,
        enableDensityToggle: false,
        enableFullScreenToggle: false,
        enableColumnVirtualization: true,
        paginateExpandedRows: false,
        enableStickyHeader: true,
        enableStickyFooter: true,
        filterFromLeafRows: true,
        enableClickToCopy: true,
        enableRowActions: showActions && columns?.length > 0,
        enableFilterMatchHighlighting: true,
        positionActionsColumn: 'last',
        positionToolbarAlertBanner: 'bottom',
        columnFilterDisplayMode: 'popover',
        autoResetAll: title === "Dashboard" ? isTabChanged : false,
        columnVirtualizerOptions: { overscan: columns.length - 1 },
        manualPagination: dynamicPagination,
        rowCount: dynamicPagination ? rowCount : tableData?.filtered_rows?.length,
        state: {
            columnOrder: tableData?.columns || [],
            ...(dynamicPagination
                ? { pagination }
                : {}
            ),
            showProgressBars: isLoading,
        },
        ...(dynamicPagination
            ? { onPaginationChange: setPagination }
            : {}
        ),
        initialState: {
            density: 'compact',
            pagination: { pageIndex: 0, pageSize: 20 },
        },
        renderTopToolbarCustomActions: ({ table }) => (
            <>
                <div>
                    <Button
                        ref={resetButtonRef}
                        className="!hidden"
                        onClick={() => handleResetTable(table)}
                    />

                    {isReportExportable && (
                        <Button
                            startIcon={<FileDownloadIcon sx={{ marginTop: '-1px', marginRight: '5px' }} />}
                            size="small"
                            variant="outlined"
                            disabled={table.getPrePaginationRowModel().rows.length === 0}
                            onClick={() => handleExportRows(table.getPrePaginationRowModel().rows, tableData?.columns || [])}
                        >
                            Export {title}
                        </Button>
                    )}
                </div>
            </>
        ),
        renderToolbarInternalActions: ({ table }) => (
            <>
                <Slide
                    direction="left"
                    in={showGlobalFilterTextField}
                    mountOnEnter
                    unmountOnExit
                >
                    <TextField
                        inputRef={searchInputRef}
                        placeholder="Search..."
                        className="global-search mr-1"
                        value={globalFilterValue || ""}
                        disabled={data?.length === 0}
                        onChange={handleGlobalFilterValueChange}
                        onKeyDown={handleEnterPress}
                        slotProps={{
                            inputLabel: {
                                shrink: false
                            },
                            input: {
                                endAdornment: (
                                    <>
                                        <IconButton
                                            title="Clear"
                                            size="small"
                                            onClick={handleClearGlobalFilter}
                                        >
                                            <ClearIcon
                                                fontSize="small"
                                                sx={{ color: '#5C6DD7' }}
                                            />
                                        </IconButton>

                                        <IconButton
                                            ref={searchButtonRef}
                                            title="Search"
                                            size="small"
                                            onClick={() => handleGlobalFilter(data)
                                            }
                                        >
                                            <SearchIcon
                                                fontSize="small"
                                                sx={{ color: '#5C6DD7' }}
                                            />
                                        </IconButton>
                                    </>
                                )
                            }
                        }}
                    />
                </Slide>

                <IconButton
                    title="Search"
                    disabled={table.getPrePaginationRowModel().rows.length === 0}
                    className="!ml-2"
                    onClick={handleShowGlobalFilterTextField}
                >
                    {showGlobalFilterTextField ? (
                        <SearchOffIcon
                            fontSize="small"
                            sx={{ color: '#5C6DD7' }}
                        />
                    ) : (
                        <SearchIcon
                            fontSize="small"
                            sx={{ color: '#5C6DD7' }}
                        />
                    )}
                </IconButton>

                <IconButton
                    title="Refresh Data"
                    onClick={() => setTriggerDataRefresh(!triggerDataRefresh)}
                >
                    <RefreshIcon
                        fontSize="small"
                        sx={{ color: '#5C6DD7' }}
                    />
                </IconButton>

                <IconButton
                    title="Clear Filters"
                    disabled={table.getPrePaginationRowModel().rows.length === 0}
                    onClick={() => table.resetColumnFilters()}
                >
                    <FilterAltOffIcon
                        fontSize="small"
                        sx={{ color: '#5C6DD7' }}
                    />
                </IconButton>

                <MRT_ShowHideColumnsButton
                    table={table}
                    sx={{
                        '> svg': {
                            fill: '#5C6DD7'
                        }
                    }}
                />
            </>
        ),
        renderEmptyRowsFallback: () => (
            <p className="empty-table">
                {!isLoading && "No records to display."}
            </p>
        ),
        renderRowActions: ({ row }) => {
            let rowData = row.original || {};

            return (
                <Box className="flex justify-center items-center w-full gap-2 h-full">
                    {title === "User Management" && (
                        <>
                            <Tooltip title="Reset Password">
                                <span className="my-auto">
                                    <IconButton
                                        color="primary"
                                        size="small"
                                        onClick={() => handleResetPassword(rowData)}
                                    >
                                        <LockResetIcon
                                            fontSize="inherit"
                                            sx={{ color: '#065886' }}
                                        />
                                    </IconButton>
                                </span>
                            </Tooltip>

                            {currentUserId !== rowData?.id && (
                                <Button
                                    className="capitalize"
                                    color={rowData?.Status === "Inactive" ? "success" : "error"}
                                    disabled={!isWritable}
                                    size="small"
                                    onClick={() => handleUserStatusChange(rowData?.id, rowData?.Status === "Inactive" ? 1 : 0)}
                                    sx={{
                                        minWidth: 'fit-content',
                                        fontSize: '12px'
                                    }}
                                >
                                    <strong>
                                        {rowData?.Status === "Inactive" ? "Enable" : "Disable"}
                                    </strong>
                                </Button>
                            )}
                        </>
                    )}
                </Box>
            );
        },
        displayColumnDefOptions: {
            'mrt-row-actions': {
                size: 120,
                grow: false,
                visibleInShowHideMenu: false
            }
        },
        filterFns: {
            multiSelect: (row, columnId, filterValue) => {
                if (!filterValue || filterValue.length === 0) {
                    return true;
                }

                return filterValue?.includes(row.getValue(columnId));
            }
        },
        muiTableProps: {
            sx: {
                caption: {
                    captionSide: 'top'
                },
                '& .MuiTableCell-alignLeft:first-of-type': {
                    justifyContent: 'flex-start',
                },
                '& .MuiTableCell-footer': {
                    borderColor: '#e7e7e7'
                }
            }
        },
        muiTableContainerProps: {
            sx: {
                height: showGlobalFilterTextField
                    ? (title === "User Management" ? 'calc(100vh - 156px)' : '100%')
                    : (title === "User Management" ? 'calc(100vh - 151px)' : '100%'),
                overflow: 'auto'
            }
        },
        muiTableBodyProps: {
            sx: {
                '& .MuiTableCell-root': {
                    borderColor: '#e7e7e7'
                },
                ...(showActions && {
                    '& .MuiTableCell-root:last-of-type': {
                        border: 'none'
                    }
                })
            }
        },
        muiTableHeadProps: {
            sx: {
                zIndex: !isLoading ? 1 : 0,
                '& .MuiTableCell-head': {
                    paddingTop: 0,
                    justifyContent: 'center'
                },
                ...(showActions && {
                    '& .MuiTableCell-head:nth-last-of-type(2) > div': {
                        justifyContent: 'center'
                    },
                    '& .MuiTableCell-head:last-of-type': {
                        boxShadow: 'none',
                        border: 'none'
                    }
                })
            }
        },
        muiTableHeadCellProps: {
            sx: {
                backgroundColor: '#5C6DD7',
                color: '#ffffff',
                border: '1px solid rgba(81, 81, 81, .5)',
                fontSize: '12px',
                fontWeight: 'regular',
                paddingTop: 0,
                paddingBottom: 0,
                '& .MuiSvgIcon-root': {
                    color: '#ffffff !important'
                },
            }
        },
        muiTableBodyRowProps: () => {
            return {
                sx: {
                    height: 'auto',
                    fontSize: '12px',
                    '&:hover': {
                        backgroundColor: '#ddf3ff'
                    }
                }
            };
        },
        muiTableBodyCellProps: ({ column }) => {
            let color = "black";
            let backgroundColor = "transparent";
            let fontWeight = "normal";
            let align = 'left';

            if (column.columnDef.type === 'number' ||
                column.columnDef.type === 'float' ||
                column.columnDef.type === 'int') {
                align = 'right';
            }

            if (column.id === 'photoLinks' || column.id.endsWith('photoLinks')) {
                align = 'center';
            }

            if (column.id === "mrt-row-actions") {
                backgroundColor = "white";
            }

            return {
                align,
                sx: {
                    border: '1px solid rgba(81, 81, 81, .5)',
                    opacity: 1,
                    overflow: 'visible',
                    whiteSpace: 'wrap',
                    color,
                    backgroundColor,
                    fontWeight,
                }
            };
        },
        muiTableFooterCellProps: {
            sx: {
                justifyContent: 'flex-end',
                border: '1px solid rgba(81, 81, 81, .5)',
            },
        },
        muiFilterAutocompleteProps: {
            sx: {
                '& .MuiAutocomplete-input': {
                    width: '100% !important'
                }
            }
        },
        muiLinearProgressProps: {
            sx: {
                color: 'secondary',
                variant: 'indeterminate'
            }
        },
        muiPaginationProps: {
            showRowsPerPage: false,
            showFirstButton: true,
            showLastButton: true
        },
        muiTablePaperProps: {
            className: 'custom-table',
            sx: {
                height: '100%',
                width: '100%',
                '& > .MuiBox-root:last-child': {
                    minHeight: '3em',
                    zIndex: 0,
                },
                '& > .MuiBox-root:first-of-type': {
                    zIndex: 0,
                },
                '& .MuiBox-root .Mui-ToolbarDropZone': {
                    zIndex: 0
                },
                '& > .MuiBox-root:last-child .MuiTablePagination-root': {
                    padding: '10px'
                },
                '& > .MuiBox-root:last-child .MuiTablePagination-root > span': {
                    fontSize: '14px'
                },
            }
        }
    });
    const resetButtonRef = useRef(null);

    useEffect(() => {
        let tableColumns = tableData?.columns || [];
        const { rows: tableRows = [], filtered_rows: filteredTableRows = [], data_types: tableColumnDataTypes = {} } = tableData;
        const tempColumns = [];
        const columnAverages = {};
        const columnTotals = {};

        tableColumns = tableColumns.filter(column => !["id", "thumbnailUrl", "fullImageUrl"]?.includes(column)) || [];

        tableColumns.forEach(column => {
            const dataType = tableColumnDataTypes[column];

            if (dataType?.includes("int") || dataType?.includes("float")) {
                let sum = 0;
                let count = 0;

                filteredTableRows.forEach(row => {
                    const value = row[column];
                    if (value !== null && value !== undefined && !isNaN(value)) {
                        sum += Number(value);
                        count++;
                    }
                });

                if (averageColumns[column]) {
                    const { exponent, dependent } = averageColumns[column];
                    console.log(exponent, ':', columnTotals[exponent], ':', dependent, ':', columnTotals[dependent])
                    const numerator = columnTotals[exponent] ?? 0;
                    const denominator = columnTotals[dependent] ?? 0;
                    columnAverages[column] =
                        count > 0 && denominator !== 0
                            ? (numerator / denominator) * 100
                            : null;
                }
                else {
                    columnTotals[column] = sum;
                }
            }
        });

        tableColumns.forEach((column, index) => {
            const dataType = tableColumnDataTypes[column];
            const charWidth = 10.5;
            const width = Math.max(column.length * charWidth, 160);

            const footerContent = index === 0 ? (
                <Box sx={{ fontWeight: 'bold' }}>Total</Box>
            ) : (
                averageColumns[column] ? (
                    <Box color="warning.main">
                        {columnAverages[column] !== null
                            ? columnAverages[column]?.toFixed(2)
                            : 'N/A'}
                    </Box>
                ) : (
                    <Box color="warning.main">
                        {columnTotals[column] !== null
                            ? columnTotals[column]?.toFixed(2)
                            : 'N/A'}
                    </Box>
                )
            );

            if (dataType?.includes("object")) {
                tempColumns.push({
                    accessorFn: (originalRow) => originalRow[column],
                    id: column,
                    header: column,
                    size: width,
                    filterVariant: 'multi-select',
                    filterFn: 'multiSelect',
                    Header: ({ column }) => (
                        <Tooltip title={column.columnDef.header} arrow>
                            <div>{column.columnDef.header}</div>
                        </Tooltip>
                    ),
                    Cell: ({ column: col, row }) => {
                        const string = row.original?.[column];
                        return (
                            <RenderCustomCell
                                value={string}
                                width={col.getSize()}
                                isNumber={false}
                            />
                        );
                    },
                    Footer: () => showFooterRow ? footerContent : null,

                });
            } else if (dataType?.includes("int") || dataType?.includes("float")) {
                tempColumns.push({
                    accessorFn: (originalRow) => originalRow[column],
                    id: column,
                    header: column,
                    size: width,
                    align: 'left',
                    type: 'number',
                    filterVariant: 'range',
                    filterFn: 'between',
                    Header: ({ column }) => (
                        <Tooltip title={column.columnDef.header} arrow>
                            <div>{column.columnDef.header}</div>
                        </Tooltip>
                    ),
                    Cell: ({ column: col, row }) => {
                        const number = isNaN(parseFloat(row.original?.[column])) ? null : parseFloat(row.original?.[column]);
                        return (
                            <RenderCustomCell
                                value={number}
                                width={col.getSize()}
                                isNumber={true}
                            />
                        );
                    },
                    Footer: () => showFooterRow ? footerContent : null,

                });
            } else if (dataType?.includes("datetime")) {
                tempColumns.push({
                    accessorFn: (originalRow) => new Date(originalRow[column]),
                    id: column,
                    header: column,
                    size: width,
                    filterVariant: 'date-range',
                    filterFn: 'betweenInclusive',
                    Header: ({ column }) => (
                        <Tooltip title={column.columnDef.header} arrow>
                            <div>{column.columnDef.header}</div>
                        </Tooltip>
                    ),
                    Cell: ({ column: col, row }) => {
                        const date = row.original[column];
                        return (
                            <RenderCustomCell
                                value={date}
                                width={col.getSize()}
                                isNumber={false}
                            />
                        );
                    },
                    Footer: () => showFooterRow ? footerContent : null,

 // Apply footer content
                });
            }
        });

        if (showImagelinks && tableData?.filtered_rows?.length > 0) {
            tempColumns.push({
                id: 'reawlogram',
                header: 'Realogram',
                size: 150,
                enableSorting: false,
                enableColumnFilter: false,
                enableClickToCopy: false,
                Cell: ({ row }) => {
                    const rowData = row.original;
                    return (
                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <Tooltip title="Image URL">
                                <IconButton
                                    onClick={() => handleImageClick(rowData?.id, rowData?.thumbnailUrl)}
                                    color="primary"
                                >
                                    <ImageIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    );
                },
                Footer: () => <Box></Box>, // Empty footer for Realogram column
            });
        }

        if (title === "Dashboard" && isTabChanged) {
            resetButtonRef?.current?.click();
        }

        setColumns(tempColumns);
        setData(tableRows);
        setFilteredData(filteredTableRows);
        setIsDataChanged(false);

        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [tableData]);

    useImperativeHandle(ref, () => (
        {
            setFilteredData
        }));

    const handleEnterPress = (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            searchButtonRef?.current?.click();
        }
    }

    const handleShowGlobalFilterTextField = () => {
        if (showGlobalFilterTextField) {
            setShowGlobalFilterTextField(false);
            handleClearGlobalFilter();
        }
        else {
            setShowGlobalFilterTextField(true);
            setTimeout(() => searchInputRef.current.focus(), 0);
        }
    }

    const handleGlobalFilterValueChange = (event) => {
        const { value } = event.target;
        setGlobalFilterValue(value);

        if (!value) {
            setFilteredData(data);
        }
    }

    const handleClearGlobalFilter = () => {
        setGlobalFilterValue("");
        setFilteredData(data);
    }

    const handleResetTable = (table) => {
        table.resetSorting();
        table.resetColumnFilters();
        table.resetPagination();
    }

    return (
        <div className="h-full">
            <MaterialReactTable table={table} />
        </div>
    );
});

export default memo(MaterialReactDataTable);