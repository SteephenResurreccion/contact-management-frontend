// src/components/ContactFormModal.jsx
import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col, InputGroup } from "react-bootstrap";
import { FaPlus, FaMinus, FaExternalLinkAlt } from "react-icons/fa";

const emptyForm = {
    firstName: "", lastName: "", email: "", phone: "",
    profilePicture: "", company: "", jobTitle: "", address: "",
    socialMedia: [], notes: "", starred: false,
};

function isValidPhone(phone) {
    const digitsOnly = phone.replace(/\D/g, "");
    return digitsOnly.length >= 10 && digitsOnly.length <= 15;
}

export default function ContactFormModal({ show, mode, initial, onClose, onSave }) {
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (initial && mode === "edit") {
            setForm({
                firstName: initial.firstName || "",
                lastName: initial.lastName || "",
                email: initial.email || "",
                phone: initial.phone || "",
                profilePicture: initial.profilePicture || "",
                company: initial.company || "",
                jobTitle: initial.jobTitle || "",
                address: initial.address || "",
                socialMedia: initial.socialMedia || [],
                notes: initial.notes || "",
                starred: initial.starred || false,
            });
        } else {
            setForm(emptyForm);
        }
        setErrors({});
    }, [initial, mode, show]);

    function handleChange(field) {
        return (e) => {
            const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
            setForm((prev) => ({ ...prev, [field]: value }));
        };
    }

    function handleSocialMediaChange(index, value) {
        const newSocialMedia = [...form.socialMedia];
        newSocialMedia[index] = value;
        setForm((prev) => ({ 
            ...prev, 
            socialMedia: newSocialMedia.filter(link => link.trim() !== '' || index === newSocialMedia.length - 1)
        }));
    }
    
    function addSocialMediaField() {
        setForm((prev) => ({ ...prev, socialMedia: [...prev.socialMedia, ""] }));
    }
    
    function removeSocialMediaField(index) {
        const newSocialMedia = form.socialMedia.filter((_, i) => i !== index);
        setForm((prev) => ({ ...prev, socialMedia: newSocialMedia }));
    }

    function handleSubmit(e) {
        e.preventDefault();
        const newErrors = {};
        if (!form.firstName.trim()) newErrors.firstName = "First Name is required.";
        if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = "Invalid email.";
        if (!form.phone.trim()) newErrors.phone = "Phone is required.";
        else if (!isValidPhone(form.phone)) newErrors.phone = "Invalid phone.";

        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
        setErrors({});
        onSave(form);
    }

    const title = mode === "edit" ? "Edit Contact" : "Add New Contact";
    const socialMediaDisplay = form.socialMedia.length === 0 && mode !== 'edit' ? [""] : form.socialMedia;

    return (
        <Modal show={show} onHide={onClose} size="lg" centered>
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton><Modal.Title>{title}</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Row className="mb-3">
                        <Form.Group as={Col} md={12}>
                            <Form.Label>Profile Picture (URL)</Form.Label>
                            <Form.Control type="url" value={form.profilePicture} onChange={handleChange("profilePicture")} placeholder="https://example.com/image.jpg" />
                        </Form.Group>
                    </Row>
                    <Row className="mb-3">
                        <Form.Group as={Col} md={6}>
                            <Form.Label>First Name <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" value={form.firstName} onChange={handleChange("firstName")} isInvalid={!!errors.firstName} placeholder="First Name" />
                            <Form.Control.Feedback type="invalid">{errors.firstName}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group as={Col} md={6}>
                            <Form.Label>Last Name</Form.Label>
                            <Form.Control type="text" value={form.lastName} onChange={handleChange("lastName")} placeholder="Last Name" />
                        </Form.Group>
                    </Row>
                    <Row className="mb-3">
                        <Form.Group as={Col} md={6}>
                            <Form.Label>Phone <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" value={form.phone} onChange={handleChange("phone")} isInvalid={!!errors.phone} placeholder="+63 900 000 0000" />
                            <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group as={Col} md={6}>
                            <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="email" value={form.email} onChange={handleChange("email")} isInvalid={!!errors.email} placeholder="name@example.com" />
                            <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                        </Form.Group>
                    </Row>
                    <Row className="mb-3">
                        <Form.Group as={Col} md={6}>
                            <Form.Label>Affiliation/Company</Form.Label>
                            <Form.Control type="text" value={form.company} onChange={handleChange("company")} placeholder="Company Name" />
                        </Form.Group>
                        <Form.Group as={Col} md={6}>
                            <Form.Label>Job Title/Role</Form.Label>
                            <Form.Control type="text" value={form.jobTitle} onChange={handleChange("jobTitle")} placeholder="Role/Title" />
                        </Form.Group>
                    </Row>
                    <Row className="mb-3">
                        <Form.Group as={Col}>
                            <Form.Label>Address</Form.Label>
                            <Form.Control as="textarea" rows={2} value={form.address} onChange={handleChange("address")} placeholder="Full mailing address" />
                        </Form.Group>
                    </Row>
                    <Row className="mb-3">
                        <Col>
                            <Form.Label>Social Media Links</Form.Label>
                            {socialMediaDisplay.map((link, index) => (
                                <InputGroup key={index} className="mb-2">
                                    <InputGroup.Text><FaExternalLinkAlt /></InputGroup.Text>
                                    <Form.Control type="url" placeholder={`Enter URL for link #${index + 1}`} value={link} onChange={(e) => handleSocialMediaChange(index, e.target.value)} />
                                    {form.socialMedia.length > 0 && (
                                        <Button variant="outline-danger" onClick={() => removeSocialMediaField(index)} disabled={mode !== 'edit' && index === socialMediaDisplay.length - 1 && form.socialMedia.length === 0}><FaMinus /></Button>
                                    )}
                                </InputGroup>
                            ))}
                            <Button variant="outline-secondary" size="sm" onClick={addSocialMediaField}><FaPlus className="me-1" /> Add Another Link</Button>
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Form.Group as={Col}>
                            <Form.Label>Notes</Form.Label>
                            <Form.Control as="textarea" rows={3} value={form.notes} onChange={handleChange("notes")} placeholder="Extra info about this contact" />
                        </Form.Group>
                    </Row>
                    <Row className="mb-3">
                        <Form.Group as={Col}>
                            <Form.Check type="checkbox" label="Mark as Favorite / Starred" name="starred" checked={form.starred} onChange={handleChange("starred")} />
                        </Form.Group>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="primary">{mode === "edit" ? 'Save Changes' : 'Create Contact'}</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}