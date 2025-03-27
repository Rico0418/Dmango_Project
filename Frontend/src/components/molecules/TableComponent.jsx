import React, { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
    Button
} from "@mui/material";

const TableComponent = ({ columns, rows }) => {
    const [page, setPage] = useState(0); 
    const [rowsPerPage, setRowsPerPage] = useState(5); 

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };


    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); 
    };

    return (
        <TableContainer component={Paper} sx={{ maxWidth: 800, margin: "auto", mt: 4 }}>
            <Table>
                <TableHead>
                    <TableRow>
                        {columns.map((column, index) => (
                            <TableCell key={index} sx={{ fontWeight: "bold", textAlign:"center" }}>
                                {column.label}
                            </TableCell>
                        ))}
                        <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Actions</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                            {columns.map((column, colIndex) => (
                                <TableCell key={colIndex} sx={{ textAlign: "center" }}>{row[column.field]}</TableCell>
                            ))}
                             <TableCell sx={{ textAlign: "center" }}>
                                {row.actions && row.actions.map((action, actionIndex) => (
                                    <Button
                                        key={actionIndex}
                                        variant="contained"
                                        color={action.color || "primary"}
                                        size="small"
                                        sx={{ ml: actionIndex > 0 ? 1 : 0 }}
                                        onClick={() => action.onClick(row)}
                                    >
                                        {action.label}
                                    </Button>
                                ))}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>


            <TablePagination
                rowsPerPageOptions={[5, 10, 25]} 
                component="div"
                count={rows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </TableContainer>
    );
};

export default TableComponent;
