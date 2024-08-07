import React, {useEffect, useState} from 'react';
import TeacherService from '../../../services/teacher.service';
import {useFormik} from "formik";

const TeacherList = () => {
    const [teachers, setTeachers] = useState([]);

    const formik = useFormik({
        initialValues: {
            name: '',
            email: '',
        },
        onSubmit: async (values) => {
            try {
                const response = await TeacherService.getTeacherByNameAndEmail(values.name, values.email);
                setTeachers(response.data);
            } catch (error) {
                console.error('Error fetching teachers by name and email:', error);
                setTeachers([]);
            }
        },
    });
    useEffect(() => {
        if (formik.values.name || formik.values.email) {
            TeacherService.getTeacherByNameAndEmail(formik.values.name, formik.values.email).then((response) => {
                setTeachers(response.data);
            })
        } else {
            TeacherService.getAllTeachers().then((response) => {
                setTeachers(response.data);
            })
        }
    }, []);

    return (
        <div>
            <h1 className='d-flex align-items-between justify-content-between'>Teacher List <form
                className="d-flex mx-1 my-2" role="search"
                onSubmit={formik.handleSubmit}
            >
                <input className="form-control me-2" type="search" placeholder="name"
                       aria-label="Search"
                       name="name"
                       value={formik.values.name}
                       onChange={formik.handleChange}
                />
                <input className="form-control me-2" type="search" placeholder="email"
                       aria-label="Search"
                       name="email"
                       value={formik.values.email}
                       onChange={formik.handleChange}
                />
                <button className="btn btn-outline-success" type="submit">Search</button>
            </form>
            </h1>
            <table className="table table-striped">
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Registered At</th>
                    <th>Last Login</th>
                </tr>
                </thead>
                <tbody>
                {teachers.map(teacher => (
                    <tr key={teacher.id}>
                        <td>{teacher.name}</td>
                        <td>{teacher.email}</td>
                        <td>{teacher.registeredAt}</td>
                        <td>{teacher.lastLogin}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default TeacherList;
