import { useEffect, useMemo, useState } from "react";
import {
  Paper,
  Box,
  Grid,
} from "@mui/material";
import { LocalizationProvider, DesktopDatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import RestoreIcon from '@mui/icons-material/Restore';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { FixedSizeGrid } from "react-window";
import Backdrop from '@mui/material/Backdrop';
import AutoSizer from "react-virtualized-auto-sizer";
import ReactPaginate from "react-paginate";
import temporaryImage from "../../assets/logo.svg";
import Alert from "../../components/Alert";
import VirtualizedAutocomplete from "../../components/Autocomplete";
import axios from "axios";
import withAuth from "../../lib/withAuth";
import { roles } from "../../constants/roles.constant";
import { abortController } from "../../utils/abortController";
import useSessionExpire from "../../hooks/useSessionExpire";
import Loader from "../../components/Loader";

const COLUMN_COUNT = 9;
const ROW_HEIGHT = 95;
const PAGE_SIZE = 32;

const Gallery = ({ logOut = () => { } }) => {

  /* HOOKS */
  const triggerSessionExpire = useSessionExpire();

  /* API VARIABLES */
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");

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

  /* DATA VARIABLS */
  const [photos, setPhotos] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasImageLoadingError, setHasImageLoadingError] = useState(false);

  useEffect(() => {
    const fetchFiltersList = async () => {
      setIsLoading(true);
      setShowAlert(false);
      setAlertMessage("");
      setAlertType("");

      await axios({
        method: "get",
        url: "/api/fetchfilters",
        signal: abortController.signal,
        params: {
          month: selectedMonth?.id,
        }
      })
        .then((response) => {
          setIsLoading(false);
          const { status, data } = response;

          if (status === 200) {
            setZoneOptions(data?.filters.zones || []);
            setGeographyOptions(data?.filters.geographies || []);
            setRiderOptions(data?.filters.riders || []);
            setAreaOptions(data?.filters.areas || []);
            setDistributionOptions(data?.filters.distributions || []);
            setTerritoryOptions(data?.filters.territories || []);
            setStoreCodeOptions(data?.filters?.store_codes || []);
            setStoreNameOptions(data?.filters?.store_names || []);
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

    fetchFiltersList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth]);

  useEffect(() => {
    const fetchImages = async () => {
      setIsDataLoading(true);
      setShowAlert(false);
      setAlertMessage("");
      setAlertType("");

      await axios({
        method: "get",
        url: "/api/GetPhotos",
        params: {
          page: currentPage + 1,
          limit: PAGE_SIZE,
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
        },
        signal: abortController.signal
      })
        .then((response) => {
          setIsDataLoading(false);
          const { status, data } = response;
          setTotalPages(
            Math.ceil(
              (data?.dashboard_data?.totalCount || 0) / 
              (data?.dashboard_data?.filtered_count || 1)
            )
          );
          if (status === 200) {
            const formatted = data?.filtered_rows?.map((img) => ({
              id: img.id,
              src: img.signed_link,
              fullSrc: img.signed_link,
              month_name: img["Reporting Period"],
              zone: img.Zone,
              region: img.Region,
              rider_id: img["Rider ID"],
              location_id: img.location_id,
            }));
            setPhotos(formatted);
            if (formatted?.length === 0) {
              setAlertMessage("No photos found for the selected filters.");
              setAlertType("info");
              setShowAlert(true);
            }
          } else {
            setAlertMessage("An error occurred while processing your request. Please try again later or contact the site administrator.");
            setAlertType("error");
            setShowAlert(true);
          }
        })
        .catch((error) => {
          console.log("Get Photos Api: ", error);
          setIsDataLoading(false);

          if (axios.isCancel(error) || error.code === "ERR_CANCELED") {
            return;
          }

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

            if (status === 429) {
              setTimeout(logOut, 3000);
            }
          }
        });
    };

    fetchImages();
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [currentPage, filter]);

  // When user clicks on a thumbnail
  const handleThumbnailClick = (photo) => {
    const queryParams = new URLSearchParams({
      id: photo.id,
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
      photosCount: photos?.length,
      fullSrc: photo.fullSrc?.url || photo.fullSrc,
      from: window.location.pathname + window.location.search, // Add current URL
    });

    const url = `/photo-hub/photo-details?${queryParams.toString()}`;

    window.open(url, "_blank");
  };

  useEffect(() => {
    const isAllFiltersSelected =
      selectedZone &&
      selectedGeography ;

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

  // const convertToDayJsObject = (date) => {
  //   const convertedDate = date ? dayjs(date, "MMMM-YYYY") : null;
  //   return convertedDate;
  // }

  // const handleDateChange = (newDate) => {
  //   const date = newDate ? dayjs(newDate).format("MMMM-YYYY") : newDate;
  //   setIsFilterable(true);
  //   setIsFiltered(true);
  //   setSelectedMonth(date)
  // }


  const handleFilter = () => {
    setIsFiltered(true);
    setFilter(!filter);
  };

  const handleReset = () => {
    setSelectedMonth({ id: '2025-May', value: 'May 2025' });
    setSelectedZone(null);
    setSelectedGeography(null);
    setSelectedRider(null);
    setSelectedArea(null);
    setSelectedDistribution(null);
    setSelectedTerritory(null);
    setSelectedStoreCode(null);
    setSelectedStoreName(null);
    setSelectedCompliance(null);
    setIsFilterable(false);
    setFilter(false);
    setIsFiltered(false);
  };


  const Cell = ({ columnIndex, rowIndex, style }) => {
    const index = rowIndex * COLUMN_COUNT + columnIndex;
    if (index >= photos?.length) return null;
    const photo = photos[index];

    return (
      <div style = {{ ...style, padding: 8 }} key = {photo.id}>
        <Paper
          onClick = {() => {
            if (!hasImageLoadingError) {
              handleThumbnailClick(photo);
            }
          }}
          className = "cursor-pointer rounded-lg shadow-lg hover:shadow-2xl transition-all duration-200"
          sx = {{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <img
            src = {photo.fullSrc}
            alt = {`Thumbnail ${photo.id}`}
            style = {{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "8px",
            }}
            className = "transition-transform duration-300 ease-in-out transform hover:scale-105"
            onError = {(e) => {
              e.target.src = temporaryImage;
              setHasImageLoadingError(true);
            }}
          />
        </Paper>
      </div>
    );
  };

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  return (
    <>
      <h2 className = "page-heading">Photohub Gallery</h2>
      <div className = "content-container">
        <Alert
          show = {showAlert}
          message = {alertMessage}
          type = {alertType}
          setShow = {setShowAlert}
        />

        <Backdrop
          sx = {{ color: '#fff', position: "absolute", borderRadius: "inherit", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open = {isDataLoading}
        >
          <Loader />
        </Backdrop>

        <Grid container spacing={1} justifyContent = "center" alignItems = "center" className = "w-full">
          <Grid size = {{ xs: 1.7 }} className = "autocomplete d-flex justify-content-center">
            <LocalizationProvider dateAdapter = {AdapterDayjs}>
              <VirtualizedAutocomplete
                  isMultiple = {false}
                  isObject = {true}
                  isWritable = {true}
                  filterOn = "Month"
                  options = {monthList}
                  selectedOptions = {selectedMonth}
                  handleSelectChange = {(filterOn, newValue) => handleSelectMonth(newValue)}
              />
            </LocalizationProvider>
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

        <Box
          sx = {{
            backgroundColor: "#f5f5f5",
            padding: 2,
            height: "calc(100vh - 200px)",
          }}
        >
          <AutoSizer>
            {({ height, width }) => (
              <FixedSizeGrid
                columnCount = {COLUMN_COUNT}
                columnWidth = {width / COLUMN_COUNT}
                height = {height - 20}
                rowCount = {Math.ceil(photos?.length / COLUMN_COUNT)}
                rowHeight = {ROW_HEIGHT}
                width = {width}
              >
                {Cell}
              </FixedSizeGrid>
            )}
          </AutoSizer>
        </Box>

        <Grid
          container
          spacing = {1}
          gap = {2}
          justifyContent = "center"
          alignItems = "center"
        >
          <ReactPaginate
            previousLabel = {"← Prev"}
            nextLabel = {"Next →"}
            breakLabel = {"..."}
            pageCount = {totalPages}
            marginPagesDisplayed = {0}
            pageRangeDisplayed = {0}
            onPageChange = {handlePageClick}
            containerClassName = "pagination"
            activeClassName = "active"
            pageClassName = "page-item"
            pageLinkClassName = "page-link"
            previousClassName = "page-item"
            previousLinkClassName = "page-link"
            nextClassName = "page-item"
            nextLinkClassName = "page-link"
            breakClassName = "page-item"
            breakLinkClassName = "page-link"
            disabledClassName = "disabled"
          />
        </Grid>
      </div>
    </>
  );
};

const PhotohubWithAuth = withAuth(Gallery)([roles[1]]);
export default PhotohubWithAuth;