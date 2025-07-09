import { useEffect, useMemo, useRef, useState } from 'react';
import { abortController } from '../../utils/abortController';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import useSessionExpire from '../../hooks/useSessionExpire';
import { Backdrop, Card, CardContent } from '@mui/material';
import MaterialReactDataTable from '../../components/MaterialReactDataTable';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import VirtualizedAutocomplete from '../../components/Autocomplete';
import Alert from '../../components/Alert';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import axios from 'axios';
import { Grid } from '@mui/material';
import withAuth from '../../lib/withAuth';
import { roles } from '../../constants/roles.constant';
import LineChart from '../../components/LineChart';
import PieChart from '../../components/PieChart';
import Loader from '../../components/Loader';

const TrendAnalysis = ({ logOut = () => { } }) => {
    /* API VARIABLES */
    const [isLoading, setIsLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertType, setAlertType] = useState("");

    /* SESSION EXPIRY VARIABLES */
    const triggerSessionExpire = useSessionExpire();

    /* TAB VARIABLES */
    const [selectedTab, setSelectedTab] = useState("SKU_FREQUENCY");
    const [isTabChanged, setIsTabChanged] = useState(false);

    // FILTER LISTS
    const monthList = useMemo(() => [
        { id: 'March', value: 'March 2025' },
        { id: 'April', value: 'April 2025' }
    ], []);

    /* SELECTED LIST VARIABLES */
    const [selectedMonth, setSelectedMonth] = useState({ id: 'March', value: 'March 2025' });

    /* CONDITIONAL FILTER VARIABLES */
    const [isFilterable, setIsFilterable] = useState(false);
    const [filter, setFilter] = useState(true);

    /* DATATABLE VARIABLES */
    const [frequencyTrendMonthTableData, setFrequencyTrendMonthTableData] = useState([]);
    const [triggerDataRefresh, setTriggerDataRefresh] = useState(false);
    const tableRef = useRef();

    /* CHART DATA VARIABLE */
    const [frequencytrendMonthOverMonth, setFrequencytrendMonthOverMonth] = useState(null);
    const [skuPieData, setSkuPieData] = useState(null);
    const [singleSkuTrend, setSingleSkuTrend] = useState(null);

    /* DATATABLE GLOBAL FILTER VARIABLES */
    const [globalFilterValue, setGlobalFilterValue] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setShowAlert(false);
            setAlertMessage("");
            setAlertType("");

            await axios({
                method: "post",
                url: "/api/GetFrequencyTrendMonthTableData",
                data: {
                    selected_tab: selectedTab,
                    filter_value: globalFilterValue,
                    month: selectedMonth?.id
                },
                signal: abortController.signal
            })
                .then((response) => {
                    setIsLoading(false);
                    const { status, data } = response;

                    if (status === 200) {
                        const frequencyTrendMonthTableData = data?.table_data || {};
                        setFrequencyTrendMonthTableData(frequencyTrendMonthTableData);
                    }
                    else {
                        setAlertMessage("An error occurred while processing your request. Please try again later or contact the site administrator.");
                        setAlertType("error");
                        setShowAlert(true);
                    }
                })
                .catch((error) => {
                    console.log("Get Dashboard Data Api: ", error);
                    setIsLoading(false);

                    if (axios.isCancel(error) || error.code === "ERR_CANCELED") {
                        return;
                    }

                    const status = error?.response?.status;

                    if (status === 403) {
                        triggerSessionExpire();
                    }
                    else {
                        setAlertMessage(
                            status === 401
                                ? "Unauthorized access. You do not have the required permissions to perform this action."
                                : status === 429
                                    ? "Request limit exceeded. Your account is temporarily disabled. Please contact the site administrator."
                                    : "An error occurred while processing your request. Please try again later or contact the site administrator."
                        );
                        setAlertType("error");
                        setShowAlert(true);

                        if (status === 429) {
                            setTimeout(logOut, 3000);
                        }
                    }
                });
        }

        if (selectedTab === "SKU_FREQUENCY") {
            fetchData();
        }

        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [selectedTab, triggerDataRefresh, filter]);

    useEffect(() => {
        const fetchFrequencyTrendMonthOverMonth = async () => {
            setIsLoading(true);
            setShowAlert(false);
            setAlertMessage("");
            setAlertType("");

            await axios({
                method: "post",
                url: "/api/fetchFrequencyTrendMonthOverMonth",
                data: {
                    selected_tab: selectedTab,
                    month: selectedMonth?.id
                },
                signal: abortController.signal
            })
                .then((response) => {
                    setIsLoading(false);
                    const { status, data } = response;

                    if (status === 200) {
                        const frequencyTrendMonthOverMonthData = data?.frequencyTrendMonthOverMonth || {};
                        setFrequencytrendMonthOverMonth(frequencyTrendMonthOverMonthData);
                    }
                    else {
                        setAlertMessage("An error occurred while processing your request. Please try again later or contact the site administrator.");
                        setAlertType("error");
                        setShowAlert(true);
                    }
                })
                .catch((error) => {
                    console.log("Get frequencyTrendMonthOverMonth Data Api: ", error);
                    setIsLoading(false);

                    if (axios.isCancel(error) || error.code === "ERR_CANCELED") {
                        return;
                    }

                    const status = error?.response?.status;

                    if (status === 403) {
                        triggerSessionExpire();
                    }
                    else {
                        setAlertMessage(
                            status === 401
                                ? "Unauthorized access. You do not have the required permissions to perform this action."
                                : status === 429
                                    ? "Request limit exceeded. Your account is temporarily disabled. Please contact the site administrator."
                                    : "An error occurred while processing your request. Please try again later or contact the site administrator."
                        );
                        setAlertType("error");
                        setShowAlert(true);

                        if (status === 429) {
                            setTimeout(logOut, 3000);
                        }
                    }
                });
        }

        const fetchSkuPieData = async () => {
            setIsLoading(true);
            setShowAlert(false);
            setAlertMessage("");
            setAlertType("");

            await axios({
                method: "post",
                url: "/api/fetchSkuPieData",
                data: {
                    selected_tab: selectedTab,
                    month: selectedMonth?.id
                },
                signal: abortController.signal
            })
                .then((response) => {
                    setIsLoading(false);
                    const { status, data } = response;

                    if (status === 200) {
                        const skuPieData = data?.skuPieData || {};
                        setSkuPieData(skuPieData);
                    }
                    else {
                        setAlertMessage("An error occurred while processing your request. Please try again later or contact the site administrator.");
                        setAlertType("error");
                        setShowAlert(true);
                    }
                })
                .catch((error) => {
                    console.log("Get skuPieData Data Api: ", error);
                    setIsLoading(false);

                    if (axios.isCancel(error) || error.code === "ERR_CANCELED") {
                        return;
                    }

                    const status = error?.response?.status;

                    if (status === 403) {
                        triggerSessionExpire();
                    }
                    else {
                        setAlertMessage(
                            status === 401
                                ? "Unauthorized access. You do not have the required permissions to perform this action."
                                : status === 429
                                    ? "Request limit exceeded. Your account is temporarily disabled. Please contact the site administrator."
                                    : "An error occurred while processing your request. Please try again later or contact the site administrator."
                        );
                        setAlertType("error");
                        setShowAlert(true);

                        if (status === 429) {
                            setTimeout(logOut, 3000);
                        }
                    }
                });
        }

        const fetchSingleSkuTrend = async () => {
            setIsLoading(true);
            setShowAlert(false);
            setAlertMessage("");
            setAlertType("");

            await axios({
                method: "post",
                url: "/api/fetchSingleSkuTrend",
                data: {
                    selected_tab: selectedTab,
                    month: selectedMonth?.id
                },
                signal: abortController.signal
            })
                .then((response) => {
                    setIsLoading(false);
                    const { status, data } = response;

                    if (status === 200) {
                        const singleSkuTrendData = data?.singleSkuTrend || {};
                        setSingleSkuTrend(singleSkuTrendData);
                    }
                    else {
                        setAlertMessage("An error occurred while processing your request. Please try again later or contact the site administrator.");
                        setAlertType("error");
                        setShowAlert(true);
                    }
                })
                .catch((error) => {
                    console.log("Get singleSkuTrend Data Api: ", error);
                    setIsLoading(false);

                    if (axios.isCancel(error) || error.code === "ERR_CANCELED") {
                        return;
                    }

                    const status = error?.response?.status;

                    if (status === 403) {
                        triggerSessionExpire();
                    }
                    else {
                        setAlertMessage(
                            status === 401
                                ? "Unauthorized access. You do not have the required permissions to perform this action."
                                : status === 429
                                    ? "Request limit exceeded. Your account is temporarily disabled. Please contact the site administrator."
                                    : "An error occurred while processing your request. Please try again later or contact the site administrator."
                        );
                        setAlertType("error");
                        setShowAlert(true);

                        if (status === 429) {
                            setTimeout(logOut, 3000);
                        }
                    }
                });
        }

        switch (selectedTab) {
            case "SKU_FREQUENCY":
                fetchFrequencyTrendMonthOverMonth();
                break;

            case "ITEM_SHARE":
                fetchSkuPieData();
                break;

            case "SINGLE_SKU_TREND":
                fetchSingleSkuTrend();
                break;

            default:
                break;
        }

    }, [selectedTab, filter]);

    const handleTabChange = (tab) => {
        setIsTabChanged(selectedTab !== tab);
        setSelectedTab(tab);
    }

    const handleSelectMonth = (month) => {
        setIsFilterable(true);
        setSelectedMonth(month);
    }

    const handleFilter = () => {
        setFilter(true);
        setTriggerDataRefresh(!triggerDataRefresh);
    }


    const handleGlobalFilter = async (rowData) => {
        setIsLoading(true);
        setShowAlert(false);
        setAlertMessage("");
        setAlertType("");

        await axios({
            method: "post",
            url: "/api/FilterTableData",
            data: {
                table_data: rowData,
                filter_value: globalFilterValue
            },
            signal: abortController.signal
        })
            .then((response) => {
                setIsLoading(false);
                const { status, data } = response;

                if (status === 200) {
                    tableRef?.current?.setFilteredData(data || []);
                }
                else {
                    setAlertMessage("An error occurred while processing your request. Please try again later or contact the site administrator.");
                    setAlertType("error");
                    setShowAlert(true);
                }
            })
            .catch((error) => {
                console.log("Filter Table Data Api: ", error);
                setIsLoading(false);

                if (axios.isCancel(error) || error.code === "ERR_CANCELED") {
                    return;
                }

                const status = error?.response?.status;

                if (status === 403) {
                    triggerSessionExpire();
                }
                else {
                    setAlertMessage(
                        status === 401
                            ? "Unauthorized access. You do not have the required permissions to perform this action."
                            : status === 429
                                ? "Request limit exceeded. Your account is temporarily disabled. Please contact the site administrator."
                                : "An error occurred while processing your request. Please try again later or contact the site administrator."
                    );
                    setAlertType("error");
                    setShowAlert(true);

                    if (status === 429) {
                        setTimeout(logOut, 3000);
                    }
                }
            });
    }

    const handleExportRows = (prePaginationRows, headers) => {
        const rows = prePaginationRows.map(row => row.original);
        if (rows?.length > 0) {
            const csvContent = [
                headers.join(","),
                ...rows.map((row) =>
                    headers.map((col) => escapeCSVValue(row[col])).join(",")
                ),
            ].join("\n");

            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `${selectedTab}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert("No data available to download.");
        }
    };

    const escapeCSVValue = (value) => {
        if (value == null) return "";
        const stringValue = value.toString().replace(/"/g, '""');
        return /[",\n]/.test(stringValue) ? `"${stringValue}"` : stringValue;
    };


    return (
        <>
            <Alert
                show = {showAlert}
                message = {alertMessage}
                type = {alertType}
                setShow = {setShowAlert}
            />

            <h2 className = "page-heading m-0">
                Trend Analysis
            </h2>

            <Box display = "flex" justifyContent = "center" width = "100%">
                <Tabs
                    value = {selectedTab}
                    variant = "scrollable"
                    scrollButtons = "auto"
                    onChange = {(event, newValue) => handleTabChange(newValue)}
                    sx = {{
                        minHeight: '38px !important',
                        marginBottom: '0.5em',
                        backgroundColor: '#eef2ff',
                        '& .MuiTab-root': {
                            minHeight: '38px !important'
                        }
                    }}
                >
                    <Tab label = "Month-over-Month SKU Frequency" value = "SKU_FREQUENCY" />
                    <Tab label = "Item Share (Last 90 Days)" value = "ITEM_SHARE" />
                    <Tab label = "Single SKU Trend" value = "SINGLE_SKU_TREND" />
                </Tabs>

            </Box>

            <Grid container spacing = {1} justifyContent = "center" alignItems = "center" className = "mt-2">

                <Grid size = {{ xs: 2 }} className = "audit-trail-filter autocomplete flex justify-center">
                    <VirtualizedAutocomplete
                        isMultiple = {false}
                        isObject = {true}
                        isWritable = {true}
                        filterOn = "Month"
                        options = {monthList}
                        selectedOptions = {selectedMonth}
                        handleSelectChange = {(filterOn, newValue) => handleSelectMonth(newValue)}
                    />
                </Grid>

                <Grid size = {{ xs: "auto" }} className = "flex justify-center">
                    <ButtonGroup variant = "contained" disableElevation = {true}>
                        <Button type = "submit" className = "filter-button" color = "primary" disabled = {!isFilterable} onClick = {handleFilter}>Filter</Button>
                    </ButtonGroup>
                </Grid>
            </Grid>

            <Grid container spacing = {1} gap = {2} justifyContent = "center" alignItems = "center" className = "pb-4">

                <Grid size = {{ xs: 12 }} className = "flex flex-col items-center gap-4 p-4">
                    <Card sx = {{ width: '100%' }} className='!rounded-lg relative'>
                        <CardContent
                            className = "flex flex-col gap-3 items-center justify-center"
                            sx = {{ height: '400px' }}
                        >
                            {selectedTab === 'SKU_FREQUENCY' && (
                                isLoading && !frequencytrendMonthOverMonth ? (
                                    <Backdrop
                                        sx = {{ color: '#fff', position: "absolute", borderRadius: "inherit", zIndex: (theme) => theme.zIndex.drawer + 1 }}
                                        open = {isLoading && !frequencytrendMonthOverMonth}
                                    >
                                        <Loader />
                                    </Backdrop>
                                ) : (
                                    <LineChart
                                        data = {frequencytrendMonthOverMonth}
                                        title = "Monthly Frequency Trend"
                                        height = {300}
                                        width = {600}
                                    />
                                )
                            )}

                            {selectedTab === 'ITEM_SHARE' && (
                                isLoading && !skuPieData ? (
                                    <Backdrop
                                        sx = {{ color: '#fff', position: "absolute", borderRadius: "inherit", zIndex: (theme) => theme.zIndex.drawer + 1 }}
                                        open = {isLoading && !skuPieData}
                                    >
                                        <Loader />
                                    </Backdrop>
                                ) : (
                                    <PieChart
                                        data = {skuPieData}
                                        height = {300}
                                        width = {600}
                                    />
                                )
                            )}

                            {selectedTab === 'SINGLE_SKU_TREND' && (
                                isLoading && !singleSkuTrend ? (
                                    <Backdrop
                                        sx = {{ color: '#fff', position: "absolute", borderRadius: "inherit", zIndex: (theme) => theme.zIndex.drawer + 1 }}
                                        open = {isLoading && !singleSkuTrend}
                                    >
                                        <Loader />
                                    </Backdrop>
                                ) : (
                                    <LineChart
                                        data = {singleSkuTrend}
                                        title = "Single SKU Month-over-Month Trend"
                                        height = {300}
                                        width = {600}
                                    />
                                )
                            )}
                        </CardContent>
                    </Card>
                </Grid>
                {selectedTab === 'SKU_FREQUENCY' && (
                    <Grid size = {{ xs: 12 }} className = "flex flex-col items-center gap-4 p-4">

                        <Card sx = {{ width: '100%' }} className='!rounded-lg relative'>

                            <CardContent>
                                <Backdrop
                                    sx = {{ color: '#fff', position: "absolute", borderRadius: "inherit", zIndex: (theme) => theme.zIndex.drawer + 1 }}
                                    open = {isLoading && !frequencyTrendMonthTableData?.length > 0}
                                >
                                    <Loader />
                                </Backdrop>
                                <LocalizationProvider dateAdapter = {AdapterDayjs}>
                                    <MaterialReactDataTable
                                        ref = {tableRef}
                                        title = "Dashboard"
                                        isWritable = {true}
                                        isLoading = {isLoading}
                                        isTabChanged = {isTabChanged}
                                        allowBulkActions = {true}
                                        globalFilterValue = {globalFilterValue}
                                        triggerDataRefresh = {triggerDataRefresh}
                                        tableData = {frequencyTrendMonthTableData}
                                        isReportExportable = {true}
                                        handleExportRows = {handleExportRows}
                                        setIsLoading = {setIsLoading}
                                        setShowAlert = {setShowAlert}
                                        setAlertMessage = {setAlertMessage}
                                        setAlertType = {setAlertType}
                                        setIsTabChanged = {setIsTabChanged}
                                        setGlobalFilterValue = {setGlobalFilterValue}
                                        setTriggerDataRefresh = {setTriggerDataRefresh}
                                        handleGlobalFilter = {handleGlobalFilter}
                                    />
                                </LocalizationProvider>
                            </CardContent>
                        </Card>
                    </Grid>
                )}
            </Grid>

        </>
    );
}

const TrendAnalysisWithAuth = withAuth(TrendAnalysis)([roles[1]]);
export default TrendAnalysisWithAuth;