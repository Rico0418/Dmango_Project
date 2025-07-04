import TableComponent from "../molecules/TableComponent";
const columns = [
    { field: "id", label: "ID"},
    { field: "guest_house_name", label: "Guest House"},
    { field: "room_number", label: "Room Number"},
    { field: "type", label: "Room Type"},
    { field: "price_per_day", label: "Price Per Day"},
    { field: "price_per_month", label: "Price Per Month"},
    { field: "facilities", label: "Facilities"},
    { field: "status", label: "Status"},
]
const TableRoomAdmin = ({rows}) => {
    return (
        <div>
            <TableComponent columns={columns} rows={rows}/>
        </div>
    );
};
export default TableRoomAdmin;