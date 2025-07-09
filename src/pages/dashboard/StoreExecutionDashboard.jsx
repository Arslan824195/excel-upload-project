import { useEffect, useRef, useState } from 'react';
import { abortController } from '../../utils/abortController';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import useSessionExpire from '../../hooks/useSessionExpire';
import { Card, CardContent } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
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
import LineChart from '../../components/LineChart';
import PieChart from '../../components/PieChart';
import BarChart from '../../components/BarChart';

const StoreExecutionDashboard = ({ logOut = () => {} }) =>  
{
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

    /* SELECTED LIST VARIABLES */
    const [selectedMonth, setSelectedMonth] = useState("March");

    /* CONDITIONAL FILTER VARIABLES */
    const [isFilterable, setIsFilterable] = useState(false);
    const [filter, setFilter] = useState(true);
    const [isFiltered, setIsFiltered] = useState(false);

    /* DATATABLE VARIABLES */
    const [frequencyTrendMonthTableData, setFrequencyTrendMonthTableData] = useState([]);
    const [triggerDataRefresh, setTriggerDataRefresh] = useState(false);
    const tableRef = useRef();
    
    /* CHARTS DATA VARIABLE */
        const [totalPicVsTotalStoresTotalStores, setTotalPicVsTotalStores] = useState({
        labels: ['User A', 'User B', 'User C'],
        datasets: [
            {
            label: 'Total Stores',
            data: [12, 19, 14],
            backgroundColor: '#597893',
            },
            {
            label: 'Total Pictures',
            data: [10, 15, 13],
            backgroundColor: '#A9D18B',
        },
        ],
    });
    const [rodVsNonRodData, setRodVsNonRodData] = useState({
        labels: ['Group 1', 'Group 2', 'Group 3'],
        datasets: [
        {
            label: 'ROD',
            data: [30, 45, 25],
            backgroundColor: '#597893',
        },
        {
            label: 'Non ROD',
            data: [20, 35, 30],
            backgroundColor: '#B0946C',
        },
        ],
    });
    const [complianceData, setComplianceData] = useState({
        labels: ['SKU A', 'SKU B', 'SKU C', 'SKU D', 'SKU E'],
        datasets: [
            {
            label: 'Item Share',
            data: [45, 25, 15, 10, 5], // Represents item counts or percentage shares
            backgroundColor: [
                '#A9D18B', // muted green
                '#6C9BA4', // desaturated cyan-gray
                '#B0946C', // earthy brown
                '#6A8CAB', // dusty blue
                '#597893'  // soft navy
            ]
            }
        ]
    });

    /* DATATABLE GLOBAL FILTER VARIABLES */
    const [globalFilterValue, setGlobalFilterValue] = useState("");

    // useEffect(() =>
    // {
    //     const fetchData = async () => 
    //     {
    //         setIsLoading(true);
    //         setShowAlert(false);
    //         setAlertMessage("");
    //         setAlertType("");
    
    //         await axios({
    //             method: "post",
    //             url: "/api/GetFrequencyTrendMonthTableData",
    //             data: {
    //                 selected_tab: selectedTab,
    //                 filter_value: globalFilterValue
    //             },
    //             signal: abortController.signal
    //         })
    //         .then((response) => 
    //         {
    //             setIsLoading(false);
    //             const { status, data } = response;
        
    //             if (status === 200) 
    //             {
    //                 const frequencyTrendMonthTableData = data?.table_data || {};        
    //                 setFrequencyTrendMonthTableData(frequencyTrendMonthTableData);
    //             }
    //             else
    //             {
    //                 setAlertMessage("An error occurred while processing your request. Please try again later or contact the site administrator.");
    //                 setAlertType("error");
    //                 setShowAlert(true);
    //             }
    //         })
    //         .catch((error) => 
    //         {
    //             console.log("Get Dashboard Data Api: ", error);
    //             setIsLoading(false);

    //             if (axios.isCancel(error) || error.code === "ERR_CANCELED") 
    //             {
    //                 return;
    //             }
                
    //             const status = error?.response?.status;

    //             if (status === 403) 
    //             {
    //                 triggerSessionExpire();
    //             } 
    //             else 
    //             {
    //                 setAlertMessage(
    //                     status === 401
    //                         ? "Unauthorized access. You do not have the required permissions to perform this action."
    //                         : status === 429
    //                         ? "Request limit exceeded. Your account is temporarily disabled. Please contact the site administrator."
    //                         : "An error occurred while processing your request. Please try again later or contact the site administrator."
    //                 );
    //                 setAlertType("error");
    //                 setShowAlert(true);
                
    //                 if (status === 429) 
    //                 {
    //                     setTimeout(logOut, 3000);
    //                 }
    //             }
    //         });
    //     }
        
    //     if(selectedTab === "SKU_FREQUENCY")
    //     {
    //         fetchData();
    //     }

    //     /* eslint-disable-next-line react-hooks/exhaustive-deps */
    // }, [selectedTab, triggerDataRefresh, filter]);

    // useEffect(() => {
    //    const fetchTotalPicVsTotalStores = async () => {
    //        setIsLoading(true);
    //        setShowAlert(false);
    //        setAlertMessage("");
    //        setAlertType("");

    //        await axios({
    //            method: "post",
    //            url: "/api/fetchTotalPicVsTotalStores",
    //            data: {
    //                selected_tab: selectedTab,
    //                month: selectedMonth
    //            },
    //            signal: abortController.signal
    //        })
    //        .then((response) => {
    //            setIsLoading(false);
    //            const { status, data } = response;

    //            if (status === 200) {
    //                const totalPicVsTotalStoresData = data?.totalPicVsTotalStores || {};
    //                setTotalPicVsTotalStores(totalPicVsTotalStoresData);
    //            }
    //            else {
    //                setAlertMessage("An error occurred while processing your request. Please try again later or contact the site administrator.");
    //                setAlertType("error");
    //                 setShowAlert(true);
    //             }
    //         })
    //         .catch((error) => 
    //         {
    //             console.log("Get totalPicVsTotalStores Data Api: ", error);
    //             setIsLoading(false);

    //             if (axios.isCancel(error) || error.code === "ERR_CANCELED") 
    //             {
    //                 return;
    //             }
                
    //             const status = error?.response?.status;

    //             if (status === 403) 
    //             {
    //                 triggerSessionExpire();
    //             } 
    //             else 
    //             {
    //                 setAlertMessage(
    //                     status === 401
    //                         ? "Unauthorized access. You do not have the required permissions to perform this action."
    //                         : status === 429
    //                         ? "Request limit exceeded. Your account is temporarily disabled. Please contact the site administrator."
    //                         : "An error occurred while processing your request. Please try again later or contact the site administrator."
    //                 );
    //                 setAlertType("error");
    //                 setShowAlert(true);
                
    //                 if (status === 429) 
    //                 {
    //                     setTimeout(logOut, 3000);
    //                 }
    //             }
    //         });
    //     }

    //     const fetchRodVsNonRodData = async () => {
    //        setIsLoading(true);
    //        setShowAlert(false);
    //        setAlertMessage("");
    //        setAlertType("");

    //        await axios({
    //            method: "post",
    //            url: "/api/fetchRodVsNonRodData",
    //            data: {
    //                selected_tab: selectedTab,
    //                month: selectedMonth
    //            },
    //            signal: abortController.signal
    //        })
    //        .then((response) => {
    //            setIsLoading(false);
    //            const { status, data } = response;

    //            if (status === 200) {
    //                const rodVsNonRodData = data?.rodVsNonRodData || {};
    //                setRodVsNonRodData(rodVsNonRodData);
    //            }
    //            else {
    //                setAlertMessage("An error occurred while processing your request. Please try again later or contact the site administrator.");
    //                setAlertType("error");
    //                 setShowAlert(true);
    //             }
    //         })
    //         .catch((error) => 
    //         {
    //             console.log("Get rodVsNonRodData Data Api: ", error);
    //             setIsLoading(false);

    //             if (axios.isCancel(error) || error.code === "ERR_CANCELED") 
    //             {
    //                 return;
    //             }
                
    //             const status = error?.response?.status;

    //             if (status === 403) 
    //             {
    //                 triggerSessionExpire();
    //             } 
    //             else 
    //             {
    //                 setAlertMessage(
    //                     status === 401
    //                         ? "Unauthorized access. You do not have the required permissions to perform this action."
    //                         : status === 429
    //                         ? "Request limit exceeded. Your account is temporarily disabled. Please contact the site administrator."
    //                         : "An error occurred while processing your request. Please try again later or contact the site administrator."
    //                 );
    //                 setAlertType("error");
    //                 setShowAlert(true);
                
    //                 if (status === 429) 
    //                 {
    //                     setTimeout(logOut, 3000);
    //                 }
    //             }
    //         });
    //     }

    //     const fetchComplianceData = async () => {
    //        setIsLoading(true);
    //        setShowAlert(false);
    //        setAlertMessage("");
    //        setAlertType("");

    //        await axios({
    //            method: "post",
    //            url: "/api/fetchComplianceData",
    //            data: {
    //                selected_tab: selectedTab,
    //                month: selectedMonth
    //            },
    //            signal: abortController.signal
    //        })
    //        .then((response) => {
    //            setIsLoading(false);
    //            const { status, data } = response;

    //            if (status === 200) {
    //                const complianceDataData = data?.complianceData || {};
    //                setComplianceData(complianceDataData);
    //            }
    //            else {
    //                setAlertMessage("An error occurred while processing your request. Please try again later or contact the site administrator.");
    //                setAlertType("error");
    //                 setShowAlert(true);
    //             }
    //         })
    //         .catch((error) => 
    //         {
    //             console.log("Get complianceData Data Api: ", error);
    //             setIsLoading(false);

    //             if (axios.isCancel(error) || error.code === "ERR_CANCELED") 
    //             {
    //                 return;
    //             }
                
    //             const status = error?.response?.status;

    //             if (status === 403) 
    //             {
    //                 triggerSessionExpire();
    //             } 
    //             else 
    //             {
    //                 setAlertMessage(
    //                     status === 401
    //                         ? "Unauthorized access. You do not have the required permissions to perform this action."
    //                         : status === 429
    //                         ? "Request limit exceeded. Your account is temporarily disabled. Please contact the site administrator."
    //                         : "An error occurred while processing your request. Please try again later or contact the site administrator."
    //                 );
    //                 setAlertType("error");
    //                 setShowAlert(true);
                
    //                 if (status === 429) 
    //                 {
    //                     setTimeout(logOut, 3000);
    //                 }
    //             }
    //         });
    //     }

    //     switch (selectedTab) {
    //         case "TOTAL_PIC_VS_TOTAL_STORES":
    //             fetchTotalPicVsTotalStores();
    //             break;

    //         case "ROD_VS_NON_ROD":
    //             fetchRodVsNonRodData();
    //             break;

    //         case "COMPLIANCE":
    //             fetchComplianceData();
    //             break;

    //         default:
    //             break;
    //         }

    // }, [selectedTab, filter]);

     const handleTabChange = (tab) =>
    {
        setIsTabChanged(selectedTab !== tab);
        setSelectedTab(tab);
    }

    const handleSelectMonth = (month) =>
    {
        setIsFilterable(true);
        setIsFiltered(true);
        setSelectedMonth(month);
    }

    const handleFilter = () => {
        setIsFiltered(true);
        setFilter(true);
        setTriggerDataRefresh(!triggerDataRefresh);
    }

    const handleReset = () => 
    {
        setSelectedMonth('March')
        setIsFilterable(false);
        setFilter(false);
        setIsFiltered(false);
    }
      

    const handleGlobalFilter = async (rowData) =>
    {
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
        .then((response) => 
        {
            setIsLoading(false);
            const { status, data } = response;
    
            if (status === 200) 
            {
                tableRef?.current?.setFilteredData(data || []);
            }
            else
            {
                setAlertMessage("An error occurred while processing your request. Please try again later or contact the site administrator.");
                setAlertType("error");
                setShowAlert(true);
            }
        })
        .catch((error) => 
        {
            console.log("Filter Table Data Api: ", error);
            setIsLoading(false);

            if (axios.isCancel(error) || error.code === "ERR_CANCELED") 
            {
                return;
            }
            
            const status = error?.response?.status;

            if (status === 403) 
            {
                triggerSessionExpire();
            } 
            else 
            {
                setAlertMessage(
                    status === 401
                        ? "Unauthorized access. You do not have the required permissions to perform this action."
                        : status === 429
                        ? "Request limit exceeded. Your account is temporarily disabled. Please contact the site administrator."
                        : "An error occurred while processing your request. Please try again later or contact the site administrator."
                );
                setAlertType("error");
                setShowAlert(true);
            
                if (status === 429) 
                {
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

            <h2 className = "page-heading mb-2">
                Store Execution Dashboard
            </h2>

            <Box display = "flex" justifyContent = "center" width = "100%">
                <Tabs
                        value={selectedTab}
                        variant="scrollable"
                        scrollButtons="auto"
                        onChange={(event, newValue) => handleTabChange(newValue)}
                        sx={{ 
                            minHeight: '38px !important',
                            marginBottom: '0.5em',
                            backgroundColor: '#eef2ff',
                            '& .MuiTab-root': {
                                minHeight: '38px !important'
                            }
                        }}
                    >
                        <Tab label="Total Pic vs Total Stores" value="TOTAL_PIC_VS_TOTAL_STORES" />
                        <Tab label="Rod vs Non Rod" value="ROD_VS_NON_ROD" />
                        <Tab label="Compliance" value="COMPLIANCE" />
                    </Tabs>

            </Box>

            <Grid container spacing = {1} justifyContent = "center" alignItems = "center" className="mt-2">

                <Grid size = {{ xs: 2 }} className = "audit-trail-filter autocomplete flex justify-center">
                    <VirtualizedAutocomplete
                        isMultiple = {false}
                        isObject = {false}
                        isWritable = {true}
                        filterOn = "Month"
                        options = {["March", "April"]}
                        selectedOptions = {selectedMonth}
                        handleSelectChange = {(filterOn, newValue) => handleSelectMonth(newValue)}
                    />
                </Grid>

                <Grid size = {{ xs: "auto" }} className = "flex justify-center">
                    <ButtonGroup variant = "contained" disableElevation = {true}>
                        <Button type = "submit" className = "filter-button" color = "primary" disabled = {!isFilterable} onClick = {handleFilter}>Filter</Button>
                        <Button className = "reset-button" color = "info" disabled = {!isFiltered} startIcon = {<RestoreIcon />}  onClick = {handleReset}></Button>
                    </ButtonGroup>
                </Grid>
            </Grid>

            <Grid container spacing = {1} gap={2} justifyContent = "center" alignItems = "center" className="pb-4">

                <Grid size = {{ xs: 12}} className="flex flex-col items-center gap-4 p-4">
                    <Card sx={{ width: '100%' }} className='!rounded-lg'>
                        <CardContent
                            className="flex flex-col gap-3 items-center justify-center"
                            // sx={{ height: '400px' }}
                        >
                            {isLoading && !totalPicVsTotalStoresTotalStores ? (
                                <CircularProgress size={16} sx={{ color: 'black' }} />
                                ) : (
                                <BarChart
                                    data={totalPicVsTotalStoresTotalStores}
                                    title="Total PIC vs Total Stores"
                                />
                                )
                            }

                            {isLoading && !rodVsNonRodData ? (
                                <CircularProgress size={16} sx={{ color: 'black' }} />
                                ) : (
                                <BarChart
                                        data={rodVsNonRodData}
                                        title="Rod vs Non Rod"
                                />
                                )
                            }

                            </CardContent>
                        </Card>
                </Grid>
                  <Grid size = {{ xs: 12}} className="p-4">
                    <Card sx={{ width: '100%' }} className='flex justify-center items-center gap-4 !rounded-lg'>
                        <CardContent
                            className="flex flex-col gap-3 items-center justify-center w-1/2"
                            // sx={{ height: '400px' }}
                        >
                          
                            {isLoading && !complianceData ? (
                                <CircularProgress size={16} sx={{ color: 'black' }} />
                                ) : (
                                <PieChart
                                    data={complianceData}
                                    height={100}
                                    width={100}
                                    title={"Compliance"}
                                />
                                )
                            }
                            </CardContent>
                        </Card>
                </Grid>
                {/* {selectedTab === 'SKU_FREQUENCY' && (
                    <Grid size = {{ xs: 12}} className="flex flex-col items-center gap-4 p-4">        

                                <Card sx={{ width: '100%' }} className='!rounded-lg '>
                                <CardContent>
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
                                        tableData={frequencyTrendMonthTableData}
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
                                </CardContent>
                                </Card>
                    </Grid>
                )} */}
            </Grid>

        </>
    );
}

const StoreExecutionDashboardWithAuth = withAuth(StoreExecutionDashboard)([roles[1]]);
export default StoreExecutionDashboardWithAuth;