// assets/js/auth.js - Hộp đăng nhập nhỏ nhẹ, không làm hỏng giao diện cũ
(async function() {

    // HARD-CODE PASSWORD
    const PASSWORD = "200898";

    // Tạo modal nhỏ xinh
    const modal = document.createElement('div');
    modal.style.cssText = `
        position:fixed;top:0;left:0;width:100vw;height:100vh;
        background:rgba(0,0,0,0.6);z-index:99999;display:flex;
        align-items:center;justify-content:center;backdrop-filter:blur(5px);
    `;
    modal.innerHTML = `
        <div style="background:#fff;padding:30px 40px;border-radius:12px;
                    box-shadow:0 10px 40px rgba(0,0,0,0.3);max-width:90%;text-align:center;">
            <h3 style="margin:0 0 15px;color:#0056b3;">🔐 Đăng nhập nội bộ</h3>
            <p style="margin:10px 0 20px;color:#555;font-size:0.95rem;">
                Vui lòng nhập mật khẩu để tiếp tục
            </p>
            <input type="password" id="pwd-input" autofocus 
                   style="width:100%;padding:12px;font-size:1rem;border:1px solid #ddd;
                          border-radius:8px;margin-bottom:15px;outline:none;"
                   placeholder="Nhập mật khẩu...">
            <button id="pwd-submit" 
                    style="background:#0056b3;color:#fff;border:none;padding:12px 30px;
                           border-radius:8px;font-size:1rem;cursor:pointer;min-width:120px;">
                Đăng nhập
            </button>
            <p id="pwd-error" style="color:#e74c3c;margin-top:12px;height:20px;font-size:0.9rem;"></p>
        </div>
    `;
    document.body.appendChild(modal);

    const input = modal.querySelector('#pwd-input');
    const btn = modal.querySelector('#pwd-submit');
    const error = modal.querySelector('#pwd-error');

    const tryLogin = () => {
        if (input.value === PASSWORD) {
            modal.remove();
            // Khởi động app như bình thường
            if (typeof router === 'function') router();
            if (allFiles && allFiles.length === 0) {
                renderNotificationList(document.getElementById('viewer-container'));
            }
        } else {
            error.textContent = 'Sai mật khẩu, thử lại!';
            input.value = '';
            input.focus();
        }
    };

    btn.onclick = tryLogin;
    input.addEventListener('keyup', e => { if (e.key === 'Enter') tryLogin(); });
    input.focus();
})();
