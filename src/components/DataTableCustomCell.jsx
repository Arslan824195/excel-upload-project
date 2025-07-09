import { memo, useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';

function isOverflown(element) 
{
    return (
        element.scrollHeight > element.clientHeight ||
        element.scrollWidth > element.clientWidth
    );
}

const CustomCell = memo(function CustomCell(props) 
{
    const { value, isNumber, width } = props;
    const [anchorEl, setAnchorEl] = useState(null);
    const [showFullCell, setShowFullCell] = useState(false);
    const [showPopper, setShowPopper] = useState(false);
    const wrapper = useRef(null);
    const cellDiv = useRef(null);
    const cellValue = useRef(null);

    useEffect(() => 
    {
        const isCurrentlyOverflown = isOverflown(cellValue.current);
        setShowPopper(isCurrentlyOverflown);
    }, [value]);

    useEffect(() => 
    {
        if (!showFullCell) return;

        const handleKeyDown = (nativeEvent) => 
        {
            if (nativeEvent.key === "Escape") 
            {
                setShowFullCell(false);
            }
        }

        document.addEventListener("keydown", handleKeyDown);

        return () => 
        {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [showFullCell]);

    const handleMouseEnter = () => 
    {
        setAnchorEl(cellDiv.current);
        setShowFullCell(true);
    }

    const handleMouseLeave = () => 
    {
        setShowFullCell(false);
    }
    
    return (
        <Box
            ref = {wrapper}
            onMouseEnter = {handleMouseEnter}
            onMouseLeave = {handleMouseLeave}
            sx = {{
                alignItems: 'center',
                lineHeight: '24px',
                width: '100%',
                height: '100%',
                position: 'relative',
                display: 'flex',
                justifyContent: isNumber ? 'flex-end' : 'flex-start'
            }}
        >
            <Box
                ref = {cellDiv}
                sx = {{
                    height: '100%',
                    width,
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    userSelect: 'text',
                    pointerEvents: 'none'
                }}
            />

            <Box
                ref = {cellValue}
                className = "cellValue"
                sx = {{ 
                    // whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    fontSize: '12px'
                }}
            >
                {![null, undefined, "", "null"].includes(value) ? isNumber ? new Intl.NumberFormat().format(value || 0) : value : null}
            </Box>

            {showPopper && (
                <Popper
                    open = {showFullCell && anchorEl !== null}
                    anchorEl = {anchorEl}
                    sx = {{ width: 'fit-content', maxWidth: '200px', top: '6px !important', left: '-8px !important', zIndex: 6 }}
                >
                    <Paper
                        elevation = {1}
                        sx = {{ minHeight: wrapper.current.offsetHeight - 3, borderTopLeftRadius: 0, borderTopRightRadius: 0, marginTop: '2px' }}
                    >
                        <Typography variant = "body2" sx = {{ padding: '0.8em' }}>
                            {value}
                        </Typography>
                    </Paper>
                </Popper>
            )}
        </Box>
    );
});

export function RenderCustomCell(props) 
{
    return (
        <CustomCell
            value = {(props?.value !== null || props?.value !== undefined) ? props?.value?.toString() : ""}
            width = {props?.width}
            isNumber = {props?.isNumber || false}
        />
    );
}