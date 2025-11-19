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
    const [profilePictureFile, setProfilePictureFile] = useState(null);
    const [profilePicturePreview, setProfilePicturePreview] = useState(null);
    const fileInputRef = React.useRef(null);

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
            setProfilePicturePreview(initial.profilePicture || null);
        } else {
            setForm(emptyForm);
            setProfilePicturePreview(null);
        }
        setProfilePictureFile(null);
        setErrors({});
    }, [initial, mode, show]);

    function handleChange(field) {
        return (e) => {
            const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
            setForm((prev) => ({ ...prev, [field]: value }));
        };
    }

    function handleFileChange(e) {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setErrors({ profilePicture: "Please select an image file." });
                return;
            }
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setErrors({ profilePicture: "Image size must be less than 5MB." });
                return;
            }
            
            setProfilePictureFile(file);
            setErrors({ ...errors, profilePicture: null });
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePicturePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    }

    function removeProfilePicture() {
        setProfilePictureFile(null);
        setProfilePicturePreview(null);
        setForm((prev) => ({ ...prev, profilePicture: "" }));
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
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

    async function handleSubmit(e) {
        e.preventDefault();
        const newErrors = {};
        if (!form.firstName.trim()) newErrors.firstName = "First Name is required.";
        if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = "Invalid email.";
        if (!form.phone.trim()) newErrors.phone = "Phone is required.";
        else if (!isValidPhone(form.phone)) newErrors.phone = "Invalid phone.";

        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
        setErrors({});
        
        // If a new file was selected, convert it to base64
        let finalProfilePicture = form.profilePicture;
        if (profilePictureFile) {
            finalProfilePicture = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(profilePictureFile);
            });
        }
        
        onSave({ ...form, profilePicture: finalProfilePicture });
    }

    const title = mode === "edit" ? "Edit Contact" : "Add New Contact";
    const socialMediaDisplay = form.socialMedia.length === 0 && mode !== 'edit' ? [""] : form.socialMedia;

    return (
        <Modal show={show} onHide={onClose} size="lg" centered className="contact-form-modal">
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton style={{ 
                    borderBottom: "2px solid var(--border-light)",
                    padding: "var(--spacing-lg) var(--spacing-xl)"
                }}>
                    <Modal.Title style={{ 
                        fontSize: "var(--font-xl)",
                        fontWeight: "var(--font-bold)",
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--spacing-sm)"
                    }}>
                        <i className={`bi ${mode === "edit" ? "bi-pencil-square" : "bi-person-plus"}`} style={{ color: "var(--accent-primary)" }}></i>
                        {title}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ padding: "var(--spacing-xl)" }}>
                    <Row className="mb-4">
                        <Form.Group as={Col} md={12}>
                            <Form.Label style={{ 
                                fontSize: "var(--font-sm)",
                                fontWeight: "var(--font-semibold)",
                                marginBottom: "var(--spacing-sm)"
                            }}>
                                Profile Picture
                            </Form.Label>
                            <div style={{ 
                                display: "flex", 
                                alignItems: "center", 
                                gap: "var(--spacing-md)",
                                flexWrap: "wrap"
                            }}>
                                {profilePicturePreview && (
                                    <div style={{ 
                                        position: "relative",
                                        width: "80px",
                                        height: "80px",
                                        borderRadius: "var(--radius-lg)",
                                        overflow: "hidden",
                                        border: "2px solid var(--border-light)",
                                        boxShadow: "var(--shadow-sm)"
                                    }}>
                                        <img 
                                            src={profilePicturePreview} 
                                            alt="Preview" 
                                            style={{ 
                                                width: "100%", 
                                                height: "100%", 
                                                objectFit: "cover" 
                                            }} 
                                        />
                                        <button
                                            type="button"
                                            onClick={removeProfilePicture}
                                            style={{
                                                position: "absolute",
                                                top: "4px",
                                                right: "4px",
                                                background: "rgba(0, 0, 0, 0.7)",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "50%",
                                                width: "24px",
                                                height: "24px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                cursor: "pointer",
                                                fontSize: "12px"
                                            }}
                                        >
                                            <i className="bi bi-x"></i>
                                        </button>
                                    </div>
                                )}
                                <div style={{ flex: 1, minWidth: "200px" }}>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        style={{ display: "none" }}
                                        id="profile-picture-upload"
                                    />
                                    <label
                                        htmlFor="profile-picture-upload"
                                        style={{
                                            display: "inline-block",
                                            padding: "var(--spacing-sm) var(--spacing-lg)",
                                            background: "var(--bg-card)",
                                            border: "1px solid var(--border-default)",
                                            borderRadius: "var(--radius-md)",
                                            cursor: "pointer",
                                            fontSize: "var(--font-sm)",
                                            fontWeight: "var(--font-medium)",
                                            transition: "all var(--transition-base)",
                                            textAlign: "center",
                                            width: "100%"
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.background = "var(--bg-card-hover)";
                                            e.target.style.borderColor = "var(--accent-primary)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.background = "var(--bg-card)";
                                            e.target.style.borderColor = "var(--border-default)";
                                        }}
                                    >
                                        <i className="bi bi-upload me-2"></i>
                                        {profilePicturePreview ? "Change Picture" : "Upload Picture"}
                                    </label>
                                    {errors.profilePicture && (
                                        <div className="text-danger" style={{ 
                                            fontSize: "var(--font-xs)",
                                            marginTop: "var(--spacing-xs)"
                                        }}>
                                            {errors.profilePicture}
                                        </div>
                                    )}
                                    <Form.Text className="text-muted" style={{ 
                                        display: "block",
                                        marginTop: "var(--spacing-xs)",
                                        fontSize: "var(--font-xs)"
                                    }}>
                                        Supported formats: JPG, PNG, GIF (Max 5MB)
                                    </Form.Text>
                                </div>
                            </div>
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
                <Modal.Footer style={{ 
                    borderTop: "2px solid var(--border-light)",
                    padding: "var(--spacing-lg) var(--spacing-xl)"
                }}>
                    <Button 
                        variant="outline-secondary" 
                        onClick={onClose}
                        style={{
                            padding: "var(--spacing-sm) var(--spacing-xl)",
                            borderRadius: "var(--radius-md)",
                            fontWeight: "var(--font-medium)"
                        }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        variant="primary"
                        style={{
                            padding: "var(--spacing-sm) var(--spacing-xl)",
                            borderRadius: "var(--radius-md)",
                            fontWeight: "var(--font-semibold)"
                        }}
                    >
                        <i className={`bi ${mode === "edit" ? "bi-check-lg" : "bi-plus-lg"} me-2`}></i>
                        {mode === "edit" ? 'Save Changes' : 'Create Contact'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}