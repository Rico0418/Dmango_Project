import { TextField } from "@mui/material";
const InputLabel = ({name,type,onChange,label,value}) => {
    return(
        <div>
            <TextField name={name} type={type} onChange={onChange} label={label} value={value} />
        </div>
    );
};
export default InputLabel;