// pages/ExcelUploadPage.jsx
import { Padding } from '@mui/icons-material';
import { Grid } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';

const ExcelTablePage = () => {
    const [tableData, setTableData] = useState([]);

    // const handleFileUpload = (e) => {
    //     const file = e.target.files[0];

    //     if (!file) return;

    //     const reader = new FileReader();

    //     reader.onload = (evt) => {
    //         const data = new Uint8Array(evt.target.result);
    //         const workbook = XLSX.read(data, { type: 'array' });
    //         const sheetName = workbook.SheetNames[0];
    //         const worksheet = workbook.Sheets[sheetName];
    //         const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // include header row
    //         setTableData(jsonData);
    //     };

    //     reader.readAsArrayBuffer(file);
    // };


    // ✅ GET request: Fetch processed data from Python backend
    const fetchProcessedData = async () => {
        try {
            const response = await axios.get('http://localhost:5000/processed-data');
            setTableData(response.data);
        } catch (error) {
            console.error('Error fetching processed data:', error);
            alert('Failed to load processed data.');
        }
    }

    useEffect(() => {
        fetchProcessedData();
    }, [])


    //  Upload file to backend on file selection
    const handleFileUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await axios.post('http://localhost:5000/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        console.log('Upload response:', response.data);
        alert('File uploaded successfully!');
        fetchProcessedData();
    } catch (error) {
        console.error('Upload failed:', error.message);
        alert('File upload failed!');
    }
};




    return (
        <Grid container direction="column" spacing={2} justifyContent="flex-start" alignItems="center" style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
            {/* Heading  */}
            <Grid item>
                <h2 className="text-2xl font-bold mb-4 ">Upload Excel File</h2>
            </Grid>
            {/* Input File  */}
            <Grid item>
                <label
                    htmlFor="fileUpload"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded cursor-pointer inline-block"
                >
                    Upload Excel File
                </label>
                <input
                    id="fileUpload"
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileUpload}
                    className="hidden"
                />
            </Grid>

            {/* Table  */}
            <Grid item style={{ width: '90%', overflowY: 'auto', maxHeight: '60vh', marginTop: '1rem' }} >
                <table className="table-auto w-full border " >
                    <thead >
                        <tr >
                            {tableData[0]?.map((header, index) => (
                                <th key={index} className="border px-2 py-1 text-sm" style={{ background: '#6172D8', color: 'white' }}>{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.slice(1).map((row, i) => (
                            <tr key={i}>
                                {row.map((cell, j) => (
                                    <td key={j} className="border px-2 py-1 text-sm">{cell}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Grid>
        </Grid>
    );
};

export default ExcelTablePage;
