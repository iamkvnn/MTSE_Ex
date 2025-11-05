import './Profile.css'

function Profile() {
  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h1 className="name">Vũ Năng Đăng Khoa</h1>
        </div>

        <div className="profile-section">
          <div className="contact-info">
            <div className="contact-item">
              <span className="icon">📧</span>
              <span>23110119@student.hcmute.edu.vn</span>
            </div>
            <div className="contact-item">
              <span className="icon">📍</span>
              <span>Thủ Đức, Hồ Chí Minh</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
