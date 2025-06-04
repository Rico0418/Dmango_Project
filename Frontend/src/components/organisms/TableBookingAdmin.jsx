import TableComponent from "../molecules/TableComponent";
const columns = [
    { field: "id", label: "ID"},
    { field: "guest_house_name", label: "Guest House"},
    { field: "room_number", label: "Room Number"},
    { field: "email", label: "User Email"},
    { field: "start_date", label: "Start Date"},
    { field: "end_date", label: "End Date"},
    { field: "created_at", label: "Created At"},
    { field: "status", label: "Status"},
]
const TableBookingAdmin = ({rows}) => {
    return (
        <div>
            <TableComponent columns={columns} rows={rows}/>
        </div>
    );
};
export default TableBookingAdmin;