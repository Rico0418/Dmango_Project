import CircularProgress from '@mui/material/CircularProgress';

const LoadingScreen = () => {
    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'white'
        }}>
            <CircularProgress />
        </div>
    )
};
export default LoadingScreen;