import TableComponent from "../molecules/TableComponent";
const columns = [
    { field: "id", label: "ID"},
    { field: "room_number", label: "Room Number"},
    { field: "email", label: "User Email"},
    { field: "description", label: "Description"},
    { field: "created_at", label: "Created At"},
    { field: "status", label: "Status"},
]
const TableComplaintAdmin = ({rows}) => {
    return (
        <div>
            <TableComponent columns={columns} rows={rows}/>
        </div>
    );
};
export default TableComplaintAdmin;