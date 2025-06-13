import TableComponent from "../molecules/TableComponent";
const columns = [
    { field: "id", label: "ID"},
    { field: "description", label: "Guest House"},
    { field: "created_at", label: "Created At"},
]
const TableSuggestionAdmin = ({rows}) => {
    return (
        <div>
            <TableComponent columns={columns} rows={rows}/>
        </div>
    );
};
export default TableSuggestionAdmin;