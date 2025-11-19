// src/components/Sidebar.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authAPI, getUser, getProfilePicture } from "../services/api.js";
import placeholderImg from "../assets/placeholder.png";

export default function Sidebar({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const loadProfilePicture = useCallback(() => {
    const pic = getProfilePicture();
    setProfilePicture(pic);
  }, []);

  const fetchUserProfile = useCallback(async () => {
    try {
      // Try to get from API first
      const data = await authAPI.getProfile();
      if (data.success && data.data.user) {
        setUser(data.data.user);
      } else {
        // Fallback to stored user data
        const storedUser = getUser();
        if (storedUser) {
          setUser(storedUser);
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      // Fallback to stored user data
      const storedUser = getUser();
      if (storedUser) {
        setUser(storedUser);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
    loadProfilePicture();
    // Auto-collapse sidebar after 2 seconds
    const timer = setTimeout(() => {
      setIsCollapsed(true);
    }, 2000);
    
    // Listen for profile picture updates
    const handleProfilePictureUpdate = () => {
      loadProfilePicture();
    };
    
    // Listen for profile updates
    const handleProfileUpdate = (event) => {
      if (event.detail) {
        setUser(event.detail);
        loadProfilePicture();
      }
    };
    
    window.addEventListener('profilePictureUpdated', handleProfilePictureUpdate);
    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('profilePictureUpdated', handleProfilePictureUpdate);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [fetchUserProfile, loadProfilePicture]);

  // Update parent class when collapsed state changes
  useEffect(() => {
    const pageElement = document.querySelector('.contacts-page');
    if (pageElement) {
      if (isCollapsed) {
        pageElement.classList.add('sidebar-collapsed');
      } else {
        pageElement.classList.remove('sidebar-collapsed');
      }
    }
    return () => {
      if (pageElement) {
        pageElement.classList.remove('sidebar-collapsed');
      }
    };
  }, [isCollapsed]);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      authAPI.logout();
      navigate("/");
    }
  };

  if (loading) {
    return (
      <div className="sidebar">
        <div className="sidebar-content">
          <div className="sidebar-loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      <div className="sidebar-content">
        {/* Brand/Logo */}
        <div className="sidebar-header">
          <h1 className="sidebar-brand">NextContacts</h1>
        </div>

        {/* User Profile Section */}
        <div className="sidebar-profile">
          <div className="sidebar-avatar-container">
            <img
              src={profilePicture || placeholderImg}
              alt={user?.username || "User"}
              className="sidebar-avatar"
            />
          </div>
          <div className="sidebar-user-info">
            <h3 className="sidebar-user-name">{user?.username || "User"}</h3>
            <p className="sidebar-user-email">{user?.email || "user@example.com"}</p>
            {user?.role && (
              <span className="sidebar-user-role">
                <i className="bi bi-shield-check"></i>
                {user.role === 'admin' ? 'Administrator' : 'User'}
              </span>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          <div className="sidebar-nav-section">
            <div className="sidebar-nav-label">Main</div>
            <button 
              type="button"
              className={`sidebar-nav-item ${location.pathname === '/contacts' ? 'active' : ''}`}
              onClick={() => navigate("/contacts")}
            >
              <i className="bi bi-person-lines-fill"></i>
              <span>Contacts</span>
            </button>
          </div>

          <div className="sidebar-nav-section">
            <div className="sidebar-nav-label">Settings</div>
            <button 
              type="button"
              className={`sidebar-nav-item ${location.pathname === '/profile' ? 'active' : ''}`}
              onClick={() => navigate("/profile")}
            >
              <i className="bi bi-person-gear"></i>
              <span>Profile Settings</span>
            </button>
          </div>
        </nav>

        {/* Footer Actions */}
        <div className="sidebar-footer">
          <button className="sidebar-logout-btn" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right"></i>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
