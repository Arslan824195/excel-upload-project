import React, { useEffect, useMemo, useState } from 'react'
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import RestoreIcon from '@mui/icons-material/Restore';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import NationalRodChart from '../../components/NationalRodChart'
import DonutChart from '../../components/DonutChart';
import { Grid } from '@mui/material';
import VirtualizedAutocomplete from '../../components/Autocomplete';
import axios from 'axios';
import TwoLineChart from '../../components/TwoLineChart';
import TargetArcChart from '../../components/TargetArcChart';

const ExtractChart = () => {
    /* CONDITIONAL FILTER VARIABLES */
    const [isFilterable, setIsFilterable] = useState(false);
    const [filter, setFilter] = useState(true);
    const [isFiltered, setIsFiltered] = useState(false);


    // FILTER LISTS
    const monthList = useMemo(() => [
        { id: '2025-May', value: 'May 2025' }
    ], [])
    const [zoneOptions, setZoneOptions] = useState([]);
    const [geographyOptions, setGeographyOptions] = useState([]);
    const [areaOptions, setAreaOptions] = useState([]);
    const [territoryOptions, setTerritoryOptions] = useState([]);
    const [distributionOptions, setDistributionOptions] = useState([]);
    const [riderOptions, setRiderOptions] = useState([]);
    const [storeCodeOptions, setStoreCodeOptions] = useState([]);
    const complianceOptions = useMemo(() => ['Compliant', 'Non Compliant'], []);

    /* SELECTED LIST VARIABLES */
    const [selectedMonth, setSelectedMonth] = useState({ id: '2025-May', value: 'May 2025' });
    const [selectedZone, setSelectedZone] = useState(null);
    const [selectedGeography, setSelectedGeography] = useState(null);
    const [selectedArea, setSelectedArea] = useState(null);
    const [selectedTerritory, setSelectedTerritory] = useState(null);
    const [selectedDistribution, setSelectedDistribution] = useState(null);
    const [selectedRider, setSelectedRider] = useState(null);
    const [selectedStoreCode, setSelectedStoreCode] = useState(null);
    const [selectedCompliance, setSelectedCompliance] = useState(null);


    const fetchData = async () => {
        try {
            const response = await axios.get("/api/fetchfilters", {
                params: {
                    month: selectedMonth?.id,
                }
            });
            console.log(response);
            const { status, data } = response

            if (status === 200) {
                setZoneOptions(data?.filters.zones || []);
                setGeographyOptions(data?.filters.geographies || []);
                setAreaOptions(data?.filters.areas || []);
                setTerritoryOptions(data?.filters.territories || []);
                setDistributionOptions(data?.filters.distributions || []);
                setRiderOptions(data?.filters.riders || []);
                setStoreCodeOptions(data?.filters.store_codes || []);
            }

        } catch (error) {
            console.error("Error fetching filters:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedMonth]);


    const handleSelectMonth = (month) => {
        setIsFilterable(true);
        setSelectedMonth(month);
    }

    const handleSelectFilter = (filterType, value) => {
        setIsFiltered(true);
        switch (filterType) {
            case "zone":
                setSelectedZone(value);
                console.log("geography value is ", value);
                setSelectedGeography(null);
                setSelectedArea(null);
                setSelectedTerritory(null);
                setSelectedDistribution(null);
                setSelectedRider(null);
                setSelectedStoreCode(null);
                setSelectedCompliance(null)
                break;
            case "geography":
                setSelectedGeography(value);
                console.log("geography value is ", value);
                setSelectedArea(null);
                setSelectedTerritory(null);
                setSelectedDistribution(null);
                setSelectedRider(null);
                setSelectedStoreCode(null);
                setSelectedCompliance(null)
                break;
            case "area":
                setSelectedArea(value);
                console.log("Area value is ", value);
                setSelectedTerritory(null);
                setSelectedDistribution(null);
                setSelectedRider(null);
                setSelectedStoreCode(null);
                setSelectedCompliance(null)
                break;
            case "territory":
                setSelectedTerritory(value);
                console.log("Territory value is ", value);
                setSelectedDistribution(null);
                setSelectedRider(null);
                setSelectedStoreCode(null);
                setSelectedCompliance(null)
                break;
            case "distribution":
                setSelectedDistribution(value);
                console.log("Distribution value is ", value);
                setSelectedRider(null);
                setSelectedStoreCode(null);
                setSelectedCompliance(null)
                break;
            case "rider":
                setSelectedRider(value);
                console.log("Rider value is ", value)
                break;
            case "storeCode":
                setSelectedStoreCode(value);
                console.log("StoreCode value is ", value)
                break;
            case "compliance":
                setSelectedCompliance(value);
                console.log("Compliance value is ", value)
                break;

            default:
                break;
        }
    };

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
        setSelectedCompliance(null);
        setIsFilterable(false);
        setFilter(false);
        setIsFiltered(false);
    };

    const handleRefresh = () => {
        window.location.reload();
    }

    const [nationalRodData, setNationalRodData] = useState({
        labels: [
            'TOTAL UNIQUE PICTURES', '',
            'UNIQUE ROD PICTURES', '',
            'ROD COMPLIANT PICTURES', ''
        ],
        datasets: [
            {
                label: 'National Rod Data',
                data: [546, 123, 875, 610, 420, 700],
                backgroundColor: [
                    'rgba(31, 62, 98)',
                    'rgba(31, 62, 98)',
                    'rgba(88, 126, 171)',
                    'rgba(88, 126, 171)',
                    'rgba(255, 182, 1)',
                    'rgba(255, 182, 1)',
                ],
                borderRadius: {
                    topLeft: 10,
                    topRight: 10,
                    bottomLeft: 0,
                    bottomRight: 0,
                },
            },
        ],
    });

    return (
        <>
            <div className=''>
                <h2 className='text-2xl font-bold mb-4'>Analytics Dashboard</h2>

                <Grid container spacing={1} justifyContent="center" alignItems="center" className='w-full '>
                    <Grid size={{ xs: 1.7 }} className='flex autocomplete justify-center'>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <VirtualizedAutocomplete
                                isMultiple={false}
                                isObject={true}
                                isWritable={true}
                                filterOn='Month'
                                options={monthList}
                                selectedOptions={selectedMonth}
                                handleSelectChange={(filterOn, newValue) => handleSelectMonth(newValue)}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid size={{ xs: 1.7 }} className="autocomplete flex justify-center">
                        <VirtualizedAutocomplete
                            isMultiple={false}
                            isObject={false}
                            isWritable={true}
                            filterOn="Zone"
                            options={zoneOptions}
                            selectedOptions={selectedZone}
                            handleSelectChange={(filterOn, newValue) => handleSelectFilter("zone", newValue)}
                        />
                    </Grid>
                    <Grid size={{ xs: 1.7 }} className='flex autocomplete justify-center'>
                        <VirtualizedAutocomplete
                            isMultiple={false}
                            isObject={false}
                            isWritable={true}
                            filterOn='Geograpgy'
                            options={geographyOptions}
                            selectedOptions={selectedGeography}
                            handleSelectChange={(filterOn, newValue) => handleSelectFilter("geography", newValue)}
                        />
                    </Grid>
                    <Grid size={{ xs: 1.7 }} className="autocomplete flex justify-center">
                        <VirtualizedAutocomplete
                            isMultiple={false}
                            isObject={false}
                            isWritable={true}
                            filterOn="Area"
                            options={areaOptions}
                            selectedOptions={selectedArea}
                            handleSelectChange={(filterOn, newValue) => handleSelectFilter("area", newValue)}
                        />
                    </Grid>
                    <Grid size={{ xs: 1.7 }} className="autocomplete flex justify-center">
                        <VirtualizedAutocomplete
                            isMultiple={false}
                            isObject={false}
                            isWritable={true}
                            filterOn='Territory'
                            options={territoryOptions}
                            selectedOptions={selectedTerritory}
                            handleSelectChange={(filterOn, newValue) => handleSelectFilter("territory", newValue)}
                        />
                    </Grid>
                    <Grid size={{ xs: 1.7 }} className="autocomplete flex justify-center">
                        <VirtualizedAutocomplete
                            isMultiple={false}
                            isObject={false}
                            isWritable={true}
                            filterOn='Distribution'
                            options={distributionOptions}
                            selectedOptions={selectedDistribution}
                            handleSelectChange={(filterOn, newValue) => handleSelectFilter("distribution", newValue)}
                        />
                    </Grid>
                    <Grid size={{ xs: 1.7 }} className="autocomplete flex justify-center">
                        <VirtualizedAutocomplete
                            isMultiple={false}
                            isObject={false}
                            isWritable={true}
                            filterOn='Rider'
                            options={riderOptions}
                            selectedOptions={selectedRider}
                            handleSelectChange={(filterOn, newValue) => handleSelectFilter("rider", newValue)}
                        />
                    </Grid>
                    <Grid size={{ xs: 1.7 }} className="autocomplete flex justify-center">
                        <VirtualizedAutocomplete
                            isMultiple={false}
                            isObject={false}
                            isWritable={true}
                            filterOn='Store Code'
                            options={storeCodeOptions}
                            selectedOptions={selectedStoreCode}
                            handleSelectChange={(filterOn, newValue) => handleSelectFilter("storeCode", newValue)}
                        />
                    </Grid>
                    <Grid size={{ xs: 1.7 }} className='flex autocomplete justify-center'>
                        <VirtualizedAutocomplete
                            isObject={false}
                            isMultiple={false}
                            isWritable={true}
                            filterOn="Compliance"
                            options={complianceOptions}
                            selectedOptions={selectedCompliance}
                            handleSelectChange={(filterOn, newValue) =>
                                handleSelectFilter("compliance", newValue)
                            }
                        />
                    </Grid>
                    <Grid size={{ xs: 1.7 }} className="flex justify-center">
                        <ButtonGroup variant="contained" disableElevation={true}>
                            <Button type="submit" className="filter-button" color="primary" disabled={!isFilterable} onClick={handleFilter}>
                                Filter
                            </Button>
                            <Button className="reset-button" color="info" disabled={!isFiltered} startIcon={<RestoreIcon />} onClick={handleReset} />
                        </ButtonGroup>
                    </Grid>
                    <Grid size={{ xs: 1.7 }} className="flex justify-center">
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={handleRefresh}
                        >
                            Refresh Page
                        </Button>
                    </Grid>
                </Grid>



                {/* National Rod Chart     */}
                <NationalRodChart data={nationalRodData} />

                {/* Donut Chart */}
                <hr className="border-t-2 border-gray-400 mt-10 w-full rounded" />
                <div className="flex flex-wrap justify-center items-center gap-4 my-10">
                    <DonutChart percentage="41%" label="Jhelum" />
                    <DonutChart percentage="72%" label="Lahore" />
                    <DonutChart percentage="40%" label="Karachi" />
                    <DonutChart percentage="70%" label="Sindh" />
                </div>

                {/* Two Line Chart */}
                <TwoLineChart />

                {/* Target Arc Chart */}
                <TargetArcChart />
            </div>

        </>
    )
}

export default ExtractChart