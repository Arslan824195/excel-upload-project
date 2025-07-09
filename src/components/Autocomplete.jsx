import { Fragment, createContext, forwardRef, useContext, useEffect, useMemo, useRef } from 'react';
import { useTheme, styled } from '@mui/material/styles';
import { VariableSizeList } from 'react-window';
import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete';
import useMediaQuery from '@mui/material/useMediaQuery';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import Chip from '@mui/material/Chip';
import Popper from '@mui/material/Popper';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

const icon = <CheckBoxOutlineBlankIcon fontSize = "small" />;
const checkedIcon = <CheckBoxIcon fontSize = "small" />;

function renderRow(props) 
{
    const { data, index, style } = props;
    const dataSet = data[index];
    const selected = dataSet[2]?.selected || false;
    const filterOn = dataSet[4];
    const isMultiple = dataSet[5] || false;
    const isObject = dataSet[6] || false;
    const selectedDeal = dataSet[7] || "";
    const counterPartyStatusColors = {
        "Proceed with Caution": "#B8860B",
        "Future Transaction Blocked": "red",
        "On-Boarded and Available to Use": "green"
    };
    
    const inlineStyle = { 
        ...style, 
        top: style.top, 
        borderBottom: '1px solid #f0f0f0', 
        padding: '0 5px', 
        height: 'fit-content',
        fontSize: '14px',
        color: filterOn === "Counter Party Status" ? counterPartyStatusColors[dataSet[1]] || 'black' : 'black'
    };
    const { ...componentProps } = dataSet[0];

    return (
        <Typography component = "li" {...componentProps} style = {inlineStyle}>
            {isMultiple && (
                <Checkbox
                    icon = {icon}
                    checkedIcon = {checkedIcon}
                    checked = {selected}
                    size = "small"
                    sx = {{ 
                        paddingTop: 0, 
                        paddingBottom: 0
                    }}
                />
            )}
            {isObject 
                ? `${selectedDeal || ''}${dataSet[1].value === "SBLC" ? "Polymers - SBLC" : dataSet[1].value}` 
                : dataSet[1] === "SBLC" 
                    ? "Polymers - SBLC" 
                    : dataSet[1]}
        </Typography>
    );
}

const OuterElementContext = createContext({});

const OuterElementType = forwardRef((props, ref) => 
{
    const outerProps = useContext(OuterElementContext);
    return <div ref = {ref} {...props} {...outerProps} />;
});

function useResetCache(data) 
{
    const ref = useRef(null);

    useEffect(() => 
    {
        if (ref.current !== null) 
        {
            ref.current.resetAfterIndex(0, true);
        }

    }, [data]);

    return ref;
}

const ListboxComponent = forwardRef(function ListboxComponent(props, ref) 
{
    const { children, ...other } = props;
    const itemData = [];

    children.forEach((item) => 
    {
        itemData.push(item);
        itemData.push(...(item.children || []));
    });

    const theme = useTheme();
    const smUp = useMediaQuery(theme.breakpoints.up('sm'), { noSsr: true });
    const itemCount = itemData?.length;
    const itemSize = smUp ? 20 : 30;

    const getChildSize = () => 
    {
        return itemSize;
    };

    const getHeight = () => 
    {
        if (itemCount > 8) 
        {
            return 8 * itemSize;
        }

        return itemData.map(getChildSize).reduce((a, b) => a + b, 0);
    };

    const gridRef = useResetCache(itemCount);

    return (
        <div ref = {ref}>
            <OuterElementContext.Provider value = {other}>
                <VariableSizeList
                    ref = {gridRef}
                    itemData = {itemData}
                    height = {getHeight() + 2}
                    width = "100%"
                    outerElementType = {OuterElementType}
                    innerElementType = "ul"
                    itemSize = {(index) => getChildSize(itemData[index])}
                    overscanCount = {5}
                    itemCount = {itemCount}
                >
                    {renderRow}
                </VariableSizeList>
            </OuterElementContext.Provider>
        </div>
    );
});

const StyledPopper = styled(Popper)(
{
    [`& .${autocompleteClasses.listbox}`]: 
    {
        boxSizing: 'border-box',
        '& ul': {
            padding: 0,
            margin: 0
        }
    }
},
({ maxLength }) => (
{
    minWidth: maxLength
}));

export default function VirtualizedAutocomplete({ isLoading = false, isMultiple = false, isObject = false, isRequired = false, isDisabled = false, isPlaceHolder = false, isWritable = false, filterOn = "", options = [], originalSelectedOptions = null, selectedOptions = null, selectedDeal = null, handleSelectChange = () => {} }) 
{
    const getMaxLength = useMemo(() => options.reduce((max, current) => Math.max(max, (isObject ? current?.value?.length : current?.length || 0)), 0) * 0.5 * 20 + 40, [options, isObject]);
    const PopperComponent = useMemo(() => (props) => <StyledPopper {...props} maxLength = {getMaxLength} />, [getMaxLength]);
    const inputRef = useRef(null);

    return (
        <Autocomplete
            size = "small"
            sx = {{ width: '100%' }}
            loading = {isLoading}
            forcePopupIcon = {true}
            autoHighlight = {true}
            clearOnBlur = {true}
            disableClearable = {true}
            disableCloseOnSelect = {isMultiple}
            multiple = {isMultiple}
            limitTags = {1}
            disabled = {isDisabled}
            readOnly = {!isWritable}
            options = {options}
            value = {selectedOptions}
            renderOption = {(props, option, state) => [props, option, state, state.index, filterOn, isMultiple, isObject, selectedDeal]}
            isOptionEqualToValue = {(option, value) => 
            {
                if (isObject && option !== null && value !== null) 
                {
                    return option.id === value.id;
                }
                
                return option === value;
            }}
            getOptionLabel = {(option) => 
            {
                if (isObject && option) 
                {
                    let value = option.value?.toString() || "";
                    return value === "SBLC" ? "Polymers - SBLC" : value;
                }
                
                return option ? (option === "SBLC" ? "Polymers - SBLC" : option.toString()) : "";
            }}
            getOptionDisabled = {(option) =>
            {
                if (filterOn === "Nature of Business Relation" && option)
                {
                    return JSON.parse(originalSelectedOptions)?.includes(option);
                }

                return false;
            }}
            onChange = {(event, newValue) => 
            {
                const isInvalid = isRequired ? isMultiple ? newValue.length === 0 : !newValue : false;

                if (isInvalid) 
                {
                    inputRef?.current?.setCustomValidity("Please select at least one option.");
                } 
                else 
                {
                    inputRef?.current?.setCustomValidity("");
                }
                
                inputRef?.current?.reportValidity();  
                handleSelectChange(filterOn, newValue);
            }}
            onInputChange = {(event, newValue) => 
            {
                if (!newValue)
                {
                    handleSelectChange(filterOn, newValue)
                }
            }}
            slots = {{
                popper: PopperComponent
            }}
            slotProps = {{
                listbox: {
                    component: ListboxComponent
                }
            }}
            renderTags = {(values, getTagProps) => 
            {
                const parsedOriginalSelectedOptions = filterOn === "Nature of Business Relation" ? JSON.parse(originalSelectedOptions || "[]") : [];            
                const disabledValues = new Set(parsedOriginalSelectedOptions);
            
                return (
                    <>
                        {values.map((value, index) => 
                        {
                            const isChipDisabled = isDisabled || disabledValues.has(value);
            
                            const chipProps = {
                                ...getTagProps(index),
                                disabled: isChipDisabled
                            };
            
                            if (index === 0) 
                            {
                                return (
                                    <Chip
                                        key = {value}
                                        size = "small"
                                        label = {isObject ? value?.value : value}
                                        sx = {{
                                            height: '22px',
                                            margin: '0 2px',
                                        }}
                                        {...{ ...chipProps, key: undefined }}
                                    />
                                );
                            }
                            
                            return null;
                        })}
            
                        {values.length > 1 && (
                            <small className = "MuiAutocomplete-tag MuiAutocomplete-tagSizeSmall">
                                +{values.length - 1}
                            </small>
                        )}
                    </>
                );
            }}                       
            renderInput = {(params) => 
            {
                const counterPartyStatusColors = {
                    "Proceed with Caution": "#B8860B",
                    "Future Transaction Blocked": "red",
                    "On-Boarded and Available to Use": "green"
                };
                
                return (
                    <TextField 
                        { ...params }
                        inputRef = {inputRef}
                        size = "small" 
                        margin = "dense"
                        label = {isPlaceHolder ? "" : filterOn}
                        placeholder = {isPlaceHolder ? filterOn : ""}
                        required = {isRequired ? isMultiple ? selectedOptions?.length === 0 : !selectedOptions : false}
                        sx = {{
                            '& .MuiInputBase-input': {
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                fontSize: '12px',
                                color: filterOn === "Counter Party Status" ? counterPartyStatusColors[selectedOptions] || 'black' : 'black'
                            }
                        }}
                        slotProps = {{
                            input: {
                                ...params.InputProps,
                                endAdornment: (
                                    <Fragment>
                                        {isLoading ? <CircularProgress color = "inherit" size = {20} /> : null}
                                        {params.InputProps.endAdornment}
                                    </Fragment>
                                )
                            }
                        }}
                        onKeyDown = {(event) =>
                        {
                            if (filterOn === "Nature of Business Relation")
                            {
                                const parsedOriginalSelectedOptions = JSON.parse(originalSelectedOptions || "[]");
                                const disabledValues = new Set(parsedOriginalSelectedOptions);
                                const lastOption = selectedOptions[selectedOptions.length - 1];
                                const isLastOptionDisabled = disabledValues.has(lastOption);

                                if (isLastOptionDisabled && event.key === "Backspace")
                                {
                                    event.stopPropagation();
                                }
                            }
                        }}
                    />
                );
            }}       
        />
    );
}