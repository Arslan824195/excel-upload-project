import { useEffect, useMemo, useRef, useState } from 'react';
import { abortController } from '../../utils/abortController';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import useSessionExpire from '../../hooks/useSessionExpire';
import Backdrop from '@mui/material/Backdrop';
import MaterialReactDataTable from '../../components/MaterialReactDataTable';
import RestoreIcon from '@mui/icons-material/Restore';
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
import Loader from '../../components/Loader';

const averagesConfig = {
    // GEO/RIDER tabs
    'GEO': {
        'Compliance % Per ROD Total': {
            exponent: 'Total Compliant Pictures',
            dependent: 'Total ROD Pictures'
        },
        'Compliance % Per Actual Total': {
            exponent: 'Total Compliant Pictures',
            dependent: 'Total Pictures'
        },
        'ROD Pictures %': {
            exponent: 'Total ROD Pictures',
            dependent: 'Total Pictures'
        },
        'ROD Target Achieved': {
            exponent: 'Total ROD Pictures',
            dependent: 'Total ROD Month Target'
        }
    },
    'RIDER': {
        'Compliance % Per ROD Total': {
            exponent: 'Total Compliant Pictures',
            dependent: 'Total ROD Pictures'
        },
        'Compliance % Per Actual Total': {
            exponent: 'Total Compliant Pictures',
            dependent: 'Total Pictures'
        },
        'ROD Pictures %': {
            exponent: 'Total ROD Pictures',
            dependent: 'Total Pictures'
        },
        'ROD Target Achieved': {
            exponent: 'Total ROD Pictures',
            dependent: 'Total ROD Month Target'
        }
    },
    'GEO UNIQUE': {
        'Unique Target Compliance': {
            exponent: 'Unique Compliant Pictures',
            dependent: 'Unique Target',
        },
        'Unique Pictures %': {
            exponent: 'Total Unique POP Pictures',
            dependent: 'Total Outlets Visited'
        },
        'Unique ROD Pictures %': {
            exponent: 'Unique ROD Pictures',
            dependent: 'Total Unique POP Pictures'
        },
        'Unique Compliant Pictures %': {
            exponent: 'Unique Compliant Pictures',
            dependent: 'Total Unique POP Pictures'
        }
    },
    'RIDER UNIQUE': {
        'Unique Compliance Per Rider': {
            exponent: 'Unique Compliant Pictures',
            dependent: 'Unique Target Per Rider',
        },
        'Unique Pictures %': {
            exponent: 'Total Unique POP Pictures',
            dependent: 'Total Outlets Visited'
        },
        'Unique ROD Pictures %': {
            exponent: 'Unique ROD Pictures',
            dependent: 'Total Unique POP Pictures'
        },
        'Unique Compliant Pictures %': {
            exponent: 'Unique Compliant Pictures',
            dependent: 'Total Unique POP Pictures'
        }
    }
};


const Dashboard = ({ logOut = () => { } }) => {
    /* API VARIABLES */
    const [isLoading, setIsLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertType, setAlertType] = useState("");

    /* SESSION EXPIRY VARIABLES */
    const triggerSessionExpire = useSessionExpire();

    /* TAB VARIABLES */
    const [selectedTab, setSelectedTab] = useState("R");
    const [isTabChanged, setIsTabChanged] = useState(false);

    // FILTER LISTS
    const monthList = useMemo(() => [
        { id: 'March', value: 'March 2025' },
        { id: 'April', value: 'April 2025' },
        { id: 'May', value: 'May 2025' }
    ], []);

    /* SELECTED LIST VARIABLES */
    const [selectedMonth, setSelectedMonth] = useState({ id: 'March', value: 'March 2025' });

    /* CONDITIONAL FILTER VARIABLES */
    const [isFilterable, setIsFilterable] = useState(false);
    const [filter, setFilter] = useState(true);

    /* DATATABLE VARIABLES */
    const [dashboardData, setDashboardData] = useState([]);
    const [triggerDataRefresh, setTriggerDataRefresh] = useState(false);
    const tableRef = useRef();

    /* DATATABLE GLOBAL FILTER VARIABLES */
    const [globalFilterValue, setGlobalFilterValue] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            setDashboardData([])
            setIsLoading(true);
            setShowAlert(false);
            setAlertMessage("");
            setAlertType("");

            await axios({
                method: "post",
                url: "/api/GetDashboardData",
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
                        const dashboardData = data?.dashboard_data || {};
                        setDashboardData(dashboardData);
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

        fetchData();

        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [selectedTab, triggerDataRefresh, filter]);

    const handleTabChange = (tab) => {
        setIsTabChanged(selectedTab !== tab);
        setSelectedTab(tab);

    }

    const averageColumns = useMemo(() => averagesConfig[selectedTab], [selectedTab]);

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
            <h2 className="page-heading m-0">
                Dashboard
            </h2>

            <Box display="flex" justifyContent="center" className="w-full" >
                <Tabs
                    value={selectedTab}
                    variant="scrollable"
                    scrollButtons="auto"
                    onChange={(event, newValue) => handleTabChange(newValue)}
                    sx={{
                        backgroundColor: '#eef2ff'
                    }}
                >
                    <Tab label="GEO" value="GEO" />
                    <Tab label="Rider" value="RIDER" />
                    <Tab label="GEO UNIQUE" value="GEO UNIQUE" />
                    <Tab label="RIDER UNIQUE" value="RIDER UNIQUE" />
                    {/* <Tab label = "BY OUTLET" value = "BY OUTLET" /> */}
                </Tabs>
            </Box>

            <div className="content-container">
                <Alert
                    show={showAlert}
                    message={alertMessage}
                    type={alertType}
                    setShow={setShowAlert}
                />

                <Backdrop
                    sx={{ color: '#fff', position: "absolute", borderRadius: "inherit", zIndex: (theme) => theme.zIndex.drawer + 1 }}
                    open={isLoading}
                >
                    <Loader />
                </Backdrop>

                <Grid
                    container
                    spacing={1}
                    justifyContent="center"
                    alignItems="center"
                >
                    <Grid size={{ xs: 1.7 }} className="autocomplete d-flex justify-content-center">
                        <VirtualizedAutocomplete
                            isMultiple={false}
                            isObject={true}
                            isWritable={true}
                            filterOn="Month"
                            options={monthList}
                            selectedOptions={selectedMonth}
                            handleSelectChange={(filterOn, newValue) => handleSelectMonth(newValue)}
                        />
                    </Grid>

                    <Grid size={{ xs: 1.7 }} className="d-flex justify-content-center">
                        <ButtonGroup variant="contained" disableElevation={true}>
                            <Button type="submit" className="filter-button" color="primary" disabled={!isFilterable} onClick={handleFilter}>Filter</Button>
                        </ButtonGroup>
                    </Grid>

                    <Grid size={{ xs: 12 }} className="d-flex justify-content-center">

                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <MaterialReactDataTable
                                ref={tableRef}
                                title="Dashboard"
                                isWritable={true}
                                isLoading={isLoading}
                                isTabChanged={isTabChanged}
                                allowBulkActions={true}
                                globalFilterValue={globalFilterValue}
                                triggerDataRefresh={triggerDataRefresh}
                                tableData={dashboardData}
                                averageColumns={averageColumns}
                                isReportExportable={true}
                                handleExportRows={handleExportRows}
                                setIsLoading={setIsLoading}
                                setShowAlert={setShowAlert}
                                setAlertMessage={setAlertMessage}
                                setAlertType={setAlertType}
                                setIsTabChanged={setIsTabChanged}
                                setGlobalFilterValue={setGlobalFilterValue}
                                setTriggerDataRefresh={setTriggerDataRefresh}
                                handleGlobalFilter={handleGlobalFilter}
                            />
                        </LocalizationProvider>
                    </Grid>
                </Grid>

            </div>
        </>
    );
}

const DashboardWithAuth = withAuth(Dashboard)([roles[1]]);
export default DashboardWithAuth;