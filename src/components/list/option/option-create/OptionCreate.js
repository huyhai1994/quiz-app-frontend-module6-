import React, {useEffect, useState} from 'react';
import {
    Box,
    Button,
    Checkbox,
    FormControl,
    FormControlLabel,
    InputLabel,
    OutlinedInput,
    Radio,
    RadioGroup,
    Typography
} from '@mui/material';
import Swal from 'sweetalert2';
import axios from 'axios';
import './OptionCreate.css';
import {useNavigate} from "react-router-dom";

const OptionCreate = () => {
    const [options, setOptions] = useState([]);
    const [questionId, setQuestionId] = useState(null);
    const [questionType, setQuestionType] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const storedQuestionId = localStorage.getItem('questionId');
        const storedQuestionType = localStorage.getItem('questionType');
        if (storedQuestionId) {
            setQuestionId(parseInt(storedQuestionId, 10));
        }
        if (storedQuestionType) {
            setQuestionType(parseInt(storedQuestionType, 10));
            initializeOptions(parseInt(storedQuestionType, 10));
        }
        setLoading(false);
    }, []);

    const initializeOptions = (type) => {
        let initialOptions = [];
        if (type === 1 || type === 2) {
            initialOptions = [
                {optionText: '', isCorrect: false},
                {optionText: '', isCorrect: false},
                {optionText: '', isCorrect: false},
                {optionText: '', isCorrect: false}
            ];
        } else if (type === 3) {
            initialOptions = [
                {optionText: 'True', isCorrect: false},
                {optionText: 'False', isCorrect: false}
            ];
        }
        setOptions(initialOptions);
    };

    const handleOptionChange = (index, field, value) => {
        const newOptions = [...options];
        if (field === 'isCorrect' && value === true && (questionType === 1 || questionType === 3)) {
            newOptions.forEach((option, i) => {
                option.isCorrect = i === index;
            });
        } else {
            newOptions[index][field] = value;
        }
        setOptions(newOptions);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!questionId) {
            Swal.fire('Thất bại', 'Không tìm thấy questionId trong localStorage', 'error');
            return;
        }
        const url = `http://localhost:8080/option/create/${questionId}`;

        try {
            await axios.post(url, options);
            Swal.fire({
                title: "Thành công", text: "Tùy chọn đã được tạo", icon: "success"
            });
            navigate('/teacher/question/create');
            localStorage.removeItem('questionId');
            localStorage.removeItem('questionType');
        } catch (error) {
            Swal.fire('Thất bại', error.response?.data || 'Xin vui lòng kiểm tra lại thông tin vừa nhập!', 'error');
            console.error("Error creating option", error);
        }
    };

    if (loading) {
        return <Typography>Loading...</Typography>;
    }

    return (
        <Box sx={{
            maxWidth: 600,
            margin: 'auto',
            mt: 4,
            border: '1px solid #ccc',
            borderRadius: 4,
            padding: 3,
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
        }}>
            <form onSubmit={handleSubmit}>
                {questionType === 1 && (
                    <RadioGroup>
                        {options.map((option, index) => (
                            <FormControl fullWidth margin="normal" key={index}>
                                <InputLabel htmlFor={`option-${index}`}>Tùy chọn {index + 1}</InputLabel>
                                <OutlinedInput
                                    id={`option-${index}`}
                                    name={`option-${index}`}
                                    value={option.optionText}
                                    onChange={(e) => handleOptionChange(index, 'optionText', e.target.value)}
                                    placeholder={`Nhập tùy chọn ${index + 1}`}
                                />
                                <FormControlLabel
                                    control={<Radio
                                        checked={option.isCorrect}
                                        onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked)}
                                    />}
                                    label="Đúng"
                                />
                            </FormControl>
                        ))}
                    </RadioGroup>
                )}
                {questionType === 2 && (
                    options.map((option, index) => (
                        <FormControl fullWidth margin="normal" key={index}>
                            <InputLabel htmlFor={`option-${index}`}>Tùy chọn {index + 1}</InputLabel>
                            <OutlinedInput
                                id={`option-${index}`}
                                name={`option-${index}`}
                                value={option.optionText}
                                onChange={(e) => handleOptionChange(index, 'optionText', e.target.value)}
                                placeholder={`Nhập tùy chọn ${index + 1}`}
                            />
                            <FormControlLabel
                                control={<Checkbox
                                    checked={option.isCorrect}
                                    onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked)}
                                />}
                                label="Đúng"
                            />
                        </FormControl>
                    ))
                )}
                {questionType === 3 && (
                    <RadioGroup>
                        {options.map((option, index) => (
                            <FormControl fullWidth margin="normal" key={index}>
                                <FormControlLabel
                                    control={<Radio
                                        checked={option.isCorrect}
                                        onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked)}
                                    />}
                                    label={option.optionText}
                                />
                            </FormControl>
                        ))}
                    </RadioGroup>
                )}
                <Button className='option-submit-button' variant="contained" fullWidth type="submit">
                    Tạo tùy chọn
                </Button>
            </form>
        </Box>
    );
};

export default OptionCreate;