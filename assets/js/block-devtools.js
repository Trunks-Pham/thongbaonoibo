// ================== CHẶN DEVTOOLS – PHIÊN BẢN HOÀN HẢO CHO PRODUCTION 2025 ==================
(function () {
    'use strict';

    // ======== CHỐT AN TOÀN CHO ADMIN (bạn thôi) ========
    if (location.search.includes('unlock=admin2025xyz')) {
        console.log('%c✅ Đã mở khóa DevTools (admin mode)', 'color:#27ae60;font-size:18px');
        return; // Không chặn gì cả
    }

    // ======== CHỈ CHẠY KHI KHÔNG PHẢI ADMIN ========
    
    // 1. Chặn phím tắt (F12, Ctrl+Shift+I, Ctrl+U...)
    document.addEventListener('keydown', function (e) {
        if (
            e.keyCode === 123 ||                                                         // F12
            (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) ||       // Ctrl+Shift+I/J
            (e.ctrlKey && e.keyCode === 85)                                              // Ctrl+U
        ) {
            e.preventDefault();
            e.stopImmediatePropagation();
        }
    }, true);

    // 2. Chặn chuột phải
    document.addEventListener('contextmenu', e => e.preventDefault());

    // 3. Chặn chọn text + kéo thả (ngăn copy dễ dàng)
    document.onselectstart = () => false;
    document.ondragstart = () => false;

    // 4. Phát hiện DevTools bằng kích thước – threshold CAO để tránh nhầm
    setInterval(() => {
        if (
            window.outerWidth - window.innerWidth > 350 ||   // tăng lên 350px mới trigger
            window.outerHeight - window.innerHeight > 350
        ) {
            document.documentElement.innerHTML = `
                <div style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:#c0392b;color:#fff;z-index:999999;
                            display:flex;align-items:center;justify-content:center;text-align:center;font-size:1.6rem;padding:20px;">
                    <div>
                        <h2>DevTools bị cấm trên hệ thống nội bộ</h2>
                        <p>Vui lòng tắt cửa sổ Developer Tools để tiếp tục.</p>
                    </div>
                </div>`;
        }
    }, 1000);

    // 5. Debugger trap NHẸ NHẤT – không làm treo máy, không override console.log
    let devtoolsOpen = false;
    setInterval(() => {
        const before = Date.now();
        debugger;
        if (Date.now() - before > 150) {  // chỉ trigger khi thực sự bị pause
            if (!devtoolsOpen) {
                devtoolsOpen = true;
                document.documentElement.innerHTML = `
                    <div style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:#e74c3c;color:#fff;z-index:999999;
                                display:flex;align-items:center;justify-content:center;text-align:center;font-size:1.6rem;">
                        <div>
                            <h2>Không được sử dụng DevTools</h2>
                            <p>Hệ thống nội bộ không cho phép chế độ debug.</p>
                        </div>
                    </div>`;
            }
        }
    }, 2000);

})();