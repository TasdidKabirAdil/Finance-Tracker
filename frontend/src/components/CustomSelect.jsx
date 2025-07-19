import Select from 'react-select'

export const CustomSelect1 = ({ options, value, onChange }) => {
    const customStyles = {
        input: (provided) => ({
            ...provided,
            color: 'white',
        }),

        control: (provided, state) => ({
            ...provided,
            fontSize: 'clamp(0.8rem, 3vw, 0.9rem)',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            border: 'none',
            borderBottom: '1px solid #008080',
            borderRadius: '4px',
            width: '100%',
            minHeight: '33px',
            color: 'white',
            boxShadow: 'none',
            '&:hover': {
                borderColor: '#4bb692',
            },
        }),

        dropdownIndicator: (provided) => ({
            ...provided,
            padding: 4,
        }),
        menu: (provided) => ({
            ...provided,
            fontSize: 'clamp(0.8rem, 3vw, 0.9rem)',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            borderRadius: '4px',
            overflow: 'hidden',
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isFocused ? '#009191' : 'transparent',
            color: 'white',
            cursor: 'pointer',
        }),
        singleValue: (provided) => ({
            ...provided,
            color: 'white',
        }),
    }

    return (
        <Select
            options={options}
            styles={customStyles}
            getOptionLabel={(e) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span
                        style={{
                            backgroundColor: e.color,
                            padding: '2px 8px',
                            borderRadius: '12px',
                        }}
                    >
                        {e.label}
                    </span>
                </div>
            )}
            value={options.find((o) => o.value === value)}
            onChange={(opt) => onChange(opt.value)}
        />
    )
}

export const CustomSelect2 = ({ options, value, onChange, isDisabled = false, padding = '0px' }) => {
    const customStyles = {
        input: (provided) => ({
            ...provided,
            color: 'white',
        }),

        control: (provided, state) => ({
            ...provided,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            border: 'none',
            borderBottom: '1px solid #008080',
            borderRadius: '4px',
            width: '100%',
            minWidth: '60px',
            minHeight: '33px',
            padding,
            color: 'white',
            fontSize: 'clamp(0.7rem, 3vw, 0.8rem)',
            boxShadow: 'none',
            opacity: isDisabled ? 0.5 : 1,
            cursor: isDisabled ? 'not-allowed' : 'default',
            '&:hover': {
                borderColor: '#4bb692',
            },
        }),

        dropdownIndicator: (provided) => ({
            ...provided,
            padding: 4,
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            fontSize: 'clamp(0.7rem, 3vw, 0.8rem)',
            borderRadius: '4px',
            overflow: 'hidden',
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isFocused ? '#008080' : 'transparent',
            color: 'white',
            cursor: 'pointer',
        }),
        singleValue: (provided) => ({
            ...provided,
            color: 'white',
        }),
    }

    return (
        <Select
            options={options}
            styles={customStyles}
            value={options.find((o) => o.value === value)}
            onChange={(opt) => onChange(opt.value)}
            isDisabled={isDisabled}
        />
    )
}