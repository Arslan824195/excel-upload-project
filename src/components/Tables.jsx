import React, { useRef, useState } from 'react';
import { Grid } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import MaterialReactDataTable from './MaterialReactDataTable';

const Tables = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [globalFilterValue1, setGlobalFilterValue1] = useState("");
  const [globalFilterValue2, setGlobalFilterValue2] = useState("");
  const [triggerDataRefresh, setTriggerDataRefresh] = useState(false);

  const tableRef1 = useRef();
  const tableRef2 = useRef();

  const [tablesPageData1, setTablesPageData1] = useState({
    columns: ['Name', 'Department', 'TotalPictures'],
    data_types: {
      Name: 'object',
      Department: 'object',
      TotalPictures: 'int'
    },
    rows: [
      { Name: 'Ali', Department: 'IT', TotalPictures: 100 },
      { Name: 'Zara', Department: 'HR', TotalPictures: 80 }
    ],
    filtered_rows: [
      { Name: 'Ali', Department: 'IT', TotalPictures: 100 },
      { Name: 'Zara', Department: 'HR', TotalPictures: 80 }
    ]
  });

  const [tablesPageData2, setTablesPageData2] = useState({
    columns: ['Product', 'Category', 'Stock'],
    data_types: {
      Product: 'object',
      Category: 'object',
      Stock: 'int'
    },
    rows: [
      { Product: 'Laptop', Category: 'Electronics', Stock: 25 },
      { Product: 'Shampoo', Category: 'Grocery', Stock: 60 }
    ],
    filtered_rows: [
      { Product: 'Laptop', Category: 'Electronics', Stock: 25 },
      { Product: 'Shampoo', Category: 'Grocery', Stock: 60 }
    ]
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Grid container spacing={4} justifyContent="center" alignItems="center" className="mt-8" >
        {/* Table 1 */}
        <Grid item xs={12} md={6}>
          <MaterialReactDataTable
            ref={tableRef1}
            title="Employee Table"
            isLoading={isLoading}
            isWritable={true}
            globalFilterValue={globalFilterValue1}
            triggerDataRefresh={triggerDataRefresh}
            tableData={tablesPageData1}
            setGlobalFilterValue={setGlobalFilterValue1}
            setIsLoading={setIsLoading}
            setTriggerDataRefresh={setTriggerDataRefresh}
            showFooterRow={false}
          />
        </Grid>

        {/* Table 2 */}
        <Grid item xs={12} md={6} >
          <MaterialReactDataTable
            ref={tableRef2}
            title="Inventory Table"
            isLoading={isLoading}
            isWritable={true}
            globalFilterValue={globalFilterValue2}
            triggerDataRefresh={triggerDataRefresh}
            tableData={tablesPageData2}
            setGlobalFilterValue={setGlobalFilterValue2}
            setIsLoading={setIsLoading}
            setTriggerDataRefresh={setTriggerDataRefresh}
            showFooterRow={false}
          />
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
};

export default Tables;
