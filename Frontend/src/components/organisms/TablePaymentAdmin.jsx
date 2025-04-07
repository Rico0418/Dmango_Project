import TableComponent from "../molecules/TableComponent";
const columns = [
    { field: "id", label: "ID"},
    { field: "booking_id", label: "ID Booking"},
    { field: "amount", label: "Amount"},
    { field: "method", label: "Method"},
    { field: "created_at", label: "Created At"},
    { field: "status", label: "Status"},
]
const TablePaymentAdmin = ({rows}) => {
    return (
        <div>
            <TableComponent columns={columns} rows={rows}/>
        </div>
    );
};
export default TablePaymentAdmin;