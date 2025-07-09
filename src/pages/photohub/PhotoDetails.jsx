import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Box,
  Button,
  Grid,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Link,
  Backdrop,
  Chip,
  Tooltip,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { abortController } from "../../utils/abortController";
import useSessionExpire from "../../hooks/useSessionExpire";
import Loader from "../../components/Loader";
import { roles } from "../../constants/roles.constant";
import withAuth from "../../lib/withAuth";
import Alert from "../../components/Alert";
import ReactPaginate from "react-paginate";

const PhotoDetails = ({ logOut = () => { } }) => {
  /* REACT ROUTER VARIABLES */
  const navigate = useNavigate();
  const location = useLocation();
  const triggerSessionExpire = useSessionExpire();

  /* API VARIABLES */
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");

  /* PHOTO DETAILS VARIABLES */
  const initialPhoto = useMemo(() => {
    if (location.state?.photo) {
      return location.state.photo;
    }

    const query = new URLSearchParams(location.search);
    return {
      filters: {
        id: query.get("id"),
        selectedMonth: query.get("selectedMonth"),
        zone: query.get("zone"),
        geography: query.get("geography"),
        rider: query.get("rider"),
        area: query.get("area"),
        distribution: query.get("distribution"),
        territory: query.get("territory"),
        storeCode: query.get("storeCode"),
        storeName: query.get("storeName"),
        compliance: query.get("compliance")
      },
      photosCount: parseInt(query.get("photosCount")) || 0,
      fullSrc: decodeURIComponent(query.get("fullSrc") || ""),
    };
  }, [location]);
  const [showRealogram, setShowRealogram] = useState(false);
  const [currentImageId, setCurrentImageId] = useState(initialPhoto?.filters?.id || 1);
  const [photosCount, setPhotosCount] = useState(initialPhoto?.photosCount || 0);
  const [photoIdList, setPhotoIdList] = useState([]);
  const [imageData, setImageData] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchImageData = useCallback(
    async (imageId) => {
      setIsLoading(true);
      setShowAlert(false);
      setAlertMessage("");
      setAlertType("");

      try {
        const response = await axios({
          method: "post",
          url: "/api/photodetails",
          data: {
            id: imageId,
            selectedMonth: initialPhoto?.filters?.selectedMonth,
            zone: initialPhoto?.filters?.zone,
            geography: initialPhoto?.filters?.geography,
            rider: initialPhoto?.filters?.rider,
            area: initialPhoto?.filters?.area,
            distribution: initialPhoto?.filters?.distribution,
            territory: initialPhoto?.filters?.territory,
            storeCode: initialPhoto?.filters?.storeCode,
            storeName: initialPhoto?.filters?.storeName,
            compliance: initialPhoto?.filters?.compliance,
            photosCount: photosCount,
          },
          signal: abortController.signal,
        });

        setIsLoading(false);
        const parsed = response.data;

        setPhotoIdList(parsed?.photoIDList || []);
        const data = {
          id: parsed?.id,
          fullSrc: { base64: parsed?.fullSrc.base64, contentType: parsed?.fullSrc.contentType },
          realogramSrc: parsed?.realogramSrc?.base64
            ? { base64: parsed?.realogramSrc.base64, contentType: parsed?.realogramSrc.contentType }
            : null,
          metadata: parsed?.metadata,
          availability: parsed?.availability,
          photosCount: parsed?.photosCount || photosCount,
        };

        setImageData(data);

        if (parsed?.photosCount && parsed?.photosCount !== photosCount && parsed?.photosCount > 0) {
          setPhotosCount(parsed?.photosCount);
        }

        if (parsed?.photoIdList && !parsed.photoIdList.includes(imageId)) {
          setCurrentImageId(parsed.photoIdList[0] || null);
        }
      } catch (error) {
        console.log("Get Photo Details API:", error);
        setIsLoading(false);

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
      }
    },
    [initialPhoto, photosCount, triggerSessionExpire, logOut]
  );

  useEffect(() => {
    if (isInitialLoad && currentImageId) {
      fetchImageData(currentImageId);
      setIsInitialLoad(false);
    }
  }, [isInitialLoad, currentImageId, fetchImageData]);

  useEffect(() => {
    if (photoIdList.length > 0 && !photoIdList.includes(currentImageId)) {
      setCurrentImageId(photoIdList[0] || null);
    }
  }, [photoIdList, currentImageId]);

  const handlePageClick = (data) => {
    const selectedIndex = data.selected;
    const selectedId = photoIdList[selectedIndex];
    if (selectedId && selectedId !== currentImageId) {
      setCurrentImageId(selectedId);
      fetchImageData(selectedId);
    }
  };

  function chunkArray(array, chunkSize) {
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      result.push(array.slice(i, i + chunkSize));
    }
    return result;
  }

  const handleBackPress = () => {
    const queryParams = new URLSearchParams(location.search);
    const from = queryParams.get('from');
    navigate(from);
  };

  return (
    <>
      <h2 className="page-heading m-0">Photohub Dashboard</h2>
      <div className="content-container">
        <Alert show={showAlert} message={alertMessage} type={alertType} setShow={setShowAlert} />
        <Backdrop
          sx={{ color: "#fff", position: "absolute", borderRadius: "inherit", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={isLoading}
        >
          <Loader />
        </Backdrop>
        <Grid container spacing={0.5} gap={2} justifyContent="center">
          <Grid size={{ xs: 7 }} display="flex" flexDirection="column" gap={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ height: "50px" }}>
              <Button variant="contained" onClick={handleBackPress}>
                Previous Page
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setShowRealogram(!showRealogram)}
                disabled={!imageData?.realogramSrc?.base64}
              >
                {showRealogram ? "Hide Realogram" : "Show Realogram"}
              </Button>
            </Box>

            <Box sx={{ position: "relative" }}>
              {isLoading ? (
                <Skeleton variant="rectangular" height={400} sx={{ borderRadius: "8px" }} />
              ) : (
                <div
                  style={{
                    height: "400px",
                    width: "auto",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "relative",
                    overflow: "hidden",
                    backgroundColor: "#f0f0f0",
                  }}
                >
                  <img
                    src={`data:${imageData?.fullSrc?.contentType};base64,${imageData?.fullSrc?.base64}`}
                    alt={`Image ${imageData?.id}`}
                    style={{
                      width: "100%",
                      height: "400px",
                      borderRadius: "8px",
                      position: "absolute",
                      top: 0,
                      left: 0,
                    }}
                  />

                  {imageData?.realogramSrc?.base64 && (
                    <img
                      src={`data:${imageData?.realogramSrc?.contentType};base64,${imageData?.realogramSrc?.base64}`}
                      alt={`Realogram Overlay ${imageData?.id}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "8px",
                        position: "absolute",
                        top: 0,
                        left: 0,
                        opacity: showRealogram ? 1 : 0,
                        transition: "opacity 0.5s ease-in-out",
                        pointerEvents: "none",
                      }}
                    />
                  )}
                </div>
              )}
            </Box>

            <ReactPaginate
              previousLabel={"← Prev"}
              nextLabel={"Next →"}
              breakLabel={"..."}
              pageCount={photoIdList.length || photosCount || 1}
              marginPagesDisplayed={0}
              pageRangeDisplayed={0}
              onPageChange={handlePageClick}
              containerClassName="pagination"
              activeClassName="active"
              pageClassName="page-item"
              pageLinkClassName="page-link"
              previousClassName="page-item"
              previousLinkClassName="page-link"
              nextClassName="page-item"
              nextLinkClassName="page-link"
              breakClassName="page-item"
              breakLinkClassName="page-link"
              disabledClassName="disabled"
            />
          </Grid>

          <Grid size={{ xs: 4 }} display="flex" flexDirection="column" gap={2}>
            {imageData?.availability && (
              <>
                <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: "50px" }}>
                  <h2 className="page-heading m-0">On Shelf Availability</h2>
                </Box>

                <TableContainer
                  component="div"
                  sx={{
                    backgroundColor: "#f9f9f9",
                    borderRadius: "12px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    overflow: "hidden",
                    mb: 2,
                  }}
                >
                  <Table>
                    <TableBody>
                      {imageData.availability.map((item, index) => (

                        <TableRow key={index}>
                          <TableCell
                            sx={{
                              color: "#333",
                              border: "1px solid #ddd",
                              p: 1,
                              maxWidth: 200,
                              padding: "6px 8px",
                              fontSize: "0.85rem",
                              overflow: "hidden",
                              whiteSpace: "nowrap",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {Array.isArray(imageData.availability) && (
                                <Tooltip key={index} title={item} arrow>
                                  <Box
                                    key={index}
                                    sx={{
                                      backgroundColor: "#f0f0f0",
                                      color: "#333",
                                      borderRadius: "4px",
                                      p: 0.5,
                                      width:"100%",
                                      fontSize: "0.875rem",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >

                                    {item}
                                  </Box>
                                </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </Grid>

          <Grid size={{ xs: 12 }} display="flex" flexDirection="column" gap={2}>
            {imageData?.metadata && (
              <>
                <Box display="flex" justifyContent="center" alignItems="center">
                  <h2 className="page-heading m-0">Photo Metadata</h2>
                </Box>
                <TableContainer
                  component="div"
                  sx={{
                    backgroundColor: "#f9f9f9",
                    borderRadius: "12px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    overflow: "hidden",
                  }}
                >
                  <Table sx={{ minWidth: 300 }}>
                    <TableBody>
                      {chunkArray(Object.entries(imageData.metadata), 4).map((row, rowIndex) => (
                        <TableRow key={`row-${rowIndex}`}>
                          {row.map(([key, value]) => (
                            <React.Fragment key={key}>
                              {/* Label Cell */}
                              <TableCell
                                sx={{
                                  fontWeight: 600,
                                  textTransform: "capitalize",
                                  color: "#333",
                                  backgroundColor: "#f0f0f0",
                                  border: "1px solid #ddd",
                                  width: "12%",
                                  padding: "6px 8px",
                                  fontSize: "0.85rem",
                                  overflow: "hidden",
                                  whiteSpace: "nowrap",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                <Tooltip title={key} arrow>
                                  <Box
                                    component="span"
                                    sx={{
                                      display: "inline-block",
                                      maxWidth: "100%",
                                      overflow: "hidden",
                                      whiteSpace: "nowrap",
                                      textOverflow: "ellipsis",
                                    }}
                                  >
                                    {key}
                                  </Box>
                                </Tooltip>
                              </TableCell>

                              {/* Value Cell */}
                              <TableCell
                                sx={{
                                  color: "#333",
                                  border: "1px solid #ddd",
                                  maxWidth: 200,
                                  padding: "6px 8px",
                                  fontSize: "0.85rem",
                                  overflow: "hidden",
                                  whiteSpace: "nowrap",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {key.toLowerCase().includes("url") ? (
                                  <Tooltip title={value} arrow>
                                    <Link
                                      href={value}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      sx={{
                                        color: "#1976d2",
                                        textDecoration: "none",
                                        fontWeight: 500,
                                        display: "inline-block",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {value}
                                    </Link>
                                  </Tooltip>
                                ) : Array.isArray(value) ? (
                                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                    {value.map((item, i) => (
                                      <Tooltip key={i} title={item} arrow>
                                        <Box
                                          component="span"
                                          sx={{
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                          }}
                                        >
                                          {item}
                                        </Box>
                                      </Tooltip>
                                    ))}
                                  </Box>
                                ) : (
                                  <Tooltip title={String(value)} arrow>
                                    <Box
                                      component="span"
                                      sx={{
                                        width: "100%",
                                        display: "inline-block",
                                        overflow: "hidden",
                                        whiteSpace: "nowrap",
                                        textOverflow: "ellipsis",
                                        verticalAlign: "middle",
                                      }}
                                    >
                                      {String(value)}
                                    </Box>
                                  </Tooltip>
                                )}
                              </TableCell>
                            </React.Fragment>
                          ))}
                          {/* Empty filler cells if less than 3 pairs */}
                          {row.length < 4 &&
                            Array.from({ length: (4 - row.length) * 2 }).map((_, i) => (
                              <TableCell
                                key={`empty-${i}`}
                                sx={{
                                  color: "#333",
                                  border: "1px solid #ddd",
                                  width: "12%",
                                  padding: "6px 8px",
                                }}
                              />
                            ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </Grid>
        </Grid>
      </div>
    </>
  );
};

const PhotoDetailsWithAuth = withAuth(PhotoDetails)([roles[1]]);
export default PhotoDetailsWithAuth;