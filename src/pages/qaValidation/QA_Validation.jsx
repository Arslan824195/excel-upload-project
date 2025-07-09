import React from 'react';
import { 
  Grid, Paper, Typography, LinearProgress, Box, Divider
} from '@mui/material';
import { 
  CheckCircleOutline, 
  ErrorOutline, 
  WarningAmber, 
  InfoOutlined,
  ArrowDropDown,
  Timeline,
  Schema,
  DataObject,
  ShowChart,
  Rule,
  CompareArrows,
  CalendarToday
} from '@mui/icons-material';

const AxleFileValidationDashboard = () => {
  // Original data
  const issueData = [
    { type: "Duplicates", count: 14, severity: "medium", icon: <WarningAmber /> },
    { type: "Truncations", count: 7, severity: "low", icon: <InfoOutlined /> },
    { type: "Type Mismatches", count: 3, severity: "high", icon: <ErrorOutline /> },
    { type: "Missing Fields", count: 28, severity: "high", icon: <ErrorOutline /> }
  ];

  const totalIssues = issueData.reduce((sum, issue) => sum + issue.count, 0);
  const criticalIssues = issueData
    .filter(i => i.severity === 'high')
    .reduce((sum, issue) => sum + issue.count, 0);

  const fileStats = {
    fileName: "axle_data_20240526.csv",
    fileSize: "4.7 MB",
    uploadTime: "May 26, 2024 14:30",
    processingTime: "2.4 seconds"
  };

  const completenessData = {
    originalRecords: 1248,
    processedRecords: 1220,
    missingRecords: 28,
    completenessPercentage: 97.8
  };

  // New validation KPIs
  const structureValidation = {
    expectedColumns: 28,
    foundColumns: 27,
    missingColumns: ["vin_checksum"],
    extraColumns: ["unexpected_field"],
    structureScore: 89.3
  };

  const valueDistribution = {
    emptyValues: 42,
    zeroValues: 15,
    negativeValues: 3,
    outlierValues: 8,
    defaultValues: 27
  };

  const patternCompliance = {
    vinFormatMatches: 92.4,
    dateFormatMatches: 88.1,
    idFormatMatches: 95.2,
    emailFormatMatches: 97}
  // Sample validation issues
  const validationIssues = [
    { 
      id: 1, 
      recordId: "AX-2001", 
      field: "Odometer", 
      issueType: "Type Mismatch", 
      value: "Unknown", 
      expected: "Numeric value",
      severity: "high"
    },
    { 
      id: 2, 
      recordId: "AX-2002", 
      field: "Last Service Date", 
      issueType: "Missing Field", 
      value: "", 
      expected: "YYYY-MM-DD",
      severity: "high"
    },
    { 
      id: 3, 
      recordId: "AX-2003", 
      field: "Owner Name", 
      issueType: "Truncation", 
      value: "Christopher...", 
      expected: "Full name",
      severity: "medium"
    },
    { 
      id: 4, 
      recordId: "AX-2004", 
      field: "VIN", 
      issueType: "Format Issue", 
      value: "1HGCM82633", 
      expected: "17 characters",
      severity: "high"
    },
    { 
      id: 5, 
      recordId: "AX-2005", 
      field: "License Plate", 
      issueType: "Invalid Region", 
      value: "ABC1234", 
      expected: "California format",
      severity: "medium"
    },
  ];
  return (
    <div className="p-6 max-w-7xl mx-auto">
            {/* Header Section */}
      <Grid container spacing={3} className="mb-6">
        <Grid xs={12}>
          <Paper className="p-4 shadow-sm">
            <Typography variant="h5" className="font-bold text-gray-800">
              Axle File Validation Report
            </Typography>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
              <span><strong>File:</strong> {fileStats.fileName}</span>
              <span><strong>Size:</strong> {fileStats.fileSize}</span>
              <span><strong>Uploaded:</strong> {fileStats.uploadTime}</span>
              <span><strong>Processing Time:</strong> {fileStats.processingTime}</span>
            </div>
          </Paper>
        </Grid>
      </Grid>

      {/* Summary KPI Cards */}
      <Grid container spacing={3} className="mb-6">
        {/* Completeness Card */}
        <Grid xs={12} md={4}>
          <Paper className="p-4 shadow-sm border-l-4 border-green-500">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircleOutline />
              <Typography variant="subtitle1" className="font-medium">
                Completeness
              </Typography>
            </div>
            <Typography variant="h4" className="my-2 font-bold">
              {completenessData.completenessPercentage}%
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              {completenessData.processedRecords}/{completenessData.originalRecords} records processed
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={completenessData.completenessPercentage} 
              className="mt-2 h-2 rounded-full bg-green-100"
              classes={{ bar: 'bg-green-500' }}
            />
          </Paper>
        </Grid>

        {/* Total Issues Card */}
        <Grid xs={12} md={4}>
          <Paper className="p-4 shadow-sm border-l-4 border-amber-500">
            <div className="flex items-center gap-2 text-amber-700">
              <WarningAmber />
              <Typography variant="subtitle1" className="font-medium">
                Data Issues
              </Typography>
            </div>
            <Typography variant="h4" className="my-2 font-bold">
              {totalIssues}
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Total issues found in processed data
            </Typography>
          </Paper>
        </Grid>

        {/* Critical Issues Card */}
        <Grid xs={12} md={4}>
          <Paper className="p-4 shadow-sm border-l-4 border-red-500">
            <div className="flex items-center gap-2 text-red-700">
              <ErrorOutline />
              <Typography variant="subtitle1" className="font-medium">
                Critical Issues
              </Typography>
            </div>
            <Typography variant="h4" className="my-2 font-bold">
              {criticalIssues}
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Requires immediate attention
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Issues Breakdown */}
      <Grid container spacing={3} className="mb-6">
        <Grid xs={12}>
          <Paper className="p-4 shadow-sm">
            <Typography variant="h6" className="font-bold mb-4 text-gray-800">
              Data Quality Issues Breakdown
            </Typography>
            <Grid container spacing={2}>
              {issueData.map((issue, index) => (
                <Grid xs={12} sm={6} md={3} key={index}>
                  <Box className={`p-3 rounded-lg border-l-4 ${
                    issue.severity === 'high' ? 'border-red-500 bg-red-50' :
                    issue.severity === 'medium' ? 'border-amber-500 bg-amber-50' :
                    'border-blue-500 bg-blue-50'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className={`${
                        issue.severity === 'high' ? 'text-red-500' :
                        issue.severity === 'medium' ? 'text-amber-500' :
                        'text-blue-500'
                      }`}>
                        {issue.icon}
                      </span>
                      <Typography variant="subtitle2" className="font-medium">
                        {issue.type}
                      </Typography>
                    </div>
                    <Typography variant="h5" className="mt-1 font-bold">
                      {issue.count}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Records Processing Visualization */}
      <Grid container spacing={3}>
        <Grid xs={12}>
          <Paper className="p-4 shadow-sm">
            <Typography variant="h6" className="font-bold mb-2 text-gray-800">
              Records Processing Status
            </Typography>
            <div className="flex justify-between mb-1 text-sm text-gray-600">
              <span>Processed: {completenessData.processedRecords} records</span>
              <span>Missing: {completenessData.missingRecords} records</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-green-500 h-4 rounded-full" 
                style={{ width: `${completenessData.completenessPercentage}%` }}
              ></div>
            </div>
          </Paper>
        </Grid>
      </Grid>



      {/* Data Validation Issues Table */}
      <Grid container spacing={3} className="mt-4">
        <Grid xs={12}>
          <Paper className="p-4 shadow-sm">
            <Typography variant="h6" className="font-bold mb-4 text-gray-800">
              Data Validation Issues ({validationIssues.length})
            </Typography>
            <div className="h-[300px] w-full">
              
            </div>
            <div className="mt-2 text-sm text-gray-600">
              These records were processed but contain data quality issues that need review
            </div>
          </Paper>
        </Grid>
      </Grid>

      {/* Color Legend */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <Typography variant="subtitle1" className="font-bold mb-2">
          Color Legend
        </Typography>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span>Critical Issues (Skipped Records)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 rounded-full"></div>
            <span>High Severity Validation Issues</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-100 rounded-full"></div>
            <span>Medium Severity Validation Issues</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 rounded-full"></div>
            <span>Expected/Correct Values</span>
          </div>
        </div>
      </div>

      {/* Additional KPI Cards */}
<Grid container spacing={3} className="mb-6">
  {/* Structure Validation Card */}
  <Grid xs={12} md={4}>
    <Paper className="p-4 shadow-sm border-l-4 border-blue-500">
      <div className="flex items-center gap-2 text-blue-700">
        <InfoOutlined />
        <Typography variant="subtitle1" className="font-medium">
          Structure Validation
        </Typography>
      </div>
      <Typography variant="h4" className="my-2 font-bold">
        {structureValidation.structureScore}%
      </Typography>
      <Typography variant="body2" className="text-gray-600">
        {structureValidation.missingColumns.length} missing, {structureValidation.extraColumns.length} extra columns
      </Typography>
    </Paper>
  </Grid>

  {/* Pattern Compliance Card */}
  <Grid xs={12} md={4}>
    <Paper className="p-4 shadow-sm border-l-4 border-purple-500">
      <div className="flex items-center gap-2 text-purple-700">
        <InfoOutlined />
        <Typography variant="subtitle1" className="font-medium">
          Pattern Compliance
        </Typography>
      </div>
      <div className="flex gap-4 my-2">
        <div>
          <Typography variant="h6" className="font-bold">
            {patternCompliance.vinFormatMatches}%
          </Typography>
          <Typography variant="caption">VINs</Typography>
        </div>
        <div>
          <Typography variant="h6" className="font-bold">
            {patternCompliance.dateFormatMatches}%
          </Typography>
          <Typography variant="caption">Dates</Typography>
        </div>
      </div>
    </Paper>
  </Grid>

  {/* Statistical Anomalies Card */}
  <Grid xs={12} md={4}>
    <Paper className="p-4 shadow-sm border-l-4 border-orange-500">
      <div className="flex items-center gap-2 text-orange-700">
        <WarningAmber />
        <Typography variant="subtitle1" className="font-medium">
          Statistical Anomalies
        </Typography>
      </div>
      <Typography variant="h4" className="my-2 font-bold">
        {valueDistribution.outlierValues}
      </Typography>
      <Typography variant="body2" className="text-gray-600">
        Outliers detected in numeric fields
      </Typography>
    </Paper>
  </Grid>
</Grid>
      
    </div>
  );
};

export default AxleFileValidationDashboard;