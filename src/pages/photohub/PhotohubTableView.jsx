import { useEffect, useMemo, useRef, useState } from 'react';
import { abortController } from '../../utils/abortController';
import { LocalizationProvider, DesktopDatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import useSessionExpire from '../../hooks/useSessionExpire';
import Backdrop from '@mui/material/Backdrop';
import MaterialReactDataTable from '../../components/MaterialReactDataTable';
import RestoreIcon from '@mui/icons-material/Restore';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import VirtualizedAutocomplete from '../../components/Autocomplete';
import Alert from '../../components/Alert';
import axios from 'axios';
import { Grid } from '@mui/material';
import withAuth from '../../lib/withAuth';
import { roles } from '../../constants/roles.constant';
import Loader from '../../components/Loader';

const PhotohubTableView = ({ logOut = () => {} }) =>  
{

    /* API VARIABLES */
    const [isLoading, setIsLoading] = useState(false);
    const [isDataLoading, setIsDataLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertType, setAlertType] = useState("");

    /* SESSION EXPIRY VARIABLES */
    const triggerSessionExpire = useSessionExpire();

    // FILTER LISTS
    const monthList = useMemo(() => [
        { id: '2025-May', value: 'May 2025' }
    ], []);
    const [zoneOptions, setZoneOptions] = useState([]);
    const [geographyOptions, setGeographyOptions] = useState([]);
    const [riderOptions, setRiderOptions] = useState([]);
    const [areaOptions, setAreaOptions] = useState([]);
    const [distributionOptions, setDistributionOptions] = useState([]);
    const [territoryOptions, setTerritoryOptions] = useState([]);
    const [storeCodeOptions, setStoreCodeOptions] = useState([]);
    const [storeNameOptions, setStoreNameOptions] = useState([]);
    const complianceOptions = useMemo(() => ["Compliant", "Non Compliant"], []);
        
    /* SELECTED LIST VARIABLES */
    const [selectedMonth, setSelectedMonth] = useState({ id: '2025-May', value: 'May 2025' });
    const [selectedZone, setSelectedZone] = useState(null);
    const [selectedGeography, setSelectedGeography] = useState(null);
    const [selectedRider, setSelectedRider] = useState(null);
    const [selectedArea, setSelectedArea] = useState(null);
    const [selectedDistribution, setSelectedDistribution] = useState(null);
    const [selectedTerritory, setSelectedTerritory] = useState(null);
    const [selectedStoreCode, setSelectedStoreCode] = useState(null);
    const [selectedStoreName, setSelectedStoreName] = useState(null);
    const [selectedCompliance, setSelectedCompliance] = useState(null);

    /* CONDITIONAL FILTER VARIABLES */
    const [isFilterable, setIsFilterable] = useState(false);
    const [filter, setFilter] = useState(true);
    const [isFiltered, setIsFiltered] = useState(false);

    /* DATATABLE VARIABLES */
    const [dashboardData, setDashboardData] = useState([]);
    const [triggerDataRefresh, setTriggerDataRefresh] = useState(false);
    const tableRef = useRef();
     const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 25,
    });
    const [rowCount, setRowCount] = useState(0);
    
    /* DATATABLE GLOBAL FILTER VARIABLES */
    const [globalFilterValue, setGlobalFilterValue] = useState("");

    useEffect(() => {

        const fetchFiltersList = async () => {
            setIsLoading(true);
            setShowAlert(false);
            setAlertMessage("");
            setAlertType("");

            try {
            const response = await axios({
                method: "get",
                url: "/api/fetchfilters",
                signal: abortController.signal,
                params: {
                month: selectedMonth?.id,
                zone: selectedZone,
                geography: selectedGeography,
                area: selectedArea,
                territory: selectedTerritory,
                },
            });

            setIsLoading(false);
            const { status, data } = response;

            if (status === 200) {
                setZoneOptions(data.filters.zones || []);
                setGeographyOptions(data.filters.geographies || []);
                setAreaOptions(data.filters.areas || []);
                setTerritoryOptions(data.filters.territories || []);
                setDistributionOptions(data.filters.distributions || []);
                setRiderOptions(data.filters.riders || []);
                setStoreCodeOptions(data?.filters?.store_codes || []);
                setStoreNameOptions(data?.filters?.store_names || []);
            } else {
                setAlertMessage("An error occurred while processing your request. Please try again later or contact the site administrator.");
                setAlertType("error");
                setShowAlert(true);
            }
            } catch (error) {
            console.log("Get Filters API Error: ", error);
            setIsLoading(false);

            if (axios.isCancel(error) || error.code === "ERR_CANCELED") return;

            const status = error?.response?.status;

            if (status === 403) {
                triggerSessionExpire();
            } else {
                setAlertMessage(
                status === 401
                    ? "Unauthorized access. You do not have the required permissions to perform this action."
                    : status === 429
                    ? "Request limit exceeded. Your account is temporarily disabled. Please contact the site administrator."
                    : "An error occurred while processing your request. Please try again later or contact the site administrator."
                );
                setAlertType("error");
                setShowAlert(true);

                if (status === 429) setTimeout(logOut, 3000);
            }
            }
        };

        fetchFiltersList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedMonth]);

    

    useEffect(() =>
    {
        const fetchData = async () => 
        {
            setIsDataLoading(true);
            setShowAlert(false);
            setAlertMessage("");
            setAlertType("");
    
            await axios({
                method: "post",
                url: "/api/GetPhotosTable",
                data: {
                    filter_value: globalFilterValue,
                    selectedMonth: selectedMonth?.id,
                    zone: selectedZone,
                    geography: selectedGeography,
                    rider: selectedRider,
                    area: selectedArea,
                    distribution: selectedDistribution,
                    territory: selectedTerritory,
                    storeCode: selectedStoreCode,
                    storeName: selectedStoreName,
                    compliance: selectedCompliance,
                    page: pagination?.pageIndex + 1, // API expects 1-based page index
                    pageSize: pagination?.pageSize,
                },
                signal: abortController.signal
            })
            .then((response) => 
            {
                setIsDataLoading(false);
                const { status, data } = response;
        
                if (status === 200) 
                {
                    const dashboardData = data;
                    setDashboardData(dashboardData);
                    setRowCount(dashboardData?.rowCount || dashboardData?.data?.length || 0);
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
                console.log("Get Dashboard Data Api: ", error);
                setIsDataLoading(false);

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
        
        fetchData();

        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [triggerDataRefresh, filter, pagination]);

    useEffect(() => {
        const isAllFiltersSelected =
            selectedZone &&
            selectedGeography;

        setIsFilterable(!!isAllFiltersSelected);
    }, [selectedZone, selectedGeography]);

    const handleSelectMonth = (month) =>
    {
        setIsFilterable(true);
        setSelectedMonth(month);
    }

    const handleSelectFilter = (filterType, value) => {
    setIsFiltered(true);

    switch (filterType) {
      case "zone":
        setSelectedZone(value);
        setSelectedGeography(null);
        setSelectedArea(null);
        setSelectedTerritory(null);
        setSelectedDistribution(null);
        setSelectedRider(null);
        setSelectedStoreCode(null);
        setSelectedStoreName(null);
        setSelectedCompliance(null)
        break;

      case "geography":
        setSelectedGeography(value);
        setSelectedArea(null);
        setSelectedTerritory(null);
        setSelectedDistribution(null);
        setSelectedRider(null);
        setSelectedStoreCode(null);
        setSelectedStoreName(null);
        setSelectedCompliance(null)
        break;

      case "area":
        setSelectedArea(value);
        setSelectedTerritory(null);
        setSelectedDistribution(null);
        setSelectedRider(null);
        setSelectedStoreCode(null);
        setSelectedStoreName(null);
        setSelectedCompliance(null)
        break;

      case "territory":
        setSelectedTerritory(value);
        setSelectedDistribution(null);
        setSelectedRider(null);
        setSelectedStoreCode(null);
        setSelectedStoreName(null);
        setSelectedCompliance(null)
        break;

      case "distribution":
        setSelectedDistribution(value);
        setSelectedRider(null);
        setSelectedStoreCode(null);
        setSelectedStoreName(null);
        setSelectedCompliance(null)
        break;

      case "rider":
        setSelectedRider(value);
        break;
      
      case "storeCode":
        setSelectedStoreCode(value)
        break;

      case "storeName":
        setSelectedStoreName(value)
        break;

      case "compliance":
        setSelectedCompliance(value);
        break;

      default:
        break;
    }
    };

    // const handleDateChange = (newDate) => 
    // {
    //     const date = newDate ? dayjs(newDate).format("MMMM-YYYY") : newDate;
    //     setIsFilterable(true);
    //     setIsFiltered(false);
    //     setSelectedMonth(date)
    // }

    const handleFilter = () => 
    {
        setIsFiltered(true);
        setFilter(true);
        setTriggerDataRefresh(!triggerDataRefresh);
    }

    const handleReset = () => 
    {
        setSelectedMonth({ id: '2025-May', value: 'May 2025' });
        setSelectedZone(null);
        setSelectedGeography(null);
        setSelectedRider(null);
        setSelectedArea(null);
        setSelectedDistribution(null);
        setSelectedTerritory(null);
        setSelectedStoreCode(null);
        setSelectedStoreName(null);
        setSelectedCompliance(null)
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
            link.setAttribute("download", `${'selectedTab'}.csv`);
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

   const handleImageClick = (image_id, image_url) => {
        const queryParams = new URLSearchParams({
            id: image_id,
            selectedMonth: selectedMonth?.id,
            zone: selectedZone,
            geography: selectedGeography,
            rider: selectedRider,
            area: selectedArea,
            distribution: selectedDistribution,
            territory: selectedTerritory,
            storeCode: selectedStoreCode,
            storeName: selectedStoreName,
            compliance: selectedCompliance,
            photosCount: dashboardData?.filtered_rows?.length,
            fullSrc: encodeURIComponent(image_url),
            from: window.location.pathname + window.location.search, // Add current URL
        });

        const url = `/photo-hub/photo-details?${queryParams.toString()}`;
        window.open(url, '_blank');
    };


    return (
        <>
            <h2 className = "page-heading m-0">
                Photohub Table
            </h2>
            <div className = "content-container">
                <Alert
                    show = {showAlert}
                    message = {alertMessage}
                    type = {alertType}
                    setShow = {setShowAlert}
                />
                <Backdrop
                    sx = {{ color: '#fff', position: "absolute", borderRadius:"inherit", zIndex: (theme)=> theme.zIndex.drawer + 1 }}
                    open = {isDataLoading}
                >
                    <Loader />
                </Backdrop>
                <Grid container spacing = {1} justifyContent = "center" alignItems = "center" className="w-full">
                    <Grid size = {{ xs: 1.7 }} className = "autocomplete d-flex justify-content-center">
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
                    <Grid size = {{ xs: 1.7 }} className = "autocomplete flex justify-center">
                        <VirtualizedAutocomplete
                            isMultiple = {false}
                            isLoading = {!selectedZone && isLoading}
                            isObject = {false}
                            isWritable = {true}
                            filterOn = "Zone"
                            options = {isLoading ? [] : zoneOptions}
                            selectedOptions = {selectedZone}
                            handleSelectChange = {(filterOn, newValue) => handleSelectFilter("zone", newValue)}
                        />
                    </Grid>
                    <Grid size = {{ xs: 1.7 }} className = "autocomplete flex justify-center">
                        <VirtualizedAutocomplete
                            isMultiple = {false}
                            isLoading = {!selectedGeography && isLoading}
                            isObject = {false}
                            isWritable = {true}
                            filterOn = "Geography"
                            options = {isLoading ? [] : geographyOptions}
                            selectedOptions = {selectedGeography}
                            handleSelectChange = {(filterOn, newValue) => handleSelectFilter("geography", newValue)}
                        />
                    </Grid>
                    <Grid size = {{ xs: 1.7 }} className = "autocomplete flex justify-center">
                        <VirtualizedAutocomplete
                            isMultiple = {false}
                            isLoading = {!selectedArea && isLoading}
                            isObject = {false}
                            isWritable = {true}
                            filterOn = "Area"
                            options = {isLoading ? [] : areaOptions}
                            selectedOptions = {selectedArea}
                            handleSelectChange = {(filterOn, newValue) => handleSelectFilter("area", newValue)}
                        />
                    </Grid>
                    <Grid size = {{ xs: 1.7 }} className = "autocomplete flex justify-center">
                        <VirtualizedAutocomplete
                            isMultiple = {false}
                            isLoading = {!selectedTerritory && isLoading}
                            isObject = {false}
                            isWritable = {true}
                            filterOn = "Territory"
                            options = {isLoading ? [] : territoryOptions}
                            selectedOptions = {selectedTerritory}
                            handleSelectChange = {(filterOn, newValue) => handleSelectFilter("territory", newValue)}
                        />
                    </Grid>
                    <Grid size = {{ xs: 1.7 }} className = "autocomplete flex justify-center">
                        <VirtualizedAutocomplete
                            isMultiple = {false}
                            isLoading = {!selectedDistribution && isLoading}
                            isObject = {false}
                            isWritable = {true}
                            filterOn = "Distribution"
                            options = {isLoading ? [] : distributionOptions}
                            selectedOptions = {selectedDistribution}
                            handleSelectChange = {(filterOn, newValue) => handleSelectFilter("distribution", newValue)}
                        />
                    </Grid>
                    <Grid size = {{ xs: 1.7 }} className = "autocomplete flex justify-center">
                        <VirtualizedAutocomplete
                            isMultiple = {false}
                            isLoading = {!selectedRider && isLoading}
                            isObject = {false}
                            isWritable = {true}
                            filterOn = "Rider"
                            options = {isLoading ? [] : riderOptions}
                            selectedOptions = {selectedRider}
                            handleSelectChange = {(filterOn, newValue) => handleSelectFilter("rider", newValue)}
                        />
                    </Grid>
                    <Grid size = {{ xs: 1.7 }} className = "autocomplete flex justify-center">
                        <VirtualizedAutocomplete
                            isMultiple = {false}
                            isLoading = {!selectedStoreCode && isLoading}
                            isObject = {false}
                            isWritable = {true}
                            filterOn = "Store Code"
                            options = {isLoading ? [] : storeCodeOptions}
                            selectedOptions = {selectedStoreCode}
                            handleSelectChange = {(filterOn, newValue) => handleSelectFilter("storeCode", newValue)}
                        />
                    </Grid>
                    {/* <Grid size = {{ xs: 1.7 }} className = "autocomplete flex justify-center">
                        <VirtualizedAutocomplete
                            isMultiple = {false}
                            isLoading = {!selectedStoreName && isLoading}
                            isObject = {false}
                            isWritable = {true}
                            filterOn = "Store Name"
                            options = {isLoading ? [] : storeNameOptions}
                            selectedOptions = {selectedStoreName}
                            handleSelectChange = {(filterOn, newValue) => handleSelectFilter("storeName", newValue)}
                        />
                    </Grid> */}
                    <Grid size = {{ xs: 1.7 }} className = "autocomplete flex justify-center">
                        <VirtualizedAutocomplete
                            isMultiple = {false}
                            isObject = {false}
                            isWritable = {true}
                            filterOn = "Compliance"
                            options = {complianceOptions}
                            selectedOptions = {selectedCompliance}
                            handleSelectChange = {(filterOn, newValue) => handleSelectFilter("compliance", newValue)}
                        />
                    </Grid>
                    <Grid size = {{ xs: 1.7 }} className = "flex justify-center">
                        <ButtonGroup variant = "contained" disableElevation = {true}>
                        <Button type = "submit" className = "filter-button" color = "primary" disabled = {!isFilterable} onClick = {handleFilter}>
                            Filter
                        </Button>
                        <Button className = "reset-button" color = "info" disabled = {!isFiltered} startIcon = {<RestoreIcon />} onClick = {handleReset} />
                        </ButtonGroup>
                    </Grid>
                </Grid>

                <Grid container spacing = {0.5} justifyContent = "center" alignItems = "center" className="w-full">
                    <Grid size = {{ xs: 12 }}>
                        <LocalizationProvider dateAdapter = {AdapterDayjs}>
                            <MaterialReactDataTable
                                ref = {tableRef}
                                title = "Dashboard"
                                isWritable = {true}
                                isLoading = {isDataLoading}
                                allowBulkActions = {true}
                                globalFilterValue = {globalFilterValue}
                                triggerDataRefresh = {triggerDataRefresh}
                                tableData = {dashboardData}
                                isReportExportable = {true}
                                showImagelinks = {true}
                                dynamicPagination = {true}
                                pagination = {pagination }
                                rowCount = {rowCount}
                                setPagination = {setPagination}
                                handleImageClick = {handleImageClick}
                                handleExportRows = {handleExportRows}
                                setIsLoading = {setIsLoading}
                                setShowAlert = {setShowAlert}
                                setAlertMessage = {setAlertMessage}
                                setAlertType = {setAlertType}
                                setGlobalFilterValue = {setGlobalFilterValue}
                                setTriggerDataRefresh = {setTriggerDataRefresh}
                                handleGlobalFilter = {handleGlobalFilter}
                            />
                        </LocalizationProvider>
                    </Grid>
                </Grid>

            </div>
        </>
    );
}

const PhotohubTableViewWithAuth = withAuth(PhotohubTableView)([roles[1]]);
export default PhotohubTableViewWithAuth;