import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import HistoryIcon from '@mui/icons-material/History';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {Link} from 'react-router-dom';

import axios from 'axios';
import {useDispatch, useSelector} from "react-redux";
import {useEffect, useState} from "react";
import {DeleteQuestion, ListTeacherQuestion} from "../../../store/questionStore/QuestionAxios";
import {TailSpin} from "react-loader-spinner";
import Swal from "sweetalert2";
import Page from "../../pages/Page";
import {format} from "date-fns"; // Import axios for API call

// Existing imports...

const ListTeacherQuestions = () => {
    const dispatch = useDispatch();
    const {questions, loading, error} = useSelector((state) => state.questions);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 20;
    const userId = localStorage.getItem('userId');
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedQuestionId, setSelectedQuestionId] = useState(null);
    const [questionDetail, setQuestionDetail] = useState(null); // State to store question details
    const [openModal, setOpenModal] = useState(false); // State to manage modal visibility

    useEffect(() => {
        dispatch(ListTeacherQuestion(userId));
    }, [dispatch]);

    const handleRowClick = (id) => {
        getQuestionDetail(id);
        setOpenModal(true);
    };

    const getQuestionDetail = async (id) => {
        try {
            const response = await axios.get(`http://localhost:8080/question/specific-question/${id}`);
            setQuestionDetail(response.data);
        } catch (error) {
            Swal.fire('Lỗi', 'Không thể tải chi tiết câu hỏi', 'error');
        }
    };

    const handleDelete = (id) => {
        setSelectedQuestionId(id);
        setOpenDialog(true);
    };

    const confirmDelete = () => {
        dispatch(DeleteQuestion(selectedQuestionId)).then(() => {
            setOpenDialog(false);
            setSelectedQuestionId(null);
        });
    };

    useEffect(() => {
        if (error) {
            Swal.fire('Lỗi', error, 'error');
        }
    }, [error]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{height: '100vh'}}>
                <TailSpin color="#00BFFF" height={80} width={80}/>
            </div>
        );
    }

    const totalPages = Math.ceil(questions.length / pageSize);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const getCurrentPageData = () => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return questions.slice(startIndex, endIndex);
    };

    const mapTypeName = (typeName) => {
        switch (typeName) {
            case "ONE":
                return "Một câu";
            case "MANY":
                return "Nhiều câu";
            case "TRUE_FALSE":
                return "Đúng/Sai";
            default:
                return typeName;
        }
    };

    const currentData = getCurrentPageData();

    return (
        <Grid container spacing={2} className='p-3'>
            <Grid item xs={12}>
                <h2 className='fw-bold text-center'>Danh sách câu hỏi của giáo viên</h2>
            </Grid>
            <Grid item xs={12}>
                <TableContainer component={Paper}>
                    <Table aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>STT</TableCell>
                                <TableCell>Câu hỏi</TableCell>
                                <TableCell>Danh mục</TableCell>
                                <TableCell>Loại câu hỏi</TableCell>
                                <TableCell>Thời gian tạo</TableCell>
                                <TableCell>Hành động</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {currentData.length > 0 ? (
                                currentData.map((question, index) => (
                                    <TableRow
                                        key={question.questionId}
                                        className="question-row"
                                        onClick={() => handleRowClick(question.questionId)} // Handle row click
                                    >
                                        <TableCell>{(currentPage - 1) * pageSize + index + 1}</TableCell>
                                        <TableCell>{question.questionText}</TableCell>
                                        <TableCell>{question.categoryName}</TableCell>
                                        <TableCell>{mapTypeName(question.typeName)}</TableCell>
                                        <TableCell>{format(new Date(question.timeCreate), 'dd-MM-yyyy - HH:mm:ss')}</TableCell>
                                        <TableCell>
                                            <div className="action-icons">
                                                <Button
                                                    variant="standard"
                                                    startIcon={<DeleteIcon/>}
                                                    style={{color: 'red'}}
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent triggering row click
                                                        handleDelete(question.questionId)
                                                    }}
                                                    className="icon-button"
                                                />
                                                <Button
                                                    variant="standard"
                                                    startIcon={<EditIcon/>}
                                                    component={Link}
                                                    to={`/teacher/question/edit/${question.questionId}`}
                                                    onClick={(e) => e.stopPropagation()} // Prevent triggering row click
                                                    className="icon-button"
                                                />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan="6">Không có dữ liệu</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
            <Grid item xs={12} className='d-flex align-items-center justify-content-center'>
                <Page
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            </Grid>

            {/* Modal to show question details */}
            <Dialog
                open={openModal}
                onClose={() => setOpenModal(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle className='h4' style={{fontWeight: 'bold', fontSize: '1.5rem', textAlign: 'center'}}>Chi
                    tiết câu
                    hỏi</DialogTitle>

                <Typography style={{textAlign: 'center'}} variant="h5"
                            gutterBottom>{questionDetail.questionText}</Typography>
                <DialogContent dividers style={{padding: '30px', textAlign: 'center'}}>
                    {questionDetail ? (
                        <>
                            <Typography variant="h6" gutterBottom>Danh mục: {questionDetail.category}</Typography>
                            <Typography variant="h6" gutterBottom>Độ khó: {questionDetail.difficulty}</Typography>
                            <Typography variant="h6"
                                        gutterBottom>Loại: {mapTypeName(questionDetail.typeName)}</Typography>
                            <Typography variant="h6" gutterBottom>Các lựa chọn:</Typography>
                            <ul style={{listStyleType: 'none', paddingLeft: 0, fontSize: '1.2rem'}}>
                                {questionDetail.options.map(option => (
                                    <li key={option.id}
                                        style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                        <CheckCircleIcon style={{marginRight: '8px', color: 'green'}}/>
                                        {option.optionText}
                                    </li>
                                ))}
                            </ul>
                            <Box display="flex" justifyContent="space-between" alignItems="center" width="100%" mt={3}>
                                <Typography variant="subtitle1" display="flex" alignItems="center">
                                    <AccountCircleIcon style={{marginRight: '5px'}}/>
                                    Người tạo: {questionDetail.createdBy}
                                </Typography>
                                <Typography variant="body2">
                                    <HistoryIcon/> Tạo
                                    lúc {format(new Date(questionDetail.timeCreate), 'dd-MM-yyyy - HH:mm:ss')}
                                </Typography>
                            </Box>
                        </>
                    ) : (
                        <Typography>Đang tải...</Typography>
                    )}
                </DialogContent>
                <DialogActions style={{justifyContent: 'center'}}>
                    <IconButton
                        onClick={() => setOpenModal(false)}
                        style={{color: 'red'}}
                    >
                        <CloseIcon/>
                    </IconButton>
                </DialogActions>
            </Dialog>

            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
            >
                <DialogTitle>Xác nhận xóa</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Bạn có chắc chắn muốn xóa câu hỏi này? Bạn sẽ không thể hoàn tác hành động này!
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} color="primary">
                        Hủy
                    </Button>
                    <Button onClick={confirmDelete} color="secondary">
                        Xóa
                    </Button>
                </DialogActions>
            </Dialog>
        </Grid>
    );
};

export default ListTeacherQuestions;
